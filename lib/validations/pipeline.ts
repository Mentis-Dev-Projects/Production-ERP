import { z } from "zod"

export const pipelineLookupSchema = z.object({
  salesOrderNumber: z.string().trim().min(1).max(50),
})
