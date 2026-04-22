import Link from "next/link"
import { AlertTriangle, ArrowUpRight, Clock3, Gauge, Layers3 } from "lucide-react"
import { DataAccessNotice } from "@/components/data-access-notice"
import { MobilePageShell } from "@/components/mobile/mobile-page-shell"
import { MobileListLink, MobileSection, MobileStatCard } from "@/components/mobile/mobile-shared"
import { StatusBadge } from "@/components/status-badge"
import type { DashboardSummary, DataAccessMeta } from "@/types/mentis"
import { formatDate } from "@/lib/utils/format"

export function MobileDashboard({ item, meta }: { item: DashboardSummary; meta: DataAccessMeta }) {
  return (
    <MobilePageShell title="Dashboard" subtitle="Live production signals designed for a phone-first workflow.">
      <DataAccessNotice meta={meta} />

      <div className="grid grid-cols-2 gap-3">
        <MobileStatCard label="Open Orders" value={item.openOrders} tone="primary" helper="Live across the current flow" />
        <MobileStatCard label="Due This Week" value={item.dueThisWeek} tone="warning" helper="Orders requiring attention" />
        <MobileStatCard label="In Progress" value={item.ordersInProgress} tone="neutral" helper="Active production jobs" />
        <MobileStatCard label="Late Orders" value={item.lateOrders} tone="danger" helper="Past planned finish" />
      </div>

      <MobileSection
        title="Quick Open"
        action={
          <Link href="/sales-orders" className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            View all
          </Link>
        }
      >
        <div className="space-y-3">
          {item.recentOrders.slice(0, 5).map((order) => (
            <MobileListLink
              key={order.id}
              href={`/pipeline?order=${order.salesOrderNumber}`}
              title={order.salesOrderNumber}
              subtitle={`${order.clientName} | Due ${formatDate(order.dueDate)}`}
              trailing={<StatusBadge status={order.status} />}
            />
          ))}
        </div>
      </MobileSection>

      <MobileSection title="Step Snapshot">
        <div className="grid grid-cols-1 gap-3">
          {item.pipelineByStep.slice(0, 5).map((step) => (
            <div key={step.step} className="rounded-3xl border border-border/50 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-primary/10 p-2 text-primary">
                    <Layers3 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold">{step.step}</p>
                    <p className="text-xs text-muted-foreground">Active production jobbing load</p>
                  </div>
                </div>
                <p className="text-2xl font-semibold">{step.count}</p>
              </div>
            </div>
          ))}
        </div>
      </MobileSection>

      <MobileSection title="Attention Needed">
        <div className="space-y-3">
          {item.lateOrderList.length === 0 ? (
            <div className="rounded-3xl border border-border/50 bg-white p-5 text-sm text-muted-foreground shadow-sm">
              No late orders are currently flagged in the live feed.
            </div>
          ) : (
            item.lateOrderList.slice(0, 4).map((order) => (
              <div key={order.id} className="rounded-3xl border border-red-100 bg-red-50/70 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{order.salesOrderNumber}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{order.clientName}</p>
                    <p className="mt-2 text-xs text-red-700">Due {formatDate(order.dueDate)} | Current step {order.currentStep}</p>
                  </div>
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
              </div>
            ))
          )}
        </div>
      </MobileSection>

      <MobileSection title="Streams">
        <div className="space-y-3">
          {item.streamOverview.map((stream) => (
            <div key={stream.stream} className="rounded-3xl border border-border/50 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{stream.stream}</p>
                  <p className="text-xs text-muted-foreground">
                    {stream.inProgress} active | {stream.pending} pending | {stream.complete} complete
                  </p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-primary" />
              </div>
            </div>
          ))}
        </div>
      </MobileSection>

      <div className="rounded-3xl border border-border/50 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-amber-50 p-2 text-amber-600">
            <Clock3 className="h-4 w-4" />
          </div>
          <div>
            <p className="font-semibold">Current workload</p>
            <p className="text-sm text-muted-foreground">{item.currentWorkload} jobs are currently moving through the flow.</p>
          </div>
        </div>
      </div>

      <Link href="/performance-dashboard" className="block rounded-3xl border border-primary/20 bg-primary/5 p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-primary/10 p-2 text-primary">
              <Gauge className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold">Performance Dashboard</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Executive production metrics, risk charts, and exception reporting.
              </p>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-primary" />
        </div>
      </Link>
    </MobilePageShell>
  )
}
