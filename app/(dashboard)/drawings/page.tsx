import { AppHeader } from "@/components/app-header"
import { MobileModulePlaceholder } from "@/components/mobile/mobile-module-placeholder"
import { ModulePlaceholder } from "@/components/module-placeholder"

export default function DrawingsPage() {
  return (
    <>
      <MobileModulePlaceholder
        title="Drawings"
        description="The drawings module remains staged while the first production release focuses on Rectagrid."
        plannedData={["drawing queue", "attachment metadata", "approval milestones"]}
      />
      <div className="hidden min-h-screen lg:block">
        <AppHeader title="Drawings" />
        <main className="p-6">
          <ModulePlaceholder
            title="Drawings workflow foundation"
            description="The drawings module remains intentionally staged while the first production release focuses on the live Rectagrid production jobbing flow."
            plannedData={["drawing queue", "attachment metadata", "approval milestones"]}
          />
        </main>
      </div>
    </>
  )
}
