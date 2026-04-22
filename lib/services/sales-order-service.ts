import type { DataAccessMeta, SalesOrderListItem } from "@/types/mentis"
import { findSalesOrderByNumber, findSalesOrders } from "@/lib/repositories/sales-order-repository"

function toMeta(dataSource: "database" | "unavailable"): DataAccessMeta {
  return dataSource === "database"
    ? { dataSource }
    : {
        dataSource,
        message:
          "The database is not currently reachable. Confirm DATABASE_URL and the expected Mentis tables/views.",
      }
}

export async function getSalesOrders(params: {
  q: string
  status: string
  stream: string
  sortBy?: "dueDate" | "approvalDate"
  sortDirection?: "asc" | "desc"
  limit: number
}) {
  const result = await findSalesOrders({
    ...params,
    sortBy: params.sortBy ?? "dueDate",
    sortDirection: params.sortDirection ?? "desc",
  })

  return {
    items: result.data,
    meta: toMeta(result.dataSource),
  }
}

export async function getSalesOrder(salesOrderNumber: string): Promise<{
  item: SalesOrderListItem | null
  meta: DataAccessMeta
}> {
  const result = await findSalesOrderByNumber(salesOrderNumber)

  return {
    item: result.data,
    meta: toMeta(result.dataSource),
  }
}
