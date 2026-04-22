import { findPublicHolidays, findWorkCenters } from "@/lib/repositories/reference-repository"

export async function getReferenceData() {
  const [workCentersResult, publicHolidaysResult] = await Promise.all([
    findWorkCenters(),
    findPublicHolidays(),
  ])

  return {
    item: {
      workCenters: workCentersResult.data,
      publicHolidays: publicHolidaysResult.data,
    },
    meta:
      workCentersResult.dataSource === "database" && publicHolidaysResult.dataSource === "database"
        ? { dataSource: "database" as const }
        : {
            dataSource: "unavailable" as const,
            message:
              "Reference data is in an empty state because the required tables were not reachable from PostgreSQL.",
          },
  }
}
