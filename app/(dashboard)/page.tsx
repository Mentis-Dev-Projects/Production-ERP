import { AppHeader } from "@/components/app-header"
import { DataAccessNotice } from "@/components/data-access-notice"
import { DashboardKpiDrilldown } from "@/components/dashboard/dashboard-kpi-drilldown"
import { KPICards } from "@/components/dashboard/kpi-cards"
import { ProductionOverview } from "@/components/dashboard/production-overview"
import { ProductionStatusDonut } from "@/components/dashboard/production-status-donut"
import { QuickLinksCard } from "@/components/dashboard/quick-links-card"
import { RecentOrders } from "@/components/dashboard/recent-orders"
import { WorkloadChart } from "@/components/dashboard/workload-chart"
import { MobileDashboard } from "@/components/mobile/mobile-dashboard"
import { getDashboardSummary } from "@/lib/services/dashboard-service"

type DashboardPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function getFirstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const rawSearchParams = await searchParams
  const selectedKpi = getFirstValue(rawSearchParams.kpi)
  const { item, meta } = await getDashboardSummary()

  const drilldownOrders =
    selectedKpi === "open-orders"
      ? item.openOrderList
      : selectedKpi === "orders-in-progress"
        ? item.ordersInProgressList
        : selectedKpi === "late-orders"
          ? item.lateOrderList
          : selectedKpi === "due-this-week"
            ? item.dueThisWeekList
            : []

  return (
    <>
      <MobileDashboard item={item} meta={meta} />

      <div className="hidden min-h-screen lg:block">
        <AppHeader title="Dashboard" />

        <main className="space-y-6 p-6">
          <DataAccessNotice meta={meta} />
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            <div className="xl:col-span-6">
              <KPICards
                summary={item}
                selectedKpi={
                  selectedKpi === "open-orders" ||
                  selectedKpi === "orders-in-progress" ||
                  selectedKpi === "late-orders" ||
                  selectedKpi === "due-this-week"
                    ? selectedKpi
                    : null
                }
                className="grid-cols-1 md:grid-cols-2 lg:grid-cols-2"
              />
            </div>
            <div className="xl:col-span-3">
              <ProductionStatusDonut statusItems={item.statusOverview} stepItems={item.pipelineByStep} />
            </div>
            <div className="xl:col-span-3">
              <QuickLinksCard />
            </div>
          </div>

          {selectedKpi === "open-orders" ||
          selectedKpi === "orders-in-progress" ||
          selectedKpi === "late-orders" ||
          selectedKpi === "due-this-week" ? (
            <DashboardKpiDrilldown selected={selectedKpi} orders={drilldownOrders} />
          ) : null}

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            <div className="space-y-6 xl:col-span-8">
              <RecentOrders orders={item.recentOrders} />
              <ProductionOverview items={item.streamOverview} />
            </div>
            <div className="xl:col-span-4">
              <WorkloadChart items={item.workCenters} />
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
