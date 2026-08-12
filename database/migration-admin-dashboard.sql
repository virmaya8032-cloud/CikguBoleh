-- ============================================================
-- CikguBoleh — migration: admin dashboard, email, audit log
-- Selamat dijalankan berulang (idempotent). TIDAK memadam data.
-- Jalankan di Supabase → SQL Editor.
-- ============================================================

-- Feedback: kolum untuk auto-reply, status email balasan admin, approval email
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS auto_reply_sent           BOOLEAN     DEFAULT false;
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS auto_reply_sent_at        TIMESTAMPTZ;
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS auto_reply_status         TEXT;
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS auto_reply_message_id     TEXT;
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS admin_reply_email_status  TEXT;
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS admin_reply_message_id    TEXT;
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS approval_email_sent       BOOLEAN     DEFAULT false;
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS approval_email_sent_at    TIMESTAMPTZ;

-- Sejarah balasan (satu feedback boleh banyak balasan)
CREATE TABLE IF NOT EXISTS feedback_replies (
  id                  BIGSERIAL PRIMARY KEY,
  feedback_id         BIGINT NOT NULL REFERENCES feedback(id) ON DELETE CASCADE,
  reply_message       TEXT NOT NULL,
  email_to            TEXT,
  email_subject       TEXT,
  email_status        TEXT,
  provider_message_id TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_replies_feedback ON feedback_replies (feedback_id);

-- Audit log tindakan admin
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id           BIGSERIAL PRIMARY KEY,
  action       TEXT NOT NULL,
  target_type  TEXT,
  target_id    TEXT,
  metadata     JSONB DEFAULT '{}'::jsonb,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_created ON admin_audit_log (created_at);
CREATE INDEX IF NOT EXISTS idx_audit_action  ON admin_audit_log (action);

-- Index tambahan untuk prestasi dashboard
CREATE INDEX IF NOT EXISTS idx_events_created  ON analytics_events (created_at);
CREATE INDEX IF NOT EXISTS idx_events_name     ON analytics_events (event_name);
CREATE INDEX IF NOT EXISTS idx_events_tool     ON analytics_events (tool_slug);
CREATE INDEX IF NOT EXISTS idx_events_session  ON analytics_events (session_id);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback (status);
CREATE INDEX IF NOT EXISTS idx_feedback_public ON feedback (status, allow_public_display);
CREATE INDEX IF NOT EXISTS idx_feedback_created ON feedback (created_at);
