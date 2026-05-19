import type { OrderStatus, SalesOrderListItem } from "@/types/mentis"

export type SalesReportFilters = {
  datePreset: string
  dateField: "dueDate" | "approvalDate"
  stream: string
  status: string
  client: string
}

export function getFirstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export function parseSalesReportFilters(rawParams: Record<string, string | string[] | undefined>): SalesReportFilters {
  const dateField = getFirstValue(rawParams.dateField)

  return {
    datePreset: getFirstValue(rawParams.datePreset) || "all",
    dateField: dateField === "approvalDate" ? "approvalDate" : "dueDate",
    stream: getFirstValue(rawParams.stream) || "all",
    status: getFirstValue(rawParams.status) || "all",
    client: getFirstValue(rawParams.client) || "all",
  }
}

function getDateRange(datePreset: string) {
  if (datePreset === "all") {
    return null
  }

  const now = new Date()
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  const start = new Date(end)

  if (datePreset === "7d") {
    start.setDate(end.getDate() - 7)
  } else if (datePreset === "30d") {
    start.setDate(end.getDate() - 30)
  } else if (datePreset === "90d") {
    start.setDate(end.getDate() - 90)
  } else if (datePreset === "this-month") {
    start.setDate(1)
  } else {
    return null
  }

  return { start, end }
}

export function applySalesReportFilters(items: SalesOrderListItem[], filters: SalesReportFilters) {
  const range = getDateRange(filters.datePreset)

  return items
    .filter((item) => {
      if (filters.stream !== "all" && item.stream !== filters.stream) {
        return false
      }

      if (filters.status !== "all" && item.status !== filters.status) {
        return false
      }

      if (filters.client !== "all" && item.clientName !== filters.client) {
        return false
      }

      if (!range) {
        return true
      }

      const rawDate = item[filters.dateField]
      if (!rawDate) {
        return false
      }

      const date = new Date(rawDate)
      return !Number.isNaN(date.getTime()) && date >= range.start && date < range.end
    })
    .sort((left, right) => {
      const leftTime = left.dueDate ? new Date(left.dueDate).getTime() : -Infinity
      const rightTime = right.dueDate ? new Date(right.dueDate).getTime() : -Infinity
      return rightTime - leftTime || left.salesOrderNumber.localeCompare(right.salesOrderNumber)
    })
}

export function buildClientTotals(items: SalesOrderListItem[]) {
  const grouped = new Map<
    string,
    {
      clientName: string
      orderCount: number
      openOrders: number
      lateOrders: number
      streams: Set<string>
    }
  >()

  for (const item of items) {
    const clientName = item.clientName || "Unknown Client"
    const row =
      grouped.get(clientName) ??
      {
        clientName,
        orderCount: 0,
        openOrders: 0,
        lateOrders: 0,
        streams: new Set<string>(),
      }

    row.orderCount += 1
    row.openOrders += item.status === "complete" ? 0 : 1
    row.lateOrders += item.status === "late" ? 1 : 0
    row.streams.add(item.stream)
    grouped.set(clientName, row)
  }

  return Array.from(grouped.values())
    .map((row) => ({
      ...row,
      streams: Array.from(row.streams).sort(),
    }))
    .sort((left, right) => right.orderCount - left.orderCount || left.clientName.localeCompare(right.clientName))
}

export function buildStatusRows(items: SalesOrderListItem[]) {
  const counts = new Map<OrderStatus, number>()
  for (const item of items) {
    counts.set(item.status, (counts.get(item.status) ?? 0) + 1)
  }

  return Array.from(counts.entries())
    .map(([status, count]) => ({ status, count }))
    .sort((left, right) => right.count - left.count || left.status.localeCompare(right.status))
}

export function buildStreamRows(items: SalesOrderListItem[]) {
  const counts = new Map<string, number>()
  for (const item of items) {
    counts.set(item.stream, (counts.get(item.stream) ?? 0) + 1)
  }

  return Array.from(counts.entries())
    .map(([stream, count]) => ({ stream, count }))
    .sort((left, right) => right.count - left.count || left.stream.localeCompare(right.stream))
}
