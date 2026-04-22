import Link from "next/link"
import { AlertTriangle, Bell, CheckCircle, Clock, Pause } from "lucide-react"
import { DataAccessNotice } from "@/components/data-access-notice"
import { MobilePageShell } from "@/components/mobile/mobile-page-shell"
import { StatusBadge } from "@/components/status-badge"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getDashboardSummary } from "@/lib/services/dashboard-service"
import { getSalesOrders } from "@/lib/services/sales-order-service"
import { getDepartmentDashboard } from "@/lib/services/workflow-service"
import { formatDate } from "@/lib/utils/format"

export default async function ProductionDepartmentPage() {
  const [{ item: summary, meta }, { items: orders }, workflow] = await Promise.all([
    getDashboardSummary(),
    getSalesOrders({ q: "", status: "all", stream: "all", limit: 5000 }),
    getDepartmentDashboard("production"),
  ])

  const overdue = orders.filter((order) => order.status === "late")
  const inProgress = orders.filter((order) => order.status === "in-progress")
  const waitingToStart = orders.filter((order) => order.status === "not-started" || order.status === "pending")

  return (
    <>
      <MobilePageShell title="Production Dashboard" subtitle="Current production planning plus incoming workflow notifications.">
        <DataAccessNotice meta={meta} />
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-3xl border border-border/50 bg-white p-4 shadow-sm">
            <Clock className="mb-3 h-5 w-5 text-amber-600" />
            <p className="text-2xl font-semibold">{summary.dueThisWeek}</p>
            <p className="text-sm text-muted-foreground">Due This Week</p>
          </div>
          <div className="rounded-3xl border border-border/50 bg-white p-4 shadow-sm">
            <AlertTriangle className="mb-3 h-5 w-5 text-red-600" />
            <p className="text-2xl font-semibold">{overdue.length}</p>
            <p className="text-sm text-muted-foreground">Overdue</p>
          </div>
          <div className="rounded-3xl border border-border/50 bg-white p-4 shadow-sm">
            <CheckCircle className="mb-3 h-5 w-5 text-blue-600" />
            <p className="text-2xl font-semibold">{inProgress.length}</p>
            <p className="text-sm text-muted-foreground">In Progress</p>
          </div>
          <div className="rounded-3xl border border-border/50 bg-white p-4 shadow-sm">
            <Pause className="mb-3 h-5 w-5 text-muted-foreground" />
            <p className="text-2xl font-semibold">{waitingToStart.length}</p>
            <p className="text-sm text-muted-foreground">Waiting</p>
          </div>
        </div>

        <div className="space-y-3">
          <p className="px-1 text-sm font-semibold">Incoming Notifications</p>
          {workflow.item.notifications.length === 0 ? (
            <div className="rounded-3xl border border-border/50 bg-white p-5 text-sm text-muted-foreground shadow-sm">
              No production notifications yet.
            </div>
          ) : (
            workflow.item.notifications.map((notification) => (
              <Link
                key={notification.id}
                href={`/departments/notifications/${notification.id}`}
                className="block rounded-3xl border border-border/50 bg-white p-4 shadow-sm"
              >
                <p className="font-semibold">{notification.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{notification.message}</p>
              </Link>
            ))
          )}
        </div>
      </MobilePageShell>

      <div className="hidden min-h-screen lg:block">
        <main className="space-y-6 p-6">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-primary">Production</p>
            <h1 className="text-3xl font-semibold">Production Dashboard</h1>
          </div>

          <DataAccessNotice meta={meta} />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
            {[
              { title: "Due This Week", value: summary.dueThisWeek, icon: Clock, tone: "bg-amber-100 text-amber-600" },
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
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-orange-100 p-2">
                    <Bell className="h-5 w-5 text-orange-700" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-2xl font-bold">{workflow.item.notifications.length}</p>
                    <p className="text-sm text-muted-foreground">Latest Notifications</p>
                    {workflow.item.notifications[0] ? (
                      <Link
                        href={`/departments/notifications/${workflow.item.notifications[0].id}`}
                        className="mt-1 block truncate text-xs text-primary hover:underline"
                      >
                        {workflow.item.notifications[0].title}
                      </Link>
                    ) : (
                      <p className="mt-1 text-xs text-muted-foreground">No notifications yet</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Work Queue by Department</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Stream</TableHead>
                    <TableHead>Current Step</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders
                    .filter((order) => order.status !== "complete")
                    .sort((left, right) => (left.dueDate ?? "").localeCompare(right.dueDate ?? ""))
                    .map((order) => (
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
                        <TableCell>{order.currentStep}</TableCell>
                        <TableCell className={order.status === "late" ? "font-medium text-red-600" : ""}>
                          {formatDate(order.dueDate)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={order.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  )
}
