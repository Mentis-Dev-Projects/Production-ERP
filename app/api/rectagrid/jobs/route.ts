import { NextRequest, NextResponse } from "next/server"
import { getRectagridJobs } from "@/lib/services/rectagrid-service"
import { rectagridJobsQuerySchema } from "@/lib/validations/rectagrid"

export async function GET(request: NextRequest) {
  const params = rectagridJobsQuerySchema.parse({
    q: request.nextUrl.searchParams.get("q") ?? "",
    step: request.nextUrl.searchParams.get("step") ?? "all",
    status: request.nextUrl.searchParams.get("status") ?? "all",
    limit: request.nextUrl.searchParams.get("limit") ?? "100",
  })

  const result = await getRectagridJobs(params)
  return NextResponse.json(result)
}
