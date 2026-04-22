import { AppHeader } from "@/components/app-header"
import { MobileModulePlaceholder } from "@/components/mobile/mobile-module-placeholder"
import { ModulePlaceholder } from "@/components/module-placeholder"

export default function PressShopPage() {
  return (
    <>
      <MobileModulePlaceholder
        title="Press Shop"
        description="This stream is staged cleanly for a later release."
        plannedData={["press shop orders", "work centre planning", "step statuses"]}
      />
      <div className="hidden min-h-screen lg:block">
        <AppHeader title="Press Shop Production" />
        <main className="p-6">
          <ModulePlaceholder
            title="Press Shop module"
            description="Press Shop is reserved as a future stream and now uses an intentional Mentis placeholder instead of generic template content."
            plannedData={["press shop orders", "work centre planning", "step statuses"]}
          />
        </main>
      </div>
    </>
  )
}
