import type { MesOutputEfficiencyFilters } from "@/lib/validations/mes-reporting"

export type MesOutputGauge = {
  headline: string
  target: number
  availability: number
  performance: number
  quality: number
}

export type MesAvailabilityDatum = {
  label: string
  availability: number
  target: number
}

export type MesDowntimeDatum = {
  group: string
  hours: number
}

export type MesOutputEfficiencyReport = {
  filters: MesOutputEfficiencyFilters
  streamLabel: string
  resolvedRangeLabel: string
  rangeStart: string
  rangeEnd: string
  lineLabel: string
  overallOee: MesOutputGauge
  lineOee: MesOutputGauge
  availability: MesAvailabilityDatum[]
  downtimeLast7Days: MesDowntimeDatum[]
  downtimeLast30Days: MesDowntimeDatum[]
}

const streamLabels: Record<MesOutputEfficiencyFilters["stream"], string> = {
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

function resolveRange(filters: MesOutputEfficiencyFilters) {
  const today = startOfToday()

  switch (filters.range) {
    case "previous-day": {
      const target = addDays(today, -1)
      return { label: "Previous Day", start: toDateInput(target), end: toDateInput(target) }
    }
    case "previous-week": {
      return { label: "Previous Week", start: toDateInput(addDays(today, -7)), end: toDateInput(addDays(today, -1)) }
    }
    case "previous-month": {
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      const end = new Date(today.getFullYear(), today.getMonth(), 0)
      return { label: "Previous Month", start: toDateInput(start), end: toDateInput(end) }
    }
    case "custom":
      return {
        label: "Custom Range",
        start: filters.startDate || toDateInput(today),
        end: filters.endDate || toDateInput(today),
      }
    default:
      return { label: "Current", start: toDateInput(today), end: toDateInput(today) }
  }
}

function streamFactor(stream: MesOutputEfficiencyFilters["stream"]) {
  switch (stream) {
    case "rectagrid":
      return 1
    case "expanded-metal":
      return 0.93
    case "handrailing":
      return 0.89
    case "mentrail":
      return 0.96
    case "press-shop":
      return 1.04
  }
}

function rangeFactor(range: MesOutputEfficiencyFilters["range"]) {
  switch (range) {
    case "previous-day":
      return 0.82
    case "previous-week":
      return 0.94
    case "previous-month":
      return 1.05
    case "custom":
      return 0.98
    default:
      return 1
  }
}

function lineFactor(line: MesOutputEfficiencyFilters["line"]) {
  return 0.9 + Number(line) * 0.015
}

function scale(base: number, filters: MesOutputEfficiencyFilters, digits = 1) {
  const value = base * streamFactor(filters.stream) * rangeFactor(filters.range) * lineFactor(filters.line)
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

export async function getMesOutputEfficiencyReport(filters: MesOutputEfficiencyFilters): Promise<MesOutputEfficiencyReport> {
  const resolvedRange = resolveRange(filters)
  const streamLabel = streamLabels[filters.stream]
  const lineLabel = `Line ${filters.line}`

  return {
    filters,
    streamLabel,
    resolvedRangeLabel: resolvedRange.label,
    rangeStart: resolvedRange.start,
    rangeEnd: resolvedRange.end,
    lineLabel,
    overallOee: {
      headline: `${scale(67.3, filters)}%`,
      target: 80,
      availability: scale(76.4, filters),
      performance: scale(89.7, filters),
      quality: scale(98.2, filters),
    },
    lineOee: {
      headline: `${scale(57.3, filters)}%`,
      target: 80,
      availability: scale(67.7, filters),
      performance: scale(85.8, filters),
      quality: scale(98.7, filters),
    },
    availability: [
      { label: "Day 17", availability: scale(88, filters), target: 86 },
      { label: "Day 19", availability: scale(87, filters), target: 86 },
      { label: "Day 21", availability: scale(86, filters), target: 86 },
      { label: "Day 23", availability: scale(89, filters), target: 86 },
      { label: "Day 25", availability: scale(87, filters), target: 86 },
      { label: "Day 27", availability: scale(38, filters), target: 86 },
      { label: "Day 29", availability: scale(41, filters), target: 86 },
      { label: "Day 31", availability: scale(49, filters), target: 86 },
      { label: "Day 02", availability: scale(86, filters), target: 86 },
      { label: "Day 04", availability: scale(88, filters), target: 86 },
      { label: "Day 06", availability: scale(89, filters), target: 86 },
      { label: "Day 08", availability: scale(88, filters), target: 86 },
      { label: "Day 10", availability: scale(87, filters), target: 86 },
      { label: "Day 12", availability: scale(86, filters), target: 86 },
      { label: "Day 14", availability: scale(87, filters), target: 86 },
    ],
    downtimeLast7Days: [
      { group: "Work Arrangement", hours: scale(16, filters, 1) },
      { group: "Uncommented", hours: scale(13, filters, 1) },
      { group: "Organisational", hours: scale(8, filters, 1) },
      { group: "Technical", hours: scale(6, filters, 1) },
      { group: "Maintenance", hours: scale(3.2, filters, 1) },
      { group: "Setup", hours: scale(2.9, filters, 1) },
      { group: "Meetings", hours: scale(1.3, filters, 1) },
    ],
    downtimeLast30Days: [
      { group: "Uncommented", hours: scale(7.2, filters, 1) },
      { group: "Shift Handover", hours: scale(6.7, filters, 1) },
      { group: "Conveyor Breakdown", hours: scale(3.6, filters, 1) },
      { group: "Break", hours: scale(2.1, filters, 1) },
      { group: "No Production Planned", hours: scale(1.8, filters, 1) },
      { group: "Material Shortage", hours: scale(1.1, filters, 1) },
      { group: "Electrical Failure", hours: scale(0.9, filters, 1) },
      { group: "Setup", hours: scale(0.8, filters, 1) },
      { group: "Mechanical Failure", hours: scale(0.7, filters, 1) },
      { group: "Material Quality Issues", hours: scale(0.6, filters, 1) },
    ],
  }
}
