"use client"

import { Check, Clock, AlertTriangle, Zap, Target } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDate } from "@/lib/utils/format"
import type { PipelineStage } from "@/types/mentis"

interface PipelineTrackerProps {
  stages: PipelineStage[]
}

export function PipelineTracker({ stages }: PipelineTrackerProps) {
  const getStepIcon = (step: PipelineStage) => {
    if (step.isComplete || step.status === "early") return <Check className="h-4 w-4" />
    if (step.status === "in-progress") return <Clock className="h-4 w-4" />
    if (step.status === "late" || step.timingState === "late") return <AlertTriangle className="h-4 w-4" />
    return null
  }

  const getStepColors = (step: PipelineStage) => {
    if (step.isComplete) return "border-emerald-500 bg-emerald-500 text-white"
    if (step.status === "early" || step.timingState === "early") return "border-sky-500 bg-sky-500 text-white"
    if (step.status === "in-progress") return "border-blue-500 bg-blue-500 text-white"
    if (step.status === "late" || step.timingState === "late") return "border-red-500 bg-red-500 text-white"
    return "border-border bg-muted text-muted-foreground"
  }

  if (stages.length === 0) {
    return <div className="py-12 text-center text-sm text-muted-foreground">No production jobbing stages were returned.</div>
  }

  return (
    <div className="space-y-6">
      <div className="relative z-20 flex flex-wrap items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          <span>Current Actual Step</span>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-amber-500" />
          <span>Expected Step</span>
        </div>
      </div>

      <div className="relative flex items-start justify-between gap-2 overflow-x-auto px-1 pb-4 pt-2">
        <div className="absolute left-10 right-10 top-7 h-0.5 bg-border" />
        {stages.map((step) => (
          <div key={`${step.stepNumber}-${step.stepCode}`} className="relative z-10 min-w-[120px] flex-1">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all",
                  getStepColors(step),
                )}
              >
                {getStepIcon(step)}
                {step.isCurrentActual && (
                  <span className="absolute -right-1 -top-1 rounded-full bg-card p-0.5 shadow-sm">
                    <Target className="h-4 w-4 text-primary" />
                  </span>
                )}
                {step.isExpectedStep && (
                  <span className="absolute -left-1 -top-1 rounded-full bg-card p-0.5 shadow-sm">
                    <Zap className="h-4 w-4 text-amber-500" />
                  </span>
                )}
              </div>
              <p className="mt-3 px-1 text-center text-xs font-medium leading-tight">{step.stepName}</p>
              <div className="mt-2 text-center">
                <p className="text-xs text-muted-foreground">Plan End: {formatDate(step.plannedEndDate)}</p>
                <p className="text-xs text-muted-foreground">Actual: {formatDate(step.actualEndDate ?? step.actualStartDate)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
