"use client"

import Link from "next/link"
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { formatNumber } from "@/lib/utils/format"
import type { PerformanceDashboardData } from "@/types/mentis"

export function ProductionThroughputReport({ item }: { item: PerformanceDashboardData }) {
  const totals = item.trends.reduce(
    (summary, point) => ({
      created: summary.created + point.createdOrders,
      completed: summary.completed + point.completedOrders,
      overdue: summary.overdue + point.overdueOrders,
    }),
    { created: 0, completed: 0, overdue: 0 },
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Production Throughput Report</h2>
          <p className="mt-1 text-sm text-muted-foreground">Created, completed, and overdue movement across the selected reporting window.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/reports/production">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Production Reporting
          </Link>
        </Button>
      </div>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Created Orders</p>
            <p className="mt-2 text-3xl font-semibold">{formatNumber(totals.created)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Completed Orders</p>
            <p className="mt-2 text-3xl font-semibold">{formatNumber(totals.completed)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Overdue Orders</p>
            <p className="mt-2 text-3xl font-semibold">{formatNumber(totals.overdue)}</p>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Throughput Trend</CardTitle>
          <CardDescription>Weekly order flow with created, completed, and overdue movement.</CardDescription>
        </CardHeader>
        <CardContent>
          {item.trends.length === 0 ? (
            <div className="flex h-[420px] items-center justify-center text-sm text-muted-foreground">
              No throughput data is available for the current filters.
            </div>
          ) : (
            <ChartContainer
              config={{
                createdOrders: { label: "Created", color: "#38BDF8" },
                completedOrders: { label: "Completed", color: "#22C55E" },
                overdueOrders: { label: "Overdue", color: "#EF4444" },
              }}
              className="h-[420px] w-full"
            >
              <LineChart data={item.trends} margin={{ left: 12, right: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="periodLabel" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Line type="monotone" dataKey="createdOrders" stroke="#38BDF8" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="completedOrders" stroke="#22C55E" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="overdueOrders" stroke="#EF4444" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Throughput by Period</CardTitle>
          <CardDescription>Side-by-side created, completed, and overdue counts for each reporting bucket.</CardDescription>
        </CardHeader>
        <CardContent>
          {item.trends.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No period rows are available.
            </div>
          ) : (
            <ChartContainer
              config={{
                createdOrders: { label: "Created", color: "#38BDF8" },
                completedOrders: { label: "Completed", color: "#22C55E" },
                overdueOrders: { label: "Overdue", color: "#EF4444" },
              }}
              className="h-[320px] w-full"
            >
              <BarChart data={item.trends} margin={{ left: 12, right: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="periodLabel" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="createdOrders" fill="#38BDF8" radius={[6, 6, 0, 0]} />
                <Bar dataKey="completedOrders" fill="#22C55E" radius={[6, 6, 0, 0]} />
                <Bar dataKey="overdueOrders" fill="#EF4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
