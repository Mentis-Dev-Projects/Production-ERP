"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useMemo, useState } from "react"
import { ChevronRight, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { departmentNavItems, mobileBottomNavItems, productionStreams, supportNavItems } from "@/lib/navigation"

export function MobileBottomNav() {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = useState(false)

  const isMoreActive = useMemo(() => {
    const moreHrefs = [
      ...departmentNavItems.map((item) => item.href),
      ...productionStreams.map((item) => item.href),
      ...supportNavItems.map((item) => item.href),
    ]

    return moreHrefs.some((href) => pathname === href)
  }, [pathname])

  return (
    <>
      <div
        className={cn(
          "fixed inset-x-0 bottom-[76px] z-50 mx-auto w-full max-w-md px-3 transition-all duration-200 lg:hidden",
          moreOpen ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
        )}
      >
        <div className="max-h-[65vh] overflow-hidden rounded-[28px] border border-border/70 bg-background shadow-2xl">
          <div className="flex items-center justify-between border-b border-border/50 px-5 pb-3 pt-4">
            <div>
              <p className="text-lg font-semibold">More</p>
              <p className="text-sm text-muted-foreground">Open the rest of the Mentis modules.</p>
            </div>
            <button
              type="button"
              onClick={() => setMoreOpen(false)}
              className="rounded-full border border-border/60 p-2 text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="scrollbar-hide max-h-[calc(65vh-72px)] space-y-6 overflow-y-auto px-5 py-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Departments</p>
              <div className="space-y-2">
                {departmentNavItems.map((entry) => (
                  <Link
                    key={entry.name}
                    href={entry.href}
                    onClick={() => setMoreOpen(false)}
                    className="flex items-center justify-between rounded-2xl border border-border/60 bg-card px-4 py-4"
                  >
                    <div className="flex items-center gap-3">
                      <entry.icon className="h-5 w-5 text-primary" />
                      <span className="font-medium">{entry.name}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Production Streams</p>
              <div className="space-y-2">
                {productionStreams.map((entry) => (
                  <Link
                    key={entry.name}
                    href={entry.href}
                    onClick={() => setMoreOpen(false)}
                    className="flex items-center justify-between rounded-2xl border border-border/60 bg-card px-4 py-4"
                  >
                    <div className="flex items-center gap-3">
                      <entry.icon className="h-5 w-5 text-primary" />
                      <span className="font-medium">{entry.name}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Support</p>
              <div className="space-y-2">
                {supportNavItems.map((entry) => (
                  <Link
                    key={entry.name}
                    href={entry.href}
                    onClick={() => setMoreOpen(false)}
                    className="flex items-center justify-between rounded-2xl border border-border/60 bg-card px-4 py-4"
                  >
                    <div className="flex items-center gap-3">
                      <entry.icon className="h-5 w-5 text-primary" />
                      <span className="font-medium">{entry.name}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-4 gap-1 px-3 py-2">
          {mobileBottomNavItems.map((item) => {
            if (item.name === "More") {
              const Icon = item.icon
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setMoreOpen(true)}
                  className={cn(
                    "flex min-h-[60px] flex-col items-center justify-center rounded-2xl text-[11px] font-medium transition-colors",
                    isMoreActive || moreOpen
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                  )}
                >
                  <Icon className="mb-1 h-5 w-5" />
                  {item.name}
                </button>
              )
            }

            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex min-h-[60px] flex-col items-center justify-center rounded-2xl text-[11px] font-medium transition-colors",
                  isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                )}
              >
                <Icon className="mb-1 h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}
