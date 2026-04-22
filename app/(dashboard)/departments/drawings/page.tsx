import { DepartmentDashboardView } from "@/components/departments/department-dashboard"
import { getDepartmentDashboard } from "@/lib/services/workflow-service"

export default async function DrawingsDepartmentPage() {
  const { item, meta } = await getDepartmentDashboard("drawings")

  return <DepartmentDashboardView item={item} meta={meta} desktopTitle="Drawings Dashboard" />
}
