import Link from "next/link"
import { X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/status-badge"
import { formatDate } from "@/lib/utils/format"
import type { SalesOrderListItem } from "@/types/mentis"

type DashboardKpiView = "open-orders" | "orders-in-progress" | "late-orders" | "due-this-week"

const drilldownContent: Record<DashboardKpiView, { title: string; empty: string }> = {
  "open-orders": {
    title: "Open Orders",
    empty: "No open orders are currently available.",
  },
  "orders-in-progress": {
    title: "Orders In Progress",
    empty: "No in-progress orders are currently available.",
  },
  "late-orders": {
    title: "Late Orders",
    empty: "No late orders are currently flagged.",
  },
  "due-this-week": {
    title: "Due This Week",
    empty: "No orders are currently due in the next 7 days.",
  },
}

export function DashboardKpiDrilldown({
  selected,
  orders,
}: {
  selected: DashboardKpiView
  orders: SalesOrderListItem[]
}) {
  const content = drilldownContent[selected]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">{content.title}</CardTitle>
        <Link href="/" className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground">
          Clear
          <X className="h-4 w-4" />
        </Link>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">{content.empty}</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Current Step</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} className="hover:bg-muted/50">
                  <TableCell>
                    <Link href={`/pipeline?order=${order.salesOrderNumber}`} className="font-medium text-primary hover:underline">
                      {order.salesOrderNumber}
                    </Link>
                  </TableCell>
                  <TableCell>{order.clientName}</TableCell>
                  <TableCell className="text-muted-foreground">{order.productCode ?? "-"}</TableCell>
                  <TableCell className={order.status === "late" ? "font-medium text-red-600" : ""}>
                    {formatDate(order.dueDate)}
                  </TableCell>
                  <TableCell>{order.currentStep}</TableCell>
                  <TableCell>
                    <StatusBadge status={order.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
