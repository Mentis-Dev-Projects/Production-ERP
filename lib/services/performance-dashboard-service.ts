import type {
  DataAccessMeta,
  PerformanceBreakdownDatum,
  PerformanceDashboardData,
  PerformanceDashboardFilters,
  PerformanceDatePreset,
  PerformanceDistributionDatum,
  PerformanceEfficiencySummary,
  PerformanceEfficiencyTrendDatum,
  PerformanceExceptionRow,
  PerformanceKpiDrilldownRow,
  PerformanceKpiSummary,
  PerformanceKpiView,
  PerformanceLineBreakdownDatum,
  PerformanceQuickFilter,
  PerformanceTrendDatum,
  PerformanceWorkOrderStatus,
} from "@/types/mentis"
import {
  findPerformanceDashboardFilters,
  findPerformanceExceptions,
  findPerformanceEfficiency,
  findPerformanceSummaryViews,
  findPerformanceTrendViews,
  findPerformanceUnifiedRows,
  type PerformanceDashboardByClientRow,
  type PerformanceDashboardByDepartmentRow,
  type PerformanceDashboardByLineRow,
  type PerformanceDashboardKpiRow,
  type PerformanceDashboardWeeklyTrendRow,
  type PerformanceEfficiencyViewRow,
  type PerformanceUnifiedRow,
} from "@/lib/repositories/performance-dashboard-repository"

const workOrderStatusOptions: Array<{ value: PerformanceWorkOrderStatus; label: string }> = [
  { value: "all", label: "All statuses" },
  { value: "not-started", label: "Not Started" },
  { value: "in-production", label: "In Production" },
  { value: "completed", label: "Completed" },
  { value: "delayed", label: "Delayed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "unknown", label: "Unknown" },
]

const quickFilterOptions: Array<{ value: PerformanceQuickFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "overdue", label: "Overdue" },
  { value: "due-this-week", label: "Due This Week" },
  { value: "in-production", label: "In Production" },
  { value: "completed", label: "Completed" },
  { value: "late-jobs", label: "Late Jobs" },
]

const datePresetOptions: Array<{ value: PerformanceDatePreset; label: string }> = [
  { value: "all", label: "All Dates" },
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "this-month", label: "This Month" },
]

interface PerformanceRecord {
  productionLine: string
  salesOrderNumber: string
  clientName: string
  productCode: string | null
  description: string | null
  qty: number
  sqm: number | null
  salesOrderApprovalDate: string | null
  startDate: string | null
  dueDate: string | null
  revisedDueDate: string | null
  effectiveDueDate: string | null
  currentDepartment: string
  worksOrder: string | null
  actualProductionDays: number | null
  plannedProductionDays: number | null
  varianceDays: number | null
  completedDate: string | null
  normalizedStatus: Exclude<PerformanceWorkOrderStatus, "all">
  isActive: boolean
  isCompleted: boolean
  isOverdue: boolean
  isLate: boolean
  isAtRisk: boolean
  daysLate: number
}

function toMeta(dataSource: "database" | "unavailable"): DataAccessMeta {
  return dataSource === "database"
    ? { dataSource }
    : {
        dataSource,
        message:
          "The Performance Dashboard is in a safe empty state because PostgreSQL could not be reached with the current reporting configuration.",
      }
}

function startOfToday() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

function formatDateInput(date: Date) {
  return date.toISOString().slice(0, 10)
}

function parseDate(value: string | null | undefined) {
  if (!value) {
    return null
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function round(value: number, digits = 1) {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

function average(values: Array<number | null | undefined>) {
  const valid = values.filter((value): value is number => typeof value === "number" && Number.isFinite(value))
  if (valid.length === 0) {
    return 0
  }

  return valid.reduce((sum, value) => sum + value, 0) / valid.length
}

function percentage(part: number, whole: number) {
  if (!whole || !Number.isFinite(part) || !Number.isFinite(whole)) {
    return 0
  }

  return (part / whole) * 100
}

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function resolveFilters(filters: PerformanceDashboardFilters): PerformanceDashboardFilters {
  if (filters.startDate || filters.endDate || filters.datePreset === "all") {
    return filters
  }

  const today = startOfToday()
  const resolved = { ...filters }

  switch (filters.datePreset) {
    case "today":
      resolved.startDate = formatDateInput(today)
      resolved.endDate = formatDateInput(today)
      break
    case "7d": {
      const start = new Date(today)
      start.setDate(today.getDate() - 6)
      resolved.startDate = formatDateInput(start)
      resolved.endDate = formatDateInput(today)
      break
    }
    case "30d": {
      const start = new Date(today)
      start.setDate(today.getDate() - 29)
      resolved.startDate = formatDateInput(start)
      resolved.endDate = formatDateInput(today)
      break
    }
    case "this-month": {
      const start = new Date(today.getFullYear(), today.getMonth(), 1)
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      resolved.startDate = formatDateInput(start)
      resolved.endDate = formatDateInput(end)
      break
    }
    default:
      break
  }

  return resolved
}

function isPlaceholderDate(date: Date | null) {
  return date !== null && date.getFullYear() < 2000
}

function normalizeDepartment(value: string | null | undefined) {
  const trimmed = value?.trim()
  if (!trimmed || trimmed === "0.0" || trimmed === "0" || trimmed === "-") {
    return "Unknown"
  }

  return trimmed
}

function normalizeStatus(row: PerformanceUnifiedRow) {
  const completionStatus = row.completionStatus?.trim().toLowerCase()
  const department = normalizeDepartment(row.currentDepartment).toLowerCase()

  if (department.includes("cancel")) {
    return "cancelled" as const
  }

  if (completionStatus === "completed" || department.includes("invoice") || department.includes("warehouse") || department === "complete") {
    return "completed" as const
  }

  if (department === "unknown" || department === "0.0" || department.includes("duplicated")) {
    return "unknown" as const
  }

  if (department.includes("awaiting") || department === "issued" || department === "on hold") {
    return "not-started" as const
  }

  return "in-production" as const
}

function mapUnifiedRow(row: PerformanceUnifiedRow): PerformanceRecord {
  const effectiveDueDate = parseDate(row.effectiveDueDate)
  const completedDate = parseDate(row.finalStageEndDate)
  const today = startOfToday()
  const normalizedStatus = normalizeStatus(row)
  const isCompleted = normalizedStatus === "completed"
  const isActive = normalizedStatus !== "completed" && normalizedStatus !== "cancelled"
  const overdue = isActive && effectiveDueDate !== null && !isPlaceholderDate(effectiveDueDate) && effectiveDueDate < today
  const lateCompleted =
    isCompleted &&
    effectiveDueDate !== null &&
    completedDate !== null &&
    !isPlaceholderDate(effectiveDueDate) &&
    !isPlaceholderDate(completedDate) &&
    completedDate > effectiveDueDate

  const daysLate = overdue
    ? Math.max(0, Math.round((today.getTime() - (effectiveDueDate?.getTime() ?? today.getTime())) / 86400000))
    : lateCompleted
      ? Math.max(0, Math.round(((completedDate?.getTime() ?? today.getTime()) - (effectiveDueDate?.getTime() ?? today.getTime())) / 86400000))
      : 0

  const isAtRisk =
    isActive &&
    effectiveDueDate !== null &&
    !isPlaceholderDate(effectiveDueDate) &&
    effectiveDueDate >= today &&
    effectiveDueDate < addDays(today, 7) &&
    (normalizedStatus === "not-started" || normalizedStatus === "unknown" || (row.actualDays ?? 0) <= 0)

  return {
    productionLine: row.productionLine,
    salesOrderNumber: row.salesOrderNumber ?? "Unknown",
    clientName: row.clientName ?? "Unknown Client",
    productCode: row.productCode,
    description: [row.description1, row.description2, row.description3].filter(Boolean).join(" | ") || null,
    qty: row.qty ?? 0,
    sqm: row.sqm,
    salesOrderApprovalDate: row.approvalDate,
    startDate: row.startDate,
    dueDate: row.dueDate,
    revisedDueDate: row.revisedDueDate,
    effectiveDueDate: row.effectiveDueDate,
    currentDepartment: normalizeDepartment(row.currentDepartment),
    worksOrder: row.worksOrder ?? row.worksOrder2 ?? row.worksOrder3 ?? row.worksOrder4,
    actualProductionDays: row.actualDays,
    plannedProductionDays: row.plannedDays,
    varianceDays:
      row.actualDays != null && row.plannedDays != null ? row.actualDays - row.plannedDays : null,
    completedDate: row.finalStageEndDate,
    normalizedStatus,
    isActive,
    isCompleted,
    isOverdue: overdue,
    isLate: overdue || lateCompleted,
    isAtRisk,
    daysLate,
  }
}

function applyFilterRules(rows: PerformanceRecord[], filters: PerformanceDashboardFilters) {
  const today = startOfToday()
  const nextWeek = addDays(today, 7)

  return rows.filter((row) => {
    if (filters.workOrderStatus !== "all" && row.normalizedStatus !== filters.workOrderStatus) {
      return false
    }

    switch (filters.quickFilter) {
      case "overdue":
        return row.isOverdue
      case "due-this-week": {
        const dueDate = parseDate(row.effectiveDueDate)
        return row.isActive && dueDate !== null && dueDate >= today && dueDate < nextWeek
      }
      case "in-production":
        return row.normalizedStatus === "in-production"
      case "completed":
        return row.isCompleted
      case "late-jobs":
        return row.isLate
      default:
        return true
    }
  })
}

function labelForStatus(status: PerformanceWorkOrderStatus) {
  return workOrderStatusOptions.find((option) => option.value === status)?.label ?? status
}

function toDistribution(
  rows: Array<[string, number]>,
  total: number,
  labelFormatter?: (value: string) => string,
): PerformanceDistributionDatum[] {
  return rows.map(([key, value]) => ({
    key,
    label: labelFormatter ? labelFormatter(key) : key,
    value,
    percentage: round(percentage(value, total), 1),
  }))
}

function buildSummary(rows: PerformanceRecord[], efficiencyRows: PerformanceEfficiencyViewRow[]): PerformanceKpiSummary {
  const activeRows = rows.filter((row) => row.isActive)
  const completedRows = rows.filter((row) => row.isCompleted)
  const dueThisWeekRows = getDueThisWeekRows(rows)

  const totalQty = efficiencyRows.reduce((sum, row) => sum + (row.totalQty ?? 0), 0)
  const totalCompletedQty = efficiencyRows.reduce((sum, row) => sum + (row.qtyCompleted ?? 0), 0)

  return {
    totalActiveOrders: activeRows.length,
    overdueOrders: activeRows.filter((row) => row.isOverdue).length,
    dueThisWeek: dueThisWeekRows.length,
    completedOrders: completedRows.length,
    onTimeRate: completedRows.length > 0 ? round(percentage(completedRows.filter((row) => !row.isLate).length, completedRows.length), 1) : 0,
    lateRate: rows.length > 0 ? round(percentage(rows.filter((row) => row.isLate).length, rows.length), 1) : 0,
    averageProductionDays: round(average(rows.map((row) => row.actualProductionDays)), 1),
    plannedVsActualVariance: round(average(rows.map((row) => row.varianceDays)), 1),
    trackedQuantityCompletion: round(percentage(totalCompletedQty, totalQty), 1),
    ordersAtRisk: activeRows.filter((row) => row.isAtRisk).length,
  }
}

function buildLineBreakdown(rows: PerformanceRecord[]): PerformanceLineBreakdownDatum[] {
  const grouped = new Map<string, PerformanceLineBreakdownDatum>()

  for (const row of rows) {
    const entry = grouped.get(row.productionLine) ?? {
      productionLine: row.productionLine,
      totalOrders: 0,
      activeOrders: 0,
      overdueOrders: 0,
      completedOrders: 0,
      averageActualDays: null,
      averageVarianceDays: null,
    }

    entry.totalOrders += 1
    entry.activeOrders += row.isActive ? 1 : 0
    entry.overdueOrders += row.isOverdue ? 1 : 0
    entry.completedOrders += row.isCompleted ? 1 : 0
    grouped.set(row.productionLine, entry)
  }

  return Array.from(grouped.values())
    .map((entry) => {
      const lineRows = rows.filter((row) => row.productionLine === entry.productionLine)
      return {
        ...entry,
        averageActualDays: round(average(lineRows.map((row) => row.actualProductionDays)), 1) || null,
        averageVarianceDays: round(average(lineRows.map((row) => row.varianceDays)), 1) || null,
      }
    })
    .sort((left, right) => right.totalOrders - left.totalOrders)
}

function buildVisuals(rows: PerformanceRecord[], lineBreakdown: PerformanceLineBreakdownDatum[]) {
  const completedRows = rows.filter((row) => row.isCompleted)

  const onTimeVsLate = toDistribution(
    [
      ["on-time", completedRows.filter((row) => !row.isLate).length],
      ["late", completedRows.filter((row) => row.isLate).length],
    ],
    Math.max(completedRows.length, 1),
    (value) => (value === "on-time" ? "On Time" : "Late"),
  )

  const statusMap = new Map<string, number>()
  const departmentMap = new Map<string, number>()

  for (const row of rows) {
    statusMap.set(row.normalizedStatus, (statusMap.get(row.normalizedStatus) ?? 0) + 1)
    departmentMap.set(row.currentDepartment, (departmentMap.get(row.currentDepartment) ?? 0) + 1)
  }

  return {
    onTimeVsLate,
    workOrderStatusMix: toDistribution(Array.from(statusMap.entries()).sort((a, b) => b[1] - a[1]), Math.max(rows.length, 1), (value) =>
      labelForStatus(value as PerformanceWorkOrderStatus),
    ),
    departmentDistribution: toDistribution(Array.from(departmentMap.entries()).sort((a, b) => b[1] - a[1]), Math.max(rows.length, 1)),
    lineDistribution: lineBreakdown.map((line) => ({
      key: line.productionLine,
      label: line.productionLine,
      value: line.totalOrders,
      percentage: round(percentage(line.totalOrders, Math.max(rows.length, 1)), 1),
    })),
  }
}

function formatWeekLabel(year: number, week: number) {
  return `${year}-W${String(week).padStart(2, "0")}`
}

function getIsoWeek(date: Date) {
  const temp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = temp.getUTCDay() || 7
  temp.setUTCDate(temp.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(temp.getUTCFullYear(), 0, 1))
  return Math.ceil((((temp.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

function getIsoWeekYear(date: Date) {
  const temp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = temp.getUTCDay() || 7
  temp.setUTCDate(temp.getUTCDate() + 4 - dayNum)
  return temp.getUTCFullYear()
}

function buildTrendData(rows: PerformanceRecord[]): PerformanceTrendDatum[] {
  const grouped = new Map<string, PerformanceTrendDatum>()

  for (const row of rows) {
    const date = parseDate(row.salesOrderApprovalDate ?? row.effectiveDueDate)
    if (!date || isPlaceholderDate(date)) {
      continue
    }

    const week = getIsoWeek(date)
    const year = getIsoWeekYear(date)
    const key = `${year}-${week}`
    const entry = grouped.get(key) ?? {
      periodKey: key,
      periodLabel: formatWeekLabel(year, week),
      createdOrders: 0,
      completedOrders: 0,
      overdueOrders: 0,
      averageProductionDays: 0,
      onTimeRate: 0,
    }

    entry.createdOrders += 1
    entry.completedOrders += row.isCompleted ? 1 : 0
    entry.overdueOrders += row.isOverdue ? 1 : 0
    grouped.set(key, entry)
  }

  return Array.from(grouped.values())
    .sort((left, right) => left.periodKey.localeCompare(right.periodKey))
    .map((entry) => {
      const weekRows = rows.filter((row) => {
        const date = parseDate(row.salesOrderApprovalDate ?? row.effectiveDueDate)
        if (!date || isPlaceholderDate(date)) return false
        return formatWeekLabel(getIsoWeekYear(date), getIsoWeek(date)) === entry.periodLabel
      })

      const completedRows = weekRows.filter((row) => row.isCompleted)
      return {
        ...entry,
        averageProductionDays: round(average(weekRows.map((row) => row.actualProductionDays)), 1),
        onTimeRate:
          completedRows.length > 0 ? round(percentage(completedRows.filter((row) => !row.isLate).length, completedRows.length), 1) : 0,
      }
    })
}

function toBreakdown(
  rows: PerformanceRecord[],
  selector: (row: PerformanceRecord) => string,
  limit = 8,
): PerformanceBreakdownDatum[] {
  const grouped = new Map<string, { value: number; lateCount: number; completedCount: number; onTimeCompletedCount: number }>()

  for (const row of rows) {
    const key = selector(row)
    const entry = grouped.get(key) ?? { value: 0, lateCount: 0, completedCount: 0, onTimeCompletedCount: 0 }
    entry.value += 1
    entry.lateCount += row.isLate ? 1 : 0
    entry.completedCount += row.isCompleted ? 1 : 0
    entry.onTimeCompletedCount += row.isCompleted && !row.isLate ? 1 : 0
    grouped.set(key, entry)
  }

  return Array.from(grouped.entries())
    .map(([key, value]) => ({
      key,
      label: key,
      value: value.value,
      lateCount: value.lateCount,
      onTimeRate: value.completedCount > 0 ? round(percentage(value.onTimeCompletedCount, value.completedCount), 1) : null,
    }))
    .sort((left, right) => right.value - left.value)
    .slice(0, limit)
}

function buildBreakdowns(rows: PerformanceRecord[]) {
  const lateRows = rows.filter((row) => row.isLate)

  return {
    departments: toBreakdown(rows, (row) => row.currentDepartment),
    clients: toBreakdown(rows, (row) => row.clientName),
    productCodes: toBreakdown(rows, (row) => row.productCode ?? "Unknown Product"),
    workOrderStatuses: toBreakdown(rows, (row) => labelForStatus(row.normalizedStatus)),
    delayedClients: toBreakdown(lateRows, (row) => row.clientName),
    delayedProducts: toBreakdown(lateRows, (row) => row.productCode ?? "Unknown Product"),
  }
}

function getDueThisWeekRows(rows: PerformanceRecord[]) {
  const today = startOfToday()
  const endExclusive = addDays(today, 7)

  return rows.filter((row) => {
    if (!row.isActive) {
      return false
    }

    const dueDate = parseDate(row.effectiveDueDate)
    return dueDate !== null && !isPlaceholderDate(dueDate) && dueDate >= today && dueDate < endExclusive
  })
}

function getKpiRows(rows: PerformanceRecord[], selected: PerformanceKpiView) {
  switch (selected) {
    case "total-active-orders":
      return rows.filter((row) => row.isActive)
    case "overdue-orders":
      return rows.filter((row) => row.isOverdue)
    case "due-this-week":
      return getDueThisWeekRows(rows)
    case "completed-orders":
      return rows.filter((row) => row.isCompleted)
    case "orders-at-risk":
      return rows.filter((row) => row.isAtRisk)
    default:
      return []
  }
}

function buildKpiDrilldown(rows: PerformanceRecord[], selected: PerformanceKpiView) {
  if (selected === "none") {
    return {
      selected,
      title: null,
      description: null,
      rows: [] as PerformanceKpiDrilldownRow[],
    }
  }

  const copy = [...getKpiRows(rows, selected)].sort((left, right) => {
    if (right.daysLate !== left.daysLate) {
      return right.daysLate - left.daysLate
    }

    const rightDue = parseDate(right.effectiveDueDate)?.getTime() ?? 0
    const leftDue = parseDate(left.effectiveDueDate)?.getTime() ?? 0
    return rightDue - leftDue
  })

  const content: Record<Exclude<PerformanceKpiView, "none">, { title: string; description: string }> = {
    "total-active-orders": {
      title: "Total Active Orders Records",
      description: "Operationally active production orders after the current dashboard filters are applied.",
    },
    "overdue-orders": {
      title: "Overdue Orders Records",
      description: "Open orders whose effective due date has already passed.",
    },
    "due-this-week": {
      title: "Due This Week Records",
      description: "Open orders with an effective due date from today up to, but not including, 7 days ahead.",
    },
    "completed-orders": {
      title: "Completed Orders Records",
      description: "Orders already completed in the current reporting slice.",
    },
    "orders-at-risk": {
      title: "Orders at Risk Records",
      description: "Orders due soon with low progress or an adverse operational status.",
    },
  }

  return {
    selected,
    title: content[selected].title,
    description: content[selected].description,
    rows: copy.slice(0, 200).map((row) => ({
      productionLine: row.productionLine,
      salesOrderNumber: row.salesOrderNumber,
      worksOrder: row.worksOrder,
      client: row.clientName,
      productCode: row.productCode,
      currentDepartment: row.currentDepartment,
      salesOrderApprovalDate: row.salesOrderApprovalDate,
      effectiveDueDate: row.effectiveDueDate,
      completedDate: row.completedDate,
      daysLate: row.daysLate,
      status: row.normalizedStatus,
      qty: row.qty,
      plannedDays: row.plannedProductionDays,
      actualDays: row.actualProductionDays,
      varianceDays: row.varianceDays,
    })),
  }
}

function toRiskFlag(daysLate: number, status: PerformanceWorkOrderStatus) {
  if (daysLate >= 14 || status === "delayed") {
    return "Critical" as const
  }
  if (daysLate > 0 || status === "not-started") {
    return "High" as const
  }
  return "Watch" as const
}

function buildEfficiencySummaries(rows: PerformanceEfficiencyViewRow[]): PerformanceEfficiencySummary[] {
  const grouped = new Map<string, PerformanceEfficiencySummary>()

  for (const row of rows) {
    const entry = grouped.get(row.productionLine) ?? {
      productionLine: row.productionLine,
      averageEfficiency: 0,
      totalQty: 0,
      qtyCompleted: 0,
      qtyOutstanding: 0,
      totalOrders: 0,
      completedOrders: 0,
      openOrders: 0,
    }

    entry.totalQty += row.totalQty ?? 0
    entry.qtyCompleted += row.qtyCompleted ?? 0
    entry.qtyOutstanding += row.qtyOutstanding ?? 0
    entry.totalOrders = (entry.totalOrders ?? 0) + (row.totalOrders ?? 0)
    entry.completedOrders = (entry.completedOrders ?? 0) + (row.completedOrders ?? 0)
    entry.openOrders = (entry.openOrders ?? 0) + (row.openOrders ?? 0)
    grouped.set(row.productionLine, entry)
  }

  return Array.from(grouped.values())
    .map((entry) => ({
      ...entry,
      averageEfficiency: entry.totalQty > 0 ? round(percentage(entry.qtyCompleted, entry.totalQty), 1) : 0,
      totalOrders: entry.totalOrders ? entry.totalOrders : null,
      completedOrders: entry.completedOrders ? entry.completedOrders : null,
      openOrders: entry.openOrders ? entry.openOrders : null,
    }))
    .sort((left, right) => right.averageEfficiency - left.averageEfficiency)
}

function buildEfficiencyTrend(rows: PerformanceEfficiencyViewRow[]): PerformanceEfficiencyTrendDatum[] {
  const grouped = new Map<string, { totalQty: number; qtyCompleted: number; qtyOutstanding: number }>()

  for (const row of rows) {
    const key = row.dueWeek
    const entry = grouped.get(key) ?? { totalQty: 0, qtyCompleted: 0, qtyOutstanding: 0 }
    entry.totalQty += row.totalQty ?? 0
    entry.qtyCompleted += row.qtyCompleted ?? 0
    entry.qtyOutstanding += row.qtyOutstanding ?? 0
    grouped.set(key, entry)
  }

  return Array.from(grouped.entries())
    .sort((left, right) => Number(left[0]) - Number(right[0]))
    .map(([dueWeek, value]) => ({
      dueWeek: `Week ${dueWeek}`,
      efficiency: value.totalQty > 0 ? round(percentage(value.qtyCompleted, value.totalQty), 1) : 0,
      totalQty: round(value.totalQty, 0),
      qtyCompleted: round(value.qtyCompleted, 0),
      qtyOutstanding: round(value.qtyOutstanding, 0),
    }))
}

function buildExceptions(rows: PerformanceRecord[], exceptionRows: Awaited<ReturnType<typeof findPerformanceExceptions>>["data"]): PerformanceExceptionRow[] {
  return exceptionRows.slice(0, 50).map((row) => {
    const matching =
      rows.find(
        (item) =>
          item.productionLine === row.productionLine &&
          item.salesOrderNumber === (row.salesOrderNumber ?? "Unknown") &&
          item.productCode === row.productCode,
      ) ?? null

    const effectiveDueDate = parseDate(row.effectiveDueDate)
    const finalStageEndDate = parseDate(row.finalStageEndDate)
    const daysLate =
      matching?.daysLate ??
      (effectiveDueDate && !isPlaceholderDate(effectiveDueDate)
        ? Math.max(
            0,
            Math.round(
              (((finalStageEndDate && !isPlaceholderDate(finalStageEndDate) ? finalStageEndDate : startOfToday()).getTime()) -
                effectiveDueDate.getTime()) /
                86400000,
            ),
          )
        : 0)
    const status = matching?.normalizedStatus ?? (row.completionStatus?.toLowerCase() === "completed" ? "completed" : "delayed")

    return {
      productionLine: row.productionLine,
      salesOrderNumber: row.salesOrderNumber ?? "Unknown",
      worksOrder: matching?.worksOrder ?? null,
      client: row.client ?? "Unknown Client",
      productCode: row.productCode,
      currentDepartment: normalizeDepartment(row.currentDepartment),
      effectiveDueDate: row.effectiveDueDate,
      finalStageEndDate: row.finalStageEndDate,
      daysLate,
      status,
      qty: row.qty ?? 0,
      plannedDays: row.plannedDays,
      actualDays: row.actualDays,
      varianceDays: row.daysVariance,
      riskFlag: toRiskFlag(daysLate, status),
    }
  })
}

function buildEmptyDashboard(filters: PerformanceDashboardFilters): PerformanceDashboardData {
  return {
    filters,
    options: {
      lines: [],
      clients: [],
      departments: [],
      productCodes: [],
      workOrderStatuses: workOrderStatusOptions,
      quickFilters: quickFilterOptions,
      datePresets: datePresetOptions,
    },
    summary: {
      totalActiveOrders: 0,
      overdueOrders: 0,
      dueThisWeek: 0,
      completedOrders: 0,
      onTimeRate: 0,
      lateRate: 0,
      averageProductionDays: 0,
      plannedVsActualVariance: 0,
      trackedQuantityCompletion: 0,
      ordersAtRisk: 0,
    },
    lineBreakdown: [],
    visuals: {
      onTimeVsLate: [],
      workOrderStatusMix: [],
      departmentDistribution: [],
      quantityCompletion: {
        percent: 0,
        trackedQty: 0,
        releasedQty: 0,
      },
    },
    trends: [],
    efficiency: {
      summaries: [],
      trend: [],
    },
    breakdowns: {
      departments: [],
      clients: [],
      productCodes: [],
      workOrderStatuses: [],
      delayedClients: [],
      delayedProducts: [],
    },
    kpiDrilldown: {
      selected: filters.kpiView,
      title: null,
      description: null,
      rows: [],
    },
    exceptions: [],
    lastRefreshed: new Date().toISOString(),
  }
}

export async function getPerformanceDashboardSummary(filters: PerformanceDashboardFilters) {
  const resolvedFilters = resolveFilters(filters)
  const rowsResult = await findPerformanceUnifiedRows(resolvedFilters)

  if (rowsResult.dataSource !== "database") {
    return {
      item: {
        summary: buildEmptyDashboard(resolvedFilters).summary,
        lineBreakdown: [] as PerformanceLineBreakdownDatum[],
      },
      meta: toMeta("unavailable"),
    }
  }

  const rows = applyFilterRules(rowsResult.data.map(mapUnifiedRow), resolvedFilters)
  const efficiencyResult = await findPerformanceEfficiency(resolvedFilters)

  return {
    item: {
      summary: buildSummary(rows, efficiencyResult.dataSource === "database" ? efficiencyResult.data : []),
      lineBreakdown: buildLineBreakdown(rows),
    },
    meta: toMeta("database"),
  }
}

export async function getPerformanceDashboardTrends(filters: PerformanceDashboardFilters) {
  const resolvedFilters = resolveFilters(filters)
  const rowsResult = await findPerformanceUnifiedRows(resolvedFilters)

  if (rowsResult.dataSource !== "database") {
    return {
      item: {
        trends: [] as PerformanceTrendDatum[],
        breakdowns: {
          departments: [] as PerformanceBreakdownDatum[],
          clients: [] as PerformanceBreakdownDatum[],
        },
      },
      meta: toMeta("unavailable"),
    }
  }

  const rows = applyFilterRules(rowsResult.data.map(mapUnifiedRow), resolvedFilters)
  return {
    item: {
      trends: buildTrendData(rows),
      breakdowns: {
        departments: toBreakdown(rows, (row) => `${row.productionLine} • ${row.currentDepartment}`),
        clients: toBreakdown(rows, (row) => row.clientName),
      },
    },
    meta: toMeta("database"),
  }
}

export async function getPerformanceDashboardExceptions(filters: PerformanceDashboardFilters) {
  const resolvedFilters = resolveFilters(filters)
  const [rowsResult, exceptionsResult] = await Promise.all([
    findPerformanceUnifiedRows(resolvedFilters),
    findPerformanceExceptions(resolvedFilters),
  ])

  if (rowsResult.dataSource !== "database" || exceptionsResult.dataSource !== "database") {
    return {
      item: [] as PerformanceExceptionRow[],
      meta: toMeta("unavailable"),
    }
  }

  const rows = applyFilterRules(rowsResult.data.map(mapUnifiedRow), resolvedFilters)
  return {
    item: buildExceptions(rows, exceptionsResult.data),
    meta: toMeta("database"),
  }
}

export async function getPerformanceDashboardFilters() {
  const optionsResult = await findPerformanceDashboardFilters()
  return {
    item:
      optionsResult.dataSource === "database"
        ? {
            lines: optionsResult.data.lines ?? [],
            clients: optionsResult.data.clients ?? [],
            departments: optionsResult.data.departments ?? [],
            productCodes: optionsResult.data.productCodes ?? [],
          }
        : {
            lines: [],
            clients: [],
            departments: [],
            productCodes: [],
          },
    meta: toMeta(optionsResult.dataSource),
  }
}

export async function getPerformanceDashboardEfficiency(filters: PerformanceDashboardFilters) {
  const resolvedFilters = resolveFilters(filters)
  const result = await findPerformanceEfficiency(resolvedFilters)

  if (result.dataSource !== "database") {
    return {
      item: {
        summaries: [] as PerformanceEfficiencySummary[],
        trend: [] as PerformanceEfficiencyTrendDatum[],
      },
      meta: toMeta("unavailable"),
    }
  }

  return {
    item: {
      summaries: buildEfficiencySummaries(result.data),
      trend: buildEfficiencyTrend(result.data),
    },
    meta: toMeta("database"),
  }
}

export async function getPerformanceDashboardViewSummary() {
  const result = await findPerformanceSummaryViews()
  return {
    item: result.data,
    meta: toMeta(result.dataSource),
  }
}

export async function getPerformanceDashboardViewTrends() {
  const result = await findPerformanceTrendViews()
  return {
    item: result.data,
    meta: toMeta(result.dataSource),
  }
}

export async function getPerformanceDashboard(filters: PerformanceDashboardFilters): Promise<{
  item: PerformanceDashboardData
  meta: DataAccessMeta
}> {
  const resolvedFilters = resolveFilters(filters)
  const [rowsResult, optionsResult, exceptionsResult, efficiencyResult] = await Promise.all([
    findPerformanceUnifiedRows(resolvedFilters),
    findPerformanceDashboardFilters(),
    findPerformanceExceptions(resolvedFilters),
    findPerformanceEfficiency(resolvedFilters),
  ])

  if (rowsResult.dataSource !== "database") {
    return {
      item: buildEmptyDashboard(resolvedFilters),
      meta: toMeta("unavailable"),
    }
  }

  const rows = applyFilterRules(rowsResult.data.map(mapUnifiedRow), resolvedFilters)
  const lineBreakdown = buildLineBreakdown(rows)
  const visuals = buildVisuals(rows, lineBreakdown)
  const efficiencySummaries = efficiencyResult.dataSource === "database" ? buildEfficiencySummaries(efficiencyResult.data) : []
  const efficiencyTrend = efficiencyResult.dataSource === "database" ? buildEfficiencyTrend(efficiencyResult.data) : []
  const totalCompletedQty = efficiencySummaries.reduce((sum, row) => sum + row.qtyCompleted, 0)
  const totalQty = efficiencySummaries.reduce((sum, row) => sum + row.totalQty, 0)

  const item: PerformanceDashboardData = {
    filters: resolvedFilters,
    options: {
      lines: optionsResult.dataSource === "database" ? optionsResult.data.lines ?? [] : [],
      clients: optionsResult.dataSource === "database" ? optionsResult.data.clients ?? [] : [],
      departments: optionsResult.dataSource === "database" ? optionsResult.data.departments ?? [] : [],
      productCodes: optionsResult.dataSource === "database" ? optionsResult.data.productCodes ?? [] : [],
      workOrderStatuses: workOrderStatusOptions,
      quickFilters: quickFilterOptions,
      datePresets: datePresetOptions,
    },
    summary: buildSummary(rows, efficiencyResult.dataSource === "database" ? efficiencyResult.data : []),
    lineBreakdown,
    visuals: {
      onTimeVsLate: visuals.onTimeVsLate,
      workOrderStatusMix: visuals.workOrderStatusMix,
      departmentDistribution: visuals.departmentDistribution,
      quantityCompletion: {
        percent: round(percentage(totalCompletedQty, totalQty), 1),
        trackedQty: round(totalCompletedQty, 0),
        releasedQty: round(totalQty, 0),
      },
    },
    trends: buildTrendData(rows),
    efficiency: {
      summaries: efficiencySummaries,
      trend: efficiencyTrend,
    },
    breakdowns: buildBreakdowns(rows),
    kpiDrilldown: buildKpiDrilldown(rows, resolvedFilters.kpiView),
    exceptions:
      exceptionsResult.dataSource === "database" ? buildExceptions(rows, exceptionsResult.data) : [],
    lastRefreshed: new Date().toISOString(),
  }

  return {
    item,
    meta: toMeta("database"),
  }
}

function csvEscape(value: string | number | null) {
  const normalized = value == null ? "" : String(value)
  if (normalized.includes(",") || normalized.includes('"') || normalized.includes("\n")) {
    return `"${normalized.replaceAll('"', '""')}"`
  }
  return normalized
}

export async function exportPerformanceExceptionsCsv(filters: PerformanceDashboardFilters) {
  const result = await getPerformanceDashboardExceptions(filters)
  const headers = [
    "Production Line",
    "Sale Order Number",
    "Works Order",
    "Client",
    "Product Code",
    "Current Department",
    "Effective Due Date",
    "Final Stage End Date",
    "Days Late",
    "Status",
    "Qty",
    "Planned Days",
    "Actual Days",
    "Variance Days",
    "Risk Flag",
  ]

  const rows = result.item.map((exception) =>
    [
      exception.productionLine,
      exception.salesOrderNumber,
      exception.worksOrder,
      exception.client,
      exception.productCode,
      exception.currentDepartment,
      exception.effectiveDueDate,
      exception.finalStageEndDate,
      exception.daysLate,
      labelForStatus(exception.status),
      exception.qty,
      exception.plannedDays,
      exception.actualDays,
      exception.varianceDays,
      exception.riskFlag,
    ]
      .map(csvEscape)
      .join(","),
  )

  return {
    csv: [headers.join(","), ...rows].join("\n"),
    meta: result.meta,
  }
}

export function buildSummaryFromViewRows(kpiRow: PerformanceDashboardKpiRow | null): PerformanceKpiSummary {
  return {
    totalActiveOrders: kpiRow?.activeOrders ?? 0,
    overdueOrders: kpiRow?.overdueOrders ?? 0,
    dueThisWeek: kpiRow?.dueNext7Days ?? 0,
    completedOrders: kpiRow?.completedOrders ?? 0,
    onTimeRate: round(kpiRow?.onTimeRatePct ?? 0, 1),
    lateRate: round(kpiRow?.lateRatePct ?? 0, 1),
    averageProductionDays: round(kpiRow?.avgActualDays ?? 0, 1),
    plannedVsActualVariance: round(kpiRow?.avgVarianceDays ?? 0, 1),
    trackedQuantityCompletion: 0,
    ordersAtRisk: 0,
  }
}

export function buildLineBreakdownFromViewRows(rows: PerformanceDashboardByLineRow[]): PerformanceLineBreakdownDatum[] {
  return rows.map((row) => ({
    productionLine: row.productionLine,
    totalOrders: row.totalOrders,
    activeOrders: row.activeOrders,
    overdueOrders: row.overdueOrders,
    completedOrders: row.completedOrders,
    averageActualDays: row.avgActualDays == null ? null : round(row.avgActualDays, 1),
    averageVarianceDays: row.avgVarianceDays == null ? null : round(row.avgVarianceDays, 1),
  }))
}

export function buildTrendDataFromViewRows(rows: PerformanceDashboardWeeklyTrendRow[]): PerformanceTrendDatum[] {
  return rows.map((row) => ({
    periodKey: `${row.yearNum}-${row.weekNum}`,
    periodLabel: formatWeekLabel(row.yearNum, row.weekNum),
    createdOrders: row.totalOrders,
    completedOrders: row.completedOrders,
    overdueOrders: row.overdueOrders,
    averageProductionDays: 0,
    onTimeRate: 0,
  }))
}

export function buildClientBreakdownFromViewRows(rows: PerformanceDashboardByClientRow[]): PerformanceBreakdownDatum[] {
  return rows.slice(0, 10).map((row) => ({
    key: row.client,
    label: row.client,
    value: row.totalOrders,
    lateCount: row.overdueOrders,
    onTimeRate: null,
  }))
}

export function buildDepartmentBreakdownFromViewRows(rows: PerformanceDashboardByDepartmentRow[]): PerformanceBreakdownDatum[] {
  return rows.slice(0, 20).map((row) => ({
    key: `${row.productionLine}:${row.currentDepartment}`,
    label: `${row.productionLine} • ${row.currentDepartment}`,
    value: row.totalOrders,
    lateCount: 0,
    onTimeRate: null,
  }))
}
