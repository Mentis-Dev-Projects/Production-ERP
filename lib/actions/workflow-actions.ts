"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { approveSalesOrder, completeDrawingsStep, createSalesJobbingOrder } from "@/lib/services/workflow-service"

export async function createSalesJobbingOrderAction(formData: FormData) {
  const jobbingOrderId = await createSalesJobbingOrder(formData)
  revalidatePath("/departments/sales")
  revalidatePath("/departments/drawings")
  redirect(`/departments/jobbing-orders/${jobbingOrderId}`)
}

export async function completeDrawingsStepAction(jobbingOrderId: string, formData: FormData) {
  await completeDrawingsStep(jobbingOrderId, formData)
  revalidatePath("/departments/drawings")
  revalidatePath("/departments/sales")
  redirect(`/departments/jobbing-orders/${jobbingOrderId}`)
}

export async function approveSalesOrderAction(jobbingOrderId: string, formData: FormData) {
  await approveSalesOrder(jobbingOrderId, formData)
  revalidatePath("/departments/sales")
  revalidatePath("/departments/production")
  revalidatePath("/production-planning")
  redirect(`/departments/jobbing-orders/${jobbingOrderId}`)
}
