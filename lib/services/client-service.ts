import { findClients } from "@/lib/repositories/client-repository"

export async function getClients(q = "") {
  const result = await findClients(q)

  return {
    items: result.data,
    meta:
      result.dataSource === "database"
        ? { dataSource: "database" as const }
        : {
            dataSource: "unavailable" as const,
            message:
              "Client data is currently unavailable. Confirm app_core.client and sales.sales_order are accessible.",
          },
  }
}
