import { Prisma } from "@prisma/client"
import { executeSafeQuery } from "@/lib/db/queries"
import type { PerformanceDashboardFilters, PerformanceDashboardOption } from "@/types/mentis"

export interface PerformanceUnifiedRow {
  productionLine: string
  salesOrderNumber: string | null
  clientName: string | null
  productCode: string | null
  description1: string | null
  description2: string | null
  description3: string | null
  qty: number | null
  sqm: number | null
  approvalDate: string | null
  startDate: string | null
  xWorksDate: string | null
  dueDate: string | null
  revisedDueDate: string | null
  effectiveDueDate: string | null
  currentDepartment: string | null
  worksOrder: string | null
  worksOrder2: string | null
  worksOrder3: string | null
  worksOrder4: string | null
  actualDays: number | null
  plannedDays: number | null
  stageStatus1: string | null
  stageStatus2: string | null
  stageStatus3: string | null
  stageStatus4: string | null
  finalStageEndDate: string | null
  completionStatus: string | null
}

export interface PerformanceDashboardKpiRow {
  totalOrders: number
  activeOrders: number
  overdueOrders: number
  dueNext7Days: number
  completedOrders: number
  onTimeRatePct: number | null
  lateRatePct: number | null
  avgActualDays: number | null
  avgVarianceDays: number | null
}

export interface PerformanceDashboardByLineRow {
  productionLine: string
  totalOrders: number
  activeOrders: number
  overdueOrders: number
  completedOrders: number
  avgActualDays: number | null
  avgVarianceDays: number | null
}

export interface PerformanceDashboardWeeklyTrendRow {
  yearNum: number
  weekNum: number
  totalOrders: number
  completedOrders: number
  overdueOrders: number
  totalQty: number | null
}

export interface PerformanceDashboardByClientRow {
  client: string
  totalOrders: number
  totalQty: number | null
  overdueOrders: number
}

export interface PerformanceDashboardByDepartmentRow {
  productionLine: string
  currentDepartment: string
  totalOrders: number
  totalQty: number | null
}

export interface PerformanceDashboardExceptionViewRow {
  productionLine: string
  salesOrderNumber: string | null
  client: string | null
  productCode: string | null
  currentDepartment: string | null
  effectiveDueDate: string | null
  finalStageEndDate: string | null
  completionStatus: string | null
  qty: number | null
  plannedDays: number | null
  actualDays: number | null
  daysVariance: number | null
}

export interface PerformanceEfficiencyViewRow {
  productionLine: string
  dueWeek: string
  totalQty: number | null
  qtyOutstanding: number | null
  qtyCompleted: number | null
  efficiency: number | null
  totalOrders: number | null
  completedOrders: number | null
  openOrders: number | null
}

function buildUnifiedWhere(filters: PerformanceDashboardFilters) {
  const conditions: Prisma.Sql[] = [Prisma.sql`1 = 1`]

  if (filters.startDate) {
    conditions.push(Prisma.sql`effective_due_date IS NOT NULL AND effective_due_date >= ${filters.startDate}::date`)
  }

  if (filters.endDate) {
    conditions.push(Prisma.sql`effective_due_date IS NOT NULL AND effective_due_date <= ${filters.endDate}::date`)
  }

  if (filters.productionLine !== "all") {
    conditions.push(Prisma.sql`production_line = ${filters.productionLine}`)
  }

  if (filters.client !== "all") {
    conditions.push(Prisma.sql`client = ${filters.client}`)
  }

  if (filters.department !== "all") {
    conditions.push(Prisma.sql`current_department = ${filters.department}`)
  }

  if (filters.productCode) {
    conditions.push(Prisma.sql`COALESCE(product_code, '') ILIKE ${`%${filters.productCode}%`}`)
  }

  return Prisma.join(conditions, " AND ")
}

function buildExceptionsWhere(filters: PerformanceDashboardFilters) {
  const conditions: Prisma.Sql[] = [Prisma.sql`1 = 1`]

  if (filters.startDate) {
    conditions.push(Prisma.sql`effective_due_date IS NOT NULL AND effective_due_date >= ${filters.startDate}::date`)
  }

  if (filters.endDate) {
    conditions.push(Prisma.sql`effective_due_date IS NOT NULL AND effective_due_date <= ${filters.endDate}::date`)
  }

  if (filters.productionLine !== "all") {
    conditions.push(Prisma.sql`production_line = ${filters.productionLine}`)
  }

  if (filters.client !== "all") {
    conditions.push(Prisma.sql`client = ${filters.client}`)
  }

  if (filters.department !== "all") {
    conditions.push(Prisma.sql`current_department = ${filters.department}`)
  }

  if (filters.productCode) {
    conditions.push(Prisma.sql`COALESCE(product_code, '') ILIKE ${`%${filters.productCode}%`}`)
  }

  return Prisma.join(conditions, " AND ")
}

export async function findPerformanceUnifiedRows(filters: PerformanceDashboardFilters) {
  return executeSafeQuery<PerformanceUnifiedRow[]>(
    Prisma.sql`
      SELECT
        production_line AS "productionLine",
        sale_order_number AS "salesOrderNumber",
        client AS "clientName",
        product_code AS "productCode",
        description_1 AS "description1",
        description_2 AS "description2",
        description_3 AS "description3",
        qty::float8 AS qty,
        sqm::float8 AS sqm,
        approval_date::text AS "approvalDate",
        start_date::text AS "startDate",
        x_works_date::text AS "xWorksDate",
        due_date::text AS "dueDate",
        revised_due_date::text AS "revisedDueDate",
        effective_due_date::text AS "effectiveDueDate",
        current_department AS "currentDepartment",
        works_order AS "worksOrder",
        works_order2 AS "worksOrder2",
        works_order3 AS "worksOrder3",
        works_order4 AS "worksOrder4",
        actual_days::float8 AS "actualDays",
        planned_days::float8 AS "plannedDays",
        stage_status_1 AS "stageStatus1",
        stage_status_2 AS "stageStatus2",
        stage_status_3 AS "stageStatus3",
        stage_status_4 AS "stageStatus4",
        final_stage_end_date::text AS "finalStageEndDate",
        completion_status AS "completionStatus"
      FROM public.vw_production_orders_unified
      WHERE ${buildUnifiedWhere(filters)}
      ORDER BY effective_due_date DESC NULLS LAST, sale_order_number ASC
    `,
    [],
  )
}

export async function findPerformanceDashboardFilters() {
  const result = await executeSafeQuery<
    Array<{
      lines: PerformanceDashboardOption[] | null
      clients: PerformanceDashboardOption[] | null
      departments: PerformanceDashboardOption[] | null
      productCodes: string[] | null
    }>
  >(
    Prisma.sql`
      SELECT
        COALESCE(
          (
            SELECT JSON_AGG(line_rows ORDER BY line_rows.count DESC, line_rows.label ASC)
            FROM (
              SELECT production_line AS value, production_line AS label, COUNT(*)::int AS count
              FROM public.vw_production_orders_unified
              GROUP BY production_line
            ) AS line_rows
          ),
          '[]'::json
        ) AS lines,
        COALESCE(
          (
            SELECT JSON_AGG(client_rows ORDER BY client_rows.count DESC, client_rows.label ASC)
            FROM (
              SELECT client AS value, client AS label, COUNT(*)::int AS count
              FROM public.vw_production_orders_unified
              WHERE client IS NOT NULL
              GROUP BY client
            ) AS client_rows
          ),
          '[]'::json
        ) AS clients,
        COALESCE(
          (
            SELECT JSON_AGG(department_rows ORDER BY department_rows.count DESC, department_rows.label ASC)
            FROM (
              SELECT current_department AS value, current_department AS label, COUNT(*)::int AS count
              FROM public.vw_production_orders_unified
              WHERE current_department IS NOT NULL
              GROUP BY current_department
            ) AS department_rows
          ),
          '[]'::json
        ) AS departments,
        COALESCE(
          (
            SELECT JSON_AGG(code_rows.product_code ORDER BY code_rows.product_code ASC)
            FROM (
              SELECT DISTINCT product_code
              FROM public.vw_production_orders_unified
              WHERE product_code IS NOT NULL
            ) AS code_rows
          ),
          '[]'::json
        ) AS "productCodes"
    `,
    [],
  )

  return {
    ...result,
    data: result.data[0] ?? {
      lines: [],
      clients: [],
      departments: [],
      productCodes: [],
    },
  }
}

export async function findPerformanceExceptions(filters: PerformanceDashboardFilters) {
  return executeSafeQuery<PerformanceDashboardExceptionViewRow[]>(
    Prisma.sql`
      SELECT
        production_line AS "productionLine",
        sale_order_number AS "salesOrderNumber",
        client,
        product_code AS "productCode",
        current_department AS "currentDepartment",
        effective_due_date::text AS "effectiveDueDate",
        final_stage_end_date::text AS "finalStageEndDate",
        completion_status AS "completionStatus",
        qty::float8 AS qty,
        planned_days::float8 AS "plannedDays",
        actual_days::float8 AS "actualDays",
        days_variance::float8 AS "daysVariance"
      FROM public.vw_production_dashboard_exceptions
      WHERE ${buildExceptionsWhere(filters)}
      ORDER BY days_variance DESC NULLS LAST, effective_due_date ASC NULLS LAST, sale_order_number ASC NULLS LAST
    `,
    [],
  )
}

export async function findPerformanceEfficiency(filters: PerformanceDashboardFilters) {
  const rows = await executeSafeQuery<PerformanceEfficiencyViewRow[]>(
    Prisma.sql`
      SELECT
        production_line AS "productionLine",
        due_week::text AS "dueWeek",
        total_qty::float8 AS "totalQty",
        qty_outstanding::float8 AS "qtyOutstanding",
        qty_completed::float8 AS "qtyCompleted",
        efficiency::float8 AS efficiency,
        total_orders::float8 AS "totalOrders",
        completed_orders::float8 AS "completedOrders",
        open_orders::float8 AS "openOrders"
      FROM (
        SELECT
          'Rectagrid'::text AS production_line,
          due_week,
          total_qty,
          qty_outstanding,
          qty_completed,
          efficiency,
          NULL::numeric AS total_orders,
          NULL::numeric AS completed_orders,
          NULL::numeric AS open_orders
        FROM public.vw_rectagrid_efficiency
        UNION ALL
        SELECT
          'Mentex'::text AS production_line,
          due_week,
          total_qty,
          qty_outstanding,
          qty_completed,
          efficiency,
          total_orders::numeric,
          completed_orders::numeric,
          open_orders::numeric
        FROM public.vw_mentex_efficiency
        UNION ALL
        SELECT
          'Handrailing'::text AS production_line,
          due_week,
          total_qty,
          qty_outstanding,
          qty_completed,
          efficiency,
          NULL::numeric AS total_orders,
          NULL::numeric AS completed_orders,
          NULL::numeric AS open_orders
        FROM public.vw_handrailing_efficiency
        UNION ALL
        SELECT
          'Press Shop'::text AS production_line,
          due_week,
          total_qty,
          qty_outstanding,
          qty_completed,
          efficiency,
          NULL::numeric AS total_orders,
          NULL::numeric AS completed_orders,
          NULL::numeric AS open_orders
        FROM public.vw_press_shop_efficiency
        UNION ALL
        SELECT
          'Punching'::text AS production_line,
          due_week,
          total_qty,
          qty_outstanding,
          qty_completed,
          efficiency,
          NULL::numeric AS total_orders,
          NULL::numeric AS completed_orders,
          NULL::numeric AS open_orders
        FROM public.vw_punching_efficiency
        UNION ALL
        SELECT
          'Mentrail'::text AS production_line,
          due_week,
          total_qty,
          qty_outstanding,
          qty_completed,
          efficiency,
          NULL::numeric AS total_orders,
          NULL::numeric AS completed_orders,
          NULL::numeric AS open_orders
        FROM public.vw_mentrail_efficiency
      ) AS efficiency_rows
      WHERE ${filters.productionLine === "all" ? Prisma.sql`1 = 1` : Prisma.sql`production_line = ${filters.productionLine}`}
      ORDER BY production_line ASC, due_week::text ASC
    `,
    [],
  )

  return rows
}

export async function findPerformanceSummaryViews() {
  const [kpis, byLine] = await Promise.all([
    executeSafeQuery<PerformanceDashboardKpiRow[]>(
      Prisma.sql`
        SELECT
          total_orders::float8 AS "totalOrders",
          active_orders::float8 AS "activeOrders",
          overdue_orders::float8 AS "overdueOrders",
          due_next_7_days::float8 AS "dueNext7Days",
          completed_orders::float8 AS "completedOrders",
          on_time_rate_pct::float8 AS "onTimeRatePct",
          late_rate_pct::float8 AS "lateRatePct",
          avg_actual_days::float8 AS "avgActualDays",
          avg_variance_days::float8 AS "avgVarianceDays"
        FROM public.vw_production_dashboard_kpis
      `,
      [],
    ),
    executeSafeQuery<PerformanceDashboardByLineRow[]>(
      Prisma.sql`
        SELECT
          production_line AS "productionLine",
          total_orders::float8 AS "totalOrders",
          active_orders::float8 AS "activeOrders",
          overdue_orders::float8 AS "overdueOrders",
          completed_orders::float8 AS "completedOrders",
          avg_actual_days::float8 AS "avgActualDays",
          avg_variance_days::float8 AS "avgVarianceDays"
        FROM public.vw_production_dashboard_by_line
        ORDER BY production_line ASC
      `,
      [],
    ),
  ])

  return {
    dataSource: kpis.dataSource === "database" && byLine.dataSource === "database" ? "database" : "unavailable",
    data: {
      kpis: kpis.data[0] ?? null,
      byLine: byLine.data,
    },
  } as const
}

export async function findPerformanceTrendViews() {
  const [weeklyTrend, byClient, byDepartment] = await Promise.all([
    executeSafeQuery<PerformanceDashboardWeeklyTrendRow[]>(
      Prisma.sql`
        SELECT
          year_num AS "yearNum",
          week_num AS "weekNum",
          total_orders::float8 AS "totalOrders",
          completed_orders::float8 AS "completedOrders",
          overdue_orders::float8 AS "overdueOrders",
          total_qty::float8 AS "totalQty"
        FROM public.vw_production_dashboard_weekly_trend
        ORDER BY year_num ASC, week_num ASC
      `,
      [],
    ),
    executeSafeQuery<PerformanceDashboardByClientRow[]>(
      Prisma.sql`
        SELECT
          client,
          total_orders::float8 AS "totalOrders",
          total_qty::float8 AS "totalQty",
          overdue_orders::float8 AS "overdueOrders"
        FROM public.vw_production_dashboard_by_client
        ORDER BY total_orders DESC, client ASC
      `,
      [],
    ),
    executeSafeQuery<PerformanceDashboardByDepartmentRow[]>(
      Prisma.sql`
        SELECT
          production_line AS "productionLine",
          current_department AS "currentDepartment",
          total_orders::float8 AS "totalOrders",
          total_qty::float8 AS "totalQty"
        FROM public.vw_production_dashboard_by_department
        ORDER BY production_line ASC, total_orders DESC, current_department ASC
      `,
      [],
    ),
  ])

  return {
    dataSource:
      weeklyTrend.dataSource === "database" && byClient.dataSource === "database" && byDepartment.dataSource === "database"
        ? "database"
        : "unavailable",
    data: {
      weeklyTrend: weeklyTrend.data,
      byClient: byClient.data,
      byDepartment: byDepartment.data,
    },
  } as const
}
