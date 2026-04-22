"use client"

import { useEffect } from "react"
import { AlertTriangle } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen">
      <AppHeader title="Something went wrong" />
      <main className="p-6">
        <Card className="py-16">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <div className="mb-4 rounded-full bg-red-100 p-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-lg font-semibold">The page could not be loaded</h2>
            <p className="mt-2 max-w-lg text-sm text-muted-foreground">
              Refresh the request or confirm that the expected PostgreSQL objects are available.
            </p>
            <Button className="mt-6" onClick={reset}>
              Try again
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
