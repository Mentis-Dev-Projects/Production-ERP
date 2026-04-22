import { NextRequest, NextResponse } from "next/server"
import { getPerformanceDashboardFilters } from "@/lib/services/performance-dashboard-service"

export async function GET(_request: NextRequest) {
  const result = await getPerformanceDashboardFilters()
  return NextResponse.json(result)
}
