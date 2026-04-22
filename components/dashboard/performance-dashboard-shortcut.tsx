import Link from "next/link"
import { ArrowRight, Gauge } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function PerformanceDashboardShortcut() {
  return (
    <Card className="border-primary/20 bg-[linear-gradient(135deg,rgba(232,113,58,0.1),rgba(248,250,252,1))]">
      <CardHeader>
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-primary/10 p-3 text-primary">
            <Gauge className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-lg">Performance Dashboard</CardTitle>
            <CardDescription>
              Executive production reporting for throughput, late exposure, status mix, and operational exceptions.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Button asChild className="w-full">
          <Link href="/performance-dashboard">
            Open dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
