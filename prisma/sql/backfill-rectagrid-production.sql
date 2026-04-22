BEGIN;

WITH eligible_sales_orders AS (
  SELECT
    so.sales_order_id,
    so.sales_order_number,
    COALESCE(c.client_name, 'Unknown Client') AS client_name,
    so.entry_product_code,
    so.entry_description_1,
    so.entry_description_2,
    so.entry_description_3,
    so.entry_sqm,
    so.entry_qty,
      so.entry_sales_order_approval_at,
      so.entry_production_issued_at,
      so.entry_start_at,
      so.entry_x_works_date,
      so.entry_revised_x_works_date,
      so.entry_revised_due_date
  FROM sales.sales_order so
  LEFT JOIN app_core.client c
    ON c.client_id = so.client_id
  WHERE (
    so.source_system = 'RECTAGRID_IMPORT'
    OR so.sales_order_number ILIKE 'TEST-SO-%'
  )
    AND NOT EXISTS (
      SELECT 1
      FROM production_jobbing.rectagrid_job job
      WHERE job.sales_order_id = so.sales_order_id
    )
),
inserted_jobs AS (
  INSERT INTO production_jobbing.rectagrid_job (
    sales_order_id,
    entry_sales_order_number,
    entry_client_name,
    entry_product_code,
    entry_description_1,
    entry_description_2,
    entry_description_3,
    entry_sqm,
    entry_qty,
    entry_sales_order_approval_at,
    entry_production_issued_at,
    entry_start_at,
    entry_x_works_date,
    entry_revised_x_works_date,
    entry_revised_due_date,
    current_step_code,
    current_step_name,
    job_status
  )
  SELECT
    sales_order_id,
    sales_order_number,
    client_name,
    entry_product_code,
    entry_description_1,
    entry_description_2,
    entry_description_3,
    entry_sqm,
    entry_qty,
    entry_sales_order_approval_at,
    entry_production_issued_at,
    entry_start_at,
    entry_x_works_date,
    entry_revised_x_works_date,
    entry_revised_due_date,
    'PUNCHING',
    'Punching',
    'OPEN'
  FROM eligible_sales_orders
  RETURNING rectagrid_job_id
),
step_templates AS (
  SELECT *
  FROM (
    VALUES
      (1, 'PUNCHING', 'Punching', 'PUNCHING', 4),
      (2, 'MILLING', 'Milling', 'MILLING', 3),
      (3, 'FABRICATION', 'Fabrication', 'FABRICATION', 4),
      (4, 'FINISHING', 'Finishing', 'FINISHING', 3),
      (5, 'QM', 'QM / Invoicing', 'QM', 1)
  ) AS template(step_no, step_code, step_name, work_center_code, planned_days)
),
jobs_without_steps AS (
  SELECT
    job.rectagrid_job_id,
    job.calc_due_start_date
  FROM production_jobbing.rectagrid_job job
  WHERE NOT EXISTS (
    SELECT 1
    FROM production_jobbing.rectagrid_step step
    WHERE step.rectagrid_job_id = job.rectagrid_job_id
  )
),
expanded_steps AS (
  SELECT
    job.rectagrid_job_id,
    template.step_no,
    template.step_code,
    template.step_name,
    template.work_center_code,
    template.planned_days,
    COALESCE(
      SUM(template.planned_days) OVER (
        PARTITION BY job.rectagrid_job_id
        ORDER BY template.step_no
        ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING
      ),
      0
    ) AS prior_days
  FROM jobs_without_steps job
  CROSS JOIN step_templates template
)
INSERT INTO production_jobbing.rectagrid_step (
  rectagrid_job_id,
  step_no,
  step_code,
  step_name,
  work_center_id,
  entry_planned_days,
  entry_planned_start_date,
  entry_planned_end_date,
  entry_status,
  calc_is_complete
)
SELECT
  expanded.rectagrid_job_id,
  expanded.step_no,
  expanded.step_code,
  expanded.step_name,
  wc.work_center_id,
  expanded.planned_days,
  production_jobbing.fn_add_working_days_from_date(job.calc_due_start_date, expanded.prior_days),
  production_jobbing.fn_add_working_days_from_date(job.calc_due_start_date, expanded.prior_days + expanded.planned_days - 1),
  'N',
  false
FROM expanded_steps expanded
INNER JOIN production_jobbing.rectagrid_job job
  ON job.rectagrid_job_id = expanded.rectagrid_job_id
LEFT JOIN app_core.work_center wc
  ON wc.work_center_code = expanded.work_center_code;

COMMIT;
