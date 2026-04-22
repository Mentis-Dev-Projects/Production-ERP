import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface PipelineSnapshotProps {
  items: Array<{ step: string; count: number }>
}

export function PipelineSnapshot({ items }: PipelineSnapshotProps) {
  const maxCount = Math.max(...items.map((item) => item.count), 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Production Jobbing Snapshot</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">No active production jobbing data available.</div>
        ) : (
          <div className="flex h-40 items-end justify-between gap-2">
            {items.map((step) => {
              const heightPercent = maxCount > 0 ? (step.count / maxCount) * 100 : 0

              return (
                <div key={step.step} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{step.count}</span>
                  <div className="flex h-24 w-full flex-col justify-end">
                    <div
                      className="w-full rounded-t-md bg-primary/80 transition-all"
                      style={{ height: `${heightPercent}%`, minHeight: step.count > 0 ? "8px" : "0" }}
                    />
                  </div>
                  <span className="text-center text-xs leading-tight text-muted-foreground">{step.step}</span>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
