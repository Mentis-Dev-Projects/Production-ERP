import Link from "next/link"
import { ArrowRight, BarChart3, Boxes, Gauge, Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const links = [
  {
    title: "Performance Dashboard",
    description: "Executive production metrics and risk reporting.",
    href: "/performance-dashboard",
    icon: Gauge,
    disabled: false,
  },
  {
    title: "Reports",
    description: "Operational reporting and management drill-ins.",
    href: "/reports",
    icon: BarChart3,
    disabled: false,
  },
  {
    title: "Stock",
    description: "Inventory and stock visibility will be added here.",
    href: "#",
    icon: Boxes,
    disabled: true,
  },
]

export function QuickLinksCard() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Quick Links</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {links.map((link) => {
          const Icon = link.icon

          if (link.disabled) {
            return (
              <div key={link.title} className="flex items-center gap-3 rounded-xl border border-dashed p-3 opacity-75">
                <div className="rounded-lg bg-muted p-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{link.title}</p>
                  <p className="text-xs text-muted-foreground">{link.description}</p>
                </div>
              </div>
            )
          }

          return (
            <Link
              key={link.title}
              href={link.href}
              className="flex items-center gap-3 rounded-xl border p-3 transition-colors hover:border-primary/40 hover:bg-primary/5"
            >
              <div className="rounded-lg bg-primary/10 p-2">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{link.title}</p>
                <p className="text-xs text-muted-foreground">{link.description}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          )
        })}

        <div className={cn("flex items-center gap-3 rounded-xl border border-dashed p-3 text-muted-foreground")}>
          <div className="rounded-lg bg-muted p-2">
            <Plus className="h-4 w-4" />
          </div>
          <div>
            <p className="font-medium">More shortcuts coming</p>
            <p className="text-xs">Space reserved for the next reporting and operations modules.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
