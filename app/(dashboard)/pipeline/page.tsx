import { FileSearch } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { DataAccessNotice } from "@/components/data-access-notice"
import { OrderSummary } from "@/components/pipeline/order-summary"
import { PipelineSearchForm } from "@/components/pipeline/pipeline-search-form"
import { PipelineTracker } from "@/components/pipeline/pipeline-tracker"
import { StepDetailTable } from "@/components/pipeline/step-detail-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MobileProductionJobbing } from "@/components/mobile/mobile-production-jobbing"
import { getPipelineDetails } from "@/lib/services/pipeline-service"
import { getSalesOrders } from "@/lib/services/sales-order-service"
import { pipelineLookupSchema } from "@/lib/validations/pipeline"

type PipelinePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function PipelinePage({ searchParams }: PipelinePageProps) {
  const rawParams = await searchParams
  const orderParam = typeof rawParams.order === "string" ? rawParams.order : ""
  const lookupMeta = await getSalesOrders({ q: "", status: "all", stream: "all", limit: 1 })
  const pipeline =
    orderParam.trim().length > 0
      ? await getPipelineDetails(pipelineLookupSchema.parse({ salesOrderNumber: orderParam }).salesOrderNumber)
      : null

  return (
    <>
      <MobileProductionJobbing item={pipeline?.item ?? null} meta={pipeline?.meta ?? lookupMeta.meta} orderParam={orderParam} />

      <div className="hidden min-h-screen lg:block">
        <AppHeader title="Production Jobbing View" />
        <main className="space-y-6 p-6">
          <DataAccessNotice meta={pipeline?.meta ?? lookupMeta.meta} />

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Production Jobbing Lookup</CardTitle>
            </CardHeader>
            <CardContent>
              <PipelineSearchForm
                initialOrderNumber={orderParam}
                initialClientName={pipeline?.item?.order.clientName ?? ""}
              />
            </CardContent>
          </Card>

          {pipeline?.item ? (
            <>
              <OrderSummary order={pipeline.item.order} />
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{pipeline.item.order.stream} Production Jobbing Map</CardTitle>
                </CardHeader>
                <CardContent>
                  <PipelineTracker stages={pipeline.item.stages} />
                </CardContent>
              </Card>
              <StepDetailTable stages={pipeline.item.stages} />
            </>
          ) : (
            <Card className="py-16">
              <CardContent className="flex flex-col items-center justify-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <FileSearch className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">{orderParam ? "Sales order not found" : "No order selected"}</h3>
                <p className="mt-2 max-w-md text-muted-foreground">
                  {orderParam
                    ? "No production jobbing details were returned for that sales order number."
                    : "Search for a sales order or client above to compare planned dates with actual production progress."}
                </p>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </>
  )
}
