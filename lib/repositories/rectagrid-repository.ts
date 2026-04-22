import { Prisma } from "@prisma/client"
import { executeSafeQuery } from "@/lib/db/queries"
import type { RectagridJobListItem } from "@/types/mentis"

const statusCase = Prisma.sql`
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

function buildRectagridFilters(q: string, step: string, status: string) {
  const fragments: Prisma.Sql[] = [Prisma.sql`1 = 1`]

  if (q) {
    const term = `%${q}%`
    fragments.push(
      Prisma.sql`(
        job.entry_sales_order_number ILIKE ${term}
        OR COALESCE(job.entry_client_name, '') ILIKE ${term}
        OR COALESCE(job.entry_product_code, '') ILIKE ${term}
      )`,
    )
  }

  if (step !== "all") {
    fragments.push(Prisma.sql`LOWER(COALESCE(job.current_step_name, current_step.step_name, '')) = ${step.toLowerCase()}`)
  }

  if (status !== "all") {
    fragments.push(Prisma.sql`${statusCase} = ${status}`)
  }

  return Prisma.join(fragments, " AND ")
}

export async function findRectagridJobs(params: {
  q: string
  step: string
  status: string
  limit: number
}) {
  const whereClause = buildRectagridFilters(params.q, params.step, params.status)

  return executeSafeQuery<RectagridJobListItem[]>(
    Prisma.sql`
      SELECT
        job.rectagrid_job_id::text AS "jobId",
        job.entry_sales_order_number AS "salesOrderNumber",
        job.entry_client_name AS "clientName",
        job.entry_product_code AS "productCode",
        CONCAT_WS(' | ', job.entry_description_1, job.entry_description_2, job.entry_description_3) AS description,
        COALESCE(job.entry_sqm, 0)::float8 AS sqm,
        COALESCE(job.entry_qty, 0)::int AS qty,
        COALESCE(job.entry_revised_due_date::text, job.calc_due_date::text) AS "dueDate",
        COALESCE(job.current_step_name, current_step.step_name, 'Awaiting Planning') AS "currentStep",
        expected_step.step_name AS "expectedStep",
        blocking_step.step_name AS "blockingStep",
        ${statusCase} AS status
      FROM production_jobbing.rectagrid_job job
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
      WHERE ${whereClause}
      ORDER BY COALESCE(job.entry_revised_due_date, job.calc_due_date) ASC NULLS LAST, job.entry_sales_order_number ASC
      LIMIT ${params.limit}
    `,
    [],
  )
}
