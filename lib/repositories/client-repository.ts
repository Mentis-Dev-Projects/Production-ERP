import { Prisma } from "@prisma/client"
import { executeSafeQuery } from "@/lib/db/queries"
import type { ClientSummary } from "@/types/mentis"

export async function findClients(q = "") {
  const filter = q ? `%${q}%` : null

  return executeSafeQuery<ClientSummary[]>(
    Prisma.sql`
      SELECT
        c.client_id::text AS id,
        c.client_name AS name,
        c.client_code AS "clientCode",
        COUNT(so.sales_order_id)::int AS "activeOrders",
        COUNT(so.sales_order_id) FILTER (
          WHERE EXISTS (
            SELECT 1
            FROM production_jobbing.rectagrid_job job
            INNER JOIN production_jobbing.rectagrid_step rs
              ON rs.rectagrid_job_id = job.rectagrid_job_id
            WHERE job.sales_order_id = so.sales_order_id
              AND COALESCE(rs.calc_is_complete, false) = false
              AND rs.entry_planned_end_date IS NOT NULL
              AND rs.entry_planned_end_date < CURRENT_DATE
          )
        )::int AS "overdueOrders"
      FROM app_core.client c
      LEFT JOIN sales.sales_order so
        ON so.client_id = c.client_id
      WHERE ${filter ? Prisma.sql`(c.client_name ILIKE ${filter} OR COALESCE(c.client_code, '') ILIKE ${filter})` : Prisma.sql`1 = 1`}
      GROUP BY c.client_id, c.client_name, c.client_code
      ORDER BY c.client_name ASC
    `,
    [],
  )
}
