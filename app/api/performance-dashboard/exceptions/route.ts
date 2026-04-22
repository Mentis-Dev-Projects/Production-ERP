import { NextRequest, NextResponse } from "next/server"
import { getPerformanceDashboardExceptions } from "@/lib/services/performance-dashboard-service"
import { performanceDashboardQuerySchema } from "@/lib/validations/performance-dashboard"

export async function GET(request: NextRequest) {
  const filters = performanceDashboardQuerySchema.parse({
    startDate: request.nextUrl.searchParams.get("startDate") ?? "",
    endDate: request.nextUrl.searchParams.get("endDate") ?? "",
    productionLine: request.nextUrl.searchParams.get("productionLine") ?? "all",
    client: request.nextUrl.searchParams.get("client") ?? "all",
    department: request.nextUrl.searchParams.get("department") ?? "all",
    workOrderStatus: request.nextUrl.searchParams.get("workOrderStatus") ?? "all",
    productCode: request.nextUrl.searchParams.get("productCode") ?? "",
    quickFilter: request.nextUrl.searchParams.get("quickFilter") ?? "all",
    datePreset: request.nextUrl.searchParams.get("datePreset") ?? "all",
    kpiView: request.nextUrl.searchParams.get("kpiView") ?? "none",
  })

  const result = await getPerformanceDashboardExceptions(filters)
  return NextResponse.json(result)
}
