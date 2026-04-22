"use client"

import { usePathname, useRouter } from "next/navigation"
import { useMemo, useState, useTransition } from "react"
import { ArrowDown, ArrowUp, CalendarRange, Factory, Filter, PackageCheck } from "lucide-react"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, XAxis, YAxis } from "recharts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { MesProductionLineEfficiencyReport } from "@/lib/services/mes-report-service"
import type { MesProductionLineEfficiencyFilters } from "@/lib/validations/mes-reporting"

const streamOptions = [
  { value: "rectagrid", label: "Rectagrid" },
  { value: "expanded-metal", label: "Mentex" },
  { value: "handrailing", label: "HandRailing" },
  { value: "mentrail", label: "Mentrail" },
  { value: "press-shop", label: "Press Shop" },
] satisfies Array<{ value: MesProductionLineEfficiencyFilters["stream"]; label: string }>

const rangeOptions = [
  { value: "current", label: "Current" },
  { value: "previous-day", label: "Previous Day" },
  { value: "previous-week", label: "Previous Week" },
  { value: "previous-month", label: "Previous Month" },
  { value: "custom", label: "Custom" },
] satisfies Array<{ value: MesProductionLineEfficiencyFilters["range"]; label: string }>

const chartPalette = ["#0f766e", "#0ea5e9", "#1d4ed8", "#06b6d4", "#2563eb"]

function toSearchParams(filters: MesProductionLineEfficiencyFilters) {
  const params = new URLSearchParams()
  params.set("stream", filters.stream)
  params.set("range", filters.range)

  if (filters.range === "custom") {
    if (filters.startDate) params.set("startDate", filters.startDate)
    if (filters.endDate) params.set("endDate", filters.endDate)
  }

  return params.toString()
}

function DashboardFilterBar({
  filters,
}: {
  filters: MesProductionLineEfficiencyFilters
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const [draft, setDraft] = useState(filters)

  const apply = (next: MesProductionLineEfficiencyFilters) => {
    const query = toSearchParams(next)
    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
    })
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-primary/10 p-2 text-primary">
            <Filter className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-base">Report Filters</CardTitle>
            <CardDescription>These filters are already wired into the report service contract for the future live data points.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Production Stream</span>
            <select
              value={draft.stream}
              onChange={(event) => setDraft((current) => ({ ...current, stream: event.target.value as MesProductionLineEfficiencyFilters["stream"] }))}
              className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary"
            >
              {streamOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Range</span>
            <select
              value={draft.range}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  range: event.target.value as MesProductionLineEfficiencyFilters["range"],
                }))
              }
              className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary"
            >
              {rangeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          {draft.range === "custom" && (
            <>
              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Start Date</span>
                <input
                  type="date"
                  value={draft.startDate}
                  onChange={(event) => setDraft((current) => ({ ...current, startDate: event.target.value }))}
                  className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary"
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">End Date</span>
                <input
                  type="date"
                  value={draft.endDate}
                  onChange={(event) => setDraft((current) => ({ ...current, endDate: event.target.value }))}
                  className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary"
                />
              </label>
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/20 px-4 py-2.5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarRange className="h-4 w-4" />
            Bound to stream and reporting range inputs for the report service
          </div>
          <Button onClick={() => apply(draft)} disabled={isPending} className="h-9 rounded-full px-4">
            {isPending ? "Applying..." : "Apply Filters"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function BigMetricCard({ report }: { report: MesProductionLineEfficiencyReport }) {
  const chartHeight = Math.max(report.departmentEfficiency.length * 34, 220)

  return (
    <Card className="h-full">
      <CardHeader className="pb-1">
        <CardTitle className="text-base">Department Efficiency</CardTitle>
        <CardDescription>Top-level dummy metric shell tied to the selected MES stream and range.</CardDescription>
      </CardHeader>
      <CardContent className="flex h-full flex-col justify-between gap-2.5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[2rem] font-semibold tracking-tight text-primary">{report.metricCard.headline}</p>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">{report.metricCard.supportingText}</p>
          </div>
          <div className="flex gap-4">
            <div className="text-center">
              <ArrowDown className="mx-auto h-5 w-5 text-rose-500" />
              <p className="mt-1 text-lg font-semibold text-foreground">{report.metricCard.deltaDown}%</p>
              <p className="text-xs text-muted-foreground">Sample text</p>
            </div>
            <div className="text-center">
              <ArrowUp className="mx-auto h-5 w-5 text-emerald-500" />
              <p className="mt-1 text-lg font-semibold text-foreground">{report.metricCard.deltaUp}%</p>
              <p className="text-xs text-muted-foreground">Sample text</p>
            </div>
          </div>
        </div>

        <ChartContainer
          config={Object.fromEntries(report.departmentEfficiency.map((row, index) => [row.department, { label: row.department, color: chartPalette[index % chartPalette.length] }]))}
          className="w-full"
          style={{ height: `${chartHeight}px` }}
        >
          <BarChart data={report.departmentEfficiency} layout="vertical" margin={{ left: 8, right: 8 }}>
            <CartesianGrid horizontal={false} strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, 100]} tickLine={false} axisLine={false} />
            <YAxis dataKey="department" type="category" width={148} tickLine={false} axisLine={false} interval={0} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="efficiency" radius={[0, 10, 10, 0]}>
              {report.departmentEfficiency.map((entry, index) => (
                <Cell key={entry.department} fill={chartPalette[index % chartPalette.length]} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

function PlanVsActualCard({ report }: { report: MesProductionLineEfficiencyReport }) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-1">
        <CardTitle className="text-base">Past Month vs Actual</CardTitle>
        <CardDescription>Placeholder comparison trend for the selected reporting scope.</CardDescription>
      </CardHeader>
      <CardContent className="pt-1">
        <ChartContainer
          config={{
            planned: { label: "Past", color: "#0ea5e9" },
            actual: { label: "Actual", color: "#1d4ed8" },
          }}
          className="h-[280px] w-full"
        >
          <AreaChart data={report.planVsActual}>
            <defs>
              <linearGradient id="plannedFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.04} />
              </linearGradient>
              <linearGradient id="actualFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1d4ed8" stopOpacity={0.28} />
                <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} verticalAlign="top" />
            <Area type="monotone" dataKey="planned" stroke="#0ea5e9" fill="url(#plannedFill)" strokeWidth={2.5} />
            <Area type="monotone" dataKey="actual" stroke="#1d4ed8" fill="url(#actualFill)" strokeWidth={2.5} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

function OrdersReceivedCard({ report }: { report: MesProductionLineEfficiencyReport }) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-1">
        <CardTitle className="text-base">Orders Received</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 xl:grid-cols-[115px_minmax(0,1fr)] xl:items-end">
        <div className="min-w-0">
          <p className="text-[2rem] font-semibold tracking-tight text-primary">{report.ordersReceived.percent}%</p>
          <p className="mt-2 text-sm text-muted-foreground">{report.ordersReceived.description}</p>
        </div>
        <div className="min-w-0 overflow-hidden">
          <ChartContainer config={{ value: { label: "Orders", color: "#0ea5e9" } }} className="h-[112px] w-full">
          <BarChart data={report.ordersReceived.series}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="value" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
          </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}

function OrdersWaitingCard({ report }: { report: MesProductionLineEfficiencyReport }) {
  const chartConfig = useMemo(
    () =>
      Object.fromEntries(report.ordersWaiting.series.map((item, index) => [item.name, { label: item.name, color: chartPalette[index % chartPalette.length] }])),
    [report.ordersWaiting.series],
  )

  return (
    <Card className="h-full">
      <CardHeader className="pb-1">
        <CardTitle className="text-base">Orders Waiting</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 lg:grid-cols-[125px_1fr] lg:items-center">
        <div>
          <p className="text-[2rem] font-semibold tracking-tight text-primary">{report.ordersWaiting.percent}%</p>
          <p className="mt-2 text-sm text-muted-foreground">{report.ordersWaiting.description}</p>
        </div>
        <ChartContainer config={chartConfig} className="h-[112px] w-full">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent />} />
            <Pie data={report.ordersWaiting.series} dataKey="value" nameKey="name" innerRadius={20} outerRadius={40} strokeWidth={0}>
              {report.ordersWaiting.series.map((entry, index) => (
                <Cell key={entry.name} fill={chartPalette[index % chartPalette.length]} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

function OrdersCompletedCard({ report }: { report: MesProductionLineEfficiencyReport }) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-1">
        <CardTitle className="text-base">Orders Completed</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_115px] xl:items-center">
        <div className="min-w-0 overflow-hidden">
          <ChartContainer config={{ completed: { label: "Completed", color: "#0f766e" } }} className="h-[112px] w-full">
            <LineChart data={report.ordersCompleted.series}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="completed" stroke="#0f766e" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ChartContainer>
        </div>
        <div className="min-w-0 text-left xl:text-left">
          <p className="text-[2rem] font-semibold tracking-tight text-primary">{report.ordersCompleted.percent}%</p>
          <p className="mt-2 text-sm text-muted-foreground">{report.ordersCompleted.description}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function BottomSampleLeftCard({ report }: { report: MesProductionLineEfficiencyReport }) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-1">
        <CardTitle className="text-base">Sample for Now</CardTitle>
        <CardDescription>Placeholder stacked comparison block ready for future MES line efficiency measures.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 lg:grid-cols-[1fr_128px] lg:items-center">
        <ChartContainer
          config={{
            seriesA: { label: "Series A", color: "#1d4ed8" },
            seriesB: { label: "Series B", color: "#0f766e" },
            seriesC: { label: "Series C", color: "#38bdf8" },
          }}
          className="h-[140px] w-full"
        >
          <BarChart data={report.bottomLeft} layout="vertical" margin={{ left: 8, right: 8 }}>
            <CartesianGrid horizontal={false} strokeDasharray="3 3" />
            <XAxis type="number" tickLine={false} axisLine={false} />
            <YAxis dataKey="label" type="category" width={80} tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="seriesA" stackId="a" fill="#1d4ed8" radius={[0, 0, 0, 0]} />
            <Bar dataKey="seriesB" stackId="a" fill="#0f766e" radius={[0, 0, 0, 0]} />
            <Bar dataKey="seriesC" stackId="a" fill="#38bdf8" radius={[0, 10, 10, 0]} />
          </BarChart>
        </ChartContainer>

        <div className="space-y-2.5 rounded-xl border border-border/60 bg-muted/20 p-3">
          <div className="text-center">
            <p className="text-[2rem] font-semibold tracking-tight text-primary">{report.metricCard.headline}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <ArrowDown className="mx-auto h-5 w-5 text-rose-500" />
              <p className="mt-1 text-lg font-semibold">{report.bottomRight.percentDown}%</p>
              <p className="text-xs text-muted-foreground">Sample text</p>
            </div>
            <div className="text-center">
              <ArrowUp className="mx-auto h-5 w-5 text-emerald-500" />
              <p className="mt-1 text-lg font-semibold">{report.bottomRight.percentUp}%</p>
              <p className="text-xs text-muted-foreground">Sample text</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function BottomSampleRightCard({ report }: { report: MesProductionLineEfficiencyReport }) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-1">
        <CardTitle className="text-base">Sample For now</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 lg:grid-cols-[1fr_118px] lg:items-end">
        <ChartContainer config={{ value: { label: "Value", color: "#1d4ed8" } }} className="h-[128px] w-full">
          <BarChart data={report.bottomRight.series}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="value" fill="#1d4ed8" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ChartContainer>

        <div className="space-y-3">
          <div className="text-center">
            <ArrowDown className="mx-auto h-5 w-5 text-rose-500" />
            <p className="mt-1 text-xl font-semibold">{report.bottomRight.percentDown}%</p>
            <p className="text-xs text-muted-foreground">Sample text</p>
          </div>
          <div className="text-center">
            <ArrowUp className="mx-auto h-5 w-5 text-emerald-500" />
            <p className="mt-1 text-xl font-semibold">{report.bottomRight.percentUp}%</p>
            <p className="text-xs text-muted-foreground">Sample text</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function ProductionLineEfficiencyView({ report }: { report: MesProductionLineEfficiencyReport }) {
  return (
    <div className="space-y-6">
      <DashboardFilterBar filters={report.filters} />

      <section className="grid gap-3 xl:grid-cols-2">
        <BigMetricCard report={report} />
        <PlanVsActualCard report={report} />
      </section>

      <section className="grid gap-3 xl:grid-cols-3">
        <OrdersReceivedCard report={report} />
        <OrdersWaitingCard report={report} />
        <OrdersCompletedCard report={report} />
      </section>

      <section className="grid gap-3 xl:grid-cols-[1.7fr_1fr]">
        <BottomSampleLeftCard report={report} />
        <BottomSampleRightCard report={report} />
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Report Shell Note</CardTitle>
          <CardDescription>
            The visuals are currently using dummy data, but the report filters are already bound into the report service so the live metrics can be swapped in cleanly later.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
            <div className="flex items-center gap-3">
              <Factory className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium">Production Stream bound</p>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Selected stream is already passed into the service contract that will later target the correct production source logic.</p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
            <div className="flex items-center gap-3">
              <CalendarRange className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium">Range bound</p>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Current, previous day, previous week, previous month, and custom date range are already part of the filter contract.</p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
            <div className="flex items-center gap-3">
              <PackageCheck className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium">Ready for metric swap</p>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">We can now replace each dummy dataset with the real MES report logic without changing the page structure.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
