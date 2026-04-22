import { AlertTriangle, DatabaseZap } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { DataAccessMeta } from "@/types/mentis"

interface DataAccessNoticeProps {
  meta: DataAccessMeta
}

export function DataAccessNotice({ meta }: DataAccessNoticeProps) {
  if (meta.dataSource === "database") {
    return (
      <Alert className="border-emerald-200 bg-emerald-50 text-emerald-950">
        <DatabaseZap className="h-4 w-4" />
        <AlertTitle>Connected to PostgreSQL</AlertTitle>
        <AlertDescription>The current page is reading live Mentis data.</AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert className="border-amber-200 bg-amber-50 text-amber-950">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Database connection required</AlertTitle>
      <AlertDescription>{meta.message}</AlertDescription>
    </Alert>
  )
}
