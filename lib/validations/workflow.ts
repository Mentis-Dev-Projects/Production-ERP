import { z } from "zod"
import { workflowDepartments, workflowStreams } from "@/lib/workflow/constants"

export const workflowDepartmentSchema = z.enum(workflowDepartments)
export const workflowStreamSchema = z.enum(workflowStreams)

export const createJobbingOrderSchema = z.object({
  estimateNumber: z.string().trim().min(1).max(100),
  estimateAcceptedAt: z.string().trim().optional().default(""),
  clientName: z.string().trim().min(1).max(200),
  streamName: workflowStreamSchema.default("Rectagrid"),
  technicalRequirements: z.string().trim().max(4000).optional().default(""),
  salesNotes: z.string().trim().max(4000).optional().default(""),
  createdByName: z.string().trim().max(120).optional().default("Sales Team"),
})

export const drawingsCompletionSchema = z.object({
  salesOrderNumber: z.string().trim().min(1).max(80),
  clientName: z.string().trim().min(1).max(200),
  productCode: z.string().trim().min(1).max(100),
  sqm: z.coerce.number().nonnegative(),
  qty: z.coerce.number().nonnegative(),
  drawingNotes: z.string().trim().max(4000).optional().default(""),
  actionByName: z.string().trim().max(120).optional().default("Drawings Team"),
})

export const salesApprovalSchema = z.object({
  approvalDate: z.string().trim().min(1),
  salesNotes: z.string().trim().max(4000).optional().default(""),
  actionByName: z.string().trim().max(120).optional().default("Sales Team"),
})
