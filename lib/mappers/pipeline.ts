import type { PipelineStage } from "@/types/mentis"
import { normalizeStatus } from "@/lib/utils/status"

interface PipelineStepRow {
  stepNumber: number | null
  stepCode: string | null
  stepName: string | null
  plannedStartDate: string | Date | null
  plannedEndDate: string | Date | null
  actualStartDate: string | Date | null
  actualEndDate: string | Date | null
  statusCode: string | null
}

function toIsoDate(value: string | Date | null) {
  if (!value) {
    return null
  }

  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    return null
  }

  return date.toISOString().slice(0, 10)
}

export function mapPipelineStages(rows: PipelineStepRow[], salesOrderApprovalDate?: string | Date | null): PipelineStage[] {
  const today = new Date().toISOString().slice(0, 10)
  const approvalDate = toIsoDate(salesOrderApprovalDate ?? null)

  const normalizedRows = approvalDate
    ? [
        {
          stepNumber: 1,
          stepCode: "PRODUCTION_PLANNING",
          stepName: "Production Planning",
          plannedStartDate: approvalDate,
          plannedEndDate: approvalDate,
          actualStartDate: approvalDate,
          actualEndDate: approvalDate,
          statusCode: "complete",
        },
        ...rows.map((row, index) => ({
          ...row,
          stepNumber: index + 2,
        })),
      ]
    : rows

  const stages = normalizedRows.map((row, index) => {
    const plannedStartDate = toIsoDate(row.plannedStartDate)
    const plannedEndDate = toIsoDate(row.plannedEndDate)
    const actualStartDate = toIsoDate(row.actualStartDate)
    const actualEndDate = toIsoDate(row.actualEndDate)
    const status = normalizeStatus(row.statusCode)

    let timingState: PipelineStage["timingState"] = "pending"
    if (actualEndDate && plannedEndDate) {
      timingState =
        actualEndDate < plannedEndDate ? "early" : actualEndDate > plannedEndDate ? "late" : "on-time"
    } else if (actualStartDate && plannedStartDate) {
      timingState = actualStartDate > plannedStartDate ? "late" : "on-time"
    } else if (plannedEndDate && plannedEndDate < today) {
      timingState = "late"
    }

    return {
      stepNumber: row.stepNumber ?? index + 1,
      stepCode: row.stepCode ?? `STEP-${index + 1}`,
      stepName: row.stepName ?? `Step ${index + 1}`,
      plannedStartDate,
      plannedEndDate,
      actualStartDate,
      actualEndDate,
      status,
      timingState,
      isComplete: Boolean(actualEndDate) || status === "complete",
      isCurrentActual: false,
      isExpectedStep: false,
    }
  })

  const currentIndex = stages.findIndex((stage) => !stage.isComplete)
  const expectedIndex = stages.findIndex(
    (stage) => !stage.isComplete && stage.plannedEndDate !== null && stage.plannedEndDate >= today,
  )

  return stages.map((stage, index) => ({
    ...stage,
    isCurrentActual: currentIndex === -1 ? index === stages.length - 1 : index === currentIndex,
    isExpectedStep:
      expectedIndex === -1
        ? index === currentIndex && currentIndex !== -1
        : index === expectedIndex,
  }))
}
