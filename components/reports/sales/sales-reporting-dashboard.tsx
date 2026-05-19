"use client"

import Link from "next/link"
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { ArrowRight, CalendarClock, ClipboardList, ShoppingCart, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { formatDate, formatNumber } from "@/lib/utils/format"
import { salesReports } from "@/lib/reporting"
import type { OrderStatus, SalesOrderListItem } from "@/types/mentis"

export type SalesClientTotal = {
  clientName: string
  orderCount: number
  openOrders: number
  lateOrders: number
  streams: string[]
}

type SalesReportingDashboardProps = {
  items: SalesOrderListItem[]
  clientTotals: SalesClientTotal[]
  statusRows: Array<{ status: OrderStatus; count: number }>
  streamRows: Array<{ stream: string; count: number }>
}

const statusLabels: Record<OrderStatus, string> = {
  "not-started": "Not Started",
  "in-progress": "In Progress",
  complete: "Complete",
  late: "Late",
  "on-time": "On Time",
  early: "Early",
  pending: "Pending",
  blocked: "Blocked",
}

export function SalesReportingDashboard({ items, clientTotals, statusRows, streamRows }: SalesReportingDashboardProps) {
  const topClients = clientTotals.slice(0, 10).map((client, index) => ({
    ...client,
    rankLabel: `${index + 1}. ${client.clientName.length > 16 ? `${client.clientName.slice(0, 16)}...` : client.clientName}`,
  }))
  const totalOrders = items.length
  const activeOrders = items.filter((item) => item.status !== "complete").length
  const lateOrders = items.filter((item) => item.status === "late").length
  const uniqueClients = clientTotals.length
  const latestOrders = [...items].slice(0, 8)

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total Orders", value: totalOrders, icon: ShoppingCart, tone: "bg-sky-50 text-sky-700" },
          { label: "Active Orders", value: activeOrders, icon: ClipboardList, tone: "bg-amber-50 text-amber-700" },
          { label: "Late Orders", value: lateOrders, icon: CalendarClock, tone: "bg-red-50 text-red-700" },
          { label: "Clients", value: uniqueClients, icon: Users, tone: "bg-emerald-50 text-emerald-700" },
        ].map((metric) => (
          <Card key={metric.label}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  <p className="mt-2 text-3xl font-semibold">{formatNumber(metric.value)}</p>
                </div>
                <div className={`rounded-2xl p-3 ${metric.tone}`}>
                  <metric.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>Top 10 Clients by Order Total</CardTitle>
            <CardDescription>Order count ranking only. Sales value is intentionally excluded until value data is available.</CardDescription>
          </CardHeader>
          <CardContent>
            {topClients.length === 0 ? (
              <div className="flex h-[380px] items-center justify-center text-sm text-muted-foreground">
                No client order totals are available for the current filters.
              </div>
            ) : (
              <ChartContainer config={{ orderCount: { label: "Orders", color: "#E8713A" } }} className="h-[380px] w-full">
                <LineChart data={topClients} margin={{ left: 12, right: 12, bottom: 28 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="rankLabel" tickLine={false} axisLine={false} angle={-20} textAnchor="end" height={72} />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="orderCount" stroke="#E8713A" strokeWidth={2.5} dot={{ r: 4 }} />
                </LineChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Order Mix by Stream</CardTitle>
            <CardDescription>Production stream split for the filtered sales order set.</CardDescription>
          </CardHeader>
          <CardContent>
            {streamRows.length === 0 ? (
              <div className="flex h-[380px] items-center justify-center text-sm text-muted-foreground">No stream mix is available.</div>
            ) : (
              <ChartContainer config={{ count: { label: "Orders", color: "#38BDF8" } }} className="h-[380px] w-full">
                <BarChart data={streamRows} layout="vertical" margin={{ left: 16, right: 16 }}>
                  <CartesianGrid horizontal={false} />
                  <XAxis type="number" tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="stream" tickLine={false} axisLine={false} width={110} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="#38BDF8" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Status View</CardTitle>
            <CardDescription>Order count by current schedule or production status.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {statusRows.map((row) => (
              <div key={row.status} className="flex items-center justify-between rounded-2xl border border-border/70 p-3">
                <span className="text-sm font-medium">{statusLabels[row.status]}</span>
                <Badge variant={row.status === "late" ? "destructive" : "outline"}>{formatNumber(row.count)}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Latest Due Orders</CardTitle>
            <CardDescription>Filtered order set sorted by latest due date first.</CardDescription>
          </CardHeader>
          <CardContent>
            {latestOrders.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                No orders matched the current filters.
              </div>
            ) : (
              <div className="space-y-3">
                {latestOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between gap-4 rounded-2xl border border-border/70 p-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{order.salesOrderNumber}</p>
                      <p className="truncate text-sm text-muted-foreground">
                        {order.clientName} | {order.stream} | Due {formatDate(order.dueDate)}
                      </p>
                    </div>
                    <Badge variant={order.status === "late" ? "destructive" : "outline"}>{statusLabels[order.status]}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Sales Report Templates</CardTitle>
          <CardDescription>Professional sales reporting templates focused on order volume and client visibility.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {salesReports.map((report) => (
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
