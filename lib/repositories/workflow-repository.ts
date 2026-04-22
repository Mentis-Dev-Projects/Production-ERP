import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/db/prisma"
import { executeSafeQuery, type RepositoryResult } from "@/lib/db/queries"
import type {
  DepartmentDashboard,
  JobbingOrderAttachment,
  JobbingOrderDetail,
  JobbingOrderStage,
  JobbingOrderSummary,
  WorkflowDepartment,
  WorkflowNotificationSummary,
} from "@/types/mentis"

const streamNameSelect = Prisma.sql`
  CASE
    WHEN LOWER(COALESCE(jo.stream_name, '')) IN ('expanded metal', 'expanded-metal', 'expanded_metal', 'mentex') THEN 'Mentex'
    ELSE COALESCE(jo.stream_name, 'Rectagrid')
  END
`

function mapUnavailableMeta<T>(fallback: T): RepositoryResult<T> {
  return {
    data: fallback,
    dataSource: "unavailable",
    error: "Workflow command failed.",
  }
}

export async function findJobbingOrdersByDepartment(department: WorkflowDepartment) {
  return executeSafeQuery<JobbingOrderSummary[]>(
    Prisma.sql`
      SELECT
        jo.jobbing_order_id::text AS id,
        jo.estimate_number AS "estimateNumber",
        jo.estimate_accepted_at::text AS "estimateAcceptedAt",
        jo.client_name AS "clientName",
        ${streamNameSelect} AS "streamName",
        jo.technical_requirements AS "technicalRequirements",
        jo.sales_notes AS "salesNotes",
        jo.drawing_notes AS "drawingNotes",
        jo.production_notes AS "productionNotes",
        jo.current_department AS "currentDepartment",
        jo.current_stage AS "currentStage",
        jo.workflow_status AS "workflowStatus",
        jo.sales_order_number AS "salesOrderNumber",
        jo.product_code AS "productCode",
        jo.sqm::float8 AS sqm,
        jo.qty::float8 AS qty,
        jo.sales_order_approval_at::text AS "salesOrderApprovalAt",
        jo.linked_sales_order_id::text AS "linkedSalesOrderId",
        jo.created_by_name AS "createdByName",
        jo.updated_by_name AS "updatedByName",
        jo.created_at::text AS "createdAt",
        jo.updated_at::text AS "updatedAt"
      FROM workflow.jobbing_order jo
      WHERE jo.current_department = ${department}
      ORDER BY jo.updated_at DESC, jo.created_at DESC
    `,
    [],
  )
}

export async function findAllJobbingOrders() {
  return executeSafeQuery<JobbingOrderSummary[]>(
    Prisma.sql`
      SELECT
        jo.jobbing_order_id::text AS id,
        jo.estimate_number AS "estimateNumber",
        jo.estimate_accepted_at::text AS "estimateAcceptedAt",
        jo.client_name AS "clientName",
        ${streamNameSelect} AS "streamName",
        jo.technical_requirements AS "technicalRequirements",
        jo.sales_notes AS "salesNotes",
        jo.drawing_notes AS "drawingNotes",
        jo.production_notes AS "productionNotes",
        jo.current_department AS "currentDepartment",
        jo.current_stage AS "currentStage",
        jo.workflow_status AS "workflowStatus",
        jo.sales_order_number AS "salesOrderNumber",
        jo.product_code AS "productCode",
        jo.sqm::float8 AS sqm,
        jo.qty::float8 AS qty,
        jo.sales_order_approval_at::text AS "salesOrderApprovalAt",
        jo.linked_sales_order_id::text AS "linkedSalesOrderId",
        jo.created_by_name AS "createdByName",
        jo.updated_by_name AS "updatedByName",
        jo.created_at::text AS "createdAt",
        jo.updated_at::text AS "updatedAt"
      FROM workflow.jobbing_order jo
      ORDER BY jo.updated_at DESC, jo.created_at DESC
    `,
    [],
  )
}

export async function findWorkflowNotificationsByDepartment(department: WorkflowDepartment) {
  return executeSafeQuery<WorkflowNotificationSummary[]>(
    Prisma.sql`
      SELECT
        n.jobbing_order_notification_id::text AS id,
        n.jobbing_order_id::text AS "jobbingOrderId",
        n.jobbing_order_stage_id::text AS "stageId",
        n.recipient_department AS "recipientDepartment",
        n.title,
        n.message,
        n.notification_type AS "notificationType",
        n.is_read AS "isRead",
        n.read_at::text AS "readAt",
        n.created_at::text AS "createdAt",
        jo.estimate_number AS "estimateNumber",
        jo.client_name AS "clientName",
        jo.sales_order_number AS "salesOrderNumber"
      FROM workflow.jobbing_order_notification n
      INNER JOIN workflow.jobbing_order jo ON jo.jobbing_order_id = n.jobbing_order_id
      WHERE n.recipient_department = ${department}
      ORDER BY n.created_at DESC
    `,
    [],
  )
}

export async function findWorkflowNotificationById(notificationId: string) {
  const notificationResult = await executeSafeQuery<WorkflowNotificationSummary[]>(
    Prisma.sql`
      SELECT
        n.jobbing_order_notification_id::text AS id,
        n.jobbing_order_id::text AS "jobbingOrderId",
        n.jobbing_order_stage_id::text AS "stageId",
        n.recipient_department AS "recipientDepartment",
        n.title,
        n.message,
        n.notification_type AS "notificationType",
        n.is_read AS "isRead",
        n.read_at::text AS "readAt",
        n.created_at::text AS "createdAt",
        jo.estimate_number AS "estimateNumber",
        jo.client_name AS "clientName",
        jo.sales_order_number AS "salesOrderNumber"
      FROM workflow.jobbing_order_notification n
      INNER JOIN workflow.jobbing_order jo ON jo.jobbing_order_id = n.jobbing_order_id
      WHERE n.jobbing_order_notification_id = ${BigInt(notificationId)}
      LIMIT 1
    `,
    [],
  )

  return {
    ...notificationResult,
    data: notificationResult.data[0] ?? null,
  }
}

export async function findJobbingOrderDetailById(jobbingOrderId: string) {
  const [orderResult, stagesResult, attachmentsResult, notificationsResult] = await Promise.all([
    executeSafeQuery<JobbingOrderSummary[]>(
      Prisma.sql`
        SELECT
          jo.jobbing_order_id::text AS id,
          jo.estimate_number AS "estimateNumber",
          jo.estimate_accepted_at::text AS "estimateAcceptedAt",
          jo.client_name AS "clientName",
          ${streamNameSelect} AS "streamName",
          jo.technical_requirements AS "technicalRequirements",
          jo.sales_notes AS "salesNotes",
          jo.drawing_notes AS "drawingNotes",
          jo.production_notes AS "productionNotes",
          jo.current_department AS "currentDepartment",
          jo.current_stage AS "currentStage",
          jo.workflow_status AS "workflowStatus",
          jo.sales_order_number AS "salesOrderNumber",
          jo.product_code AS "productCode",
          jo.sqm::float8 AS sqm,
          jo.qty::float8 AS qty,
          jo.sales_order_approval_at::text AS "salesOrderApprovalAt",
          jo.linked_sales_order_id::text AS "linkedSalesOrderId",
          jo.created_by_name AS "createdByName",
          jo.updated_by_name AS "updatedByName",
          jo.created_at::text AS "createdAt",
          jo.updated_at::text AS "updatedAt"
        FROM workflow.jobbing_order jo
        WHERE jo.jobbing_order_id = ${BigInt(jobbingOrderId)}
        LIMIT 1
      `,
      [],
    ),
    executeSafeQuery<JobbingOrderStage[]>(
      Prisma.sql`
        SELECT
          s.jobbing_order_stage_id::text AS id,
          s.department_code AS "departmentCode",
          s.stage_code AS "stageCode",
          s.stage_status AS "stageStatus",
          s.stage_title AS "stageTitle",
          s.notes,
          s.action_by_name AS "actionByName",
          s.acted_at::text AS "actedAt",
          s.created_at::text AS "createdAt"
        FROM workflow.jobbing_order_stage s
        WHERE s.jobbing_order_id = ${BigInt(jobbingOrderId)}
        ORDER BY s.created_at DESC
      `,
      [],
    ),
    executeSafeQuery<JobbingOrderAttachment[]>(
      Prisma.sql`
        SELECT
          a.jobbing_order_attachment_id::text AS id,
          a.jobbing_order_id::text AS "jobbingOrderId",
          a.jobbing_order_stage_id::text AS "stageId",
          a.attachment_role AS "attachmentRole",
          a.file_name AS "fileName",
          a.original_file_name AS "originalFileName",
          a.mime_type AS "mimeType",
          a.storage_path AS "storagePath",
          a.file_size_bytes::bigint AS "fileSizeBytes",
          a.uploaded_by_name AS "uploadedByName",
          a.notes,
          a.uploaded_at::text AS "uploadedAt"
        FROM workflow.jobbing_order_attachment a
        WHERE a.jobbing_order_id = ${BigInt(jobbingOrderId)}
        ORDER BY a.uploaded_at DESC
      `,
      [],
    ),
    executeSafeQuery<WorkflowNotificationSummary[]>(
      Prisma.sql`
        SELECT
          n.jobbing_order_notification_id::text AS id,
          n.jobbing_order_id::text AS "jobbingOrderId",
          n.jobbing_order_stage_id::text AS "stageId",
          n.recipient_department AS "recipientDepartment",
          n.title,
          n.message,
          n.notification_type AS "notificationType",
          n.is_read AS "isRead",
          n.read_at::text AS "readAt",
          n.created_at::text AS "createdAt",
          jo.estimate_number AS "estimateNumber",
          jo.client_name AS "clientName",
          jo.sales_order_number AS "salesOrderNumber"
        FROM workflow.jobbing_order_notification n
        INNER JOIN workflow.jobbing_order jo ON jo.jobbing_order_id = n.jobbing_order_id
        WHERE n.jobbing_order_id = ${BigInt(jobbingOrderId)}
        ORDER BY n.created_at DESC
      `,
      [],
    ),
  ])

  return {
    data: orderResult.data[0]
      ? {
          order: orderResult.data[0],
          stages: stagesResult.data,
          attachments: attachmentsResult.data,
          notifications: notificationsResult.data,
        }
      : null,
    dataSource:
      orderResult.dataSource === "database" &&
      stagesResult.dataSource === "database" &&
      attachmentsResult.dataSource === "database" &&
      notificationsResult.dataSource === "database"
        ? "database"
        : "unavailable",
  } as RepositoryResult<JobbingOrderDetail | null>
}

export async function getDepartmentDashboardData(department: WorkflowDepartment): Promise<RepositoryResult<DepartmentDashboard>> {
  const [ordersResult, notificationsResult] = await Promise.all([
    findJobbingOrdersByDepartment(department),
    findWorkflowNotificationsByDepartment(department),
  ])

  return {
    data: {
      department,
      inboxCount: ordersResult.data.length,
      unreadNotifications: notificationsResult.data.filter((item) => !item.isRead).length,
      activeOrders: ordersResult.data.length,
      recentOrders: ordersResult.data.slice(0, 8),
      notifications: notificationsResult.data.slice(0, 8),
    },
    dataSource:
      ordersResult.dataSource === "database" && notificationsResult.dataSource === "database" ? "database" : "unavailable",
  }
}

export async function markWorkflowNotificationRead(notificationId: string) {
  try {
    await prisma.$executeRaw`
      UPDATE workflow.jobbing_order_notification
      SET is_read = true,
          read_at = COALESCE(read_at, NOW())
      WHERE jobbing_order_notification_id = ${BigInt(notificationId)}
    `

    return { ok: true as const }
  } catch {
    return { ok: false as const }
  }
}

export async function createWorkflowArtifacts(input: {
  orderInsert: Prisma.Sql
  stageInsert: (jobbingOrderId: bigint) => Prisma.Sql
  attachmentInserts?: (jobbingOrderId: bigint, stageId: bigint) => Prisma.Sql[]
  notificationInserts?: (jobbingOrderId: bigint, stageId: bigint) => Prisma.Sql[]
}) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.$queryRaw<{ jobbing_order_id: bigint }[]>(input.orderInsert)
      const jobbingOrderId = createdOrder[0]?.jobbing_order_id
      if (!jobbingOrderId) throw new Error("Workflow order was not created.")

      const createdStage = await tx.$queryRaw<{ jobbing_order_stage_id: bigint }[]>(input.stageInsert(jobbingOrderId))
      const stageId = createdStage[0]?.jobbing_order_stage_id
      if (!stageId) throw new Error("Workflow stage was not created.")

      for (const statement of input.attachmentInserts?.(jobbingOrderId, stageId) ?? []) {
        await tx.$executeRaw(statement)
      }

      for (const statement of input.notificationInserts?.(jobbingOrderId, stageId) ?? []) {
        await tx.$executeRaw(statement)
      }

      return {
        jobbingOrderId,
        stageId,
      }
    })

    return { ok: true as const, ...result }
  } catch {
    return { ok: false as const }
  }
}

export async function runWorkflowTransaction<T>(callback: Parameters<typeof prisma.$transaction>[0]) {
  try {
    const result = await prisma.$transaction(callback as never, { timeout: 120000, maxWait: 120000 })
    return { ok: true as const, data: result as T }
  } catch {
    return { ok: false as const, data: null as T | null }
  }
}
