"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { departmentNavItems, desktopMainNavItems, productionStreams, supportNavItems } from "@/lib/navigation"
import { reportingCategories } from "@/lib/reporting"

export function AppSidebar() {
  const pathname = usePathname()
  const [streamsOpen, setStreamsOpen] = useState(true)
  const [departmentsOpen, setDepartmentsOpen] = useState(true)
  const [reportingOpen, setReportingOpen] = useState(pathname.startsWith("/reports"))

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col bg-sidebar text-sidebar-foreground lg:flex">
      <div className="border-b border-sidebar-border p-4">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/images/mentis-logo.png"
            alt="Mentis Africa"
            width={180}
            height={45}
            priority
            className="w-auto brightness-0 invert"
          />
        </Link>
      </div>

      <nav className="scrollbar-hide flex-1 overflow-y-auto py-4">
        <div className="mb-6 px-3">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
            Main
          </p>
          <ul className="space-y-1">
            {desktopMainNavItems.map((item) => (
              <li key={item.name}>
                {item.href === "/reports" ? (
                  <Collapsible open={reportingOpen} onOpenChange={setReportingOpen}>
                    <CollapsibleTrigger
                      className={cn(
                        "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        pathname.startsWith("/reports")
                          ? "bg-sidebar-primary text-sidebar-primary-foreground"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      )}
                    >
                      <span className="flex items-center gap-3">
                        <item.icon className="h-4 w-4" />
                        {item.name}
                      </span>
                      <ChevronDown className={cn("h-4 w-4 transition-transform", reportingOpen && "rotate-180")} />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-1">
                      <ul className="space-y-1 pl-3">
                        {reportingCategories.map((category) => (
                          <li key={category.slug}>
                            <Link
                              href={category.href}
                              className={cn(
                                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                pathname === category.href
                                  ? "bg-sidebar-primary/80 text-sidebar-primary-foreground"
                                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                              )}
                            >
                              <category.icon className="h-4 w-4" />
                              {category.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </CollapsibleContent>
                  </Collapsible>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      pathname === item.href
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-6 px-3">
          <Collapsible open={departmentsOpen} onOpenChange={setDepartmentsOpen}>
            <CollapsibleTrigger className="mb-2 flex w-full items-center justify-between px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50 hover:text-sidebar-foreground/70">
              Departments
              <ChevronDown className={cn("h-3 w-3 transition-transform", departmentsOpen && "rotate-180")} />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <ul className="space-y-1">
                {departmentNavItems.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        pathname === item.href
                          ? "bg-sidebar-primary text-sidebar-primary-foreground"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </CollapsibleContent>
          </Collapsible>
        </div>

        <div className="mb-6 px-3">
          <Collapsible open={streamsOpen} onOpenChange={setStreamsOpen}>
            <CollapsibleTrigger className="mb-2 flex w-full items-center justify-between px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50 hover:text-sidebar-foreground/70">
              Production Streams
              <ChevronDown className={cn("h-3 w-3 transition-transform", streamsOpen && "rotate-180")} />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <ul className="space-y-1">
                {productionStreams.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        pathname === item.href
                          ? "bg-sidebar-primary text-sidebar-primary-foreground"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </CollapsibleContent>
          </Collapsible>
        </div>

        <div className="px-3">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
            Support
          </p>
          <ul className="space-y-1">
            {supportNavItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <p className="text-center text-xs text-sidebar-foreground/50">Mentis Africa 2026</p>
      </div>
    </aside>
  )
}
