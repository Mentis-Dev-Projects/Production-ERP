"use client"

import { Pie, PieChart, Cell } from "recharts"
import { Card, CardContent } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { DashboardSummary } from "@/types/mentis"

interface ProductionStatusDonutProps {
  statusItems: DashboardSummary["statusOverview"]
  stepItems: DashboardSummary["pipelineByStep"]
}

const statusPresentation = {
  "in-progress": { label: "In Progress", color: "#3b82f6" },
  complete: { label: "Completed", color: "#10b981" },
  pending: { label: "Pending", color: "#f59e0b" },
  "not-started": { label: "Not Started", color: "#94a3b8" },
  late: { label: "Late", color: "#ef4444" },
  "on-time": { label: "On Time", color: "#14b8a6" },
  early: { label: "Early", color: "#38bdf8" },
  blocked: { label: "Blocked", color: "#f97316" },
} as const

const stepPalette = ["#1d4ed8", "#0f766e", "#7c3aed", "#c2410c", "#be185d", "#0891b2", "#65a30d", "#475569"]

function DonutSection({
  title,
  centerLabel,
  data,
}: {
  title: string
  centerLabel: string
  data: Array<{ key: string; label: string; count: number; fill: string }>
}) {
  const chartConfig = Object.fromEntries(
    data.map((item) => [
      item.key,
      {
        label: item.label,
        color: item.fill,
      },
    ]),
  )

  return (
    <div className="px-1">
      <p className="text-sm font-semibold">{title}</p>
      {data.length === 0 ? (
        <div className="py-8 text-sm text-muted-foreground">No data available yet.</div>
      ) : (
        <div className="mt-3 grid grid-cols-[124px_minmax(0,1fr)] items-center gap-5">
          <ChartContainer config={chartConfig} className="h-[124px] w-[124px] shrink-0">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Pie data={data} dataKey="count" nameKey="key" innerRadius={28} outerRadius={48} paddingAngle={2} strokeWidth={0}>
                {data.map((entry) => (
                  <Cell key={entry.key} fill={entry.fill} />
                ))}
              </Pie>
              <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground text-[11px] font-semibold uppercase tracking-[0.12em]">
                {centerLabel}
              </text>
            </PieChart>
          </ChartContainer>

          <div className="min-w-0 space-y-2">
            {data.slice(0, 4).map((entry) => (
              <div key={entry.key} className="grid grid-cols-[minmax(0,1fr)_64px] items-start gap-3 text-sm">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: entry.fill }} />
                  <span className="break-words leading-5" title={entry.label}>
                    {entry.label}
                  </span>
                </div>
                <span className="pt-0.5 text-right font-medium tabular-nums text-muted-foreground">{entry.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function ProductionStatusDonut({ statusItems, stepItems }: ProductionStatusDonutProps) {
  const statusChartData = statusItems
    .filter((item) => item.count > 0)
    .map((item) => ({
      key: item.status,
      label: statusPresentation[item.status].label,
      count: item.count,
      fill: statusPresentation[item.status].color,
    }))

  const stepChartData = stepItems
    .filter((item) => item.count > 0)
    .map((item, index) => ({
      key: item.step,
      label: item.step,
      count: item.count,
      fill: stepPalette[index % stepPalette.length],
    }))

  return (
    <Card className="h-full">
      <CardContent className="grid h-full gap-4 p-6">
        <DonutSection title="Production Orders by Status" centerLabel="Status" data={statusChartData} />
        <div className="border-t border-border/60" />
        <DonutSection title="Production Orders by Current Step" centerLabel="Step" data={stepChartData} />
      </CardContent>
    </Card>
  )
}
