import { FileSearch } from "lucide-react"
import { DataAccessNotice } from "@/components/data-access-notice"
import { MobilePageShell } from "@/components/mobile/mobile-page-shell"
import { StatusBadge } from "@/components/status-badge"
import { PipelineSearchForm } from "@/components/pipeline/pipeline-search-form"
import type { DataAccessMeta, PipelineDetails } from "@/types/mentis"
import { formatDate, formatNumber, formatSquareMetres } from "@/lib/utils/format"

export function MobileProductionJobbing({
  item,
  meta,
  orderParam,
}: {
  item: PipelineDetails | null
  meta: DataAccessMeta
  orderParam: string
}) {
  return (
    <MobilePageShell title="Production Jobbing" subtitle="A separate mobile tracker for live Rectagrid job progress.">
      <DataAccessNotice meta={meta} />

      <div className="rounded-3xl border border-border/50 bg-white p-4 shadow-sm">
        <PipelineSearchForm
          initialOrderNumber={orderParam}
          initialClientName={item?.order.clientName ?? ""}
        />
      </div>

      {item ? (
        <>
          <div className="rounded-[30px] bg-primary px-5 py-6 text-primary-foreground shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-xl font-semibold">{item.order.salesOrderNumber}</p>
                <p className="mt-1 truncate text-sm text-primary-foreground/80">{item.order.clientName}</p>
              </div>
              <StatusBadge status={item.order.status} className="bg-white/90 text-primary" />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-primary-foreground/70">Product</p>
                <p className="mt-1 font-medium">{item.order.productCode ?? "-"}</p>
              </div>
              <div>
                <p className="text-primary-foreground/70">Due Date</p>
                <p className="mt-1 font-medium">{formatDate(item.order.dueDate)}</p>
              </div>
              <div>
                <p className="text-primary-foreground/70">SQM / Qty</p>
                <p className="mt-1 font-medium">
                  {formatSquareMetres(item.order.sqm)} / {formatNumber(item.order.qty)}
                </p>
              </div>
              <div>
                <p className="text-primary-foreground/70">Current Step</p>
                <p className="mt-1 font-medium">{item.order.currentStep}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {item.stages.map((stage) => (
              <div
                key={`${stage.stepNumber}-${stage.stepCode}`}
                className="rounded-3xl border border-border/50 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">
                      {stage.stepNumber}. {stage.stepName}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">{stage.stepCode}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <StatusBadge status={stage.status} />
                    {stage.isCurrentActual ? (
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                        Current
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Plan End</p>
                    <p className="mt-1 font-medium">{formatDate(stage.plannedEndDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Actual</p>
                    <p className="mt-1 font-medium">{formatDate(stage.actualEndDate ?? stage.actualStartDate)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="rounded-3xl border border-border/50 bg-white px-5 py-10 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <FileSearch className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="mt-4 text-lg font-semibold">{orderParam ? "Sales order not found" : "No order selected"}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {orderParam
              ? "No production jobbing detail was returned for that order."
              : "Choose an order from the dropdowns above to open the live mobile tracker."}
          </p>
        </div>
      )}
    </MobilePageShell>
  )
}
