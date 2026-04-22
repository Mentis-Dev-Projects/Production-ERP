"use client"

import { usePathname, useRouter } from "next/navigation"
import { useMemo, useState, useTransition } from "react"
import { CalendarRange, Factory, Filter, Gauge, TimerReset } from "lucide-react"
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, RadialBar, RadialBarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { MesOutputEfficiencyReport } from "@/lib/services/mes-output-efficiency-service"
import type { MesOutputEfficiencyFilters } from "@/lib/validations/mes-reporting"

const streamOptions = [
  { value: "rectagrid", label: "Rectagrid" },
  { value: "expanded-metal", label: "Mentex" },
  { value: "handrailing", label: "HandRailing" },
  { value: "mentrail", label: "Mentrail" },
  { value: "press-shop", label: "Press Shop" },
] satisfies Array<{ value: MesOutputEfficiencyFilters["stream"]; label: string }>

const rangeOptions = [
  { value: "current", label: "Current" },
  { value: "previous-day", label: "Previous Day" },
  { value: "previous-week", label: "Previous Week" },
  { value: "previous-month", label: "Previous Month" },
  { value: "custom", label: "Custom" },
] satisfies Array<{ value: MesOutputEfficiencyFilters["range"]; label: string }>

const lineOptions = Array.from({ length: 13 }, (_, index) => String(index + 1)) as MesOutputEfficiencyFilters["line"][]

const downtimePalette = ["#2dd4bf", "#fb7185", "#f59e0b", "#0ea5e9", "#94a3b8", "#6366f1", "#ef4444", "#14b8a6", "#8b5cf6", "#22c55e"]

function toSearchParams(filters: MesOutputEfficiencyFilters) {
  const params = new URLSearchParams()
  params.set("stream", filters.stream)
  params.set("range", filters.range)
  params.set("line", filters.line)

  if (filters.range === "custom") {
    if (filters.startDate) params.set("startDate", filters.startDate)
    if (filters.endDate) params.set("endDate", filters.endDate)
  }

  return params.toString()
}

function FilterBar({ filters }: { filters: MesOutputEfficiencyFilters }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const [draft, setDraft] = useState(filters)

  const apply = (next: MesOutputEfficiencyFilters) => {
    const query = toSearchParams(next)
    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
    })
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-primary/10 p-2 text-primary">
            <Filter className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-base">Report Filters</CardTitle>
            <CardDescription>Stream, range, and line are already wired into the report service contract for the future live source logic.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Production Stream</span>
            <select
              value={draft.stream}
              onChange={(event) => setDraft((current) => ({ ...current, stream: event.target.value as MesOutputEfficiencyFilters["stream"] }))}
              className="h-11 w-full rounded-2xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary"
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
              onChange={(event) => setDraft((current) => ({ ...current, range: event.target.value as MesOutputEfficiencyFilters["range"] }))}
              className="h-11 w-full rounded-2xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary"
            >
              {rangeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Line</span>
            <select
              value={draft.line}
              onChange={(event) => setDraft((current) => ({ ...current, line: event.target.value as MesOutputEfficiencyFilters["line"] }))}
              className="h-11 w-full rounded-2xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary"
            >
              {lineOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
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
                  className="h-11 w-full rounded-2xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary"
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">End Date</span>
                <input
                  type="date"
                  value={draft.endDate}
                  onChange={(event) => setDraft((current) => ({ ...current, endDate: event.target.value }))}
                  className="h-11 w-full rounded-2xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary"
                />
              </label>
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-muted/20 px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarRange className="h-4 w-4" />
            Bound to stream, range, and line inputs for the Output Efficiency report service
          </div>
          <Button onClick={() => apply(draft)} disabled={isPending} className="rounded-full">
            {isPending ? "Applying..." : "Apply Filters"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function OeeGaugeCard({
  title,
  subtitle,
  gauge,
}: {
  title: string
  subtitle: string
  gauge: MesOutputEfficiencyReport["overallOee"]
}) {
  const radialData = [
    { name: "Availability", value: gauge.availability, fill: "#2dd4bf" },
    { name: "Performance", value: gauge.performance, fill: "#f59e0b" },
    { name: "Quality", value: gauge.quality, fill: "#fb7185" },
  ]

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart innerRadius="28%" outerRadius="92%" data={radialData} startAngle={90} endAngle={-270}>
              <RadialBar background dataKey="value" cornerRadius={20} />
              <text x="50%" y="47%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground text-4xl font-semibold">
                {gauge.headline}
              </text>
            </RadialBarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-4 gap-3 border-t border-border/60 pt-4 text-sm">
          <div>
            <p className="text-muted-foreground">Target</p>
            <p className="mt-1 font-semibold">{gauge.target}%</p>
          </div>
          <div>
            <p className="text-muted-foreground">Availability</p>
            <p className="mt-1 font-semibold text-emerald-600">{gauge.availability}%</p>
          </div>
          <div>
            <p className="text-muted-foreground">Performance</p>
            <p className="mt-1 font-semibold text-amber-600">{gauge.performance}%</p>
          </div>
          <div>
            <p className="text-muted-foreground">Quality</p>
            <p className="mt-1 font-semibold text-rose-600">{gauge.quality}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function AvailabilityCard({ report }: { report: MesOutputEfficiencyReport }) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Availability</CardTitle>
        <CardDescription>Placeholder availability trend for {report.lineLabel.toLowerCase()} across the selected report scope.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            availability: { label: "Availability", color: "#22c55e" },
            target: { label: "Target", color: "#eab308" },
          }}
          className="h-[340px] w-full"
        >
          <BarChart data={report.availability}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} domain={[0, 100]} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="availability" radius={[8, 8, 0, 0]}>
              {report.availability.map((entry, index) => (
                <Cell key={entry.label} fill={index >= 5 && index <= 7 ? "#bbf7d0" : "#22c55e"} />
              ))}
            </Bar>
            <Bar dataKey="target" fill="#eab308" barSize={2} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

function DowntimeCard({
  title,
  subtitle,
  rows,
}: {
  title: string
  subtitle: string
  rows: MesOutputEfficiencyReport["downtimeLast7Days"]
}) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{ hours: { label: "Hours", color: "#2dd4bf" } }} className="h-[260px] w-full">
          <BarChart data={rows} layout="vertical" margin={{ left: 8, right: 8 }}>
            <CartesianGrid horizontal={false} strokeDasharray="3 3" />
            <XAxis type="number" tickLine={false} axisLine={false} />
            <YAxis dataKey="group" type="category" width={120} tickLine={false} axisLine={false} tickFormatter={(value) => (String(value).length > 18 ? `${String(value).slice(0, 18)}...` : String(value))} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="hours" radius={[0, 10, 10, 0]}>
              {rows.map((row, index) => (
                <Cell key={row.group} fill={downtimePalette[index % downtimePalette.length]} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

function AddWidgetPlaceholder() {
  return (
    <Card className="flex h-full min-h-[340px] items-center justify-center border-dashed border-border/70 bg-muted/10">
      <CardContent className="flex flex-col items-center justify-center gap-4 text-center">
        <div className="rounded-full bg-primary/10 p-4 text-primary">
          <Gauge className="h-6 w-6" />
        </div>
        <div>
          <p className="font-semibold text-foreground">Sample placeholder</p>
          <p className="mt-1 text-sm text-muted-foreground">Reserved panel space for the future live Output Efficiency widget set.</p>
        </div>
      </CardContent>
    </Card>
  )
}

export function OutputEfficiencyView({ report }: { report: MesOutputEfficiencyReport }) {
  const pieConfig = useMemo(
    () => ({
      availability: { label: "Availability", color: "#2dd4bf" },
      performance: { label: "Performance", color: "#f59e0b" },
      quality: { label: "Quality", color: "#fb7185" },
    }),
    [],
  )

  const pieData = [
    { name: "Availability", value: report.lineOee.availability, fill: "#2dd4bf" },
    { name: "Performance", value: report.lineOee.performance, fill: "#f59e0b" },
    { name: "Quality", value: report.lineOee.quality, fill: "#fb7185" },
  ]

  return (
    <div className="space-y-6">
      <FilterBar filters={report.filters} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <OeeGaugeCard
          title="OEE"
          subtitle={`${report.resolvedRangeLabel} dummy shell for ${report.streamLabel}, ${report.lineLabel.toLowerCase()}.`}
          gauge={report.overallOee}
        />

        <Card className="h-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">OEE</CardTitle>
            <CardDescription>{report.resolvedRangeLabel} filtered view for {report.lineLabel.toLowerCase()}.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ChartContainer config={pieConfig} className="h-[260px] w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={62} outerRadius={98} strokeWidth={0}>
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>

            <div className="grid grid-cols-4 gap-3 border-t border-border/60 pt-4 text-sm">
              <div>
                <p className="text-muted-foreground">Target</p>
                <p className="mt-1 font-semibold">{report.lineOee.target}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Availability</p>
                <p className="mt-1 font-semibold text-emerald-600">{report.lineOee.availability}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Performance</p>
                <p className="mt-1 font-semibold text-amber-600">{report.lineOee.performance}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Quality</p>
                <p className="mt-1 font-semibold text-rose-600">{report.lineOee.quality}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <AvailabilityCard report={report} />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-1">
          <DowntimeCard
            title="Downtime by group"
            subtitle={`Last 7 days dummy view for ${report.streamLabel}, ${report.lineLabel.toLowerCase()}.`}
            rows={report.downtimeLast7Days}
          />
        </div>
        <div className="xl:col-span-1">
          <DowntimeCard
            title="Downtime"
            subtitle={`Last 30 days dummy view for ${report.streamLabel}, ${report.lineLabel.toLowerCase()}.`}
            rows={report.downtimeLast30Days}
          />
        </div>
        <div className="xl:col-span-1">
          <AddWidgetPlaceholder />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Report Shell Note</CardTitle>
          <CardDescription>
            The visuals are dummy for now, but this report already binds Production Stream, Range, and Line into the underlying report service so we can switch to real MES calculations later without rebuilding the layout.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
            <div className="flex items-center gap-3">
              <Factory className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium">Production Stream bound</p>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">The selected stream is already passed into the report service contract for the eventual live source mapping.</p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
            <div className="flex items-center gap-3">
              <CalendarRange className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium">Range bound</p>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Current, previous day, previous week, previous month, and custom date range are already wired into the route and service.</p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
            <div className="flex items-center gap-3">
              <TimerReset className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium">Line bound</p>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Line 1 through 13 is already part of the filter contract, ready for the real line-based MES metric wiring.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
