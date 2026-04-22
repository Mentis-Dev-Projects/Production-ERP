import Link from "next/link"
import { AlertTriangle, CheckCircle2, Clock3, Package2 } from "lucide-react"
import { DataAccessNotice } from "@/components/data-access-notice"
import { MobilePageShell } from "@/components/mobile/mobile-page-shell"
import { MobileSection, MobileStatCard } from "@/components/mobile/mobile-shared"
import { StatusBadge } from "@/components/status-badge"
import type { DataAccessMeta, RectagridJobListItem } from "@/types/mentis"
import { formatDate, formatNumber, formatSquareMetres } from "@/lib/utils/format"

export function MobileRectagrid({
  items,
  meta,
  inProgress,
  pending,
  late,
  complete,
  title = "Rectagrid",
  subtitle = "A phone-first production stream board dedicated to Rectagrid.",
}: {
  items: RectagridJobListItem[]
  meta: DataAccessMeta
  inProgress: number
  pending: number
  late: number
  complete: number
  title?: string
  subtitle?: string
}) {
  return (
    <MobilePageShell title={title} subtitle={subtitle}>
      <DataAccessNotice meta={meta} />

      <div className="grid grid-cols-2 gap-3">
        <MobileStatCard label="In Progress" value={inProgress} tone="primary" />
        <MobileStatCard label="Pending" value={pending} tone="warning" />
        <MobileStatCard label="Late" value={late} tone="danger" />
        <MobileStatCard label="Complete" value={complete} tone="success" />
      </div>

      <MobileSection title="Current Jobs">
        <div className="space-y-3">
          {items.length === 0 ? (
            <div className="rounded-3xl border border-border/50 bg-white p-5 text-sm text-muted-foreground shadow-sm">
              No production jobs are available yet.
            </div>
          ) : (
            items.map((job) => (
              <Link
                key={job.jobId}
                href={`/pipeline?order=${job.salesOrderNumber}`}
                className="block rounded-3xl border border-border/50 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{job.salesOrderNumber}</p>
                    <p className="truncate text-sm text-muted-foreground">{job.clientName}</p>
                  </div>
                  <StatusBadge status={job.status} />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Product</p>
                    <p className="mt-1 truncate font-medium">{job.productCode ?? "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Current Step</p>
                    <p className="mt-1 truncate font-medium">{job.currentStep}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">SQM / Qty</p>
                    <p className="mt-1 font-medium">
                      {formatSquareMetres(job.sqm)} / {formatNumber(job.qty)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Due Date</p>
                    <p className="mt-1 font-medium">{formatDate(job.dueDate)}</p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </MobileSection>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Active", value: inProgress, icon: Clock3, tone: "bg-blue-50 text-blue-600" },
          { label: "Queued", value: pending, icon: Package2, tone: "bg-amber-50 text-amber-600" },
          { label: "Late", value: late, icon: AlertTriangle, tone: "bg-red-50 text-red-600" },
          { label: "Done", value: complete, icon: CheckCircle2, tone: "bg-emerald-50 text-emerald-600" },
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
