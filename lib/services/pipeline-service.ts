import type { DataAccessMeta, PipelineDetails } from "@/types/mentis"
import { mapPipelineStages } from "@/lib/mappers/pipeline"
import { findMentexPipelineStepsBySalesOrderNumber, findPipelineStepsBySalesOrderNumber } from "@/lib/repositories/pipeline-repository"
import { findSalesOrderByNumber } from "@/lib/repositories/sales-order-repository"

function toMeta(dataSource: "database" | "unavailable"): DataAccessMeta {
  return dataSource === "database"
    ? { dataSource }
    : {
        dataSource,
        message:
          "The production jobbing lookup could not read from PostgreSQL. Check DATABASE_URL and the expected Rectagrid objects.",
      }
}

export async function getPipelineDetails(salesOrderNumber: string): Promise<{
  item: PipelineDetails | null
  meta: DataAccessMeta
}> {
  const orderResult = await findSalesOrderByNumber(salesOrderNumber)

  if (!orderResult.data) {
    return {
      item: null,
      meta: toMeta(orderResult.dataSource),
    }
  }

  const stepsResult =
    orderResult.data.stream === "Mentex"
      ? await findMentexPipelineStepsBySalesOrderNumber(salesOrderNumber)
      : await findPipelineStepsBySalesOrderNumber(salesOrderNumber)

  const stages = mapPipelineStages(stepsResult.data, orderResult.data.approvalDate)
  const currentActualStep = stages.find((stage) => stage.isCurrentActual)?.stepName ?? orderResult.data.currentStep
  const expectedStep = stages.find((stage) => stage.isExpectedStep)?.stepName ?? orderResult.data.expectedStep

  return {
    item: {
      order: {
        ...orderResult.data,
        currentStep: currentActualStep,
        expectedStep,
      },
      currentActualStep,
      expectedStep,
      stages,
    },
    meta: toMeta(orderResult.dataSource === "database" && stepsResult.dataSource === "database" ? "database" : "unavailable"),
  }
}
