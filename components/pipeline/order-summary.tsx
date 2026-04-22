import { Building2, Package, Calendar, Ruler, Hash, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { formatDate, formatSquareMetres, formatNumber } from "@/lib/utils/format"
import type { SalesOrderListItem } from "@/types/mentis"

interface OrderSummaryProps {
  order: SalesOrderListItem
}

export function OrderSummary({ order }: OrderSummaryProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl">{order.salesOrderNumber}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">{order.description ?? "No description available."}</p>
          </div>
          <StatusBadge status={order.status} className="px-3 py-1 text-sm" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Building2 className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">Client</span>
            </div>
            <p className="text-sm font-medium">{order.clientName}</p>
            <p className="text-xs text-muted-foreground">{order.clientCode ?? "No code"}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Package className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">Product</span>
            </div>
            <p className="text-sm font-medium">{order.productCode ?? "-"}</p>
            <p className="text-xs text-muted-foreground">{order.stream}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Ruler className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">SQM / Qty</span>
            </div>
            <p className="text-sm font-medium">{formatSquareMetres(order.sqm)}</p>
            <p className="text-xs text-muted-foreground">{formatNumber(order.qty)} units</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">Approval</span>
            </div>
            <p className="text-sm font-medium">{formatDate(order.approvalDate)}</p>
            <p className="text-xs text-muted-foreground">Issued: {formatDate(order.productionIssuedDate)}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">Due Date</span>
            </div>
            <p className="text-sm font-medium">{formatDate(order.dueDate)}</p>
            <p className="text-xs text-muted-foreground">Calculated: {formatDate(order.calculatedDueDate)}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Hash className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">Current Step</span>
            </div>
            <p className="text-sm font-semibold text-primary">{order.currentStep}</p>
            <p className="text-xs text-muted-foreground">Expected: {order.expectedStep ?? "n/a"}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <AlertCircle className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">Blocking Step</span>
            </div>
            <p className="text-sm font-medium">{order.blockingStep ?? "None"}</p>
            <p className="text-xs text-muted-foreground">X-Works: {formatDate(order.xWorksDate)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
