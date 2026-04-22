import { NextResponse } from "next/server"
import { getSalesOrder } from "@/lib/services/sales-order-service"
import { salesOrderLookupSchema } from "@/lib/validations/sales-orders"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ salesOrderNumber: string }> },
) {
  const resolved = await params
  const { salesOrderNumber } = salesOrderLookupSchema.parse(resolved)
  const result = await getSalesOrder(salesOrderNumber)
  return NextResponse.json(result)
}
