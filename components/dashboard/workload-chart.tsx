import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface WorkloadChartProps {
  items: Array<{ department: string; jobs: number; capacity: number }>
}

export function WorkloadChart({ items }: WorkloadChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Current Workload by Department</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            No work centre capacity data available yet.
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => {
              const utilization = item.capacity > 0 ? Math.round((item.jobs / item.capacity) * 100) : 0
              const isHigh = utilization > 80

              return (
                <div key={item.department} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.department}</span>
                    <span className={isHigh ? "font-medium text-amber-600" : "text-muted-foreground"}>
                      {item.jobs}/{item.capacity} ({utilization}%)
                    </span>
                  </div>
                  <Progress value={utilization} className={`h-2 ${isHigh ? "[&>div]:bg-amber-500" : ""}`} />
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
