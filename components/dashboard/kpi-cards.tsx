import Link from "next/link"
import { ShoppingCart, Clock, AlertTriangle, CalendarClock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { DashboardSummary } from "@/types/mentis"

interface KPICardsProps {
  summary: DashboardSummary
  className?: string
  selectedKpi?: "open-orders" | "orders-in-progress" | "late-orders" | "due-this-week" | null
}

export function KPICards({ summary, className, selectedKpi = null }: KPICardsProps) {
  const kpis = [
    {
      key: "open-orders" as const,
      title: "Open Orders",
      value: summary.openOrders,
      icon: ShoppingCart,
      hint: `${summary.currentWorkload} jobs currently in the active production jobbing flow`,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      key: "orders-in-progress" as const,
      title: "Orders In Progress",
      value: summary.ordersInProgress,
      icon: Clock,
      hint: "Current actual work in production",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      key: "late-orders" as const,
      title: "Late Orders",
      value: summary.lateOrders,
      icon: AlertTriangle,
      hint: "Orders behind their expected timeline",
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
    {
      key: "due-this-week" as const,
      title: "Due This Week",
      value: summary.dueThisWeek,
      icon: CalendarClock,
      hint: "Due in the next 7 days",
      color: "text-amber-600",
      bgColor: "bg-amber-100",
    },
  ]

  return (
    <div className={cn("grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4", className)}>
      {kpis.map((kpi) => (
        <Link key={kpi.title} href={`/?kpi=${kpi.key}`} className="block">
          <Card className={cn("transition-colors hover:border-primary/40", selectedKpi === kpi.key && "border-primary ring-1 ring-primary/20")}>
            <CardContent className="flex min-h-[180px] items-start pt-6">
              <div className="flex w-full items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                  <p className="mt-1 text-3xl font-bold">{kpi.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{kpi.hint}</p>
                </div>
                <div className={`${kpi.bgColor} rounded-lg p-3`}>
                  <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
