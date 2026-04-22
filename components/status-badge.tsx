import { cn } from "@/lib/utils"
import type { OrderStatus } from "@/types/mentis"

interface StatusBadgeProps {
  status: OrderStatus
  className?: string
}

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  "not-started": {
    label: "Not Started",
    className: "bg-muted text-muted-foreground",
  },
  "in-progress": {
    label: "In Progress",
    className: "bg-blue-100 text-blue-700",
  },
  complete: {
    label: "Complete",
    className: "bg-emerald-100 text-emerald-700",
  },
  late: {
    label: "Late",
    className: "bg-red-100 text-red-700",
  },
  "on-time": {
    label: "On Time",
    className: "bg-emerald-100 text-emerald-700",
  },
  early: {
    label: "Early",
    className: "bg-sky-100 text-sky-700",
  },
  pending: {
    label: "Pending",
    className: "bg-amber-100 text-amber-700",
  },
  blocked: {
    label: "Blocked",
    className: "bg-orange-100 text-orange-700",
  },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}
