"use client"

import Link from "next/link"
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { formatNumber } from "@/lib/utils/format"
import type { SalesClientTotal } from "@/components/reports/sales/sales-reporting-dashboard"

export function ClientOrderTotalReport({ clientTotals }: { clientTotals: SalesClientTotal[] }) {
  const topClients = clientTotals.slice(0, 10).map((client, index) => ({
    ...client,
    rankLabel: `${index + 1}. ${client.clientName.length > 16 ? `${client.clientName.slice(0, 16)}...` : client.clientName}`,
  }))
  const totalOrders = clientTotals.reduce((sum, client) => sum + client.orderCount, 0)
  const totalOpen = clientTotals.reduce((sum, client) => sum + client.openOrders, 0)
  const totalLate = clientTotals.reduce((sum, client) => sum + client.lateOrders, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Client Order Total Report</h2>
          <p className="mt-1 text-sm text-muted-foreground">Client order ranking by count only. Sales value is not included.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/reports/sales">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Sales Reporting
          </Link>
        </Button>
      </div>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Orders</p>
            <p className="mt-2 text-3xl font-semibold">{formatNumber(totalOrders)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Open Orders</p>
            <p className="mt-2 text-3xl font-semibold">{formatNumber(totalOpen)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Late Orders</p>
            <p className="mt-2 text-3xl font-semibold">{formatNumber(totalLate)}</p>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Top 10 Clients by Order Total</CardTitle>
          <CardDescription>Line graph ranking clients by order count.</CardDescription>
        </CardHeader>
        <CardContent>
          {topClients.length === 0 ? (
            <div className="flex h-[420px] items-center justify-center text-sm text-muted-foreground">No client totals are available.</div>
          ) : (
            <ChartContainer config={{ orderCount: { label: "Orders", color: "#E8713A" } }} className="h-[420px] w-full">
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

      <Card>
        <CardHeader>
          <CardTitle>Client Order Totals</CardTitle>
          <CardDescription>Full ranked report with open and late order counts.</CardDescription>
        </CardHeader>
        <CardContent>
          {clientTotals.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No clients matched the current filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="px-3 py-2">Rank</th>
                    <th className="px-3 py-2">Client</th>
                    <th className="px-3 py-2 text-right">Total Orders</th>
                    <th className="px-3 py-2 text-right">Open Orders</th>
                    <th className="px-3 py-2 text-right">Late Orders</th>
                    <th className="px-3 py-2">Streams</th>
                  </tr>
                </thead>
                <tbody>
                  {clientTotals.map((client, index) => (
                    <tr key={client.clientName} className="border-b last:border-0">
                      <td className="px-3 py-3 font-medium">{index + 1}</td>
                      <td className="px-3 py-3 font-medium">{client.clientName}</td>
                      <td className="px-3 py-3 text-right">{formatNumber(client.orderCount)}</td>
                      <td className="px-3 py-3 text-right">{formatNumber(client.openOrders)}</td>
                      <td className="px-3 py-3 text-right">{formatNumber(client.lateOrders)}</td>
                      <td className="px-3 py-3 text-muted-foreground">{client.streams.join(", ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Client Ranking Bar View</CardTitle>
          <CardDescription>Alternate view for quick comparison across the top client set.</CardDescription>
        </CardHeader>
        <CardContent>
          {topClients.length === 0 ? (
            <div className="flex h-[320px] items-center justify-center text-sm text-muted-foreground">No chart data is available.</div>
          ) : (
            <ChartContainer config={{ orderCount: { label: "Orders", color: "#38BDF8" } }} className="h-[320px] w-full">
              <BarChart data={topClients} layout="vertical" margin={{ left: 16, right: 16 }}>
                <CartesianGrid horizontal={false} />
                <XAxis type="number" tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="rankLabel" tickLine={false} axisLine={false} width={140} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="orderCount" fill="#38BDF8" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
