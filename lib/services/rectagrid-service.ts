import type { DataAccessMeta } from "@/types/mentis"
import { findRectagridJobs } from "@/lib/repositories/rectagrid-repository"

function toMeta(dataSource: "database" | "unavailable"): DataAccessMeta {
  return dataSource === "database"
    ? { dataSource }
    : {
        dataSource,
        message:
          "Rectagrid data is currently unavailable. Confirm the production_jobbing schema is reachable from Prisma.",
      }
}

export async function getRectagridJobs(params: {
  q: string
  step: string
  status: string
  limit: number
}) {
  const result = await findRectagridJobs(params)

  return {
    items: result.data,
    meta: toMeta(result.dataSource),
  }
}
