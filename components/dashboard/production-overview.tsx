import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { DashboardSummary } from "@/types/mentis"

interface ProductionOverviewProps {
  items: DashboardSummary["streamOverview"]
}

export function ProductionOverview({ items }: ProductionOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Production Overview by Stream</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">No production streams available.</div>
        ) : (
          <div className="space-y-4">
            {items.map((stream) => {
              const total = stream.count || 1
              const progressPercent = Math.round((stream.complete / total) * 100)

              return (
                <div key={stream.stream} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{stream.stream}</span>
                    <span className="text-muted-foreground">{stream.count} orders</span>
                  </div>
                  <Progress value={progressPercent} className="h-2" />
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-blue-500" />
                      In Progress: {stream.inProgress}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      Pending: {stream.pending}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      Complete: {stream.complete}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
