import type { DashboardSummary, DataAccessMeta } from "@/types/mentis"
import { findSalesOrders } from "@/lib/repositories/sales-order-repository"
import { findWorkCenters } from "@/lib/repositories/reference-repository"

function buildEmptySummary(): DashboardSummary {
  return {
    openOrders: 0,
    ordersInProgress: 0,
    lateOrders: 0,
    dueThisWeek: 0,
    currentWorkload: 0,
    statusOverview: [],
    pipelineByStep: [],
    streamOverview: [],
    workCenters: [],
    openOrderList: [],
    ordersInProgressList: [],
    dueThisWeekList: [],
    recentOrders: [],
    lateOrderList: [],
  }
}

function toMeta(dataSource: "database" | "unavailable"): DataAccessMeta {
  return dataSource === "database"
    ? { dataSource }
    : {
        dataSource,
        message:
          "Dashboard data is in a safe empty state because PostgreSQL could not be reached with the current configuration.",
      }
}

export async function getDashboardSummary(): Promise<{
  item: DashboardSummary
  meta: DataAccessMeta
}> {
  const [ordersResult, workCentersResult] = await Promise.all([
    findSalesOrders({ q: "", status: "all", stream: "all", limit: 10000 }),
    findWorkCenters(),
  ])

  if (ordersResult.dataSource !== "database") {
    return {
      item: buildEmptySummary(),
      meta: toMeta("unavailable"),
    }
  }

  const orders = ordersResult.data
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekFromNow = new Date(today)
  weekFromNow.setDate(today.getDate() + 7)

  const openOrders = orders.filter((order) => order.status !== "complete")
  const ordersInProgress = orders.filter((order) => order.status === "in-progress")
  const lateOrders = orders.filter((order) => order.status === "late")
  const dueThisWeek = openOrders.filter((order) => {
    if (!order.dueDate) {
      return false
    }

    const dueDate = new Date(order.dueDate)
    return dueDate >= today && dueDate <= weekFromNow
  })

  const pipelineByStep = Array.from(
    openOrders.reduce((map, order) => {
      map.set(order.currentStep, (map.get(order.currentStep) ?? 0) + 1)
      return map
    }, new Map<string, number>()),
  )
    .map(([step, count]) => ({ step, count }))
    .sort((left, right) => right.count - left.count)

  const statusOverview = Array.from(
    orders.reduce((map, order) => {
      map.set(order.status, (map.get(order.status) ?? 0) + 1)
      return map
    }, new Map<DashboardSummary["statusOverview"][number]["status"], number>()),
  )
    .map(([status, count]) => ({ status, count }))
    .sort((left, right) => right.count - left.count)

  const streamOverview = Array.from(
    orders.reduce((map, order) => {
      const entry = map.get(order.stream) ?? {
        stream: order.stream,
        count: 0,
        inProgress: 0,
        pending: 0,
        complete: 0,
      }

      entry.count += 1
      if (order.status === "in-progress") entry.inProgress += 1
      if (order.status === "pending" || order.status === "not-started") entry.pending += 1
      if (order.status === "complete") entry.complete += 1

      map.set(order.stream, entry)
      return map
    }, new Map<string, DashboardSummary["streamOverview"][number]>()),
  ).map(([, value]) => value)

  const workloadMap = openOrders.reduce((map, order) => {
    map.set(order.currentStep.toLowerCase(), (map.get(order.currentStep.toLowerCase()) ?? 0) + 1)
    return map
  }, new Map<string, number>())

  const workCenters = workCentersResult.data
    .filter((workCenter) => ["RECTAGRID", "PRODUCTION_JOBBING"].includes(workCenter.streamName ?? ""))
    .map((workCenter) => {
      const matchKeys = [workCenter.stepCode, workCenter.name, workCenter.code]
        .filter(Boolean)
        .map((value) => String(value).replaceAll("_", " ").toLowerCase())

      const jobs = matchKeys.reduce((count, key) => Math.max(count, workloadMap.get(key) ?? 0), 0)

      return {
        department: workCenter.name,
        jobs,
        capacity: Math.max(Math.round(workCenter.capacity), 1),
      }
    })

  return {
    item: {
      openOrders: openOrders.length,
      ordersInProgress: ordersInProgress.length,
      lateOrders: lateOrders.length,
      dueThisWeek: dueThisWeek.length,
      currentWorkload: openOrders.length,
      statusOverview,
      pipelineByStep,
      streamOverview,
      workCenters,
      openOrderList: openOrders.slice(0, 200),
      ordersInProgressList: ordersInProgress.slice(0, 200),
      dueThisWeekList: dueThisWeek.slice(0, 200),
      recentOrders: [...orders]
        .sort((left, right) => {
          const leftTime = left.dueDate ? new Date(left.dueDate).getTime() : -Infinity
          const rightTime = right.dueDate ? new Date(right.dueDate).getTime() : -Infinity
          return rightTime - leftTime
        })
        .slice(0, 8),
      lateOrderList: lateOrders.slice(0, 8),
    },
    meta: toMeta("database"),
  }
}
