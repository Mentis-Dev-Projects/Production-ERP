import { MesReportShell } from "@/components/reports/mes/mes-report-shell"
import { ProductionLineEfficiencyView } from "@/components/reports/mes/production-line-efficiency-view"
import { getMesProductionLineEfficiencyReport } from "@/lib/services/mes-report-service"
import { mesProductionLineEfficiencyQuerySchema } from "@/lib/validations/mes-reporting"

function getFirstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function ProductionLineEfficiencyPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const rawSearchParams = await searchParams
  const filters = mesProductionLineEfficiencyQuerySchema.parse({
    stream: getFirstValue(rawSearchParams.stream) ?? "rectagrid",
    range: getFirstValue(rawSearchParams.range) ?? "current",
    startDate: getFirstValue(rawSearchParams.startDate) ?? "",
    endDate: getFirstValue(rawSearchParams.endDate) ?? "",
  })

  const report = await getMesProductionLineEfficiencyReport(filters)

  return (
    <MesReportShell
      title="Production Line Efficiency"
      subtitle="MES report shell with filter-ready range and stream bindings."
      backHref="/reports/mes"
      backLabel="Back to MES Reporting"
    >
      <ProductionLineEfficiencyView report={report} />
    </MesReportShell>
  )
}
