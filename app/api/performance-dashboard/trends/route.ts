import { NextRequest, NextResponse } from "next/server"
import {
  buildClientBreakdownFromViewRows,
  buildDepartmentBreakdownFromViewRows,
  buildTrendDataFromViewRows,
  getPerformanceDashboardViewTrends,
} from "@/lib/services/performance-dashboard-service"

export async function GET(_request: NextRequest) {
  const result = await getPerformanceDashboardViewTrends()

  return NextResponse.json({
    item: {
      trends: buildTrendDataFromViewRows(result.item.weeklyTrend),
      clients: buildClientBreakdownFromViewRows(result.item.byClient),
      departments: buildDepartmentBreakdownFromViewRows(result.item.byDepartment),
    },
    meta: result.meta,
  })
}
