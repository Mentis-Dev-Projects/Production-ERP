import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface MobilePageShellProps {
  title: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
}

export function MobilePageShell({ title, subtitle, actions, children, className }: MobilePageShellProps) {
  return (
    <div className={cn("min-h-screen bg-[linear-gradient(180deg,#fff7f3_0%,#ffffff_22%,#f7f8fa_100%)] lg:hidden", className)}>
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-4 pb-28 pt-[max(1rem,env(safe-area-inset-top))]">
        <header className="sticky top-0 z-20 -mx-4 border-b border-border/40 bg-background/85 px-4 pb-4 pt-1 backdrop-blur supports-[backdrop-filter]:bg-background/75">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">Mentis Mobile</p>
              <h1 className="text-2xl font-semibold leading-tight text-foreground">{title}</h1>
              {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
            </div>
            {actions ? <div className="shrink-0">{actions}</div> : null}
          </div>
        </header>

        <main className="flex-1 space-y-4 py-4">{children}</main>
      </div>
    </div>
  )
}
