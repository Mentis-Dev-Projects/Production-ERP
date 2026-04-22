import Link from "next/link"
import { notFound } from "next/navigation"
import { Download, MailOpen } from "lucide-react"
import { MobilePageShell } from "@/components/mobile/mobile-page-shell"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { departmentLabels } from "@/lib/workflow/constants"
import { getWorkflowNotification } from "@/lib/services/workflow-service"
import { formatDate } from "@/lib/utils/format"

type NotificationDetailPageProps = {
  params: Promise<{ id: string }>
}

export default async function NotificationDetailPage({ params }: NotificationDetailPageProps) {
  const { id } = await params
  const { item, detail } = await getWorkflowNotification(id)

  if (!item || !detail) {
    notFound()
  }

  const relatedAttachments = detail.attachments.filter((attachment) => !item.stageId || attachment.stageId === item.stageId)

  return (
    <>
      <MobilePageShell title={item.title} subtitle={`To ${departmentLabels[item.recipientDepartment]} | ${formatDate(item.createdAt)}`}>
        <div className="rounded-3xl border border-border/50 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-lg font-semibold">{item.title}</p>
              <p className="mt-2 text-sm text-muted-foreground">{item.message}</p>
            </div>
            <Badge>{departmentLabels[item.recipientDepartment]}</Badge>
          </div>
        </div>

        <div className="rounded-3xl border border-border/50 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold">Related Jobbing Order</p>
          <Link href={`/departments/jobbing-orders/${item.jobbingOrderId}`} className="mt-3 block rounded-2xl bg-muted/40 p-4">
            <p className="font-semibold">{detail.order.estimateNumber}</p>
            <p className="mt-1 text-sm text-muted-foreground">{detail.order.clientName}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Sales Order {detail.order.salesOrderNumber ?? "Pending"}
            </p>
          </Link>
        </div>

        <div className="space-y-3">
          <p className="px-1 text-sm font-semibold">Attachments</p>
          {relatedAttachments.length === 0 ? (
            <div className="rounded-3xl border border-border/50 bg-white p-5 text-sm text-muted-foreground shadow-sm">
              No files are attached directly to this notification.
            </div>
          ) : (
            relatedAttachments.map((attachment) => (
              <a
                key={attachment.id}
                href={`/api/workflow/files/${attachment.id}`}
                className="flex items-center justify-between rounded-3xl border border-border/50 bg-white p-4 shadow-sm"
              >
                <div>
                  <p className="font-semibold">{attachment.originalFileName}</p>
                  <p className="text-sm text-muted-foreground">{attachment.attachmentRole}</p>
                </div>
                <Download className="h-4 w-4 text-primary" />
              </a>
            ))
          )}
        </div>
      </MobilePageShell>

      <div className="hidden min-h-screen lg:block">
        <main className="space-y-6 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-primary">Notification</p>
              <h1 className="text-3xl font-semibold">{item.title}</h1>
              <p className="mt-2 text-muted-foreground">{item.message}</p>
            </div>
            <Badge>{departmentLabels[item.recipientDepartment]}</Badge>
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <Card className="xl:col-span-2">
              <CardHeader>
                <CardTitle>Email Style View</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-2xl border p-4">
                  <div className="flex items-center gap-3">
                    <MailOpen className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Sent to {departmentLabels[item.recipientDepartment]}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(item.createdAt)}</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border p-4">
                  <p className="font-medium">Related jobbing order</p>
                  <Link href={`/departments/jobbing-orders/${item.jobbingOrderId}`} className="mt-3 block rounded-2xl bg-muted/40 p-4">
                    <p className="font-semibold">{detail.order.estimateNumber}</p>
                    <p className="text-sm text-muted-foreground">{detail.order.clientName}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Sales Order {detail.order.salesOrderNumber ?? "Pending"}
                    </p>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Attachments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {relatedAttachments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No files are attached directly to this notification.</p>
                ) : (
                  relatedAttachments.map((attachment) => (
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
          </div>
        </main>
      </div>
    </>
  )
}
