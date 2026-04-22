import { z } from "zod"

const envSchema = z.object({
  DATABASE_URL: z.string().min(1).optional(),
  NEXT_PUBLIC_APP_NAME: z.string().default("Mentis Sales and Production Planning"),
  MENTIS_DEFAULT_STREAM: z.string().default("Rectagrid"),
})

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  MENTIS_DEFAULT_STREAM: process.env.MENTIS_DEFAULT_STREAM,
})

export function hasDatabaseUrl() {
  return Boolean(env.DATABASE_URL)
}
