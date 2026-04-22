import Link from "next/link"
import { notFound } from "next/navigation"
import { Download, FileText } from "lucide-react"
import { approveSalesOrderAction, completeDrawingsStepAction } from "@/lib/actions/workflow-actions"
import { MobilePageShell } from "@/components/mobile/mobile-page-shell"
import { StatusBadge } from "@/components/status-badge"
import { DrawingsCompletionClientForm, SalesApprovalClientForm } from "@/components/workflow/jobbing-order-action-forms"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { departmentLabels, stageLabels, statusLabels } from "@/lib/workflow/constants"
import { getJobbingOrderDetail } from "@/lib/services/workflow-service"
import { formatDate, formatNumber, formatSquareMetres } from "@/lib/utils/format"

type JobbingOrderDetailPageProps = {
  params: Promise<{ id: string }>
}

function DrawingsCompletionForm({ id, clientName }: { id: string; clientName: string }) {
  const action = completeDrawingsStepAction.bind(null, id)

  return <DrawingsCompletionClientForm id={id} clientName={clientName} action={action} />
}

function SalesApprovalForm({ id }: { id: string }) {
  const action = approveSalesOrderAction.bind(null, id)

  return <SalesApprovalClientForm id={id} action={action} />
}

export default async function JobbingOrderDetailPage({ params }: JobbingOrderDetailPageProps) {
  const { id } = await params
  const { item } = await getJobbingOrderDetail(id)

  if (!item) {
    notFound()
  }

  const canCompleteDrawings = item.order.currentDepartment === "drawings"
  const canApproveSales = item.order.currentDepartment === "sales" && Boolean(item.order.salesOrderNumber)

  return (
    <>
      <MobilePageShell
        title={item.order.estimateNumber}
        subtitle={`${item.order.clientName} | ${departmentLabels[item.order.currentDepartment]} currently owns this workflow`}
      >
        <div className="rounded-[30px] bg-primary px-5 py-6 text-primary-foreground shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xl font-semibold">{item.order.estimateNumber}</p>
              <p className="mt-1 text-sm text-primary-foreground/80">{item.order.clientName}</p>
            </div>
            <Badge className="bg-white/90 text-primary">{statusLabels[item.order.workflowStatus]}</Badge>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-primary-foreground/70">Department</p>
              <p className="mt-1 font-medium">{departmentLabels[item.order.currentDepartment]}</p>
            </div>
            <div>
              <p className="text-primary-foreground/70">Stage</p>
              <p className="mt-1 font-medium">{stageLabels[item.order.currentStage]}</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-border/50 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold">Workflow Details</p>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Sales Order</p>
              <p className="mt-1 font-medium">{item.order.salesOrderNumber ?? "Pending"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Product</p>
              <p className="mt-1 font-medium">{item.order.productCode ?? "Pending"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">SQM</p>
              <p className="mt-1 font-medium">{item.order.sqm ? formatSquareMetres(item.order.sqm) : "Pending"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Qty</p>
              <p className="mt-1 font-medium">{item.order.qty ? formatNumber(item.order.qty) : "Pending"}</p>
            </div>
          </div>
          {item.order.technicalRequirements ? (
            <p className="mt-4 text-sm text-muted-foreground">{item.order.technicalRequirements}</p>
          ) : null}
        </div>

        {canCompleteDrawings ? (
          <div className="rounded-3xl border border-border/50 bg-white p-4 shadow-sm">
            <p className="mb-4 text-sm font-semibold">Drawings Completion</p>
            <DrawingsCompletionForm id={id} clientName={item.order.clientName} />
          </div>
        ) : null}

        {canApproveSales ? (
          <div className="rounded-3xl border border-border/50 bg-white p-4 shadow-sm">
            <p className="mb-4 text-sm font-semibold">Sales Approval</p>
            <SalesApprovalForm id={id} />
          </div>
        ) : null}

        <div className="space-y-3">
          <p className="px-1 text-sm font-semibold">Attachments</p>
          {item.attachments.map((attachment) => (
            <a
              key={attachment.id}
              href={`/api/workflow/files/${attachment.id}`}
              className="flex items-center justify-between rounded-3xl border border-border/50 bg-white p-4 shadow-sm"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold">{attachment.originalFileName}</p>
                <p className="text-sm text-muted-foreground">{attachment.attachmentRole}</p>
              </div>
              <Download className="h-4 w-4 text-primary" />
            </a>
          ))}
        </div>
      </MobilePageShell>

      <div className="hidden min-h-screen lg:block">
        <main className="space-y-6 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-primary">{departmentLabels[item.order.currentDepartment]}</p>
              <h1 className="text-3xl font-semibold">{item.order.estimateNumber}</h1>
              <p className="mt-2 text-muted-foreground">{item.order.clientName}</p>
            </div>
            <div className="space-y-2 text-right">
              <Badge>{statusLabels[item.order.workflowStatus]}</Badge>
              <p className="text-sm text-muted-foreground">{stageLabels[item.order.currentStage]}</p>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <Card className="xl:col-span-2">
              <CardHeader>
                <CardTitle>Workflow Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Sales Order</p>
                    <p className="mt-1 font-medium">{item.order.salesOrderNumber ?? "Pending"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Product Code</p>
                    <p className="mt-1 font-medium">{item.order.productCode ?? "Pending"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Approval Date</p>
                    <p className="mt-1 font-medium">{formatDate(item.order.salesOrderApprovalAt)}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Requirements</p>
                  <p className="mt-2 text-sm text-muted-foreground">{item.order.technicalRequirements ?? "No requirements entered."}</p>
                </div>

                {canCompleteDrawings ? (
                  <div className="rounded-2xl border p-4">
                    <p className="mb-4 font-semibold">Complete Drawings Step</p>
                    <DrawingsCompletionForm id={id} clientName={item.order.clientName} />
                  </div>
                ) : null}

                {canApproveSales ? (
                  <div className="rounded-2xl border p-4">
                    <p className="mb-4 font-semibold">Submit Sales Approval</p>
                    <SalesApprovalForm id={id} />
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Attachments</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {item.attachments.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No attachments uploaded yet.</p>
                  ) : (
                    item.attachments.map((attachment) => (
                      <a
                        key={attachment.id}
                        href={`/api/workflow/files/${attachment.id}`}
                        className="flex items-center justify-between rounded-2xl border p-3 transition-colors hover:bg-muted/40"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium">{attachment.originalFileName}</p>
                          <p className="text-xs text-muted-foreground">{attachment.attachmentRole}</p>
                        </div>
                        <Download className="h-4 w-4 text-primary" />
                      </a>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {item.notifications.map((notification) => (
                    <Link
                      key={notification.id}
                      href={`/departments/notifications/${notification.id}`}
                      className="block rounded-2xl border p-3 transition-colors hover:bg-muted/40"
                    >
                      <p className="font-medium">{notification.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{notification.message}</p>
                    </Link>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Stage History</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {item.stages.map((stage) => (
                    <div key={stage.id} className="rounded-2xl border p-3">
                      <p className="font-medium">{stage.stageTitle}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{departmentLabels[stage.departmentCode]}</p>
                      <p className="mt-2 text-xs text-muted-foreground">{formatDate(stage.actedAt ?? stage.createdAt)}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
