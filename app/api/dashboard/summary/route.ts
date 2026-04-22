import { NextResponse } from "next/server"
import { dashboardSummaryQuerySchema } from "@/lib/validations/dashboard"
import { getDashboardSummary } from "@/lib/services/dashboard-service"

export async function GET() {
  dashboardSummaryQuerySchema.parse({})
  const result = await getDashboardSummary()
  return NextResponse.json(result)
}
