import { NextResponse } from "next/server"
import { getPipelineDetails } from "@/lib/services/pipeline-service"
import { pipelineLookupSchema } from "@/lib/validations/pipeline"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ salesOrderNumber: string }> },
) {
  const resolved = await params
  const { salesOrderNumber } = pipelineLookupSchema.parse(resolved)
  const result = await getPipelineDetails(salesOrderNumber)
  return NextResponse.json(result)
}
