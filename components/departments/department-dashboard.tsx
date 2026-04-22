import Link from "next/link"
import { Bell, FolderOpenDot, Plus, Send } from "lucide-react"
import { DataAccessNotice } from "@/components/data-access-notice"
import { MobilePageShell } from "@/components/mobile/mobile-page-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { DataAccessMeta, DepartmentDashboard } from "@/types/mentis"
import { departmentLabels } from "@/lib/workflow/constants"
import { formatDate } from "@/lib/utils/format"

export function DepartmentDashboardView({
  item,
  meta,
  createLink,
  desktopTitle,
}: {
  item: DepartmentDashboard
  meta: DataAccessMeta
  createLink?: string
  desktopTitle: string
}) {
  const label = departmentLabels[item.department]

  return (
    <>
      <MobilePageShell
        title={`${label} Dashboard`}
        subtitle={`Dedicated ${label.toLowerCase()} workflow inbox and notifications.`}
        actions={
          createLink ? (
            <Button asChild size="sm" className="rounded-full">
              <Link href={createLink}>
                <Plus className="h-4 w-4" />
              </Link>
            </Button>
          ) : undefined
        }
      >
        <DataAccessNotice meta={meta} />
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-3xl border border-border/50 bg-white p-4 shadow-sm">
            <FolderOpenDot className="mb-3 h-5 w-5 text-primary" />
            <p className="text-2xl font-semibold">{item.activeOrders}</p>
            <p className="text-sm text-muted-foreground">Active Orders</p>
          </div>
          <div className="rounded-3xl border border-border/50 bg-white p-4 shadow-sm">
            <Bell className="mb-3 h-5 w-5 text-amber-600" />
            <p className="text-2xl font-semibold">{item.unreadNotifications}</p>
            <p className="text-sm text-muted-foreground">Unread Notifications</p>
          </div>
        </div>

        {createLink ? (
          <Button asChild className="h-12 rounded-2xl">
            <Link href={createLink}>Create New Jobbing Order</Link>
          </Button>
        ) : null}

        <div className="space-y-3">
          <p className="px-1 text-sm font-semibold">Current Jobbing Orders</p>
          {item.recentOrders.length === 0 ? (
            <div className="rounded-3xl border border-border/50 bg-white p-5 text-sm text-muted-foreground shadow-sm">
              No orders are currently assigned to {label}.
            </div>
          ) : (
            item.recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/departments/jobbing-orders/${order.id}`}
                className="block rounded-3xl border border-border/50 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{order.estimateNumber}</p>
                    <p className="truncate text-sm text-muted-foreground">{order.clientName}</p>
                  </div>
                  <Badge variant="outline">{order.streamName}</Badge>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{order.currentStage}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(order.updatedAt)}</p>
                </div>
              </Link>
            ))
          )}
        </div>

        <div className="space-y-3">
          <p className="px-1 text-sm font-semibold">Notifications</p>
          {item.notifications.length === 0 ? (
            <div className="rounded-3xl border border-border/50 bg-white p-5 text-sm text-muted-foreground shadow-sm">
              No notifications yet.
            </div>
          ) : (
            item.notifications.map((notification) => (
              <Link
                key={notification.id}
                href={`/departments/notifications/${notification.id}`}
                className="block rounded-3xl border border-border/50 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{notification.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{notification.message}</p>
                  </div>
                  {!notification.isRead ? <Badge className="bg-amber-100 text-amber-700">New</Badge> : null}
                </div>
              </Link>
            ))
          )}
        </div>
      </MobilePageShell>

      <div className="hidden min-h-screen lg:block">
        <div className="min-h-screen">
          <main className="space-y-6 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-primary">{label}</p>
                <h1 className="text-3xl font-semibold">{desktopTitle}</h1>
              </div>
              {createLink ? (
                <Button asChild>
                  <Link href={createLink}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Jobbing Order
                  </Link>
                </Button>
              ) : null}
            </div>

            <DataAccessNotice meta={meta} />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <FolderOpenDot className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{item.activeOrders}</p>
                      <p className="text-sm text-muted-foreground">Current Jobbing Orders</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-amber-100 p-2">
                      <Bell className="h-5 w-5 text-amber-700" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{item.unreadNotifications}</p>
                      <p className="text-sm text-muted-foreground">Unread Notifications</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-blue-100 p-2">
                      <Send className="h-5 w-5 text-blue-700" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{item.inboxCount}</p>
                      <p className="text-sm text-muted-foreground">Department Inbox</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-orange-100 p-2">
                      <Bell className="h-5 w-5 text-orange-700" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-2xl font-bold">{item.notifications.length}</p>
                      <p className="text-sm text-muted-foreground">Latest Notifications</p>
                      {item.notifications[0] ? (
                        <Link
                          href={`/departments/notifications/${item.notifications[0].id}`}
                          className="mt-1 block truncate text-xs text-primary hover:underline"
                        >
                          {item.notifications[0].title}
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
                <CardTitle>Current Jobbing Orders</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {item.recentOrders.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No orders are currently assigned to {label}.</p>
                ) : (
                  item.recentOrders.map((order) => (
                    <Link
                      key={order.id}
                      href={`/departments/jobbing-orders/${order.id}`}
                      className="flex items-center justify-between rounded-2xl border p-4 transition-colors hover:bg-muted/40"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold">{order.estimateNumber}</p>
                        <p className="truncate text-sm text-muted-foreground">{order.clientName}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">{order.streamName}</Badge>
                        <p className="mt-2 text-xs text-muted-foreground">{formatDate(order.updatedAt)}</p>
                      </div>
                    </Link>
                  ))
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </>
  )
}
