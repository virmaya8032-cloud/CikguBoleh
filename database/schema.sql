-- ============================================================
-- CikguBoleh — skema pangkalan data (Postgres / Supabase / Neon)
-- Jalankan sekali sebelum menetapkan DATABASE_URL.
-- ============================================================

-- ---------- Analitik (metadata sahaja, tiada data murid) ----------
CREATE TABLE IF NOT EXISTS analytics_events (
  id           BIGSERIAL PRIMARY KEY,
  session_id   TEXT        NOT NULL,
  event_name   TEXT        NOT NULL,
  tool_slug    TEXT,
  page_path    TEXT,
  device_type  TEXT,
  browser      TEXT,
  os           TEXT,
  referrer     TEXT,
  country      TEXT,
  metadata     JSONB       DEFAULT '{}'::jsonb,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_events_created  ON analytics_events (created_at);
CREATE INDEX IF NOT EXISTS idx_events_name     ON analytics_events (event_name);
CREATE INDEX IF NOT EXISTS idx_events_tool     ON analytics_events (tool_slug);
CREATE INDEX IF NOT EXISTS idx_events_session  ON analytics_events (session_id);

-- ---------- Maklum balas / Kata Cikgu ----------
-- status: pending | approved | rejected | hidden
-- display_name_mode: penuh | pertama | anonymous
CREATE TABLE IF NOT EXISTS feedback (
  id                    BIGSERIAL PRIMARY KEY,
  name                  TEXT        NOT NULL,
  email                 TEXT        NOT NULL,
  display_name_mode     TEXT        NOT NULL DEFAULT 'penuh',
  subject               TEXT,
  message               TEXT        NOT NULL,
  category              TEXT        NOT NULL DEFAULT 'Lain-lain',
  status                TEXT        NOT NULL DEFAULT 'pending',
  allow_public_display  BOOLEAN     NOT NULL DEFAULT false,
  admin_reply           TEXT,
  admin_replied_at      TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  approved_at           TIMESTAMPTZ,
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_feedback_status  ON feedback (status);
CREATE INDEX IF NOT EXISTS idx_feedback_public  ON feedback (status, allow_public_display);
CREATE INDEX IF NOT EXISTS idx_feedback_created ON feedback (created_at);

-- Nota: email TIDAK PERNAH dipaparkan kepada umum. Endpoint awam hanya
-- memulangkan display_name (terbitan), message, dan admin_reply.
