import { NextRequest, NextResponse } from "next/server"
import {
  buildLineBreakdownFromViewRows,
  buildSummaryFromViewRows,
  getPerformanceDashboardViewSummary,
} from "@/lib/services/performance-dashboard-service"

export async function GET(_request: NextRequest) {
  const result = await getPerformanceDashboardViewSummary()

  return NextResponse.json({
    item: {
      summary: buildSummaryFromViewRows(result.item.kpis),
      lineBreakdown: buildLineBreakdownFromViewRows(result.item.byLine),
    },
    meta: result.meta,
  })
}
