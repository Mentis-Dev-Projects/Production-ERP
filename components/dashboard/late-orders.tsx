import Link from "next/link"
import { AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { differenceInDaysFromToday, formatDate } from "@/lib/utils/format"
import type { SalesOrderListItem } from "@/types/mentis"

interface LateOrdersProps {
  orders: SalesOrderListItem[]
}

export function LateOrders({ orders }: LateOrdersProps) {
  return (
    <Card className="border-red-200 bg-red-50/30">
      <CardHeader className="flex flex-row items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-red-600" />
        <CardTitle className="text-lg text-red-900">Late Orders</CardTitle>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <p className="text-sm text-muted-foreground">No late orders.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Current Step</TableHead>
                <TableHead>Days Late</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const daysUntil = differenceInDaysFromToday(order.dueDate)
                const daysLate = daysUntil === null ? null : Math.max(daysUntil * -1, 0)

                return (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Link href={`/pipeline?order=${order.salesOrderNumber}`} className="font-medium text-primary hover:underline">
                        {order.salesOrderNumber}
                      </Link>
                    </TableCell>
                    <TableCell>{order.clientName}</TableCell>
                    <TableCell className="font-medium text-red-700">{formatDate(order.dueDate)}</TableCell>
                    <TableCell>{order.currentStep}</TableCell>
                    <TableCell>
                      <span className="inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                        {daysLate && daysLate > 0 ? `${daysLate} days` : "Due now"}
                      </span>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
