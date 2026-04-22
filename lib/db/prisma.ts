import { PrismaClient } from "@prisma/client"

declare global {
  var __mentisPrisma: PrismaClient | undefined
}

export const prisma =
  globalThis.__mentisPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  })

if (process.env.NODE_ENV !== "production") {
  globalThis.__mentisPrisma = prisma
}
