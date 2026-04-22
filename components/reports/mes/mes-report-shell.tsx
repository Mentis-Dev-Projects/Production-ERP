"use client"

import Link from "next/link"
import { useEffect, useState, type ReactNode } from "react"
import { ArrowLeft } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { MobilePageShell } from "@/components/mobile/mobile-page-shell"
import { Button } from "@/components/ui/button"

interface MesReportShellProps {
  title: string
  subtitle: string
  backHref: string
  backLabel: string
  children: ReactNode
}

export function MesReportShell({ title, subtitle, backHref, backLabel, children }: MesReportShellProps) {
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)")
    const sync = () => setIsDesktop(mediaQuery.matches)

    sync()
    mediaQuery.addEventListener("change", sync)
    return () => mediaQuery.removeEventListener("change", sync)
  }, [])

  if (isDesktop) {
    return (
      <div className="min-h-screen">
        <AppHeader title={title} />
        <main className="space-y-6 p-6">
          <Button asChild variant="outline" className="rounded-full">
            <Link href={backHref}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {backLabel}
            </Link>
          </Button>
          {children}
        </main>
      </div>
    )
  }

  return (
    <MobilePageShell title={title} subtitle={subtitle}>
      <div className="space-y-4">
        <Button asChild variant="outline" className="w-full justify-start rounded-2xl">
          <Link href={backHref}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {backLabel}
          </Link>
        </Button>
        {children}
      </div>
    </MobilePageShell>
  )
}
