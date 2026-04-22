import { Clock3, Layers3, Wrench } from "lucide-react"
import { MobilePageShell } from "@/components/mobile/mobile-page-shell"

export function MobileModulePlaceholder({
  title,
  description,
  plannedData,
}: {
  title: string
  description: string
  plannedData: string[]
}) {
  return (
    <MobilePageShell title={title} subtitle={description}>
      <div className="space-y-3">
        <div className="rounded-3xl border border-border/50 bg-white p-5 shadow-sm">
          <Layers3 className="mb-3 h-5 w-5 text-primary" />
          <p className="font-semibold">Foundation ready</p>
          <p className="mt-1 text-sm text-muted-foreground">This route is staged intentionally inside the mobile app.</p>
        </div>
        <div className="rounded-3xl border border-border/50 bg-white p-5 shadow-sm">
          <Wrench className="mb-3 h-5 w-5 text-primary" />
          <p className="font-semibold">Planned data cut-in</p>
          <p className="mt-1 text-sm text-muted-foreground">{plannedData.join(", ")}</p>
        </div>
        <div className="rounded-3xl border border-border/50 bg-white p-5 shadow-sm">
          <Clock3 className="mb-3 h-5 w-5 text-primary" />
          <p className="font-semibold">Current release</p>
          <p className="mt-1 text-sm text-muted-foreground">
            This module stays intentionally staged while Rectagrid and production planning are wired first.
          </p>
        </div>
      </div>
    </MobilePageShell>
  )
}
