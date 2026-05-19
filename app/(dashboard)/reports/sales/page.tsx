import { Filter, RefreshCcw } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { DataAccessNotice } from "@/components/data-access-notice"
import { MobilePageShell } from "@/components/mobile/mobile-page-shell"
import { SalesReportingDashboard } from "@/components/reports/sales/sales-reporting-dashboard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getSalesOrders } from "@/lib/services/sales-order-service"
import { applySalesReportFilters, buildClientTotals, buildStatusRows, buildStreamRows, parseSalesReportFilters } from "./sales-report-utils"

type SalesReportsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const datePresets = [
  { value: "all", label: "All dates" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "this-month", label: "This month" },
]

export default async function SalesReportsPage({ searchParams }: SalesReportsPageProps) {
  const rawParams = await searchParams
  const filters = parseSalesReportFilters(rawParams)
  const { items: allItems, meta } = await getSalesOrders({
    q: "",
    salesOrderNumber: "",
    client: "",
    status: "all",
    stream: "all",
    sortBy: "dueDate",
    sortDirection: "desc",
    limit: 5000,
  })
  const items = applySalesReportFilters(allItems, filters)
  const clientTotals = buildClientTotals(items)
  const statusRows = buildStatusRows(items)
  const streamRows = buildStreamRows(items)
  const streams = Array.from(new Set(allItems.map((item) => item.stream))).sort()
  const clients = Array.from(new Set(allItems.map((item) => item.clientName))).sort()

  const renderFilters = (idSuffix: string) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Filter className="h-5 w-5 text-primary" />
          Sales Report Filters
        </CardTitle>
        <CardDescription>Filter sales reporting by date basis, range, stream, status, and client.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action="/reports/sales" className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          <label className="space-y-2">
            <span className="text-sm font-medium">Date Basis</span>
            <select name="dateField" defaultValue={filters.dateField} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
              <option value="dueDate">Due date</option>
              <option value="approvalDate">Approval date</option>
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium">Range</span>
            <select name="datePreset" defaultValue={filters.datePreset} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
              {datePresets.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium">Stream</span>
            <select name="stream" defaultValue={filters.stream} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
              <option value="all">All streams</option>
              {streams.map((stream) => (
                <option key={stream} value={stream}>
                  {stream}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium">Status</span>
            <select name="status" defaultValue={filters.status} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
              <option value="all">All statuses</option>
              <option value="not-started">Not Started</option>
              <option value="in-progress">In Progress</option>
              <option value="complete">Complete</option>
              <option value="late">Late</option>
              <option value="pending">Pending</option>
              <option value="blocked">Blocked</option>
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium">Client</span>
            <input
              name="client"
              list={`sales-report-clients-${idSuffix}`}
              defaultValue={filters.client === "all" ? "" : filters.client}
              placeholder="All clients"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            />
            <datalist id={`sales-report-clients-${idSuffix}`}>
              {clients.map((client) => (
                <option key={client} value={client} />
              ))}
            </datalist>
          </label>

          <div className="flex gap-2 md:col-span-2 xl:col-span-5">
            <Button type="submit">Apply filters</Button>
            <Button asChild type="button" variant="outline">
              <a href="/reports/sales">
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
      <MobilePageShell title="Sales Reporting" subtitle="Client order total reporting and sales order volume views.">
        <DataAccessNotice meta={meta} />
        {renderFilters("mobile")}
        <SalesReportingDashboard items={items} clientTotals={clientTotals} statusRows={statusRows} streamRows={streamRows} />
      </MobilePageShell>

      <div className="hidden min-h-screen lg:block">
        <AppHeader title="Sales Reporting" />
        <main className="space-y-6 p-6">
          <DataAccessNotice meta={meta} />
          {renderFilters("desktop")}
          <SalesReportingDashboard items={items} clientTotals={clientTotals} statusRows={statusRows} streamRows={streamRows} />
        </main>
      </div>
    </>
  )
}
