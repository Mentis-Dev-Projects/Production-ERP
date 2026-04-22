BEGIN;

DELETE FROM production_jobbing.rectagrid_step
WHERE rectagrid_job_id IN (
  SELECT rectagrid_job_id
  FROM production_jobbing.rectagrid_job
  WHERE entry_sales_order_number LIKE 'TEST-SO-%'
);

DELETE FROM production_jobbing.rectagrid_job
WHERE entry_sales_order_number LIKE 'TEST-SO-%';

DELETE FROM sales.sales_order
WHERE sales_order_number LIKE 'TEST-SO-%';

INSERT INTO app_core.client (client_name, is_active)
SELECT DISTINCT
  TRIM(import.client) AS client_name,
  true AS is_active
FROM public.app_import_rectagrid import
WHERE NULLIF(TRIM(import.client), '') IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM app_core.client client
    WHERE LOWER(client.client_name) = LOWER(TRIM(import.client))
  );

WITH prepared_import AS (
  SELECT
    NULLIF(TRIM(import.sale_order_number), '') AS sales_order_number,
    NULLIF(TRIM(import.client), '') AS client_name,
    NULLIF(TRIM(import.product_code), '') AS product_code,
    NULLIF(TRIM(import.description_1), '') AS description_1,
    NULLIF(TRIM(import.description_2), '') AS description_2,
    NULLIF(TRIM(import.description_3), '') AS description_3,
    CASE
      WHEN NULLIF(TRIM(import.sqm), '') IS NOT NULL AND TRIM(import.sqm) <> '0.0'
        THEN TRIM(import.sqm)::numeric
      ELSE NULL
    END AS sqm,
    CASE
      WHEN NULLIF(TRIM(import.qty), '') IS NOT NULL AND TRIM(import.qty) <> '0.0'
        THEN TRIM(import.qty)::numeric
      ELSE NULL
    END AS qty,
    CASE
      WHEN NULLIF(TRIM(import.sales_order_approval_date), '') IS NOT NULL AND TRIM(import.sales_order_approval_date) <> '0.0'
        THEN (timestamp '1899-12-30' + (TRIM(import.sales_order_approval_date)::numeric * interval '1 day'))
      ELSE NULL
    END AS sales_order_approval_at,
    CASE
      WHEN NULLIF(TRIM(import.issued_to_production), '') IS NOT NULL AND TRIM(import.issued_to_production) <> '0.0'
        THEN (timestamp '1899-12-30' + (TRIM(import.issued_to_production)::numeric * interval '1 day'))
      ELSE NULL
    END AS production_issued_at,
    CASE
      WHEN NULLIF(TRIM(import.start_date), '') IS NOT NULL AND TRIM(import.start_date) <> '0.0'
        THEN (timestamp '1899-12-30' + (TRIM(import.start_date)::numeric * interval '1 day'))
      ELSE NULL
    END AS start_at,
    CASE
      WHEN NULLIF(TRIM(import.x_works_date), '') IS NOT NULL AND TRIM(import.x_works_date) <> '0.0'
        THEN (date '1899-12-30' + TRIM(import.x_works_date)::numeric::int)
      ELSE NULL
    END AS x_works_date,
    CASE
      WHEN NULLIF(TRIM(import.revised_x_works_date), '') IS NOT NULL AND TRIM(import.revised_x_works_date) <> '0.0'
        THEN (date '1899-12-30' + TRIM(import.revised_x_works_date)::numeric::int)
      ELSE NULL
    END AS revised_x_works_date,
    CASE
      WHEN NULLIF(TRIM(import.revised_due_date), '') IS NOT NULL AND TRIM(import.revised_due_date) <> '0.0'
        THEN (date '1899-12-30' + TRIM(import.revised_due_date)::numeric::int)
      ELSE NULL
    END AS revised_due_date,
    import.imported_at,
    import.source_workbook
  FROM public.app_import_rectagrid import
  WHERE NULLIF(TRIM(import.sale_order_number), '') IS NOT NULL
),
aggregated_orders AS (
  SELECT
    prepared.sales_order_number,
    MIN(client.client_id) AS client_id,
    CASE
      WHEN COUNT(DISTINCT prepared.product_code) = 1 THEN MAX(prepared.product_code)
      ELSE 'MULTI'
    END AS entry_product_code,
    CASE
      WHEN COUNT(DISTINCT prepared.product_code) = 1 THEN MAX(prepared.description_1)
      ELSE 'Multiple products'
    END AS entry_description_1,
    CASE
      WHEN COUNT(DISTINCT prepared.product_code) = 1 THEN MAX(prepared.description_2)
      ELSE CONCAT(COUNT(DISTINCT prepared.product_code), ' products on order')
    END AS entry_description_2,
    CASE
      WHEN COUNT(DISTINCT prepared.product_code) = 1 THEN MAX(prepared.description_3)
      ELSE NULL
    END AS entry_description_3,
    SUM(COALESCE(prepared.sqm, 0)) AS entry_sqm,
    SUM(COALESCE(prepared.qty, 0)) AS entry_qty,
    MIN(prepared.sales_order_approval_at) AS entry_sales_order_approval_at,
    MIN(prepared.production_issued_at) AS entry_production_issued_at,
    MIN(prepared.start_at) AS entry_start_at,
    MAX(prepared.x_works_date) AS entry_x_works_date,
    MAX(prepared.revised_x_works_date) AS entry_revised_x_works_date,
    MAX(prepared.revised_due_date) AS entry_revised_due_date,
    'RECTAGRID_IMPORT' AS source_system,
    TO_CHAR(MAX(prepared.imported_at), 'YYYYMMDDHH24MISS') AS source_batch_id,
    prepared.sales_order_number AS source_row_key
  FROM prepared_import prepared
  INNER JOIN app_core.client client
    ON LOWER(client.client_name) = LOWER(prepared.client_name)
  GROUP BY prepared.sales_order_number
)
INSERT INTO sales.sales_order (
  sales_order_number,
  client_id,
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
  source_system,
  source_batch_id,
  source_row_key
)
SELECT
  aggregated.sales_order_number,
  aggregated.client_id,
  aggregated.entry_product_code,
  aggregated.entry_description_1,
  aggregated.entry_description_2,
  aggregated.entry_description_3,
  NULLIF(aggregated.entry_sqm, 0),
  NULLIF(aggregated.entry_qty, 0),
  aggregated.entry_sales_order_approval_at,
  aggregated.entry_production_issued_at,
  aggregated.entry_start_at,
  aggregated.entry_x_works_date,
  aggregated.entry_revised_x_works_date,
  aggregated.entry_revised_due_date,
  aggregated.source_system,
  aggregated.source_batch_id,
  aggregated.source_row_key
FROM aggregated_orders aggregated
ON CONFLICT (sales_order_number) DO NOTHING;

COMMIT;
