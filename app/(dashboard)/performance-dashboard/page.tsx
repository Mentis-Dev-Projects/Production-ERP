import { AppHeader } from "@/components/app-header"
import { PerformanceDashboardView } from "@/components/performance-dashboard/performance-dashboard-view"
import { getPerformanceDashboard } from "@/lib/services/performance-dashboard-service"
import { performanceDashboardQuerySchema } from "@/lib/validations/performance-dashboard"

function getFirstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function PerformanceDashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const rawSearchParams = await searchParams
  const filters = performanceDashboardQuerySchema.parse({
    startDate: getFirstValue(rawSearchParams.startDate) ?? "",
    endDate: getFirstValue(rawSearchParams.endDate) ?? "",
    productionLine: getFirstValue(rawSearchParams.productionLine) ?? "all",
    client: getFirstValue(rawSearchParams.client) ?? "all",
    department: getFirstValue(rawSearchParams.department) ?? "all",
    workOrderStatus: getFirstValue(rawSearchParams.workOrderStatus) ?? "all",
    productCode: getFirstValue(rawSearchParams.productCode) ?? "",
    quickFilter: getFirstValue(rawSearchParams.quickFilter) ?? "all",
    datePreset: getFirstValue(rawSearchParams.datePreset) ?? "all",
    kpiView: getFirstValue(rawSearchParams.kpiView) ?? "none",
  })

  const { item, meta } = await getPerformanceDashboard(filters)

  return (
    <div className="min-h-screen">
      <AppHeader title="Performance Dashboard" />
      <PerformanceDashboardView key={JSON.stringify(item.filters)} item={item} meta={meta} />
    </div>
  )
}
