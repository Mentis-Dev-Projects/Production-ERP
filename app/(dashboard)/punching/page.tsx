import { AppHeader } from "@/components/app-header"
import { MobileModulePlaceholder } from "@/components/mobile/mobile-module-placeholder"
import { ModulePlaceholder } from "@/components/module-placeholder"

export default function PunchingPage() {
  return (
    <>
      <MobileModulePlaceholder
        title="Punching"
        description="Punching remains available as a staged module entry point."
        plannedData={["punching queue", "machine capacity", "operator tracking"]}
      />
      <div className="hidden min-h-screen lg:block">
        <AppHeader title="Punching Production" />
        <main className="p-6">
          <ModulePlaceholder
            title="Punching module"
            description="Punching remains available in navigation and will later expand beyond the Rectagrid-first tracking view."
            plannedData={["punching queue", "machine capacity", "operator tracking"]}
          />
        </main>
      </div>
    </>
  )
}
