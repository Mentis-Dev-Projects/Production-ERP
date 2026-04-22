import { z } from "zod"

export const performanceQuickFilterSchema = z.enum([
  "all",
  "overdue",
  "due-this-week",
  "in-production",
  "completed",
  "late-jobs",
])

export const performanceDatePresetSchema = z.enum([
  "all",
  "today",
  "7d",
  "30d",
  "this-month",
])

export const performanceKpiViewSchema = z.enum([
  "none",
  "total-active-orders",
  "overdue-orders",
  "due-this-week",
  "completed-orders",
  "orders-at-risk",
])

export const performanceWorkOrderStatusSchema = z.enum([
  "all",
  "not-started",
  "in-production",
  "completed",
  "delayed",
  "cancelled",
  "unknown",
])

export const performanceDashboardQuerySchema = z.object({
  startDate: z.string().trim().optional().default(""),
  endDate: z.string().trim().optional().default(""),
  productionLine: z.string().trim().max(100).optional().default("all"),
  client: z.string().trim().max(200).optional().default("all"),
  department: z.string().trim().max(100).optional().default("all"),
  workOrderStatus: performanceWorkOrderStatusSchema.optional().default("all"),
  productCode: z.string().trim().max(100).optional().default(""),
  quickFilter: performanceQuickFilterSchema.optional().default("all"),
  datePreset: performanceDatePresetSchema.optional().default("all"),
  kpiView: performanceKpiViewSchema.optional().default("none"),
})
