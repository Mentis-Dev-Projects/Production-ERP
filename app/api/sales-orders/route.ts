import { NextRequest, NextResponse } from "next/server"
import { getSalesOrders } from "@/lib/services/sales-order-service"
import { salesOrdersQuerySchema } from "@/lib/validations/sales-orders"

export async function GET(request: NextRequest) {
  const params = salesOrdersQuerySchema.parse({
    q: request.nextUrl.searchParams.get("q") ?? "",
    status: request.nextUrl.searchParams.get("status") ?? "all",
    stream: request.nextUrl.searchParams.get("stream") ?? "all",
    sortBy: request.nextUrl.searchParams.get("sortBy") ?? "dueDate",
    sortDirection: request.nextUrl.searchParams.get("sortDirection") ?? "desc",
    limit: request.nextUrl.searchParams.get("limit") ?? "100",
  })

  const result = await getSalesOrders(params)
  return NextResponse.json(result)
}
