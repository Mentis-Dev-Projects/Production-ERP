import { z } from "zod"

export const rectagridJobsQuerySchema = z.object({
  q: z.string().trim().max(100).optional().default(""),
  step: z.string().trim().max(100).optional().default("all"),
  status: z.string().trim().max(50).optional().default("all"),
  limit: z.coerce.number().int().positive().max(250).optional().default(100),
})
