import type { ReactNode } from "react"
import { ChevronRight } from "lucide-react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function MobileStatCard({
  label,
  value,
  helper,
  tone = "neutral",
}: {
  label: string
  value: string | number
  helper?: string
  tone?: "neutral" | "primary" | "warning" | "danger" | "success"
}) {
  const toneStyles = {
    neutral: "bg-white",
    primary: "bg-primary text-primary-foreground",
    warning: "bg-amber-50",
    danger: "bg-red-50",
    success: "bg-emerald-50",
  }

  return (
    <Card className={cn("overflow-hidden rounded-3xl border-0 shadow-sm", toneStyles[tone])}>
      <CardContent className="space-y-2 p-5">
        <p className={cn("text-xs font-medium uppercase tracking-[0.2em]", tone === "primary" ? "text-primary-foreground/75" : "text-muted-foreground")}>
          {label}
        </p>
        <p className="text-3xl font-semibold">{value}</p>
        {helper ? (
          <p className={cn("text-sm", tone === "primary" ? "text-primary-foreground/80" : "text-muted-foreground")}>{helper}</p>
        ) : null}
      </CardContent>
    </Card>
  )
}

export function MobileSection({
  title,
  action,
  children,
}: {
  title: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3 px-1">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

export function MobileListLink({
  href,
  title,
  subtitle,
  trailing,
}: {
  href: string
  title: string
  subtitle?: string
  trailing?: ReactNode
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-3 rounded-3xl border border-border/50 bg-white px-4 py-4 shadow-sm"
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">{title}</p>
        {subtitle ? <p className="mt-1 truncate text-xs text-muted-foreground">{subtitle}</p> : null}
      </div>
      <div className="flex items-center gap-2">
        {trailing}
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </Link>
  )
}
