CREATE SCHEMA IF NOT EXISTS workflow;

CREATE TABLE IF NOT EXISTS workflow.jobbing_order (
  jobbing_order_id BIGSERIAL PRIMARY KEY,
  estimate_number TEXT NOT NULL,
  estimate_accepted_at TIMESTAMP NULL,
  client_name TEXT NOT NULL,
  stream_name TEXT NOT NULL DEFAULT 'Rectagrid',
  technical_requirements TEXT NULL,
  sales_notes TEXT NULL,
  drawing_notes TEXT NULL,
  production_notes TEXT NULL,
  current_department TEXT NOT NULL,
  current_stage TEXT NOT NULL,
  workflow_status TEXT NOT NULL,
  sales_order_number TEXT NULL,
  product_code TEXT NULL,
  sqm NUMERIC(18,4) NULL,
  qty NUMERIC(18,4) NULL,
  sales_order_approval_at TIMESTAMP NULL,
  linked_sales_order_id BIGINT NULL,
  created_by_name TEXT NULL,
  updated_by_name TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_jobbing_order_estimate_stream
  ON workflow.jobbing_order (estimate_number, stream_name);

CREATE INDEX IF NOT EXISTS ix_jobbing_order_department
  ON workflow.jobbing_order (current_department);

CREATE INDEX IF NOT EXISTS ix_jobbing_order_status
  ON workflow.jobbing_order (workflow_status);

CREATE INDEX IF NOT EXISTS ix_jobbing_order_sales_order_number
  ON workflow.jobbing_order (sales_order_number);

CREATE TABLE IF NOT EXISTS workflow.jobbing_order_stage (
  jobbing_order_stage_id BIGSERIAL PRIMARY KEY,
  jobbing_order_id BIGINT NOT NULL REFERENCES workflow.jobbing_order (jobbing_order_id) ON DELETE CASCADE,
  department_code TEXT NOT NULL,
  stage_code TEXT NOT NULL,
  stage_status TEXT NOT NULL,
  stage_title TEXT NOT NULL,
  notes TEXT NULL,
  action_by_name TEXT NULL,
  acted_at TIMESTAMP NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_jobbing_order_stage_jobbing_order_id
  ON workflow.jobbing_order_stage (jobbing_order_id);

CREATE INDEX IF NOT EXISTS ix_jobbing_order_stage_department_code
  ON workflow.jobbing_order_stage (department_code);

CREATE TABLE IF NOT EXISTS workflow.jobbing_order_attachment (
  jobbing_order_attachment_id BIGSERIAL PRIMARY KEY,
  jobbing_order_id BIGINT NOT NULL REFERENCES workflow.jobbing_order (jobbing_order_id) ON DELETE CASCADE,
  jobbing_order_stage_id BIGINT NULL REFERENCES workflow.jobbing_order_stage (jobbing_order_stage_id) ON DELETE SET NULL,
  attachment_role TEXT NOT NULL,
  file_name TEXT NOT NULL,
  original_file_name TEXT NOT NULL,
  mime_type TEXT NULL,
  storage_path TEXT NOT NULL,
  file_size_bytes BIGINT NULL,
  uploaded_by_name TEXT NULL,
  notes TEXT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_jobbing_order_attachment_jobbing_order_id
  ON workflow.jobbing_order_attachment (jobbing_order_id);

CREATE INDEX IF NOT EXISTS ix_jobbing_order_attachment_stage_id
  ON workflow.jobbing_order_attachment (jobbing_order_stage_id);

CREATE TABLE IF NOT EXISTS workflow.jobbing_order_notification (
  jobbing_order_notification_id BIGSERIAL PRIMARY KEY,
  jobbing_order_id BIGINT NOT NULL REFERENCES workflow.jobbing_order (jobbing_order_id) ON DELETE CASCADE,
  jobbing_order_stage_id BIGINT NULL REFERENCES workflow.jobbing_order_stage (jobbing_order_stage_id) ON DELETE SET NULL,
  recipient_department TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_jobbing_order_notification_recipient_read
  ON workflow.jobbing_order_notification (recipient_department, is_read);

CREATE INDEX IF NOT EXISTS ix_jobbing_order_notification_jobbing_order_id
  ON workflow.jobbing_order_notification (jobbing_order_id);
