import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/db/prisma"
import {
  findAllJobbingOrders,
  findJobbingOrderDetailById,
  findWorkflowNotificationById,
  getDepartmentDashboardData,
  markWorkflowNotificationRead,
} from "@/lib/repositories/workflow-repository"
import { persistWorkflowFile } from "@/lib/workflow/storage"
import { sendWorkflowEmailNotification } from "@/lib/workflow/notifications"
import { departmentLabels, stageLabels } from "@/lib/workflow/constants"
import { mapAppStreamNameToDb, mapDbStreamNameToApp } from "@/lib/streams"
import { createJobbingOrderSchema, drawingsCompletionSchema, salesApprovalSchema } from "@/lib/validations/workflow"
import type { DataAccessMeta, WorkflowDepartment } from "@/types/mentis"

function toMeta(dataSource: "database" | "unavailable", fallbackMessage: string): DataAccessMeta {
  return dataSource === "database" ? { dataSource } : { dataSource, message: fallbackMessage }
}

export async function getDepartmentDashboard(department: WorkflowDepartment) {
  const result = await getDepartmentDashboardData(department)

  return {
    item: result.data,
    meta: toMeta(result.dataSource, "The department workflow dashboard could not read from PostgreSQL."),
  }
}

export async function getWorkflowNotification(notificationId: string) {
  const notificationResult = await findWorkflowNotificationById(notificationId)
  if (notificationResult.data) {
    await markWorkflowNotificationRead(notificationId)
  }

  const detailResult = notificationResult.data
    ? await findJobbingOrderDetailById(notificationResult.data.jobbingOrderId)
    : { data: null, dataSource: notificationResult.dataSource }

  return {
    item: notificationResult.data,
    detail: detailResult.data,
    meta: toMeta(notificationResult.dataSource, "The workflow notification could not be read from PostgreSQL."),
  }
}

export async function getJobbingOrderDetail(jobbingOrderId: string) {
  const result = await findJobbingOrderDetailById(jobbingOrderId)

  return {
    item: result.data,
    meta: toMeta(result.dataSource, "The workflow jobbing order could not be read from PostgreSQL."),
  }
}

export async function getAllJobbingOrders() {
  const result = await findAllJobbingOrders()

  return {
    items: result.data,
    meta: toMeta(result.dataSource, "The workflow jobbing orders could not be read from PostgreSQL."),
  }
}

export async function createSalesJobbingOrder(input: FormData) {
  const parsed = createJobbingOrderSchema.parse({
    estimateNumber: input.get("estimateNumber"),
    estimateAcceptedAt: input.get("estimateAcceptedAt"),
    clientName: input.get("clientName"),
    streamName: input.get("streamName"),
    technicalRequirements: input.get("technicalRequirements"),
    salesNotes: input.get("salesNotes"),
    createdByName: input.get("createdByName"),
  })

  const files = input.getAll("technicalFiles").filter((file): file is File => file instanceof File && file.size > 0)
  const savedFiles = await Promise.all(files.map((file) => persistWorkflowFile(file)))
  const dbStreamName = mapAppStreamNameToDb(parsed.streamName)

  const orderInsert = Prisma.sql`
    INSERT INTO workflow.jobbing_order (
      estimate_number,
      estimate_accepted_at,
      client_name,
      stream_name,
      technical_requirements,
      sales_notes,
      current_department,
      current_stage,
      workflow_status,
      created_by_name,
      updated_by_name
    )
    VALUES (
      ${parsed.estimateNumber},
      ${parsed.estimateAcceptedAt ? new Date(parsed.estimateAcceptedAt) : null},
      ${parsed.clientName},
      ${dbStreamName},
      ${parsed.technicalRequirements || null},
      ${parsed.salesNotes || null},
      ${"drawings"},
      ${"drawings_preparation"},
      ${"sent_to_drawings"},
      ${parsed.createdByName},
      ${parsed.createdByName}
    )
    RETURNING jobbing_order_id
  `

  const result = await prisma.$transaction(async (tx) => {
    const createdOrder = await tx.$queryRaw<{ jobbing_order_id: bigint }[]>(orderInsert)
    const jobbingOrderId = createdOrder[0]?.jobbing_order_id
    if (!jobbingOrderId) throw new Error("Failed to create jobbing order.")

    const createdStage = await tx.$queryRaw<{ jobbing_order_stage_id: bigint }[]>(Prisma.sql`
      INSERT INTO workflow.jobbing_order_stage (
        jobbing_order_id,
        department_code,
        stage_code,
        stage_status,
        stage_title,
        notes,
        action_by_name,
        acted_at
      )
      VALUES (
        ${jobbingOrderId},
        ${"sales"},
        ${"sales_new_jobbing_order"},
        ${"completed"},
        ${stageLabels.sales_new_jobbing_order},
        ${parsed.salesNotes || parsed.technicalRequirements || null},
        ${parsed.createdByName},
        NOW()
      )
      RETURNING jobbing_order_stage_id
    `)

    const stageId = createdStage[0]?.jobbing_order_stage_id
    if (!stageId) throw new Error("Failed to create initial workflow stage.")

    for (const file of savedFiles) {
      await tx.$executeRaw(Prisma.sql`
        INSERT INTO workflow.jobbing_order_attachment (
          jobbing_order_id,
          jobbing_order_stage_id,
          attachment_role,
          file_name,
          original_file_name,
          mime_type,
          storage_path,
          file_size_bytes,
          uploaded_by_name
        )
        VALUES (
          ${jobbingOrderId},
          ${stageId},
          ${"client-technical-drawing"},
          ${file.fileName},
          ${file.originalFileName},
          ${file.mimeType},
          ${file.storagePath},
          ${BigInt(file.fileSizeBytes)},
          ${parsed.createdByName}
        )
      `)
    }

    await tx.$executeRaw(Prisma.sql`
      INSERT INTO workflow.jobbing_order_notification (
        jobbing_order_id,
        jobbing_order_stage_id,
        recipient_department,
        title,
        message,
        notification_type
      )
      VALUES (
        ${jobbingOrderId},
        ${stageId},
        ${"drawings"},
        ${`New Jobbing Order: ${parsed.estimateNumber}`},
        ${`Sales submitted estimate ${parsed.estimateNumber} with technical drawings for ${parsed.clientName}.`},
        ${"jobbing-order-created"}
      )
    `)

    return jobbingOrderId
  }, { timeout: 120000, maxWait: 120000 })

  await sendWorkflowEmailNotification({
    toDepartment: "drawings",
    subject: `New Jobbing Order: ${parsed.estimateNumber}`,
    message: `Sales submitted estimate ${parsed.estimateNumber} for ${parsed.clientName}.`,
  })

  return result.toString()
}

export async function completeDrawingsStep(jobbingOrderId: string, input: FormData) {
  const parsed = drawingsCompletionSchema.parse({
    salesOrderNumber: input.get("salesOrderNumber"),
    clientName: input.get("clientName"),
    productCode: input.get("productCode"),
    sqm: input.get("sqm"),
    qty: input.get("qty"),
    drawingNotes: input.get("drawingNotes"),
    actionByName: input.get("actionByName"),
  })

  const files = input.getAll("drawingFiles").filter((file): file is File => file instanceof File && file.size > 0)
  const savedFiles = await Promise.all(files.map((file) => persistWorkflowFile(file)))

  await prisma.$transaction(async (tx) => {
    await tx.$executeRaw(Prisma.sql`
      UPDATE workflow.jobbing_order
      SET client_name = ${parsed.clientName},
          sales_order_number = ${parsed.salesOrderNumber},
          product_code = ${parsed.productCode},
          sqm = ${parsed.sqm},
          qty = ${parsed.qty},
          drawing_notes = ${parsed.drawingNotes || null},
          current_department = ${"sales"},
          current_stage = ${"sales_client_submission"},
          workflow_status = ${"returned_to_sales"},
          updated_by_name = ${parsed.actionByName},
          updated_at = NOW()
      WHERE jobbing_order_id = ${BigInt(jobbingOrderId)}
    `)

    const createdStage = await tx.$queryRaw<{ jobbing_order_stage_id: bigint }[]>(Prisma.sql`
      INSERT INTO workflow.jobbing_order_stage (
        jobbing_order_id,
        department_code,
        stage_code,
        stage_status,
        stage_title,
        notes,
        action_by_name,
        acted_at
      )
      VALUES (
        ${BigInt(jobbingOrderId)},
        ${"drawings"},
        ${"drawings_preparation"},
        ${"completed"},
        ${stageLabels.drawings_preparation},
        ${parsed.drawingNotes || null},
        ${parsed.actionByName},
        NOW()
      )
      RETURNING jobbing_order_stage_id
    `)

    const stageId = createdStage[0]?.jobbing_order_stage_id
    if (!stageId) throw new Error("Failed to create drawings completion stage.")

    for (const file of savedFiles) {
      await tx.$executeRaw(Prisma.sql`
        INSERT INTO workflow.jobbing_order_attachment (
          jobbing_order_id,
          jobbing_order_stage_id,
          attachment_role,
          file_name,
          original_file_name,
          mime_type,
          storage_path,
          file_size_bytes,
          uploaded_by_name
        )
        VALUES (
          ${BigInt(jobbingOrderId)},
          ${stageId},
          ${"drawings-output"},
          ${file.fileName},
          ${file.originalFileName},
          ${file.mimeType},
          ${file.storagePath},
          ${BigInt(file.fileSizeBytes)},
          ${parsed.actionByName}
        )
      `)
    }

    await tx.$executeRaw(Prisma.sql`
      INSERT INTO workflow.jobbing_order_notification (
        jobbing_order_id,
        jobbing_order_stage_id,
        recipient_department,
        title,
        message,
        notification_type
      )
      VALUES (
        ${BigInt(jobbingOrderId)},
        ${stageId},
        ${"sales"},
        ${`Sales Order Ready: ${parsed.salesOrderNumber}`},
        ${`Drawings completed the package for sales order ${parsed.salesOrderNumber} and returned it to Sales.`},
        ${"drawings-completed"}
      )
    `)
  }, { timeout: 120000, maxWait: 120000 })

  await sendWorkflowEmailNotification({
    toDepartment: "sales",
    subject: `Sales Order Ready: ${parsed.salesOrderNumber}`,
    message: `Drawings completed the package for sales order ${parsed.salesOrderNumber}.`,
  })
}

async function ensureClientId(clientName: string) {
  const existing = await prisma.$queryRaw<{ client_id: bigint }[]>(Prisma.sql`
    SELECT client_id
    FROM app_core.client
    WHERE LOWER(client_name) = LOWER(${clientName})
    LIMIT 1
  `)

  if (existing[0]?.client_id) {
    return existing[0].client_id
  }

  const inserted = await prisma.$queryRaw<{ client_id: bigint }[]>(Prisma.sql`
    INSERT INTO app_core.client (client_name, is_active, created_at, updated_at)
    VALUES (${clientName}, true, NOW(), NOW())
    RETURNING client_id
  `)

  return inserted[0].client_id
}

export async function approveSalesOrder(jobbingOrderId: string, input: FormData) {
  const parsed = salesApprovalSchema.parse({
    approvalDate: input.get("approvalDate"),
    salesNotes: input.get("salesNotes"),
    actionByName: input.get("actionByName"),
  })

  await prisma.$transaction(async (tx) => {
    const orders = await tx.$queryRaw<{
      client_name: string
      sales_order_number: string | null
      product_code: string | null
      sqm: number | null
      qty: number | null
      stream_name: string
    }[]>(Prisma.sql`
      SELECT client_name, sales_order_number, product_code, sqm::float8 AS sqm, qty::float8 AS qty, stream_name
      FROM workflow.jobbing_order
      WHERE jobbing_order_id = ${BigInt(jobbingOrderId)}
      LIMIT 1
    `)

    const order = orders[0]
    if (!order || !order.sales_order_number || !order.product_code) {
      throw new Error("The jobbing order is missing sales order detail required for approval.")
    }

    const appStreamName = mapDbStreamNameToApp(order.stream_name)
    const clientId = await ensureClientId(order.client_name)

    const existingSalesOrder = await tx.$queryRaw<{ sales_order_id: bigint }[]>(Prisma.sql`
      SELECT sales_order_id
      FROM sales.sales_order
      WHERE sales_order_number = ${order.sales_order_number}
      LIMIT 1
    `)

    let salesOrderId = existingSalesOrder[0]?.sales_order_id

    if (!salesOrderId) {
      const inserted = await tx.$queryRaw<{ sales_order_id: bigint }[]>(Prisma.sql`
        INSERT INTO sales.sales_order (
          sales_order_number,
          client_id,
          entry_product_code,
          entry_description_1,
          entry_sqm,
          entry_qty,
          entry_sales_order_approval_at,
          source_system,
          source_row_key,
          created_at,
          updated_at
        )
        VALUES (
          ${order.sales_order_number},
          ${clientId},
          ${order.product_code},
          ${`${appStreamName} jobbing workflow approval`},
          ${order.sqm ?? 0},
          ${order.qty ?? 0},
          ${new Date(parsed.approvalDate)},
          ${"WORKFLOW"},
          ${jobbingOrderId},
          NOW(),
          NOW()
        )
        RETURNING sales_order_id
      `)
      salesOrderId = inserted[0]?.sales_order_id
    } else {
      await tx.$executeRaw(Prisma.sql`
        UPDATE sales.sales_order
        SET client_id = ${clientId},
            entry_product_code = ${order.product_code},
            entry_sqm = ${order.sqm ?? 0},
            entry_qty = ${order.qty ?? 0},
            entry_sales_order_approval_at = ${new Date(parsed.approvalDate)},
            updated_at = NOW()
        WHERE sales_order_id = ${salesOrderId}
      `)
    }

    await tx.$executeRaw(Prisma.sql`
      UPDATE workflow.jobbing_order
      SET sales_order_approval_at = ${new Date(parsed.approvalDate)},
          sales_notes = ${parsed.salesNotes || null},
          linked_sales_order_id = ${salesOrderId ?? null},
          current_department = ${"production"},
          current_stage = ${"production_planning_received"},
          workflow_status = ${"sent_to_production_planning"},
          updated_by_name = ${parsed.actionByName},
          updated_at = NOW()
      WHERE jobbing_order_id = ${BigInt(jobbingOrderId)}
    `)

    const createdStage = await tx.$queryRaw<{ jobbing_order_stage_id: bigint }[]>(Prisma.sql`
      INSERT INTO workflow.jobbing_order_stage (
        jobbing_order_id,
        department_code,
        stage_code,
        stage_status,
        stage_title,
        notes,
        action_by_name,
        acted_at
      )
      VALUES (
        ${BigInt(jobbingOrderId)},
        ${"sales"},
        ${"sales_order_approval"},
        ${"completed"},
        ${stageLabels.sales_order_approval},
        ${parsed.salesNotes || null},
        ${parsed.actionByName},
        ${new Date(parsed.approvalDate)}
      )
      RETURNING jobbing_order_stage_id
    `)

    const stageId = createdStage[0]?.jobbing_order_stage_id
    if (!stageId) throw new Error("Failed to create sales approval stage.")

    await tx.$executeRaw(Prisma.sql`
      INSERT INTO workflow.jobbing_order_notification (
        jobbing_order_id,
        jobbing_order_stage_id,
        recipient_department,
        title,
        message,
        notification_type
      )
      VALUES (
        ${BigInt(jobbingOrderId)},
        ${stageId},
        ${"production"},
        ${`Approved Order Ready for Planning: ${order.sales_order_number}`},
        ${`Sales approved order ${order.sales_order_number}. Production Planning can now take ownership.`},
        ${"sales-approved"}
      )
    `)
  }, { timeout: 120000, maxWait: 120000 })

  await sendWorkflowEmailNotification({
    toDepartment: "production",
    subject: "Approved Order Ready for Planning",
    message: `Sales approved the order linked to workflow job ${jobbingOrderId}.`,
  })
}
