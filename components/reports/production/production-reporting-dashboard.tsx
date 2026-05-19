"use client"

import Link from "next/link"
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { AlertTriangle, ArrowRight, Clock3, Factory, PackageCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { formatDate, formatNumber } from "@/lib/utils/format"
import { productionReports } from "@/lib/reporting"
import type { PerformanceDashboardData } from "@/types/mentis"

type ProductionReportingDashboardProps = {
  item: PerformanceDashboardData
}

const metricCards = [
  { key: "totalActiveOrders", label: "Active Orders", icon: Factory, tone: "bg-sky-50 text-sky-700" },
  { key: "overdueOrders", label: "Overdue Orders", icon: AlertTriangle, tone: "bg-red-50 text-red-700" },
  { key: "dueThisWeek", label: "Due This Week", icon: Clock3, tone: "bg-amber-50 text-amber-700" },
  { key: "completedOrders", label: "Completed Orders", icon: PackageCheck, tone: "bg-emerald-50 text-emerald-700" },
] as const

export function ProductionReportingDashboard({ item }: ProductionReportingDashboardProps) {
  const topLines = item.lineBreakdown.slice(0, 6)
  const exceptions = item.exceptions.slice(0, 8)

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card) => (
          <Card key={card.key}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <p className="mt-2 text-3xl font-semibold">{formatNumber(item.summary[card.key])}</p>
                </div>
                <div className={`rounded-2xl p-3 ${card.tone}`}>
                  <card.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>Production Throughput Trend</CardTitle>
            <CardDescription>Created, completed, and overdue order movement for the selected reporting scope.</CardDescription>
          </CardHeader>
          <CardContent>
            {item.trends.length === 0 ? (
              <div className="flex h-[360px] items-center justify-center text-sm text-muted-foreground">
                No trend data is available for the current filters.
              </div>
            ) : (
              <ChartContainer
                config={{
                  createdOrders: { label: "Created", color: "#38BDF8" },
                  completedOrders: { label: "Completed", color: "#22C55E" },
                  overdueOrders: { label: "Overdue", color: "#EF4444" },
                }}
                className="h-[360px] w-full"
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

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Line Workload View</CardTitle>
            <CardDescription>Largest active production-line loads in the filtered report.</CardDescription>
          </CardHeader>
          <CardContent>
            {topLines.length === 0 ? (
              <div className="flex h-[360px] items-center justify-center text-sm text-muted-foreground">
                No line workload data is available.
              </div>
            ) : (
              <ChartContainer config={{ activeOrders: { label: "Active Orders", color: "#E8713A" } }} className="h-[360px] w-full">
                <BarChart data={topLines} layout="vertical" margin={{ left: 16, right: 16 }}>
                  <CartesianGrid horizontal={false} />
                  <XAxis type="number" tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="productionLine" tickLine={false} axisLine={false} width={110} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="activeOrders" fill="#E8713A" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Delivery Performance</CardTitle>
            <CardDescription>Current on-time and late-rate indicators.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
              <p className="text-sm text-muted-foreground">On-Time Rate</p>
              <p className="mt-2 text-2xl font-semibold">{item.summary.onTimeRate}%</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
              <p className="text-sm text-muted-foreground">Late Rate</p>
              <p className="mt-2 text-2xl font-semibold">{item.summary.lateRate}%</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
              <p className="text-sm text-muted-foreground">Avg Prod Days</p>
              <p className="mt-2 text-2xl font-semibold">{formatNumber(item.summary.averageProductionDays, 1)}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
              <p className="text-sm text-muted-foreground">Qty Completion</p>
              <p className="mt-2 text-2xl font-semibold">{item.summary.trackedQuantityCompletion}%</p>
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Critical Exceptions</CardTitle>
              <CardDescription>Highest priority records from the current production report slice.</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/performance-dashboard?kpiView=orders-at-risk">
                Open risk view
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {exceptions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                No critical exceptions in the current report scope.
              </div>
            ) : (
              <div className="space-y-3">
                {exceptions.map((exception, index) => (
                  <div key={`${exception.productionLine}-${exception.salesOrderNumber}-${exception.worksOrder ?? "no-wo"}-${index}`} className="flex items-center justify-between gap-4 rounded-2xl border border-border/70 p-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{exception.salesOrderNumber}</p>
                      <p className="truncate text-sm text-muted-foreground">
                        {exception.productionLine} | {exception.client} | Due {formatDate(exception.effectiveDueDate)}
                      </p>
                    </div>
                    <Badge variant={exception.riskFlag === "Critical" ? "destructive" : "outline"}>{exception.riskFlag}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Production Report Templates</CardTitle>
          <CardDescription>Reusable production reporting layouts ready for operations review and export workflows.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {productionReports.map((report) => (
              <Card key={report.title} className="border-border/70">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                      <report.icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <CardTitle className="text-base">{report.title}</CardTitle>
                        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                          {report.status}
                        </span>
                      </div>
                      <CardDescription className="mt-2">{report.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {report.href ? (
                    <Button asChild className="w-full justify-between">
                      <Link href={report.href}>
                        Open template
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  ) : (
                    <Button variant="outline" className="w-full justify-between" disabled>
                      Template ready
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
