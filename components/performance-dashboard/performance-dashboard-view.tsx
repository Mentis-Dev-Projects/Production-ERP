"use client"

import Link from "next/link"
import { useMemo, useState, useTransition } from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  AlertTriangle,
  ArrowRight,
  Clock3,
  Download,
  Gauge,
  Layers3,
  PackageCheck,
  RefreshCcw,
  ShieldAlert,
  Target,
  TrendingUp,
} from "lucide-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  XAxis,
  YAxis,
} from "recharts"
import { DataAccessNotice } from "@/components/data-access-notice"
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { formatDate, formatNumber } from "@/lib/utils/format"
import type {
  DataAccessMeta,
  PerformanceDashboardData,
  PerformanceDashboardFilters,
  PerformanceDistributionDatum,
  PerformanceKpiView,
  PerformanceWorkOrderStatus,
} from "@/types/mentis"

const defaultFilters: PerformanceDashboardFilters = {
  startDate: "",
  endDate: "",
  productionLine: "all",
  client: "all",
  department: "all",
  workOrderStatus: "all",
  productCode: "",
  quickFilter: "all",
  datePreset: "all",
  kpiView: "none",
}

const dashboardSurface = "border-slate-800/80 bg-slate-950/90 text-slate-50 shadow-[0_18px_60px_rgba(2,6,23,0.32)]"
const mutedText = "text-slate-400"
const chartPalette = ["#E8713A", "#38BDF8", "#34D399", "#FBBF24", "#FB7185", "#A78BFA", "#94A3B8"]

function toSearchParams(filters: PerformanceDashboardFilters) {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(filters)) {
    if (!value) continue

    if (
      (key === "productionLine" ||
        key === "client" ||
        key === "department" ||
        key === "workOrderStatus" ||
        key === "quickFilter" ||
        key === "datePreset") &&
      value === "all"
    ) {
      continue
    }

    if (key === "kpiView" && value === "none") {
      continue
    }

    params.set(key, value)
  }

  return params.toString()
}

function statusTone(status: PerformanceWorkOrderStatus) {
  switch (status) {
    case "completed":
      return "bg-emerald-500/15 text-emerald-300 ring-emerald-500/20"
    case "delayed":
      return "bg-rose-500/15 text-rose-300 ring-rose-500/20"
    case "in-production":
      return "bg-sky-500/15 text-sky-300 ring-sky-500/20"
    case "not-started":
      return "bg-amber-500/15 text-amber-300 ring-amber-500/20"
    case "cancelled":
      return "bg-slate-500/15 text-slate-300 ring-slate-500/20"
    default:
      return "bg-violet-500/15 text-violet-300 ring-violet-500/20"
  }
}

function statusLabel(status: PerformanceWorkOrderStatus) {
  switch (status) {
    case "not-started":
      return "Not Started"
    case "in-production":
      return "In Production"
    case "completed":
      return "Completed"
    case "delayed":
      return "Delayed"
    case "cancelled":
      return "Cancelled"
    case "unknown":
      return "Unknown"
    default:
      return "All statuses"
  }
}

function PerformanceStatusBadge({ status }: { status: PerformanceWorkOrderStatus }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset", statusTone(status))}>
      {statusLabel(status)}
    </span>
  )
}

function KpiCard({
  title,
  value,
  helper,
  icon: Icon,
  tone,
  onClick,
  active = false,
}: {
  title: string
  value: string
  helper: string
  icon: React.ComponentType<{ className?: string }>
  tone: string
  onClick?: () => void
  active?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-3xl border border-slate-800/80 bg-slate-950/80 p-4 text-left transition hover:border-slate-700 hover:bg-slate-900/90",
        active && "border-primary/60 bg-slate-900 ring-1 ring-primary/30",
        !onClick && "cursor-default",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={cn("text-xs font-semibold uppercase tracking-[0.18em]", mutedText)}>{title}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-50">{value}</p>
          <p className="mt-2 text-sm text-slate-400">{helper}</p>
        </div>
        <div className={cn("rounded-2xl p-3", tone)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </button>
  )
}

function MiniLegend({ items }: { items: PerformanceDistributionDatum[] }) {
  return (
    <div className="grid grid-cols-1 gap-2 pt-3">
      {items.map((item, index) => (
        <div key={item.key} className="flex items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: chartPalette[index % chartPalette.length] }} />
            <span className="text-slate-300">{item.label}</span>
          </div>
          <span className="font-medium text-slate-100">
            {formatNumber(item.value)} <span className="text-slate-500">({item.percentage}%)</span>
          </span>
        </div>
      ))}
    </div>
  )
}

function DonutCard({
  title,
  description,
  data,
  onSliceClick,
}: {
  title: string
  description: string
  data: PerformanceDistributionDatum[]
  onSliceClick?: (key: string) => void
}) {
  const chartConfig = useMemo(
    () =>
      Object.fromEntries(
        data.map((item, index) => [
          item.key,
          {
            label: item.label,
            color: chartPalette[index % chartPalette.length],
          },
        ]),
      ),
    [data],
  )

  return (
    <Card className={dashboardSurface}>
      <CardHeader className="space-y-2 pb-2">
        <CardTitle className="text-base text-slate-50">{title}</CardTitle>
        <CardDescription className="text-slate-400">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex min-h-[240px] items-center justify-center text-sm text-slate-500">No data in the current filter selection.</div>
        ) : (
          <>
            <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[220px]">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="key" />} />
                <Pie data={data} dataKey="value" nameKey="key" innerRadius={58} outerRadius={88} paddingAngle={4} strokeWidth={0}>
                  {data.map((entry, index) => (
                    <Cell
                      key={entry.key}
                      fill={chartPalette[index % chartPalette.length]}
                      onClick={() => onSliceClick?.(entry.key)}
                      className={cn(onSliceClick && "cursor-pointer")}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <MiniLegend items={data} />
          </>
        )}
      </CardContent>
    </Card>
  )
}

function QuantityCompletionCard({
  percent,
  trackedQty,
  releasedQty,
}: {
  percent: number
  trackedQty: number
  releasedQty: number
}) {
  const chartData = [{ name: "completion", value: percent, fill: "#E8713A" }]

  return (
    <Card className={dashboardSurface}>
      <CardHeader className="space-y-2 pb-2">
        <CardTitle className="text-base text-slate-50">Quantity Completion</CardTitle>
        <CardDescription className="text-slate-400">Tracked quantity against released quantity across the filtered production set.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ChartContainer config={{ completion: { label: "Completion", color: "#E8713A" } }} className="mx-auto aspect-square max-h-[220px]">
          <RadialBarChart data={chartData} innerRadius="62%" outerRadius="100%" startAngle={90} endAngle={-270}>
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar background dataKey="value" cornerRadius={999} />
            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-slate-50 text-3xl font-semibold">
              {`${percent}%`}
            </text>
          </RadialBarChart>
        </ChartContainer>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3">
            <p className="text-slate-400">Tracked Qty</p>
            <p className="mt-1 text-lg font-semibold text-slate-50">{formatNumber(trackedQty)}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3">
            <p className="text-slate-400">Released Qty</p>
            <p className="mt-1 text-lg font-semibold text-slate-50">{formatNumber(releasedQty)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function TrendOverviewCard({ data }: { data: PerformanceDashboardData["trends"] }) {
  return (
    <Card className={dashboardSurface}>
      <CardHeader>
        <CardTitle className="text-base text-slate-50">Production Trend Overview</CardTitle>
        <CardDescription className="text-slate-400">Created, completed, and overdue order movement over time.</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex min-h-[300px] items-center justify-center text-sm text-slate-500">No trend points are available for the current filters.</div>
        ) : (
          <ChartContainer
            config={{
              createdOrders: { label: "Created", color: "#38BDF8" },
              completedOrders: { label: "Completed", color: "#34D399" },
              overdueOrders: { label: "Overdue", color: "#FB7185" },
            }}
            className="h-[300px] w-full"
          >
            <AreaChart data={data}>
              <defs>
                <linearGradient id="createdOrdersFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38BDF8" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#38BDF8" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="completedOrdersFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34D399" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#34D399" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#1E293B" />
              <XAxis dataKey="periodLabel" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Area type="monotone" dataKey="createdOrders" stroke="#38BDF8" fill="url(#createdOrdersFill)" strokeWidth={2} />
              <Area type="monotone" dataKey="completedOrders" stroke="#34D399" fill="url(#completedOrdersFill)" strokeWidth={2} />
              <Line type="monotone" dataKey="overdueOrders" stroke="#FB7185" strokeWidth={2} dot={false} />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}

function PerformanceTrendCard({ data }: { data: PerformanceDashboardData["trends"] }) {
  return (
    <Card className={dashboardSurface}>
      <CardHeader>
        <CardTitle className="text-base text-slate-50">Flow Efficiency Trend</CardTitle>
        <CardDescription className="text-slate-400">Average production days and on-time rate by the same reporting bucket.</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex min-h-[300px] items-center justify-center text-sm text-slate-500">No efficiency trend is available for the current filters.</div>
        ) : (
          <ChartContainer
            config={{
              averageProductionDays: { label: "Avg Production Days", color: "#FBBF24" },
              onTimeRate: { label: "On-Time Rate", color: "#E8713A" },
            }}
            className="h-[300px] w-full"
          >
            <LineChart data={data}>
              <CartesianGrid vertical={false} stroke="#1E293B" />
              <XAxis dataKey="periodLabel" tickLine={false} axisLine={false} />
              <YAxis yAxisId="days" tickLine={false} axisLine={false} />
              <YAxis yAxisId="percent" orientation="right" tickLine={false} axisLine={false} domain={[0, 100]} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Line yAxisId="days" type="monotone" dataKey="averageProductionDays" stroke="#FBBF24" strokeWidth={2.5} dot={false} />
              <Line yAxisId="percent" type="monotone" dataKey="onTimeRate" stroke="#E8713A" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}

function BreakdownCard({
  title,
  description,
  data,
  onBarClick,
}: {
  title: string
  description: string
  data: Array<{ key: string; label: string; value: number }>
  onBarClick?: (key: string) => void
}) {
  const chartData = data.slice(0, 8).map((item) => ({ ...item, fill: chartPalette[0] }))

  return (
    <Card className={dashboardSurface}>
      <CardHeader>
        <CardTitle className="text-base text-slate-50">{title}</CardTitle>
        <CardDescription className="text-slate-400">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex min-h-[260px] items-center justify-center text-sm text-slate-500">No breakdown data is available for the current filters.</div>
        ) : (
          <ChartContainer config={{ value: { label: "Orders", color: "#E8713A" } }} className="h-[280px] w-full">
            <BarChart data={chartData} layout="vertical" margin={{ left: 12, right: 12 }}>
              <CartesianGrid horizontal={false} stroke="#1E293B" />
              <XAxis type="number" tickLine={false} axisLine={false} />
              <YAxis
                type="category"
                dataKey="label"
                tickLine={false}
                axisLine={false}
                width={120}
                interval={0}
                tickFormatter={(value) => (String(value).length > 18 ? `${String(value).slice(0, 18)}...` : String(value))}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="value" radius={[0, 12, 12, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={entry.key}
                    fill={chartPalette[index % chartPalette.length]}
                    onClick={() => onBarClick?.(entry.key)}
                    className={cn(onBarClick && "cursor-pointer")}
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}

function EfficiencySummaryCards({ items }: { items: PerformanceDashboardData["efficiency"]["summaries"] }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <Card key={item.productionLine} className={dashboardSurface}>
          <CardHeader className="space-y-1 pb-3">
            <CardTitle className="text-base text-slate-50">{item.productionLine}</CardTitle>
            <CardDescription className="text-slate-400">Efficiency summary from the line-level reporting view.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Efficiency</p>
                <p className="mt-1 text-3xl font-semibold text-slate-50">{item.averageEfficiency}%</p>
              </div>
              <div className="text-right text-sm text-slate-400">
                <p>Completed Qty: {formatNumber(item.qtyCompleted)}</p>
                <p>Outstanding Qty: {formatNumber(item.qtyOutstanding)}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
                <p className="text-slate-500">Total Qty</p>
                <p className="mt-1 font-semibold text-slate-50">{formatNumber(item.totalQty)}</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
                <p className="text-slate-500">Open</p>
                <p className="mt-1 font-semibold text-slate-50">{item.openOrders == null ? "-" : formatNumber(item.openOrders)}</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
                <p className="text-slate-500">Done</p>
                <p className="mt-1 font-semibold text-slate-50">{item.completedOrders == null ? "-" : formatNumber(item.completedOrders)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function EfficiencyTrendCard({ data }: { data: PerformanceDashboardData["efficiency"]["trend"] }) {
  return (
    <Card className={dashboardSurface}>
      <CardHeader>
        <CardTitle className="text-base text-slate-50">Weekly Efficiency Trend</CardTitle>
        <CardDescription className="text-slate-400">Quantity completion performance from the efficiency reporting views.</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex min-h-[260px] items-center justify-center text-sm text-slate-500">No efficiency trend is available for the current filters.</div>
        ) : (
          <ChartContainer
            config={{
              efficiency: { label: "Efficiency %", color: "#34D399" },
              qtyCompleted: { label: "Completed Qty", color: "#38BDF8" },
            }}
            className="h-[280px] w-full"
          >
            <LineChart data={data}>
              <CartesianGrid vertical={false} stroke="#1E293B" />
              <XAxis dataKey="dueWeek" tickLine={false} axisLine={false} />
              <YAxis yAxisId="efficiency" tickLine={false} axisLine={false} domain={[0, 100]} />
              <YAxis yAxisId="qty" orientation="right" tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar yAxisId="qty" dataKey="qtyCompleted" fill="#38BDF8" radius={[6, 6, 0, 0]} />
              <Line yAxisId="efficiency" type="monotone" dataKey="efficiency" stroke="#34D399" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}

function LoadingOverlay({ pending }: { pending: boolean }) {
  if (!pending) {
    return null
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 top-24 z-50 mx-auto flex w-fit items-center gap-2 rounded-full border border-slate-700 bg-slate-950/95 px-4 py-2 text-sm text-slate-200 shadow-xl">
      <RefreshCcw className="h-4 w-4 animate-spin" />
      Refreshing dashboard…
    </div>
  )
}

function kpiViewForCard(title: string): PerformanceKpiView {
  switch (title) {
    case "Total Active Orders":
      return "total-active-orders"
    case "Overdue Orders":
      return "overdue-orders"
    case "Due This Week":
      return "due-this-week"
    case "Completed Orders":
      return "completed-orders"
    case "Orders at Risk":
      return "orders-at-risk"
    default:
      return "none"
  }
}

export function PerformanceDashboardView({ item, meta }: { item: PerformanceDashboardData; meta: DataAccessMeta }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const [draftFilters, setDraftFilters] = useState<PerformanceDashboardFilters>(item.filters)

  const exportHref = useMemo(() => {
    const query = toSearchParams(item.filters)
    return query ? `/api/performance-dashboard/export?${query}` : "/api/performance-dashboard/export"
  }, [item.filters])

  const applyFilters = (nextFilters: PerformanceDashboardFilters) => {
    setDraftFilters(nextFilters)
    const query = toSearchParams(nextFilters)

    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
    })
  }

  const kpis = [
    {
      title: "Total Active Orders",
      value: formatNumber(item.summary.totalActiveOrders),
      helper: "Orders currently moving through the operational production pipeline.",
      icon: Layers3,
      tone: "bg-primary/15 text-primary",
      onClick: () => applyFilters({ ...item.filters, kpiView: "total-active-orders" }),
    },
    {
      title: "Overdue Orders",
      value: formatNumber(item.summary.overdueOrders),
      helper: "Due date has passed and the work order is still operationally open.",
      icon: AlertTriangle,
      tone: "bg-rose-500/15 text-rose-300",
      onClick: () => applyFilters({ ...item.filters, kpiView: "overdue-orders" }),
    },
    {
      title: "Due This Week",
      value: formatNumber(item.summary.dueThisWeek),
      helper: "Orders landing inside the next 7-day commitment window.",
      icon: Clock3,
      tone: "bg-amber-500/15 text-amber-300",
      onClick: () => applyFilters({ ...item.filters, kpiView: "due-this-week" }),
    },
    {
      title: "Completed Orders",
      value: formatNumber(item.summary.completedOrders),
      helper: "Orders already completed or invoiced in the reporting slice.",
      icon: PackageCheck,
      tone: "bg-emerald-500/15 text-emerald-300",
      onClick: () => applyFilters({ ...item.filters, kpiView: "completed-orders" }),
    },
    {
      title: "On-Time Rate",
      value: `${item.summary.onTimeRate}%`,
      helper: "Completed orders delivered on or before the effective due date.",
      icon: Target,
      tone: "bg-sky-500/15 text-sky-300",
    },
    {
      title: "Late Rate",
      value: `${item.summary.lateRate}%`,
      helper: "Late exposure across the operational production set.",
      icon: TrendingUp,
      tone: "bg-fuchsia-500/15 text-fuchsia-300",
    },
    {
      title: "Average Production Days",
      value: formatNumber(item.summary.averageProductionDays, 1),
      helper: "Mean elapsed production days from actual start to completion/current measure.",
      icon: Gauge,
      tone: "bg-cyan-500/15 text-cyan-300",
    },
    {
      title: "Planned vs Actual Variance",
      value: formatNumber(item.summary.plannedVsActualVariance, 1),
      helper: "Average actual production days minus planned production days.",
      icon: TrendingUp,
      tone: "bg-violet-500/15 text-violet-300",
    },
    {
      title: "Tracked Quantity Completion",
      value: `${item.summary.trackedQuantityCompletion}%`,
      helper: "Overall tracked quantity against released quantity.",
      icon: PackageCheck,
      tone: "bg-primary/15 text-primary",
    },
    {
      title: "Orders at Risk",
      value: formatNumber(item.summary.ordersAtRisk),
      helper: "Due soon with low progress or adverse operational status.",
      icon: ShieldAlert,
      tone: "bg-rose-500/15 text-rose-300",
      onClick: () => applyFilters({ ...item.filters, kpiView: "orders-at-risk" }),
    },
  ]

  const noResults =
    meta.dataSource === "database" &&
    item.trends.length === 0 &&
    item.exceptions.length === 0 &&
    item.summary.totalActiveOrders === 0 &&
    item.summary.completedOrders === 0

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <LoadingOverlay pending={isPending} />
      <DataAccessNotice meta={meta} />

      <section className="rounded-[32px] border border-slate-800/90 bg-[radial-gradient(circle_at_top_left,_rgba(232,113,58,0.18),_transparent_30%),linear-gradient(135deg,_rgba(2,6,23,0.97),_rgba(15,23,42,0.96))] p-5 text-slate-50 shadow-[0_24px_80px_rgba(2,6,23,0.38)] lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/90">Operations Command Center</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight lg:text-4xl">Performance Dashboard</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 lg:text-base">
              Executive production reporting built on the staged Rectagrid and work order layer, with live signals for delivery risk, throughput, workload, and quantity completion.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[360px]">
            <div className="rounded-3xl border border-slate-800/80 bg-slate-950/70 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Current filter set</p>
              <p className="mt-2 text-lg font-semibold">{item.filters.quickFilter === "all" ? "Executive View" : item.options.quickFilters.find((option) => option.value === item.filters.quickFilter)?.label}</p>
              <p className="mt-1 text-sm text-slate-400">
                {item.filters.productionLine === "all" ? "All lines" : item.filters.productionLine}
                {" • "}
                {item.filters.client === "all" ? "All clients" : item.filters.client}
                {" • "}
                {item.filters.department === "all" ? "All departments" : item.filters.department}
              </p>
            </div>
            <div className="rounded-3xl border border-slate-800/80 bg-slate-950/70 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Last refreshed</p>
              <p className="mt-2 text-lg font-semibold">{formatDate(item.lastRefreshed)}</p>
              <p className="mt-1 text-sm text-slate-400">Live PostgreSQL reporting payload.</p>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-[28px] border border-slate-800/80 bg-slate-950/70 p-4 lg:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-100">Filter Bar</p>
              <p className="mt-1 text-sm text-slate-400">Use the controls below to drive the dashboard metrics, charts, and exceptions table.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {item.options.datePresets.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() =>
                    applyFilters({
                      ...item.filters,
                      datePreset: preset.value,
                      startDate: "",
                      endDate: "",
                    })
                  }
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                    item.filters.datePreset === preset.value && !item.filters.startDate && !item.filters.endDate
                      ? "border-primary/70 bg-primary/15 text-primary"
                      : "border-slate-700 bg-slate-900/80 text-slate-300 hover:border-slate-600 hover:text-slate-100",
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-7">
            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Start Date</span>
              <input
                type="date"
                value={draftFilters.startDate}
                onChange={(event) => setDraftFilters((current) => ({ ...current, startDate: event.target.value, datePreset: "all" }))}
                className="h-11 w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-3 text-sm text-slate-100 outline-none transition focus:border-primary"
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">End Date</span>
              <input
                type="date"
                value={draftFilters.endDate}
                onChange={(event) => setDraftFilters((current) => ({ ...current, endDate: event.target.value, datePreset: "all" }))}
                className="h-11 w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-3 text-sm text-slate-100 outline-none transition focus:border-primary"
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Production Line</span>
              <select
                value={draftFilters.productionLine}
                onChange={(event) => setDraftFilters((current) => ({ ...current, productionLine: event.target.value }))}
                className="h-11 w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-3 text-sm text-slate-100 outline-none transition focus:border-primary"
              >
                <option value="all">All lines</option>
                {item.options.lines.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label} ({formatNumber(option.count)})
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Client</span>
              <input
                list="performance-dashboard-clients"
                value={draftFilters.client === "all" ? "" : draftFilters.client}
                onChange={(event) => setDraftFilters((current) => ({ ...current, client: event.target.value.trim() ? event.target.value : "all" }))}
                placeholder="All clients"
                className="h-11 w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-primary"
              />
              <datalist id="performance-dashboard-clients">
                {item.options.clients.map((option) => (
                  <option key={option.value} value={option.value} />
                ))}
              </datalist>
            </label>
            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Department</span>
              <select
                value={draftFilters.department}
                onChange={(event) => setDraftFilters((current) => ({ ...current, department: event.target.value }))}
                className="h-11 w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-3 text-sm text-slate-100 outline-none transition focus:border-primary"
              >
                <option value="all">All departments</option>
                {item.options.departments.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label} ({formatNumber(option.count)})
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Work Order Status</span>
              <select
                value={draftFilters.workOrderStatus}
                onChange={(event) => setDraftFilters((current) => ({ ...current, workOrderStatus: event.target.value as PerformanceWorkOrderStatus }))}
                className="h-11 w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-3 text-sm text-slate-100 outline-none transition focus:border-primary"
              >
                {item.options.workOrderStatuses.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Product Code</span>
              <input
                list="performance-dashboard-product-codes"
                value={draftFilters.productCode}
                onChange={(event) => setDraftFilters((current) => ({ ...current, productCode: event.target.value }))}
                placeholder="Any product code"
                className="h-11 w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-primary"
              />
              <datalist id="performance-dashboard-product-codes">
                {item.options.productCodes.map((option) => (
                  <option key={option} value={option} />
                ))}
              </datalist>
            </label>
          </div>

          <div className="mt-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap gap-2">
              {item.options.quickFilters.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => applyFilters({ ...item.filters, quickFilter: option.value })}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                    item.filters.quickFilter === option.value
                      ? "border-primary/70 bg-primary/15 text-primary"
                      : "border-slate-700 bg-slate-900/80 text-slate-300 hover:border-slate-600 hover:text-slate-100",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={() => applyFilters(draftFilters)} className="rounded-full bg-primary px-5 text-primary-foreground hover:bg-primary/90">
                Apply Filters
              </Button>
              <Button type="button" variant="outline" onClick={() => applyFilters(defaultFilters)} className="rounded-full border-slate-700 bg-slate-950 text-slate-100 hover:bg-slate-900">
                Reset
              </Button>
              <Button asChild variant="outline" className="rounded-full border-slate-700 bg-slate-950 text-slate-100 hover:bg-slate-900">
                <Link href={exportHref}>
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {noResults ? (
        <Card className={dashboardSurface}>
          <CardContent className="p-8">
            <Empty className="border-slate-800/80">
              <EmptyHeader>
                <EmptyMedia variant="icon" className="bg-slate-900 text-primary">
                  <Gauge className="h-5 w-5" />
                </EmptyMedia>
                <EmptyTitle className="text-slate-50">No records matched the current reporting filters</EmptyTitle>
                <EmptyDescription className="text-slate-400">
                  Try broadening the date range, clearing one of the quick filters, or switching back to all departments and clients.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button type="button" onClick={() => applyFilters(defaultFilters)} className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                  Clear all filters
                </Button>
              </EmptyContent>
            </Empty>
          </CardContent>
        </Card>
      ) : (
        <>
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
            {kpis.map((kpi) => (
              <KpiCard key={kpi.title} {...kpi} active={item.filters.kpiView === kpiViewForCard(kpi.title)} />
            ))}
          </section>

          {item.kpiDrilldown.selected !== "none" && (
            <Card className={dashboardSurface}>
              <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <CardTitle className="text-base text-slate-50">{item.kpiDrilldown.title}</CardTitle>
                  <CardDescription className="text-slate-400">{item.kpiDrilldown.description}</CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => applyFilters({ ...item.filters, kpiView: "none" })}
                  className="rounded-full border-slate-700 bg-slate-950 text-slate-100 hover:bg-slate-900"
                >
                  Clear KPI View
                </Button>
              </CardHeader>
              <CardContent>
                {item.kpiDrilldown.rows.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-800 px-6 py-12 text-center text-sm text-slate-500">
                    No records matched this KPI inside the current dashboard filters.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-separate border-spacing-y-2 text-sm">
                      <thead>
                        <tr className="text-left text-xs uppercase tracking-[0.18em] text-slate-500">
                          <th className="px-3 py-2">Line</th>
                          <th className="px-3 py-2">Sale Order</th>
                          <th className="px-3 py-2">Works Order</th>
                          <th className="px-3 py-2">Client</th>
                          <th className="px-3 py-2">Product Code</th>
                          <th className="px-3 py-2">Department</th>
                          <th className="px-3 py-2">SOAP</th>
                          <th className="px-3 py-2">Effective Due</th>
                          <th className="px-3 py-2">Completed</th>
                          <th className="px-3 py-2">Days Late</th>
                          <th className="px-3 py-2">Status</th>
                          <th className="px-3 py-2">Qty</th>
                          <th className="px-3 py-2">Planned Days</th>
                          <th className="px-3 py-2">Actual Days</th>
                          <th className="px-3 py-2">Variance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {item.kpiDrilldown.rows.map((row) => (
                          <tr key={`${row.salesOrderNumber}-${row.worksOrder ?? "no-wo"}-${row.productCode ?? "no-product"}`} className="rounded-2xl bg-slate-900/70 text-slate-100">
                            <td className="rounded-l-2xl px-3 py-3 text-slate-300">{row.productionLine}</td>
                            <td className="px-3 py-3 font-medium text-primary">{row.salesOrderNumber}</td>
                            <td className="px-3 py-3 text-slate-300">{row.worksOrder ?? "-"}</td>
                            <td className="px-3 py-3 text-slate-300">{row.client}</td>
                            <td className="px-3 py-3 text-slate-300">{row.productCode ?? "-"}</td>
                            <td className="px-3 py-3 text-slate-300">{row.currentDepartment}</td>
                            <td className="px-3 py-3 text-slate-300">{formatDate(row.salesOrderApprovalDate)}</td>
                            <td className="px-3 py-3 text-slate-300">{formatDate(row.effectiveDueDate)}</td>
                            <td className="px-3 py-3 text-slate-300">{formatDate(row.completedDate)}</td>
                            <td className={cn("px-3 py-3 font-semibold", row.daysLate > 0 ? "text-rose-300" : "text-slate-300")}>{formatNumber(row.daysLate)}</td>
                            <td className="px-3 py-3">
                              <PerformanceStatusBadge status={row.status} />
                            </td>
                            <td className="px-3 py-3 text-slate-300">{formatNumber(row.qty)}</td>
                            <td className="px-3 py-3 text-slate-300">{row.plannedDays == null ? "-" : formatNumber(row.plannedDays, 1)}</td>
                            <td className="px-3 py-3 text-slate-300">{row.actualDays == null ? "-" : formatNumber(row.actualDays, 1)}</td>
                            <td className="rounded-r-2xl px-3 py-3 text-slate-300">{row.varianceDays == null ? "-" : formatNumber(row.varianceDays, 1)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <section className="grid grid-cols-1 gap-4 xl:grid-cols-4">
            <DonutCard
              title="On-Time vs Late"
              description="Completed orders split by delivery performance."
              data={item.visuals.onTimeVsLate}
              onSliceClick={(key) => applyFilters({ ...item.filters, quickFilter: key === "late" ? "late-jobs" : "completed" })}
            />
            <DonutCard
              title="Work Order Status Mix"
              description="Normalized operational status distribution."
              data={item.visuals.workOrderStatusMix}
              onSliceClick={(key) => applyFilters({ ...item.filters, workOrderStatus: key as PerformanceWorkOrderStatus })}
            />
            <DonutCard
              title="Department Distribution"
              description="Current operational load by production department."
              data={item.visuals.departmentDistribution}
              onSliceClick={(key) => applyFilters({ ...item.filters, department: key })}
            />
            <QuantityCompletionCard
              percent={item.visuals.quantityCompletion.percent}
              trackedQty={item.visuals.quantityCompletion.trackedQty}
              releasedQty={item.visuals.quantityCompletion.releasedQty}
            />
          </section>

          <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <BreakdownCard
              title="Production Line Breakdown"
              description="Order concentration across Rectagrid, Mentex, Handrailing, Press Shop, Punching, and Mentrail."
              data={item.lineBreakdown.map((line) => ({
                key: line.productionLine,
                label: line.productionLine,
                value: line.totalOrders,
              }))}
              onBarClick={(key) => applyFilters({ ...item.filters, productionLine: key })}
            />
            <EfficiencyTrendCard data={item.efficiency.trend} />
          </section>

          <section>
            <EfficiencySummaryCards items={item.efficiency.summaries} />
          </section>

          <section className="grid grid-cols-1 gap-4 xl:grid-cols-5">
            <div className="xl:col-span-3">
              <TrendOverviewCard data={item.trends} />
            </div>
            <div className="xl:col-span-2">
              <PerformanceTrendCard data={item.trends} />
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <BreakdownCard title="Orders by Department" description="Where the current workload is concentrated." data={item.breakdowns.departments} onBarClick={(key) => applyFilters({ ...item.filters, department: key })} />
            <BreakdownCard title="Orders by Client" description="Largest active/completed footprint by client." data={item.breakdowns.clients} onBarClick={(key) => applyFilters({ ...item.filters, client: key })} />
            <BreakdownCard title="Orders by Product Code" description="Most common product codes in the current production slice." data={item.breakdowns.productCodes} onBarClick={(key) => applyFilters({ ...item.filters, productCode: key })} />
            <BreakdownCard
              title="Work Order Status Breakdown"
              description="Operational status volume after backend normalization."
              data={item.breakdowns.workOrderStatuses}
              onBarClick={(key) =>
                applyFilters({
                  ...item.filters,
                  workOrderStatus: item.options.workOrderStatuses.find((option) => option.label === key)?.value ?? item.filters.workOrderStatus,
                })
              }
            />
            <BreakdownCard title="Top Delayed Clients" description="Clients currently carrying the highest late-order exposure." data={item.breakdowns.delayedClients} onBarClick={(key) => applyFilters({ ...item.filters, client: key, quickFilter: "late-jobs" })} />
            <BreakdownCard title="Top Delayed Product Codes" description="Product codes driving the largest late-job clusters." data={item.breakdowns.delayedProducts} onBarClick={(key) => applyFilters({ ...item.filters, productCode: key, quickFilter: "late-jobs" })} />
          </section>

          <Card className={dashboardSurface}>
            <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle className="text-base text-slate-50">Critical Exceptions</CardTitle>
                <CardDescription className="text-slate-400">Worst-offending production orders first, ranked by risk and lateness.</CardDescription>
              </div>
              <Button asChild variant="outline" className="rounded-full border-slate-700 bg-slate-950 text-slate-100 hover:bg-slate-900">
                <Link href={exportHref}>
                  Download exceptions CSV
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {item.exceptions.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-800 px-6 py-12 text-center text-sm text-slate-500">
                  No critical exceptions were found for the current filters.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full border-separate border-spacing-y-2 text-sm">
                    <thead>
                      <tr className="text-left text-xs uppercase tracking-[0.18em] text-slate-500">
                        <th className="px-3 py-2">Line</th>
                        <th className="px-3 py-2">Sale Order</th>
                        <th className="px-3 py-2">Works Order</th>
                        <th className="px-3 py-2">Client</th>
                        <th className="px-3 py-2">Product Code</th>
                        <th className="px-3 py-2">Current Department</th>
                        <th className="px-3 py-2">Effective Due</th>
                        <th className="px-3 py-2">Final Stage End</th>
                        <th className="px-3 py-2">Days Late</th>
                        <th className="px-3 py-2">Status</th>
                        <th className="px-3 py-2">Qty</th>
                        <th className="px-3 py-2">Planned Days</th>
                        <th className="px-3 py-2">Actual Days</th>
                        <th className="px-3 py-2">Variance Days</th>
                        <th className="px-3 py-2">Risk Flag</th>
                      </tr>
                    </thead>
                    <tbody>
                      {item.exceptions.map((exception) => (
                        <tr key={`${exception.salesOrderNumber}-${exception.worksOrder ?? "no-wo"}`} className="rounded-2xl bg-slate-900/70 text-slate-100">
                          <td className="rounded-l-2xl px-3 py-3 text-slate-300">{exception.productionLine}</td>
                          <td className="px-3 py-3 font-medium text-primary">{exception.salesOrderNumber}</td>
                          <td className="px-3 py-3 text-slate-300">{exception.worksOrder ?? "-"}</td>
                          <td className="px-3 py-3 text-slate-300">{exception.client}</td>
                          <td className="px-3 py-3 text-slate-300">{exception.productCode ?? "-"}</td>
                          <td className="px-3 py-3 text-slate-300">{exception.currentDepartment}</td>
                          <td className="px-3 py-3 text-slate-300">{formatDate(exception.effectiveDueDate)}</td>
                          <td className="px-3 py-3 text-slate-300">{formatDate(exception.finalStageEndDate)}</td>
                          <td className={cn("px-3 py-3 font-semibold", exception.daysLate > 0 ? "text-rose-300" : "text-slate-300")}>{formatNumber(exception.daysLate)}</td>
                          <td className="px-3 py-3">
                            <PerformanceStatusBadge status={exception.status} />
                          </td>
                          <td className="px-3 py-3 text-slate-300">{formatNumber(exception.qty)}</td>
                          <td className="px-3 py-3 text-slate-300">{exception.plannedDays == null ? "-" : formatNumber(exception.plannedDays, 1)}</td>
                          <td className="px-3 py-3 text-slate-300">{exception.actualDays == null ? "-" : formatNumber(exception.actualDays, 1)}</td>
                          <td className="px-3 py-3 text-slate-300">{exception.varianceDays == null ? "-" : formatNumber(exception.varianceDays, 1)}</td>
                          <td className="rounded-r-2xl px-3 py-3">
                            <span
                              className={cn(
                                "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
                                exception.riskFlag === "Critical"
                                  ? "bg-rose-500/15 text-rose-300 ring-rose-500/20"
                                  : exception.riskFlag === "High"
                                    ? "bg-amber-500/15 text-amber-300 ring-amber-500/20"
                                    : "bg-sky-500/15 text-sky-300 ring-sky-500/20",
                              )}
                            >
                              {exception.riskFlag}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

export function PerformanceDashboardLoading() {
  return (
    <div className="space-y-6 p-4 lg:p-6">
      <div className="rounded-[32px] border border-slate-800/90 bg-slate-950/95 p-6">
        <Skeleton className="h-7 w-52 bg-slate-800" />
        <Skeleton className="mt-3 h-12 w-full max-w-2xl bg-slate-800" />
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-11 rounded-2xl bg-slate-800" />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, index) => (
          <Skeleton key={index} className="h-36 rounded-3xl bg-slate-900" />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-[360px] rounded-3xl bg-slate-900" />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-[360px] rounded-3xl bg-slate-900" />
        ))}
      </div>
    </div>
  )
}
