import { Prisma } from "@prisma/client"
import { hasDatabaseUrl } from "@/lib/config/env"
import { prisma } from "@/lib/db/prisma"

export interface RepositoryResult<T> {
  data: T
  dataSource: "database" | "unavailable"
  error?: string
}

export async function executeSafeQuery<T>(
  query: Prisma.Sql,
  fallback: T,
): Promise<RepositoryResult<T>> {
  if (!hasDatabaseUrl()) {
    return {
      data: fallback,
      dataSource: "unavailable",
      error: "DATABASE_URL is not configured.",
    }
  }

  try {
    const data = await prisma.$queryRaw<T>(query)
    return { data, dataSource: "database" }
  } catch (error) {
    return {
      data: fallback,
      dataSource: "unavailable",
      error: error instanceof Error ? error.message : "Unknown database error",
    }
  }
}
