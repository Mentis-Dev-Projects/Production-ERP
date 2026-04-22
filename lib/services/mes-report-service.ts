import type { MesProductionLineEfficiencyFilters } from "@/lib/validations/mes-reporting"

export type MesEfficiencyCardMetric = {
  headline: string
  supportingText: string
  deltaDown: number
  deltaUp: number
}

export type MesDepartmentEfficiencyDatum = {
  department: string
  efficiency: number
}

export type MesPlanVsActualDatum = {
  label: string
  planned: number
  actual: number
}

export type MesOrdersReceivedDatum = {
  label: string
  value: number
}

export type MesOrdersWaitingDatum = {
  name: string
  value: number
}

export type MesOrdersCompletedDatum = {
  label: string
  completed: number
}

export type MesSampleStackDatum = {
  label: string
  seriesA: number
  seriesB: number
  seriesC: number
}

export type MesSampleBarDatum = {
  label: string
  value: number
}

export type MesProductionLineEfficiencyReport = {
  filters: MesProductionLineEfficiencyFilters
  resolvedRangeLabel: string
  rangeStart: string
  rangeEnd: string
  streamLabel: string
  metricCard: MesEfficiencyCardMetric
  departmentEfficiency: MesDepartmentEfficiencyDatum[]
  planVsActual: MesPlanVsActualDatum[]
  ordersReceived: {
    percent: number
    description: string
    series: MesOrdersReceivedDatum[]
  }
  ordersWaiting: {
    percent: number
    description: string
    series: MesOrdersWaitingDatum[]
  }
  ordersCompleted: {
    percent: number
    description: string
    series: MesOrdersCompletedDatum[]
  }
  bottomLeft: MesSampleStackDatum[]
  bottomRight: {
    percentDown: number
    percentUp: number
    series: MesSampleBarDatum[]
  }
}

const streamLabels: Record<MesProductionLineEfficiencyFilters["stream"], string> = {
  rectagrid: "Rectagrid",
  "expanded-metal": "Mentex",
  handrailing: "HandRailing",
  mentrail: "Mentrail",
  "press-shop": "Press Shop",
}

function toDateInput(date: Date) {
  return date.toISOString().slice(0, 10)
}

function startOfToday() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function resolveRange(filters: MesProductionLineEfficiencyFilters) {
  const today = startOfToday()

  switch (filters.range) {
    case "previous-day": {
      const target = addDays(today, -1)
      return {
        label: "Previous Day",
        start: toDateInput(target),
        end: toDateInput(target),
      }
    }
    case "previous-week": {
      const start = addDays(today, -7)
      const end = addDays(today, -1)
      return {
        label: "Previous Week",
        start: toDateInput(start),
        end: toDateInput(end),
      }
    }
    case "previous-month": {
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      const end = new Date(today.getFullYear(), today.getMonth(), 0)
      return {
        label: "Previous Month",
        start: toDateInput(start),
        end: toDateInput(end),
      }
    }
    case "custom": {
      return {
        label: "Custom Range",
        start: filters.startDate || toDateInput(today),
        end: filters.endDate || toDateInput(today),
      }
    }
    default:
      return {
        label: "Current",
        start: toDateInput(today),
        end: toDateInput(today),
      }
  }
}

function streamFactor(stream: MesProductionLineEfficiencyFilters["stream"]) {
  switch (stream) {
    case "rectagrid":
      return 1
    case "expanded-metal":
      return 0.92
    case "handrailing":
      return 0.88
    case "mentrail":
      return 0.95
    case "press-shop":
      return 1.06
    default:
      return 1
  }
}

function rangeFactor(range: MesProductionLineEfficiencyFilters["range"]) {
  switch (range) {
    case "previous-day":
      return 0.84
    case "previous-week":
      return 0.93
    case "previous-month":
      return 1.08
    case "custom":
      return 0.98
    default:
      return 1
  }
}

function scale(base: number, stream: MesProductionLineEfficiencyFilters["stream"], range: MesProductionLineEfficiencyFilters["range"]) {
  return Math.round(base * streamFactor(stream) * rangeFactor(range))
}

export async function getMesProductionLineEfficiencyReport(
  filters: MesProductionLineEfficiencyFilters,
): Promise<MesProductionLineEfficiencyReport> {
  const resolvedRange = resolveRange(filters)
  const streamLabel = streamLabels[filters.stream]

  return {
    filters,
    resolvedRangeLabel: resolvedRange.label,
    rangeStart: resolvedRange.start,
    rangeEnd: resolvedRange.end,
    streamLabel,
    metricCard: {
      headline: `${scale(99, filters.stream, filters.range)}%`,
      supportingText: `Dummy efficiency shell for ${streamLabel} across the selected reporting range.`,
      deltaDown: scale(9, filters.stream, filters.range),
      deltaUp: scale(11, filters.stream, filters.range),
    },
    departmentEfficiency: [
      { department: "Production Planning", efficiency: scale(86, filters.stream, filters.range) },
      { department: "Punching", efficiency: scale(91, filters.stream, filters.range) },
      { department: "Milling", efficiency: scale(88, filters.stream, filters.range) },
      { department: "Fabrication", efficiency: scale(94, filters.stream, filters.range) },
      { department: "Finishing", efficiency: scale(89, filters.stream, filters.range) },
      { department: "Q&M / Invoicing", efficiency: scale(96, filters.stream, filters.range) },
    ],
    planVsActual: [
      { label: "W1", planned: scale(70, filters.stream, filters.range), actual: scale(66, filters.stream, filters.range) },
      { label: "W2", planned: scale(82, filters.stream, filters.range), actual: scale(74, filters.stream, filters.range) },
      { label: "W3", planned: scale(78, filters.stream, filters.range), actual: scale(81, filters.stream, filters.range) },
      { label: "W4", planned: scale(90, filters.stream, filters.range), actual: scale(72, filters.stream, filters.range) },
      { label: "W5", planned: scale(104, filters.stream, filters.range), actual: scale(96, filters.stream, filters.range) },
    ],
    ordersReceived: {
      percent: scale(99, filters.stream, filters.range),
      description: `Orders released into the ${streamLabel} reporting slice.`,
      series: [
        { label: "Mon", value: scale(43, filters.stream, filters.range) },
        { label: "Tue", value: scale(24, filters.stream, filters.range) },
        { label: "Wed", value: scale(20, filters.stream, filters.range) },
        { label: "Thu", value: scale(15, filters.stream, filters.range) },
      ],
    },
    ordersWaiting: {
      percent: scale(99, filters.stream, filters.range),
      description: `Waiting orders grouped for ${streamLabel} workflow staging.`,
      series: [
        { name: "Planning", value: scale(18, filters.stream, filters.range) },
        { name: "Punching", value: scale(24, filters.stream, filters.range) },
        { name: "Fabrication", value: scale(29, filters.stream, filters.range) },
        { name: "Finishing", value: scale(17, filters.stream, filters.range) },
        { name: "Hold", value: scale(12, filters.stream, filters.range) },
      ],
    },
    ordersCompleted: {
      percent: scale(99, filters.stream, filters.range),
      description: `Completed order movement in the selected ${resolvedRange.label.toLowerCase()} window.`,
      series: [
        { label: "Mon", completed: scale(10, filters.stream, filters.range) },
        { label: "Tue", completed: scale(18, filters.stream, filters.range) },
        { label: "Wed", completed: scale(12, filters.stream, filters.range) },
        { label: "Thu", completed: scale(21, filters.stream, filters.range) },
        { label: "Fri", completed: scale(17, filters.stream, filters.range) },
      ],
    },
    bottomLeft: [
      { label: "Line A", seriesA: scale(4.5, filters.stream, filters.range), seriesB: scale(2.8, filters.stream, filters.range), seriesC: scale(5, filters.stream, filters.range) },
      { label: "Line B", seriesA: scale(3.5, filters.stream, filters.range), seriesB: scale(1.8, filters.stream, filters.range), seriesC: scale(3, filters.stream, filters.range) },
      { label: "Line C", seriesA: scale(2.5, filters.stream, filters.range), seriesB: scale(4.4, filters.stream, filters.range), seriesC: scale(2, filters.stream, filters.range) },
      { label: "Line D", seriesA: scale(4.3, filters.stream, filters.range), seriesB: scale(2.4, filters.stream, filters.range), seriesC: scale(2, filters.stream, filters.range) },
    ],
    bottomRight: {
      percentDown: scale(9, filters.stream, filters.range),
      percentUp: scale(11, filters.stream, filters.range),
      series: [
        { label: "01", value: scale(43, filters.stream, filters.range) },
        { label: "02", value: scale(24, filters.stream, filters.range) },
        { label: "03", value: scale(20, filters.stream, filters.range) },
        { label: "04", value: scale(15, filters.stream, filters.range) },
      ],
    },
  }
}
