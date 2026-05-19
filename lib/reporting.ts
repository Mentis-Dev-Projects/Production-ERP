import { Activity, BarChart3, ClipboardList, Factory, FileClock, PackageCheck, PackageSearch, ShieldAlert, ShoppingCart, TimerReset, TrendingUp, Users } from "lucide-react"

export const reportingCategories = [
  {
    name: "Production",
    slug: "production",
    href: "/reports/production",
    description: "Production reporting dashboard for throughput, delivery risk, workload, and operational exceptions.",
    icon: ClipboardList,
  },
  {
    name: "Sales",
    slug: "sales",
    href: "/reports/sales",
    description: "Sales order reporting for client order totals, stream mix, status mix, and scheduling visibility.",
    icon: ShoppingCart,
  },
  {
    name: "MES",
    slug: "mes",
    href: "/reports/mes",
    description: "Manufacturing execution and live production reporting for operations, planners, and management.",
    icon: Factory,
  },
] as const

export const salesReports = [
  {
    title: "Client Order Total",
    description: "Rank clients by order count with stream, status, and date filters.",
    icon: Users,
    status: "Available",
    href: "/reports/sales/client-order-total",
  },
  {
    title: "Sales Order Schedule",
    description: "Template for due-date based order schedules by client, stream, and status.",
    icon: FileClock,
    status: "Queued",
    href: "",
  },
  {
    title: "Client Stream Mix",
    description: "Template for comparing client demand across Rectagrid, Mentex, and other production streams.",
    icon: BarChart3,
    status: "Queued",
    href: "",
  },
] as const

export const productionReports = [
  {
    title: "Production Throughput",
    description: "Weekly created, completed, and overdue movement by selected production scope.",
    icon: TrendingUp,
    status: "Available",
    href: "/reports/production/throughput",
  },
  {
    title: "Delivery Risk Register",
    description: "Late orders, due-this-week exposure, and critical exception review by line and department.",
    icon: ShieldAlert,
    status: "Available",
    href: "/performance-dashboard?kpiView=orders-at-risk",
  },
  {
    title: "Line Workload Summary",
    description: "Compare active, completed, and overdue order load across production lines.",
    icon: BarChart3,
    status: "Available",
    href: "/reports/production",
  },
  {
    title: "Quantity Completion",
    description: "Track released versus completed quantity with efficiency reporting context.",
    icon: PackageCheck,
    status: "Queued",
    href: "",
  },
  {
    title: "Department Delay Analysis",
    description: "Template for department-level delay drivers, blockers, and late-stage ownership.",
    icon: FileClock,
    status: "Queued",
    href: "",
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
