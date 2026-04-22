import { AppHeader } from "@/components/app-header"
import { MobileModulePlaceholder } from "@/components/mobile/mobile-module-placeholder"
import { ModulePlaceholder } from "@/components/module-placeholder"

export default function HandrailingPage() {
  return (
    <>
      <MobileModulePlaceholder
        title="Handrailing"
        description="Reserved for the next production stream after Rectagrid."
        plannedData={["handrailing jobs", "step tracking", "capacity views"]}
      />
      <div className="hidden min-h-screen lg:block">
        <AppHeader title="Handrailing Production" />
        <main className="p-6">
          <ModulePlaceholder
            title="Handrailing module"
            description="Reserved for the next production stream after Rectagrid. The route, layout, and navigation are production-ready."
            plannedData={["handrailing jobs", "step tracking", "capacity views"]}
          />
        </main>
      </div>
    </>
  )
}
