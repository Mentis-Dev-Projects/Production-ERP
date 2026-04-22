import Link from "next/link"
import { AppHeader } from "@/components/app-header"
import { DataAccessNotice } from "@/components/data-access-notice"
import { SalesOrderFilters } from "@/components/sales-orders/sales-order-filters"
import { StatusBadge } from "@/components/status-badge"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MobileSalesOrders } from "@/components/mobile/mobile-sales-orders"
import { formatDate } from "@/lib/utils/format"
import { getSalesOrders } from "@/lib/services/sales-order-service"
import { salesOrdersQuerySchema } from "@/lib/validations/sales-orders"

type SalesOrdersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function SalesOrdersPage({ searchParams }: SalesOrdersPageProps) {
  const rawParams = await searchParams
  const params = salesOrdersQuerySchema.parse({
    q: typeof rawParams.q === "string" ? rawParams.q : "",
    status: typeof rawParams.status === "string" ? rawParams.status : "all",
    stream: typeof rawParams.stream === "string" ? rawParams.stream : "all",
    sortBy: "dueDate",
    sortDirection: "desc",
  })

  const { items, meta } = await getSalesOrders({ ...params, limit: 5000 })
  const streams = Array.from(new Set(items.map((item) => item.stream))).sort()
  const searchSummary = params.q ? `Client / sales order: ${params.q}` : "All live sales orders"
  const sortSummary = "Latest due date first"

  return (
    <>
      <MobileSalesOrders items={items} meta={meta} searchSummary={searchSummary} sortSummary={sortSummary} />

      <div className="hidden min-h-screen lg:block">
        <AppHeader title="Sales Orders" />
        <main className="space-y-6 p-6">
          <DataAccessNotice meta={meta} />
          <SalesOrderFilters streams={streams} />

          <Card>
            <CardContent className="pt-6">
              <Table className="min-w-[1360px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[180px]">Order #</TableHead>
                    <TableHead className="min-w-[260px]">Client</TableHead>
                    <TableHead className="min-w-[180px]">Product Code</TableHead>
                    <TableHead className="min-w-[280px]">Description</TableHead>
                    <TableHead className="min-w-[120px]">Approval Date</TableHead>
                    <TableHead className="min-w-[120px]">Due Date</TableHead>
                    <TableHead className="min-w-[150px]">Current Step</TableHead>
                    <TableHead className="min-w-[110px]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((order) => (
                    <TableRow key={order.id} className="hover:bg-muted/50">
                      <TableCell className="min-w-[180px]">
                        <Link href={`/pipeline?order=${order.salesOrderNumber}`} className="font-medium text-primary hover:underline">
                          {order.salesOrderNumber}
                        </Link>
                      </TableCell>
                      <TableCell className="min-w-[260px] font-medium whitespace-normal break-words" title={order.clientName}>
                        {order.clientName}
                      </TableCell>
                      <TableCell className="min-w-[180px] text-muted-foreground">{order.productCode ?? "-"}</TableCell>
                      <TableCell className="min-w-[280px] max-w-[320px] whitespace-normal break-words leading-5 text-muted-foreground" title={order.description ?? "-"}>
                        {order.description ?? "-"}
                      </TableCell>
                      <TableCell className="min-w-[120px]">{formatDate(order.approvalDate)}</TableCell>
                      <TableCell className={order.status === "late" ? "min-w-[120px] font-medium text-red-600" : "min-w-[120px]"}>
                        {formatDate(order.dueDate)}
                      </TableCell>
                      <TableCell className="min-w-[150px] whitespace-normal break-words" title={order.currentStep}>
                        {order.currentStep}
                      </TableCell>
                      <TableCell className="min-w-[110px]">
                        <StatusBadge status={order.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {items.length === 0 && (
                <div className="py-12 text-center text-muted-foreground">No orders found matching your filters.</div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  )
}
