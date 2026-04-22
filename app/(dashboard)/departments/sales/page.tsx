import { DepartmentDashboardView } from "@/components/departments/department-dashboard"
import { getDepartmentDashboard } from "@/lib/services/workflow-service"

export default async function SalesDepartmentPage() {
  const { item, meta } = await getDepartmentDashboard("sales")

  return <DepartmentDashboardView item={item} meta={meta} createLink="/departments/sales/new" desktopTitle="Sales Dashboard" />
}
