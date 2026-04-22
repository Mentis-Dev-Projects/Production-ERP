import { Prisma } from "@prisma/client"
import { executeSafeQuery } from "@/lib/db/queries"

interface PipelineStepRow {
  stepNumber: number | null
  stepCode: string | null
  stepName: string | null
  plannedStartDate: string | Date | null
  plannedEndDate: string | Date | null
  actualStartDate: string | Date | null
  actualEndDate: string | Date | null
  statusCode: string | null
}

export async function findPipelineStepsBySalesOrderNumber(salesOrderNumber: string) {
  return executeSafeQuery<PipelineStepRow[]>(
    Prisma.sql`
      SELECT
        rs.step_no AS "stepNumber",
        rs.step_code AS "stepCode",
        rs.step_name AS "stepName",
        COALESCE(rs.entry_revised_start_date, rs.entry_planned_start_date) AS "plannedStartDate",
        COALESCE(rs.entry_revised_end_date, rs.entry_planned_end_date) AS "plannedEndDate",
        rs.entry_actual_start_date AS "actualStartDate",
        rs.entry_actual_end_date AS "actualEndDate",
        COALESCE(rs.calc_late_early_status, rs.entry_status) AS "statusCode"
      FROM production_jobbing.rectagrid_step rs
      INNER JOIN production_jobbing.rectagrid_job job
        ON job.rectagrid_job_id = rs.rectagrid_job_id
      WHERE LOWER(job.entry_sales_order_number) = LOWER(${salesOrderNumber})
      ORDER BY rs.step_no, rs.created_at NULLS LAST
    `,
    [],
  )
}

export async function findMentexPipelineStepsBySalesOrderNumber(salesOrderNumber: string) {
  return executeSafeQuery<PipelineStepRow[]>(
    Prisma.sql`
      WITH ranked AS (
        SELECT
          mt.*,
          ROW_NUMBER() OVER (
            PARTITION BY mt.sale_order_number
            ORDER BY COALESCE(mt.revised_due_date, mt.due_date) DESC NULLS LAST
          ) AS row_no
        FROM public.stg_mentex mt
        WHERE LOWER(mt.sale_order_number) = LOWER(${salesOrderNumber})
      ),
      selected AS (
        SELECT *
        FROM ranked
        WHERE row_no = 1
      )
      SELECT *
      FROM (
        SELECT
          1 AS "stepNumber",
          'EXPANDING' AS "stepCode",
          'Expanding' AS "stepName",
          planned_start_date_expanding AS "plannedStartDate",
          COALESCE(revised_end_date_expanding, planned_end_date_expanding) AS "plannedEndDate",
          NULLIF(actual_start_date_expanding::date, DATE '1899-12-30') AS "actualStartDate",
          NULLIF(actual_end_date_expanding::date, DATE '1899-12-30') AS "actualEndDate",
          CASE
            WHEN NULLIF(actual_end_date_expanding::date, DATE '1899-12-30') IS NOT NULL THEN 'complete'
            WHEN LOWER(COALESCE(current_department, '')) IN ('awaiting expanding', 'expanding') THEN 'in-progress'
            WHEN UPPER(COALESCE(expanding_late_early, '')) = 'LATE' THEN 'late'
            ELSE COALESCE(expanding_status, 'pending')
          END AS "statusCode"
        FROM selected

        UNION ALL

        SELECT
          2 AS "stepNumber",
          'FLATTENING' AS "stepCode",
          'Flattening' AS "stepName",
          COALESCE(revised_start_date_flattening, planned_start_date_flattening) AS "plannedStartDate",
          COALESCE(revised_end_date_flattening, planned_end_date_flattening) AS "plannedEndDate",
          NULLIF(actual_start_date_flattening::date, DATE '1899-12-30') AS "actualStartDate",
          NULLIF(actual_end_date_flattening::date, DATE '1899-12-30') AS "actualEndDate",
          CASE
            WHEN NULLIF(actual_end_date_flattening::date, DATE '1899-12-30') IS NOT NULL THEN 'complete'
            WHEN LOWER(COALESCE(current_department, '')) = 'flattening' THEN 'in-progress'
            WHEN UPPER(COALESCE(flattening_late_early, '')) = 'LATE' THEN 'late'
            ELSE COALESCE(flattening_status, 'pending')
          END AS "statusCode"
        FROM selected

        UNION ALL

        SELECT
          3 AS "stepNumber",
          'CUTTING' AS "stepCode",
          'Cutting' AS "stepName",
          revised_start_date_cutting AS "plannedStartDate",
          NULL::date AS "plannedEndDate",
          NULL::date AS "actualStartDate",
          NULL::date AS "actualEndDate",
          CASE
            WHEN LOWER(COALESCE(current_department, '')) = 'cutting' THEN 'in-progress'
            WHEN UPPER(COALESCE(cutting_late_early, '')) = 'LATE' THEN 'late'
            ELSE COALESCE(cutting_status, 'pending')
          END AS "statusCode"
        FROM selected

        UNION ALL

        SELECT
          4 AS "stepNumber",
          'QUALITY_INVOICING' AS "stepCode",
          'Quality / Invoicing' AS "stepName",
          COALESCE(revised_x_works_date, x_works_date) AS "plannedStartDate",
          COALESCE(revised_due_date, due_date) AS "plannedEndDate",
          NULL::date AS "actualStartDate",
          CASE
            WHEN LOWER(COALESCE(current_department, '')) IN ('invoiced', 'gtn to warehouse') THEN COALESCE(revised_due_date, due_date)
            ELSE NULL::date
          END AS "actualEndDate",
          CASE
            WHEN LOWER(COALESCE(current_department, '')) IN ('invoiced', 'gtn to warehouse') THEN 'complete'
            WHEN LOWER(COALESCE(current_department, '')) IN ('quality', 'invoiced', 'gtn to warehouse') THEN 'in-progress'
            WHEN UPPER(COALESCE(expanding_late_early, '')) = 'LATE'
              OR UPPER(COALESCE(flattening_late_early, '')) = 'LATE'
              OR UPPER(COALESCE(cutting_late_early, '')) = 'LATE' THEN 'late'
            ELSE 'pending'
          END AS "statusCode"
        FROM selected
      ) steps
      ORDER BY "stepNumber"
    `,
    [],
  )
}
