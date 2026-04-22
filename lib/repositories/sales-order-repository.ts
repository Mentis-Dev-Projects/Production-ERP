import { Prisma } from "@prisma/client"
import { executeSafeQuery } from "@/lib/db/queries"
import type { SalesOrderListItem } from "@/types/mentis"

const mentexSalesPredicate = Prisma.sql`
  (
    COALESCE(so.entry_product_code, job.entry_product_code, '') ILIKE 'EXP%'
    OR COALESCE(so.entry_product_code, job.entry_product_code, '') ILIKE 'MENTEX%'
    OR CONCAT_WS(' ', so.entry_description_1, so.entry_description_2, so.entry_description_3) ILIKE '%expanded metal%'
    OR CONCAT_WS(' ', so.entry_description_1, so.entry_description_2, so.entry_description_3) ILIKE '%mentex%'
  )
`

const rectagridStatusCase = Prisma.sql`
  CASE
    WHEN current_step.entry_status = 'C' THEN 'complete'
    WHEN current_step.entry_status = 'O' THEN 'in-progress'
    WHEN current_step.entry_status = 'N' THEN 'not-started'
    WHEN current_step.entry_status = 'NN' THEN 'pending'
    WHEN current_step.entry_status IS NULL AND job.job_status = 'COMPLETE' THEN 'complete'
    WHEN current_step.entry_status IS NULL AND job.job_status = 'IN_PROGRESS' THEN 'in-progress'
    WHEN current_step.entry_status IS NULL AND job.job_status = 'CANCELLED' THEN 'blocked'
    WHEN current_step.entry_status IS NULL AND job.job_status = 'OPEN' THEN 'pending'
    ELSE 'not-started'
  END
`

const baseOrdersCte = Prisma.sql`
  WITH rectagrid_orders AS (
    SELECT
      so.sales_order_id::text AS id,
      so.sales_order_number AS "salesOrderNumber",
      COALESCE(c.client_name, job.entry_client_name, 'Unknown Client') AS "clientName",
      c.client_code AS "clientCode",
      COALESCE(so.entry_product_code, job.entry_product_code) AS "productCode",
      CONCAT_WS(' | ', so.entry_description_1, so.entry_description_2, so.entry_description_3) AS description,
      COALESCE(so.entry_sqm, 0)::float8 AS sqm,
      COALESCE(so.entry_qty, 0)::int AS qty,
      so.entry_sales_order_approval_at::date::text AS "approvalDate",
      so.entry_production_issued_at::date::text AS "productionIssuedDate",
      so.calc_due_date::text AS "calculatedDueDate",
      so.entry_revised_due_date::text AS "revisedDueDate",
      so.entry_x_works_date::text AS "xWorksDate",
      COALESCE(so.entry_revised_due_date::text, so.calc_due_date::text) AS "dueDate",
      COALESCE(job.current_step_name, current_step.step_name, 'Awaiting Planning') AS "currentStep",
      expected_step.step_name AS "expectedStep",
      blocking_step.step_name AS "blockingStep",
      ${rectagridStatusCase} AS status,
      'Rectagrid' AS stream
    FROM sales.sales_order so
    LEFT JOIN app_core.client c
      ON c.client_id = so.client_id
    LEFT JOIN production_jobbing.rectagrid_job job
      ON job.sales_order_id = so.sales_order_id
    LEFT JOIN LATERAL (
      SELECT
        rs.step_name,
        rs.entry_status
      FROM production_jobbing.rectagrid_step rs
      WHERE rs.rectagrid_job_id = job.rectagrid_job_id
      ORDER BY
        CASE WHEN COALESCE(rs.calc_is_complete, false) = false THEN 0 ELSE 1 END,
        rs.step_no,
        rs.created_at NULLS LAST
      LIMIT 1
    ) current_step ON TRUE
    LEFT JOIN LATERAL (
      SELECT rs.step_name
      FROM production_jobbing.rectagrid_step rs
      WHERE rs.rectagrid_job_id = job.rectagrid_job_id
        AND COALESCE(rs.calc_is_complete, false) = false
        AND (rs.entry_planned_end_date IS NULL OR rs.entry_planned_end_date >= CURRENT_DATE)
      ORDER BY rs.step_no, rs.created_at NULLS LAST
      LIMIT 1
    ) expected_step ON TRUE
    LEFT JOIN LATERAL (
      SELECT rs.step_name
      FROM production_jobbing.rectagrid_step rs
      WHERE rs.rectagrid_job_id = job.rectagrid_job_id
        AND COALESCE(rs.calc_is_complete, false) = false
        AND rs.entry_planned_end_date IS NOT NULL
        AND rs.entry_planned_end_date < CURRENT_DATE
      ORDER BY rs.step_no, rs.created_at NULLS LAST
      LIMIT 1
    ) blocking_step ON TRUE
    WHERE NOT ${mentexSalesPredicate}
  ),
  mentex_ranked AS (
    SELECT
      mt.*,
      ROW_NUMBER() OVER (
        PARTITION BY mt.sale_order_number
        ORDER BY
          COALESCE(mt.revised_due_date, mt.due_date) DESC NULLS LAST,
          COALESCE(mt.sale_order_approval_date, mt.start_date) DESC NULLS LAST,
          mt.product_code DESC NULLS LAST
      ) AS row_no
    FROM public.stg_mentex mt
  ),
  mentex_aggregated AS (
    SELECT
      mt.sale_order_number,
      MIN(NULLIF(TRIM(mt.client), '')) AS client_name,
      CASE
        WHEN COUNT(DISTINCT NULLIF(TRIM(mt.product_code), '')) = 1 THEN MAX(NULLIF(TRIM(mt.product_code), ''))
        ELSE 'MULTI'
      END AS product_code,
      CASE
        WHEN COUNT(DISTINCT NULLIF(TRIM(mt.product_code), '')) = 1 THEN MAX(NULLIF(TRIM(mt.description_1), ''))
        ELSE 'Multiple products'
      END AS description_1,
      CASE
        WHEN COUNT(DISTINCT NULLIF(TRIM(mt.product_code), '')) = 1 THEN MAX(NULLIF(TRIM(mt.description_2), ''))
        ELSE CONCAT(COUNT(DISTINCT NULLIF(TRIM(mt.product_code), '')), ' products on order')
      END AS description_2,
      CASE
        WHEN COUNT(DISTINCT NULLIF(TRIM(mt.product_code), '')) = 1 THEN MAX(NULLIF(TRIM(mt.description_3), ''))
        ELSE NULL
      END AS description_3,
      SUM(
        CASE
          WHEN NULLIF(BTRIM(mt.sqm::text), '') IS NOT NULL AND BTRIM(mt.sqm::text) <> '0.0' THEN mt.sqm::numeric
          ELSE 0
        END
      )::float8 AS sqm,
      SUM(
        CASE
          WHEN NULLIF(BTRIM(mt.qty::text), '') IS NOT NULL AND BTRIM(mt.qty::text) <> '0.0' THEN mt.qty::numeric
          ELSE 0
        END
      )::int AS qty
    FROM public.stg_mentex mt
    GROUP BY mt.sale_order_number
  ),
  mentex_orders AS (
    SELECT
      CONCAT('mentex-', agg.sale_order_number) AS id,
      agg.sale_order_number AS "salesOrderNumber",
      COALESCE(agg.client_name, 'Unknown Client') AS "clientName",
      NULL::text AS "clientCode",
      agg.product_code AS "productCode",
      CONCAT_WS(' | ', agg.description_1, agg.description_2, agg.description_3) AS description,
      agg.sqm AS sqm,
      agg.qty AS qty,
      ranked.sale_order_approval_date::date::text AS "approvalDate",
      ranked.start_date::date::text AS "productionIssuedDate",
      ranked.due_date::date::text AS "calculatedDueDate",
      ranked.revised_due_date::date::text AS "revisedDueDate",
      ranked.x_works_date::date::text AS "xWorksDate",
      COALESCE(ranked.revised_due_date::date::text, ranked.due_date::date::text) AS "dueDate",
      CASE
        WHEN NULLIF(TRIM(COALESCE(ranked.current_department, '')), '') IS NULL OR ranked.current_department = '0.0' THEN 'Awaiting Planning'
        ELSE INITCAP(REPLACE(REPLACE(LOWER(ranked.current_department), '_', ' '), 'gtn to warehouse', 'GTN To Warehouse'))
      END AS "currentStep",
      CASE
        WHEN LOWER(COALESCE(ranked.current_department, '')) IN ('awaiting expanding', 'expanding') THEN 'Expanding'
        WHEN LOWER(COALESCE(ranked.current_department, '')) = 'flattening' THEN 'Flattening'
        WHEN LOWER(COALESCE(ranked.current_department, '')) = 'cutting' THEN 'Cutting'
        WHEN LOWER(COALESCE(ranked.current_department, '')) IN ('quality', 'invoiced', 'gtn to warehouse') THEN 'Quality / Invoicing'
        ELSE NULL
      END AS "expectedStep",
      CASE
        WHEN UPPER(COALESCE(ranked.expanding_late_early, '')) = 'LATE' THEN 'Expanding'
        WHEN UPPER(COALESCE(ranked.flattening_late_early, '')) = 'LATE' THEN 'Flattening'
        WHEN UPPER(COALESCE(ranked.cutting_late_early, '')) = 'LATE' THEN 'Cutting'
        ELSE NULL
      END AS "blockingStep",
      CASE
        WHEN LOWER(COALESCE(ranked.current_department, '')) = 'cancelled' THEN 'blocked'
        WHEN LOWER(COALESCE(ranked.current_department, '')) IN ('invoiced', 'gtn to warehouse') THEN 'complete'
        WHEN UPPER(COALESCE(ranked.expanding_late_early, '')) = 'LATE'
          OR UPPER(COALESCE(ranked.flattening_late_early, '')) = 'LATE'
          OR UPPER(COALESCE(ranked.cutting_late_early, '')) = 'LATE' THEN 'late'
        WHEN LOWER(COALESCE(ranked.current_department, '')) = 'awaiting expanding' THEN 'pending'
        WHEN NULLIF(TRIM(COALESCE(ranked.current_department, '')), '') IS NULL OR ranked.current_department = '0.0' THEN 'not-started'
        ELSE 'in-progress'
      END AS status,
      'Mentex' AS stream
    FROM mentex_ranked ranked
    INNER JOIN mentex_aggregated agg
      ON agg.sale_order_number = ranked.sale_order_number
    WHERE ranked.row_no = 1
  ),
  mentex_workflow_fallback AS (
    SELECT
      so.sales_order_id::text AS id,
      so.sales_order_number AS "salesOrderNumber",
      COALESCE(c.client_name, 'Unknown Client') AS "clientName",
      c.client_code AS "clientCode",
      so.entry_product_code AS "productCode",
      CONCAT_WS(' | ', so.entry_description_1, so.entry_description_2, so.entry_description_3) AS description,
      COALESCE(so.entry_sqm, 0)::float8 AS sqm,
      COALESCE(so.entry_qty, 0)::int AS qty,
      so.entry_sales_order_approval_at::date::text AS "approvalDate",
      so.entry_production_issued_at::date::text AS "productionIssuedDate",
      so.calc_due_date::text AS "calculatedDueDate",
      so.entry_revised_due_date::text AS "revisedDueDate",
      so.entry_x_works_date::text AS "xWorksDate",
      COALESCE(so.entry_revised_due_date::text, so.calc_due_date::text) AS "dueDate",
      'Awaiting Planning' AS "currentStep",
      NULL::text AS "expectedStep",
      NULL::text AS "blockingStep",
      'not-started' AS status,
      'Mentex' AS stream
    FROM sales.sales_order so
    LEFT JOIN app_core.client c
      ON c.client_id = so.client_id
    LEFT JOIN production_jobbing.rectagrid_job job
      ON job.sales_order_id = so.sales_order_id
    WHERE ${mentexSalesPredicate}
      AND NOT EXISTS (
        SELECT 1
        FROM public.stg_mentex mt
        WHERE LOWER(mt.sale_order_number) = LOWER(so.sales_order_number)
      )
  ),
  base_orders AS (
    SELECT * FROM rectagrid_orders
    UNION ALL
    SELECT * FROM mentex_orders
    UNION ALL
    SELECT * FROM mentex_workflow_fallback
  )
`

function buildSalesOrderFilters(q: string, status: string, stream: string) {
  const fragments: Prisma.Sql[] = [Prisma.sql`1 = 1`]

  if (q) {
    const term = `%${q}%`
    fragments.push(
      Prisma.sql`(
        base."salesOrderNumber" ILIKE ${term}
        OR COALESCE(base."clientName", '') ILIKE ${term}
      )`,
    )
  }

  if (status !== "all") {
    fragments.push(Prisma.sql`LOWER(base.status) = ${status.toLowerCase()}`)
  }

  if (stream !== "all") {
    fragments.push(Prisma.sql`LOWER(base.stream) = ${stream.toLowerCase()}`)
  }

  return Prisma.join(fragments, " AND ")
}

function buildSalesOrderOrderBy(sortBy: "dueDate" | "approvalDate", sortDirection: "asc" | "desc") {
  const direction = sortDirection === "desc" ? Prisma.sql`DESC` : Prisma.sql`ASC`

  if (sortBy === "approvalDate") {
    return Prisma.sql`base."approvalDate" ${direction} NULLS LAST, base."salesOrderNumber" ASC`
  }

  return Prisma.sql`base."dueDate" ${direction} NULLS LAST, base."salesOrderNumber" ASC`
}

export async function findSalesOrders(params: {
  q: string
  status: string
  stream: string
  sortBy?: "dueDate" | "approvalDate"
  sortDirection?: "asc" | "desc"
  limit: number
}) {
  const whereClause = buildSalesOrderFilters(params.q, params.status, params.stream)
  const orderByClause = buildSalesOrderOrderBy(params.sortBy ?? "dueDate", params.sortDirection ?? "asc")

  return executeSafeQuery<SalesOrderListItem[]>(
    Prisma.sql`
      ${baseOrdersCte}
      SELECT *
      FROM base_orders base
      WHERE ${whereClause}
      ORDER BY ${orderByClause}
      LIMIT ${params.limit}
    `,
    [],
  )
}

export async function findSalesOrderByNumber(salesOrderNumber: string) {
  const result = await executeSafeQuery<SalesOrderListItem[]>(
    Prisma.sql`
      ${baseOrdersCte}
      SELECT *
      FROM base_orders base
      WHERE LOWER(base."salesOrderNumber") = LOWER(${salesOrderNumber})
      ORDER BY base."dueDate" DESC NULLS LAST
      LIMIT 1
    `,
    [],
  )

  return {
    ...result,
    data: result.data[0] ?? null,
  }
}
