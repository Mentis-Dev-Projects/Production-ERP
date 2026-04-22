import Link from "next/link"
import { AlertTriangle, CheckCircle, Clock, Pause } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { DataAccessNotice } from "@/components/data-access-notice"
import { StatusBadge } from "@/components/status-badge"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MobileProductionPlanning } from "@/components/mobile/mobile-production-planning"
import { formatDate } from "@/lib/utils/format"
import { getDashboardSummary } from "@/lib/services/dashboard-service"
import { getSalesOrders } from "@/lib/services/sales-order-service"

type ProductionOverviewPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function getFirstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function ProductionPlanningPage({ searchParams }: ProductionOverviewPageProps) {
  const rawParams = await searchParams
  const selectedClient = getFirstParam(rawParams.client) ?? ""
  const selectedSalesOrder = getFirstParam(rawParams.salesOrder) ?? ""
  const selectedStream = getFirstParam(rawParams.stream) ?? "all"

  const [{ item: summary, meta }, { items: orders }] = await Promise.all([
    getDashboardSummary(),
    getSalesOrders({ q: "", status: "all", stream: "all", sortBy: "dueDate", sortDirection: "desc", limit: 5000 }),
  ])

  const streamOptions = Array.from(new Set(orders.map((order) => order.stream))).sort((left, right) => left.localeCompare(right))
  const streamScopedOrders = orders.filter((order) => (selectedStream !== "all" ? order.stream === selectedStream : true))
  const overdue = streamScopedOrders.filter((order) => order.status === "late")
  const inProgress = streamScopedOrders.filter((order) => order.status === "in-progress")
  const waitingToStart = streamScopedOrders.filter((order) => order.status === "not-started" || order.status === "pending")
  const dueThisWeek = streamScopedOrders.filter((order) => {
    if (order.status === "complete" || !order.dueDate) return false

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const weekAhead = new Date(today)
    weekAhead.setDate(weekAhead.getDate() + 7)

    const dueDate = new Date(order.dueDate)
    dueDate.setHours(0, 0, 0, 0)

    return dueDate >= today && dueDate <= weekAhead
  })
  const clientOptions = Array.from(new Set(orders.map((order) => order.clientName))).sort((left, right) => left.localeCompare(right))
  const salesOrderOptions = Array.from(new Set(orders.map((order) => order.salesOrderNumber))).sort((left, right) => left.localeCompare(right))

  const filteredOrders = streamScopedOrders
    .filter((order) => order.status !== "complete")
    .filter((order) => (selectedClient ? order.clientName === selectedClient : true))
    .filter((order) => (selectedSalesOrder ? order.salesOrderNumber === selectedSalesOrder : true))
    .sort((left, right) => {
      const leftTime = left.dueDate ? new Date(left.dueDate).getTime() : -Infinity
      const rightTime = right.dueDate ? new Date(right.dueDate).getTime() : -Infinity
      return rightTime - leftTime
    })

  return (
    <>
      <MobileProductionPlanning
        dueThisWeekCount={dueThisWeek.length}
        meta={meta}
        overdueCount={overdue.length}
        inProgressCount={inProgress.length}
        waitingCount={waitingToStart.length}
        orders={filteredOrders}
      />

      <div className="hidden min-h-screen lg:block">
        <AppHeader title="Production Overview" />
        <main className="space-y-6 p-6">
          <DataAccessNotice meta={meta} />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {[
              { title: "Due This Week", value: dueThisWeek.length, icon: Clock, tone: "bg-amber-100 text-amber-600" },
              { title: "Overdue", value: overdue.length, icon: AlertTriangle, tone: "bg-red-100 text-red-600" },
              { title: "In Progress", value: inProgress.length, icon: CheckCircle, tone: "bg-blue-100 text-blue-600" },
              { title: "Waiting to Start", value: waitingToStart.length, icon: Pause, tone: "bg-muted text-muted-foreground" },
            ].map((card) => (
              <Card key={card.title}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{card.title}</p>
                      <p className="mt-1 text-3xl font-bold">{card.value}</p>
                    </div>
                    <div className={`rounded-lg p-2 ${card.tone.split(" ")[0]}`}>
                      <card.icon className={`h-5 w-5 ${card.tone.split(" ")[1]}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Production Orders in Progress Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="grid grid-cols-1 gap-4 lg:grid-cols-[0.8fr_1fr_1fr_auto]">
                <div className="space-y-2">
                  <label htmlFor="stream" className="text-sm font-medium">
                    Production Stream
                  </label>
                  <select
                    id="stream"
                    name="stream"
                    defaultValue={selectedStream}
                    className="border-input bg-background ring-offset-background flex h-10 w-full rounded-md border px-3 py-2 text-sm"
                  >
                    <option value="all">All streams</option>
                    {streamOptions.map((stream) => (
                      <option key={stream} value={stream}>
                        {stream}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="client" className="text-sm font-medium">
                    Client
                  </label>
                  <input
                    id="client"
                    name="client"
                    list="production-overview-client-options"
                    defaultValue={selectedClient}
                    placeholder="All clients"
                    className="border-input bg-background ring-offset-background flex h-10 w-full rounded-md border px-3 py-2 text-sm"
                  />
                  <datalist id="production-overview-client-options">
                    {clientOptions.map((client) => (
                      <option key={client} value={client} />
                    ))}
                  </datalist>
                </div>

                <div className="space-y-2">
                  <label htmlFor="salesOrder" className="text-sm font-medium">
                    Sales Order
                  </label>
                  <input
                    id="salesOrder"
                    name="salesOrder"
                    list="production-overview-sales-order-options"
                    defaultValue={selectedSalesOrder}
                    placeholder="All sales orders"
                    className="border-input bg-background ring-offset-background flex h-10 w-full rounded-md border px-3 py-2 text-sm"
                  />
                  <datalist id="production-overview-sales-order-options">
                    {salesOrderOptions.map((salesOrder) => (
                      <option key={salesOrder} value={salesOrder} />
                    ))}
                  </datalist>
                </div>

                <div className="flex items-end gap-2">
                  <button
                    type="submit"
                    className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
                  >
                    Apply
                  </button>
                  <Link
                    href="/production-planning"
                    className="inline-flex h-10 items-center justify-center rounded-md border border-border px-4 text-sm font-medium"
                  >
                    Reset
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Production Orders in Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Stream</TableHead>
                    <TableHead>SOAP</TableHead>
                    <TableHead>Current Step</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <Link href={`/pipeline?order=${order.salesOrderNumber}`} className="font-medium text-primary hover:underline">
                            {order.salesOrderNumber}
                          </Link>
                        </TableCell>
                        <TableCell>{order.clientName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{order.stream}</Badge>
                        </TableCell>
                        <TableCell>{formatDate(order.approvalDate)}</TableCell>
                        <TableCell>{order.currentStep}</TableCell>
                        <TableCell className={order.status === "late" ? "font-medium text-red-600" : ""}>
                          {formatDate(order.dueDate)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={order.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  {filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                        No in-progress production orders matched the current stream, client, and sales order filters.
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  )
}
