import { z } from "zod"

export const salesOrderStatusSchema = z.enum([
  "all",
  "not-started",
  "in-progress",
  "complete",
  "late",
  "on-time",
  "early",
  "pending",
  "blocked",
])

export const salesOrderSortBySchema = z.enum(["dueDate", "approvalDate"])
export const salesOrderSortDirectionSchema = z.enum(["asc", "desc"])

export const salesOrdersQuerySchema = z.object({
  q: z.string().trim().max(100).optional().default(""),
  status: salesOrderStatusSchema.optional().default("all"),
  stream: z.string().trim().max(50).optional().default("all"),
  sortBy: salesOrderSortBySchema.optional().default("dueDate"),
  sortDirection: salesOrderSortDirectionSchema.optional().default("asc"),
  limit: z.coerce.number().int().positive().max(5000).optional().default(100),
})

export const salesOrderLookupSchema = z.object({
  salesOrderNumber: z.string().trim().min(1).max(50),
})
