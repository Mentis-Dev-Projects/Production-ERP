export const appProductionStreams = ["Rectagrid", "Mentex", "Handrailing", "Mentrail", "Press Shop"] as const

export type AppProductionStream = (typeof appProductionStreams)[number]

export function mapDbStreamNameToApp(streamName: string | null | undefined) {
  if (!streamName) return "Rectagrid"

  const normalized = streamName.trim().toLowerCase()

  if (
    normalized === "expanded metal" ||
    normalized === "expanded-metal" ||
    normalized === "expanded_metal" ||
    normalized === "mentex"
  ) {
    return "Mentex"
  }

  return streamName
}

export function mapAppStreamNameToDb(streamName: string) {
  return streamName.trim().toLowerCase() === "mentex" ? "Expanded Metal" : streamName
}
