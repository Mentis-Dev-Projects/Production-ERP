import type { OrderStatus } from "@/types/mentis"

export function normalizeStatus(value: string | null | undefined): OrderStatus {
  switch ((value ?? "").toLowerCase()) {
    case "c":
    case "complete":
    case "completed":
    case "closed":
      return "complete"
    case "o":
    case "in-progress":
    case "in_progress":
    case "active":
    case "in progress":
      return "in-progress"
    case "n":
      return "not-started"
    case "nn":
    case "late":
    case "overdue":
      return value?.toLowerCase() === "late" || value?.toLowerCase() === "overdue" ? "late" : "pending"
    case "pending":
    case "open":
      return "pending"
    case "early":
      return "early"
    case "on-time":
    case "on_time":
    case "on time":
      return "on-time"
    case "cancelled":
    case "blocked":
      return "blocked"
    default:
      return "not-started"
  }
}
