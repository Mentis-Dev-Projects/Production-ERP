import { Filter, RefreshCcw } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { DataAccessNotice } from "@/components/data-access-notice"
import { MobilePageShell } from "@/components/mobile/mobile-page-shell"
import { ProductionReportingDashboard } from "@/components/reports/production/production-reporting-dashboard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getPerformanceDashboard } from "@/lib/services/performance-dashboard-service"
import { performanceDashboardQuerySchema } from "@/lib/validations/performance-dashboard"

type ProductionReportsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function getFirstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function ProductionReportsPage({ searchParams }: ProductionReportsPageProps) {
  const rawSearchParams = await searchParams
  const filters = performanceDashboardQuerySchema.parse({
    startDate: getFirstValue(rawSearchParams.startDate) ?? "",
    endDate: getFirstValue(rawSearchParams.endDate) ?? "",
    productionLine: getFirstValue(rawSearchParams.productionLine) ?? "all",
    client: getFirstValue(rawSearchParams.client) || "all",
    department: getFirstValue(rawSearchParams.department) || "all",
    workOrderStatus: getFirstValue(rawSearchParams.workOrderStatus) ?? "all",
    productCode: getFirstValue(rawSearchParams.productCode) ?? "",
    quickFilter: getFirstValue(rawSearchParams.quickFilter) ?? "all",
    datePreset: getFirstValue(rawSearchParams.datePreset) ?? "30d",
    kpiView: "none",
  })

  const { item, meta } = await getPerformanceDashboard(filters)

  const renderFilterPanel = (idSuffix: string) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Filter className="h-5 w-5 text-primary" />
          Production Report Filters
        </CardTitle>
        <CardDescription>Scope the production reporting dashboard by range, line, status, client, and department.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action="/reports/production" className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
          <label className="space-y-2">
            <span className="text-sm font-medium">Range</span>
            <select name="datePreset" defaultValue={item.filters.datePreset} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
              {item.options.datePresets.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium">Production Line</span>
            <select name="productionLine" defaultValue={item.filters.productionLine} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
              <option value="all">All production lines</option>
              {item.options.lines.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium">Status</span>
            <select name="workOrderStatus" defaultValue={item.filters.workOrderStatus} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
              {item.options.workOrderStatuses.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium">Quick View</span>
            <select name="quickFilter" defaultValue={item.filters.quickFilter} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
              {item.options.quickFilters.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium">Client</span>
            <input
              name="client"
              list={`production-report-clients-${idSuffix}`}
              defaultValue={item.filters.client === "all" ? "" : item.filters.client}
              placeholder="All clients"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            />
            <datalist id={`production-report-clients-${idSuffix}`}>
              {item.options.clients.map((option) => (
                <option key={option.value} value={option.value} />
              ))}
            </datalist>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium">Department</span>
            <input
              name="department"
              list={`production-report-departments-${idSuffix}`}
              defaultValue={item.filters.department === "all" ? "" : item.filters.department}
              placeholder="All departments"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            />
            <datalist id={`production-report-departments-${idSuffix}`}>
              {item.options.departments.map((option) => (
                <option key={option.value} value={option.value} />
              ))}
            </datalist>
          </label>

          <div className="flex gap-2 md:col-span-2 xl:col-span-6">
            <Button type="submit">Apply filters</Button>
            <Button asChild type="button" variant="outline">
              <a href="/reports/production">
                <RefreshCcw className="mr-2 h-4 w-4" />
                Reset
              </a>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )

  return (
    <>
      <MobilePageShell title="Production Reporting" subtitle="Production reporting dashboard for throughput, risk, and workload views.">
        <DataAccessNotice meta={meta} />
        {renderFilterPanel("mobile")}
        <ProductionReportingDashboard item={item} />
      </MobilePageShell>

      <div className="hidden min-h-screen lg:block">
        <AppHeader title="Production Reporting" />
        <main className="space-y-6 p-6">
          <DataAccessNotice meta={meta} />
          {renderFilterPanel("desktop")}
          <ProductionReportingDashboard item={item} />
        </main>
      </div>
    </>
  )
}
