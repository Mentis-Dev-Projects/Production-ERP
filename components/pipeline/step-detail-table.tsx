import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/status-badge"
import { formatDate } from "@/lib/utils/format"
import type { PipelineStage } from "@/types/mentis"

interface StepDetailTableProps {
  stages: PipelineStage[]
}

export function StepDetailTable({ stages }: StepDetailTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Production Jobbing Step Detail</CardTitle>
      </CardHeader>
      <CardContent>
        {stages.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">No production jobbing steps were returned.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Step</TableHead>
                <TableHead>Planned Start</TableHead>
                <TableHead>Planned End</TableHead>
                <TableHead>Actual Start</TableHead>
                <TableHead>Actual End</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Timing</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stages.map((step) => (
                <TableRow key={`${step.stepNumber}-${step.stepCode}`} className={step.isCurrentActual ? "bg-primary/5" : ""}>
                  <TableCell className="font-medium">
                    {step.stepName}
                    {step.isCurrentActual && <span className="ml-2 text-xs font-semibold text-primary">(Current)</span>}
                    {step.isExpectedStep && <span className="ml-2 text-xs font-semibold text-amber-600">(Expected)</span>}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(step.plannedStartDate)}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(step.plannedEndDate)}</TableCell>
                  <TableCell>{formatDate(step.actualStartDate)}</TableCell>
                  <TableCell className={step.actualEndDate ? "font-medium text-emerald-600" : "text-muted-foreground"}>
                    {formatDate(step.actualEndDate)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={step.status} />
                  </TableCell>
                  <TableCell className="capitalize">{step.timingState.replace("-", " ")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
