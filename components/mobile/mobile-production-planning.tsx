import Link from "next/link"
import { AlertTriangle, CheckCircle2, Clock3, PauseCircle } from "lucide-react"
import { DataAccessNotice } from "@/components/data-access-notice"
import { MobilePageShell } from "@/components/mobile/mobile-page-shell"
import { MobileSection, MobileStatCard } from "@/components/mobile/mobile-shared"
import { StatusBadge } from "@/components/status-badge"
import type { DataAccessMeta, SalesOrderListItem } from "@/types/mentis"
import { formatDate } from "@/lib/utils/format"

export function MobileProductionPlanning({
  dueThisWeekCount,
  meta,
  overdueCount,
  inProgressCount,
  waitingCount,
  orders,
}: {
  dueThisWeekCount: number
  meta: DataAccessMeta
  overdueCount: number
  inProgressCount: number
  waitingCount: number
  orders: SalesOrderListItem[]
}) {
  return (
    <MobilePageShell title="Production Overview" subtitle="A dedicated mobile operations board for quick production decisions.">
      <DataAccessNotice meta={meta} />

      <div className="grid grid-cols-2 gap-3">
        <MobileStatCard label="Due This Week" value={dueThisWeekCount} tone="warning" />
        <MobileStatCard label="Overdue" value={overdueCount} tone="danger" />
        <MobileStatCard label="In Progress" value={inProgressCount} tone="primary" />
        <MobileStatCard label="Waiting" value={waitingCount} tone="neutral" />
      </div>

      <MobileSection title="Production Orders in Progress">
        <div className="space-y-3">
          {orders
            .filter((order) => order.status !== "complete")
            .slice(0, 12)
            .map((order) => (
              <Link
                key={order.id}
                href={`/pipeline?order=${order.salesOrderNumber}`}
                className="block rounded-3xl border border-border/50 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{order.salesOrderNumber}</p>
                    <p className="truncate text-sm text-muted-foreground">{order.clientName}</p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Current Step</p>
                    <p className="mt-1 font-medium">{order.currentStep}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Due Date</p>
                    <p className="mt-1 font-medium">{formatDate(order.dueDate)}</p>
                  </div>
                </div>
              </Link>
            ))}
        </div>
      </MobileSection>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Critical", value: overdueCount, icon: AlertTriangle, tone: "text-red-600 bg-red-50" },
          { label: "Active", value: inProgressCount, icon: CheckCircle2, tone: "text-blue-600 bg-blue-50" },
          { label: "Pending", value: waitingCount, icon: PauseCircle, tone: "text-amber-600 bg-amber-50" },
          { label: "Due Soon", value: dueThisWeekCount, icon: Clock3, tone: "text-primary bg-primary/10" },
        ].map((card) => (
          <div key={card.label} className="rounded-3xl border border-border/50 bg-white p-4 shadow-sm">
            <div className={`inline-flex rounded-2xl p-2 ${card.tone}`}>
              <card.icon className="h-4 w-4" />
            </div>
            <p className="mt-3 text-2xl font-semibold">{card.value}</p>
            <p className="text-sm text-muted-foreground">{card.label}</p>
          </div>
        ))}
      </div>
    </MobilePageShell>
  )
}
