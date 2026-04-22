import { Prisma } from "@prisma/client"
import { executeSafeQuery } from "@/lib/db/queries"
import type { PublicHolidaySummary, WorkCenterSummary } from "@/types/mentis"

export async function findWorkCenters() {
  return executeSafeQuery<WorkCenterSummary[]>(
    Prisma.sql`
      SELECT
        wc.work_center_id::text AS id,
        wc.work_center_code AS code,
        wc.work_center_name AS name,
        REPLACE(wc.work_center_code, 'RECTAGRID_', '') AS "stepCode",
        wc.process_group AS "streamName",
        COALESCE(capacity.available_hours, 0)::float8 AS capacity,
        'hours/day' AS "capacityUnit",
        COALESCE(wc.is_active, true) AS "isActive"
      FROM app_core.work_center wc
      LEFT JOIN LATERAL (
        SELECT wcc.available_hours
        FROM data_ref.work_center_capacity wcc
        WHERE wcc.work_center_id = wc.work_center_id
        ORDER BY wcc.capacity_date DESC
        LIMIT 1
      ) capacity ON TRUE
      ORDER BY wc.process_group ASC NULLS LAST, wc.work_center_name ASC
    `,
    [],
  )
}

export async function findPublicHolidays() {
  return executeSafeQuery<PublicHolidaySummary[]>(
    Prisma.sql`
      SELECT
        ph.public_holiday_id::text AS id,
        ph.holiday_date::text AS "holidayDate",
        ph.holiday_name AS name
      FROM data_ref.public_holiday ph
      ORDER BY ph.holiday_date ASC
    `,
    [],
  )
}
