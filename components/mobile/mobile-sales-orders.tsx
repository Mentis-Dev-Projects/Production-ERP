import Link from "next/link"
import { CalendarClock, Search } from "lucide-react"
import { DataAccessNotice } from "@/components/data-access-notice"
import { MobilePageShell } from "@/components/mobile/mobile-page-shell"
import { StatusBadge } from "@/components/status-badge"
import type { DataAccessMeta, SalesOrderListItem } from "@/types/mentis"
import { formatDate } from "@/lib/utils/format"

export function MobileSalesOrders({
  items,
  meta,
  searchSummary,
  sortSummary,
}: {
  items: SalesOrderListItem[]
  meta: DataAccessMeta
  searchSummary: string
  sortSummary: string
}) {
  return (
    <MobilePageShell title="Sales Orders" subtitle="A separate mobile list focused on quick scan and open.">
      <DataAccessNotice meta={meta} />

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-3xl border border-border/50 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-primary/10 p-2 text-primary">
              <Search className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Filter</p>
              <p className="text-sm font-semibold">{searchSummary}</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-border/50 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-amber-50 p-2 text-amber-600">
              <CalendarClock className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Sort</p>
              <p className="text-sm font-semibold">{sortSummary}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="rounded-3xl border border-border/50 bg-white p-5 text-sm text-muted-foreground shadow-sm">
            No orders match the current filter set.
          </div>
        ) : (
          items.map((order) => (
            <Link
              key={order.id}
              href={`/pipeline?order=${order.salesOrderNumber}`}
              className="block rounded-3xl border border-border/50 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold">{order.salesOrderNumber}</p>
                  <p className="mt-1 truncate text-sm text-muted-foreground">{order.clientName}</p>
                </div>
                <StatusBadge status={order.status} />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Product</p>
                  <p className="mt-1 truncate font-medium">{order.productCode ?? "-"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Current Step</p>
                  <p className="mt-1 truncate font-medium">{order.currentStep}</p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-2xl bg-muted/40 px-3 py-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarClock className="h-4 w-4" />
                  Due
                </div>
                <p className="font-semibold">{formatDate(order.dueDate)}</p>
              </div>
            </Link>
          ))
        )}
      </div>
    </MobilePageShell>
  )
}
