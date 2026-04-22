import { MesReportShell } from "@/components/reports/mes/mes-report-shell"
import { OutputEfficiencyView } from "@/components/reports/mes/output-efficiency-view"
import { getMesOutputEfficiencyReport } from "@/lib/services/mes-output-efficiency-service"
import { mesOutputEfficiencyQuerySchema } from "@/lib/validations/mes-reporting"

function getFirstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function OutputEfficiencyPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const rawSearchParams = await searchParams
  const filters = mesOutputEfficiencyQuerySchema.parse({
    stream: getFirstValue(rawSearchParams.stream) ?? "rectagrid",
    range: getFirstValue(rawSearchParams.range) ?? "current",
    line: getFirstValue(rawSearchParams.line) ?? "1",
    startDate: getFirstValue(rawSearchParams.startDate) ?? "",
    endDate: getFirstValue(rawSearchParams.endDate) ?? "",
  })

  const report = await getMesOutputEfficiencyReport(filters)

  return (
    <MesReportShell
      title="Output Efficiency"
      subtitle="MES report shell with stream, range, and line-ready bindings."
      backHref="/reports/mes"
      backLabel="Back to MES Reporting"
    >
      <OutputEfficiencyView report={report} />
    </MesReportShell>
  )
}
