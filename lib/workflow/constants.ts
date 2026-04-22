export const workflowDepartments = ["sales", "drawings", "production"] as const
export type WorkflowDepartment = (typeof workflowDepartments)[number]

export const workflowStreams = ["Rectagrid", "Mentex", "Handrailing", "Mentrail", "Press Shop"] as const

export const workflowStageCodes = [
  "sales_new_jobbing_order",
  "drawings_preparation",
  "sales_client_submission",
  "sales_order_approval",
  "production_planning_received",
] as const

export type WorkflowStageCode = (typeof workflowStageCodes)[number]

export const workflowStatuses = [
  "estimate_accepted",
  "sent_to_drawings",
  "drawings_in_progress",
  "returned_to_sales",
  "awaiting_client_approval",
  "client_approved",
  "sent_to_production_planning",
  "production_planning_received",
] as const

export type WorkflowStatus = (typeof workflowStatuses)[number]

export const departmentLabels: Record<WorkflowDepartment, string> = {
  sales: "Sales",
  drawings: "Drawings",
  production: "Production",
}

export const stageLabels: Record<WorkflowStageCode, string> = {
  sales_new_jobbing_order: "New Jobbing Order",
  drawings_preparation: "Drawings Preparation",
  sales_client_submission: "Sales Client Submission",
  sales_order_approval: "Sales Order Approval",
  production_planning_received: "Production Planning Received",
}

export const statusLabels: Record<WorkflowStatus, string> = {
  estimate_accepted: "Estimate Accepted",
  sent_to_drawings: "Sent to Drawings",
  drawings_in_progress: "Drawings In Progress",
  returned_to_sales: "Returned to Sales",
  awaiting_client_approval: "Awaiting Client Approval",
  client_approved: "Client Approved",
  sent_to_production_planning: "Sent to Production Planning",
  production_planning_received: "Production Planning Received",
}
