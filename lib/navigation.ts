import {
  BarChart3,
  BriefcaseBusiness,
  ClipboardList,
  Database,
  Gauge,
  FileImage,
  Grid3X3,
  Hammer,
  Home,
  Menu,
  Settings,
  ShoppingCart,
  Train,
  Users,
  Expand,
  Fence,
} from "lucide-react"

export const desktopMainNavItems = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Performance Overview", href: "/performance-dashboard", icon: Gauge },
  { name: "Production Overview", href: "/production-planning", icon: ClipboardList },
  { name: "Reporting", href: "/reports", icon: BarChart3 },
  { name: "Scheduling & Lead Time", href: "/sales-orders", icon: ShoppingCart },
] as const

export const productionStreams = [
  { name: "Rectagrid", href: "/rectagrid", icon: Grid3X3 },
  { name: "Handrailing", href: "/handrailing", icon: Fence },
  { name: "Mentex", href: "/expanded-metal", icon: Expand },
  { name: "Press Shop", href: "/press-shop", icon: Hammer },
  { name: "Mentrail", href: "/mentrail", icon: Train },
] as const

export const supportNavItems = [
  { name: "Drawings", href: "/drawings", icon: FileImage },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Data References", href: "/data-references", icon: Database },
  { name: "Settings", href: "/settings", icon: Settings },
] as const

export const departmentNavItems = [
  { name: "Sales", href: "/departments/sales", icon: BriefcaseBusiness },
  { name: "Drawings", href: "/departments/drawings", icon: FileImage },
  { name: "Production", href: "/departments/production", icon: ClipboardList },
] as const

export const mobileBottomNavItems = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Scheduling & Lead Time", href: "/sales-orders", icon: ShoppingCart },
  { name: "Production Overview", href: "/production-planning", icon: ClipboardList },
  { name: "More", href: "#more", icon: Menu },
] as const
