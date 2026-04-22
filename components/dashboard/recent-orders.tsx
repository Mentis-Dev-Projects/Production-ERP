import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/status-badge"
import { formatDate } from "@/lib/utils/format"
import type { SalesOrderListItem } from "@/types/mentis"

interface RecentOrdersProps {
  orders: SalesOrderListItem[]
}

export function RecentOrders({ orders }: RecentOrdersProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Recent Sales Orders</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/sales-orders" className="flex items-center gap-1 text-primary">
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">No sales orders available yet.</div>
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
                  <TableCell>{formatDate(order.dueDate)}</TableCell>
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
