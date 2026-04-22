import { AppHeader } from "@/components/app-header"
import { MobileModulePlaceholder } from "@/components/mobile/mobile-module-placeholder"
import { ModulePlaceholder } from "@/components/module-placeholder"

export default function MentrailPage() {
  return (
    <>
      <MobileModulePlaceholder
        title="Mentrail"
        description="Mentrail stays as a clean future stream entry point."
        plannedData={["mentrail jobs", "production statuses", "delivery tracking"]}
      />
      <div className="hidden min-h-screen lg:block">
        <AppHeader title="Mentrail Production" />
        <main className="p-6">
          <ModulePlaceholder
            title="Mentrail module"
            description="Mentrail is kept as a clean future module entry point while the initial backend focus stays on Rectagrid."
            plannedData={["mentrail jobs", "pipeline statuses", "delivery tracking"]}
          />
        </main>
      </div>
    </>
  )
}
