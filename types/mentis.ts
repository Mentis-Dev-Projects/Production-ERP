export type OrderStatus =
  | "not-started"
  | "in-progress"
  | "complete"
  | "late"
  | "on-time"
  | "early"
  | "pending"
  | "blocked"

export interface DataAccessMeta {
  dataSource: "database" | "unavailable"
  message?: string
}

export interface SalesOrderListItem {
  id: string
  salesOrderNumber: string
  clientName: string
  clientCode: string | null
  productCode: string | null
  description: string | null
  sqm: number
  qty: number
  approvalDate: string | null
  productionIssuedDate: string | null
  calculatedDueDate: string | null
  revisedDueDate: string | null
  xWorksDate: string | null
  dueDate: string | null
  currentStep: string
  expectedStep: string | null
  blockingStep: string | null
  status: OrderStatus
  stream: string
}

export interface PipelineStage {
  stepNumber: number
  stepCode: string
  stepName: string
  plannedStartDate: string | null
  plannedEndDate: string | null
  actualStartDate: string | null
  actualEndDate: string | null
  status: OrderStatus
  timingState: "early" | "late" | "on-time" | "pending"
  isComplete: boolean
  isCurrentActual: boolean
  isExpectedStep: boolean
}

export interface PipelineDetails {
  order: SalesOrderListItem
  currentActualStep: string | null
  expectedStep: string | null
  stages: PipelineStage[]
}

export interface RectagridJobListItem {
  jobId: string
  salesOrderNumber: string
  clientName: string
  productCode: string | null
  description: string | null
  sqm: number
  qty: number
  dueDate: string | null
  currentStep: string
  expectedStep: string | null
  blockingStep: string | null
  status: OrderStatus
}

export interface DashboardSummary {
  openOrders: number
  ordersInProgress: number
  lateOrders: number
  dueThisWeek: number
  currentWorkload: number
  statusOverview: Array<{
    status: OrderStatus
    count: number
  }>
  pipelineByStep: Array<{ step: string; count: number }>
  streamOverview: Array<{
    stream: string
    count: number
    inProgress: number
    pending: number
    complete: number
  }>
  workCenters: Array<{
    department: string
    jobs: number
    capacity: number
  }>
  openOrderList: SalesOrderListItem[]
  ordersInProgressList: SalesOrderListItem[]
  dueThisWeekList: SalesOrderListItem[]
  recentOrders: SalesOrderListItem[]
  lateOrderList: SalesOrderListItem[]
}

export interface ClientSummary {
  id: string
  name: string
  clientCode: string | null
  activeOrders: number
  overdueOrders: number
}

export interface WorkCenterSummary {
  id: string
  code: string
  name: string
  stepCode: string | null
  streamName: string | null
  capacity: number
  capacityUnit: string | null
  isActive: boolean
}

export interface PublicHolidaySummary {
  id: string
  holidayDate: string
  name: string
}

export type WorkflowDepartment = "sales" | "drawings" | "production"

export type WorkflowStageCode =
  | "sales_new_jobbing_order"
  | "drawings_preparation"
  | "sales_client_submission"
  | "sales_order_approval"
  | "production_planning_received"

export type WorkflowStatus =
  | "estimate_accepted"
  | "sent_to_drawings"
  | "drawings_in_progress"
  | "returned_to_sales"
  | "awaiting_client_approval"
  | "client_approved"
  | "sent_to_production_planning"
  | "production_planning_received"

export interface JobbingOrderSummary {
  id: string
  estimateNumber: string
  estimateAcceptedAt: string | null
  clientName: string
  streamName: string
  technicalRequirements: string | null
  salesNotes: string | null
  drawingNotes: string | null
  productionNotes: string | null
  currentDepartment: WorkflowDepartment
  currentStage: WorkflowStageCode
  workflowStatus: WorkflowStatus
  salesOrderNumber: string | null
  productCode: string | null
  sqm: number | null
  qty: number | null
  salesOrderApprovalAt: string | null
  linkedSalesOrderId: string | null
  createdByName: string | null
  updatedByName: string | null
  createdAt: string
  updatedAt: string
}

export interface JobbingOrderStage {
  id: string
  departmentCode: WorkflowDepartment
  stageCode: WorkflowStageCode
  stageStatus: string
  stageTitle: string
  notes: string | null
  actionByName: string | null
  actedAt: string | null
  createdAt: string
}

export interface JobbingOrderAttachment {
  id: string
  jobbingOrderId: string
  stageId: string | null
  attachmentRole: string
  fileName: string
  originalFileName: string
  mimeType: string | null
  storagePath: string
  fileSizeBytes: number | null
  uploadedByName: string | null
  notes: string | null
  uploadedAt: string
}

export interface WorkflowNotificationSummary {
  id: string
  jobbingOrderId: string
  stageId: string | null
  recipientDepartment: WorkflowDepartment
  title: string
  message: string
  notificationType: string
  isRead: boolean
  readAt: string | null
  createdAt: string
  estimateNumber: string
  clientName: string
  salesOrderNumber: string | null
}

export interface JobbingOrderDetail {
  order: JobbingOrderSummary
  stages: JobbingOrderStage[]
  attachments: JobbingOrderAttachment[]
  notifications: WorkflowNotificationSummary[]
}

export interface DepartmentDashboard {
  department: WorkflowDepartment
  inboxCount: number
  unreadNotifications: number
  activeOrders: number
  recentOrders: JobbingOrderSummary[]
  notifications: WorkflowNotificationSummary[]
}

export type PerformanceQuickFilter =
  | "all"
  | "overdue"
  | "due-this-week"
  | "in-production"
  | "completed"
  | "late-jobs"

export type PerformanceKpiView =
  | "none"
  | "total-active-orders"
  | "overdue-orders"
  | "due-this-week"
  | "completed-orders"
  | "orders-at-risk"

export type PerformanceDatePreset =
  | "all"
  | "today"
  | "7d"
  | "30d"
  | "this-month"

export type PerformanceWorkOrderStatus =
  | "all"
  | "not-started"
  | "in-production"
  | "completed"
  | "delayed"
  | "cancelled"
  | "unknown"

export interface PerformanceDashboardFilters {
  startDate: string
  endDate: string
  productionLine: string
  client: string
  department: string
  workOrderStatus: PerformanceWorkOrderStatus
  productCode: string
  quickFilter: PerformanceQuickFilter
  datePreset: PerformanceDatePreset
  kpiView: PerformanceKpiView
}

export interface PerformanceDashboardOption {
  value: string
  label: string
  count: number
}

export interface PerformanceKpiSummary {
  totalActiveOrders: number
  overdueOrders: number
  dueThisWeek: number
  completedOrders: number
  onTimeRate: number
  lateRate: number
  averageProductionDays: number
  plannedVsActualVariance: number
  trackedQuantityCompletion: number
  ordersAtRisk: number
}

export interface PerformanceDistributionDatum {
  key: string
  label: string
  value: number
  percentage: number
}

export interface PerformanceTrendDatum {
  periodKey: string
  periodLabel: string
  createdOrders: number
  completedOrders: number
  overdueOrders: number
  averageProductionDays: number
  onTimeRate: number
}

export interface PerformanceBreakdownDatum {
  key: string
  label: string
  value: number
  lateCount: number
  onTimeRate: number | null
}

export interface PerformanceExceptionRow {
  productionLine: string
  salesOrderNumber: string
  worksOrder: string | null
  client: string
  productCode: string | null
  currentDepartment: string
  effectiveDueDate: string | null
  finalStageEndDate: string | null
  daysLate: number
  status: PerformanceWorkOrderStatus
  qty: number
  plannedDays: number | null
  actualDays: number | null
  varianceDays: number | null
  riskFlag: "Critical" | "High" | "Watch"
}

export interface PerformanceKpiDrilldownRow {
  productionLine: string
  salesOrderNumber: string
  worksOrder: string | null
  client: string
  productCode: string | null
  currentDepartment: string
  salesOrderApprovalDate: string | null
  effectiveDueDate: string | null
  completedDate: string | null
  daysLate: number
  status: PerformanceWorkOrderStatus
  qty: number
  plannedDays: number | null
  actualDays: number | null
  varianceDays: number | null
}

export interface PerformanceLineBreakdownDatum {
  productionLine: string
  totalOrders: number
  activeOrders: number
  overdueOrders: number
  completedOrders: number
  averageActualDays: number | null
  averageVarianceDays: number | null
}

export interface PerformanceEfficiencySummary {
  productionLine: string
  averageEfficiency: number
  totalQty: number
  qtyCompleted: number
  qtyOutstanding: number
  totalOrders: number | null
  completedOrders: number | null
  openOrders: number | null
}

export interface PerformanceEfficiencyTrendDatum {
  dueWeek: string
  efficiency: number
  totalQty: number
  qtyCompleted: number
  qtyOutstanding: number
}

export interface PerformanceDashboardData {
  filters: PerformanceDashboardFilters
  options: {
    lines: PerformanceDashboardOption[]
    clients: PerformanceDashboardOption[]
    departments: PerformanceDashboardOption[]
    productCodes: string[]
    workOrderStatuses: Array<{
      value: PerformanceWorkOrderStatus
      label: string
    }>
    quickFilters: Array<{
      value: PerformanceQuickFilter
      label: string
    }>
    datePresets: Array<{
      value: PerformanceDatePreset
      label: string
    }>
  }
  summary: PerformanceKpiSummary
  lineBreakdown: PerformanceLineBreakdownDatum[]
  visuals: {
    onTimeVsLate: PerformanceDistributionDatum[]
    workOrderStatusMix: PerformanceDistributionDatum[]
    departmentDistribution: PerformanceDistributionDatum[]
    quantityCompletion: {
      percent: number
      trackedQty: number
      releasedQty: number
    }
  }
  trends: PerformanceTrendDatum[]
  efficiency: {
    summaries: PerformanceEfficiencySummary[]
    trend: PerformanceEfficiencyTrendDatum[]
  }
  breakdowns: {
    departments: PerformanceBreakdownDatum[]
    clients: PerformanceBreakdownDatum[]
    productCodes: PerformanceBreakdownDatum[]
    workOrderStatuses: PerformanceBreakdownDatum[]
    delayedClients: PerformanceBreakdownDatum[]
    delayedProducts: PerformanceBreakdownDatum[]
  }
  kpiDrilldown: {
    selected: PerformanceKpiView
    title: string | null
    description: string | null
    rows: PerformanceKpiDrilldownRow[]
  }
  exceptions: PerformanceExceptionRow[]
  lastRefreshed: string
}
