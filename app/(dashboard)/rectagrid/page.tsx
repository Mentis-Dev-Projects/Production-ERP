import Link from "next/link"
import { AlertTriangle, CheckCircle, ChevronRight, Clock, Package } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { DataAccessNotice } from "@/components/data-access-notice"
import { RectagridFilters } from "@/components/rectagrid/rectagrid-filters"
import { StatusBadge } from "@/components/status-badge"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MobileRectagrid } from "@/components/mobile/mobile-rectagrid"
import { formatDate, formatSquareMetres, formatNumber } from "@/lib/utils/format"
import { getRectagridJobs } from "@/lib/services/rectagrid-service"
import { rectagridJobsQuerySchema } from "@/lib/validations/rectagrid"

type RectagridPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function RectagridPage({ searchParams }: RectagridPageProps) {
  const rawParams = await searchParams
  const params = rectagridJobsQuerySchema.parse({
    q: typeof rawParams.q === "string" ? rawParams.q : "",
    step: typeof rawParams.step === "string" ? rawParams.step : "all",
    status: typeof rawParams.status === "string" ? rawParams.status : "all",
  })

  const { items, meta } = await getRectagridJobs({ ...params, limit: 100 })

  const inProgress = items.filter((item) => item.status === "in-progress").length
  const pending = items.filter((item) => item.status === "pending" || item.status === "not-started").length
  const late = items.filter((item) => item.status === "late").length
  const complete = items.filter((item) => item.status === "complete").length
  const steps = Array.from(new Set(items.map((item) => item.currentStep))).sort()
  const stepCounts = steps.map((step) => ({
    step,
    count: items.filter((item) => item.currentStep === step).length,
  }))

  return (
    <>
      <MobileRectagrid items={items} meta={meta} inProgress={inProgress} pending={pending} late={late} complete={complete} />

      <div className="hidden min-h-screen lg:block">
        <AppHeader title="Rectagrid Production" />
        <main className="space-y-6 p-6">
          <DataAccessNotice meta={meta} />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {[
              { title: "In Progress", value: inProgress, icon: Clock, tone: "bg-blue-100 text-blue-600" },
              { title: "Pending", value: pending, icon: Package, tone: "bg-amber-100 text-amber-600" },
              { title: "Late", value: late, icon: AlertTriangle, tone: "bg-red-100 text-red-600" },
              { title: "Complete", value: complete, icon: CheckCircle, tone: "bg-emerald-100 text-emerald-600" },
            ].map((card) => (
              <Card key={card.title}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-lg p-2 ${card.tone.split(" ")[0]}`}>
                      <card.icon className={`h-5 w-5 ${card.tone.split(" ")[1]}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{card.value}</p>
                      <p className="text-sm text-muted-foreground">{card.title}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Production Steps</CardTitle>
            </CardHeader>
            <CardContent>
              {stepCounts.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">No Rectagrid jobs available.</div>
              ) : (
                <div className="flex items-center justify-between gap-2 overflow-x-auto">
                  {stepCounts.map((item, index) => (
                    <div key={item.step} className="flex items-center">
                      <div className="text-center">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold ${
                            item.count > 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {item.count}
                        </div>
                        <p className="mt-2 max-w-[96px] text-xs text-muted-foreground">{item.step}</p>
                      </div>
                      {index < stepCounts.length - 1 && <ChevronRight className="mx-2 h-5 w-5 text-muted-foreground" />}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <RectagridFilters steps={steps} />

          <Card>
            <CardHeader>
              <CardTitle>Rectagrid Production Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>SQM</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Current Step</TableHead>
                    <TableHead>Expected Step</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((order) => (
                    <TableRow key={order.jobId}>
                      <TableCell>
                        <Link href={`/pipeline?order=${order.salesOrderNumber}`} className="font-medium text-primary hover:underline">
                          {order.salesOrderNumber}
                        </Link>
                      </TableCell>
                      <TableCell className="font-medium">{order.clientName}</TableCell>
                      <TableCell className="text-muted-foreground">{order.productCode ?? "-"}</TableCell>
                      <TableCell>{formatSquareMetres(order.sqm)}</TableCell>
                      <TableCell>{formatNumber(order.qty)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{order.currentStep}</Badge>
                      </TableCell>
                      <TableCell>{order.expectedStep ?? "-"}</TableCell>
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
              {items.length === 0 && <div className="py-12 text-center text-muted-foreground">No Rectagrid jobs found.</div>}
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  )
}
