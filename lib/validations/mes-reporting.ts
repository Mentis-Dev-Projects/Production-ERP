import { z } from "zod"

export const mesProductionStreamSchema = z.enum([
  "rectagrid",
  "expanded-metal",
  "handrailing",
  "mentrail",
  "press-shop",
])

export const mesRangeSchema = z.enum([
  "current",
  "previous-day",
  "previous-week",
  "previous-month",
  "custom",
])

export const mesProductionLineEfficiencyQuerySchema = z.object({
  stream: mesProductionStreamSchema.optional().default("rectagrid"),
  range: mesRangeSchema.optional().default("current"),
  startDate: z.string().trim().optional().default(""),
  endDate: z.string().trim().optional().default(""),
})

export type MesProductionLineEfficiencyFilters = z.infer<typeof mesProductionLineEfficiencyQuerySchema>

export const mesLineSchema = z.enum([
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "13",
])

export const mesOutputEfficiencyQuerySchema = z.object({
  stream: mesProductionStreamSchema.optional().default("rectagrid"),
  range: mesRangeSchema.optional().default("current"),
  line: mesLineSchema.optional().default("1"),
  startDate: z.string().trim().optional().default(""),
  endDate: z.string().trim().optional().default(""),
})

export type MesOutputEfficiencyFilters = z.infer<typeof mesOutputEfficiencyQuerySchema>
