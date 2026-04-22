import { Activity, BarChart3, Factory, FileClock, PackageSearch, ShieldAlert, TimerReset } from "lucide-react"

export const reportingCategories = [
  {
    name: "MES",
    slug: "mes",
    href: "/reports/mes",
    description: "Manufacturing execution and live production reporting for operations, planners, and management.",
    icon: Factory,
  },
] as const

export const mesReports = [
  {
    title: "Production Line Efficiency",
    description: "Filter-ready MES report shell for production stream and reporting range efficiency analysis.",
    icon: Activity,
    status: "Available",
    href: "/reports/mes/production-line-efficiency",
  },
  {
    title: "Output Efficiency",
    description: "Filter-ready MES report shell for line-based output efficiency and downtime style analysis.",
    icon: TimerReset,
    status: "Available",
    href: "/reports/mes/output-efficiency",
  },
  {
    title: "Lead Time Variance",
    description: "Compare planned versus actual flow time to pinpoint delay drivers in production.",
    icon: FileClock,
    status: "Queued",
    href: "",
  },
  {
    title: "Production Throughput",
    description: "Review completions, starts, and output movement over the selected reporting horizon.",
    icon: BarChart3,
    status: "Queued",
    href: "",
  },
  {
    title: "Order Traceability",
    description: "Follow MES order history from release through the latest recorded production event.",
    icon: PackageSearch,
    status: "Queued",
    href: "",
  },
] as const
