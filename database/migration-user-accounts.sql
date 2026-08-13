-- ============================================================
-- CikguBoleh — migration: akaun pengguna (user accounts)
-- Selamat & idempotent. TIDAK memadam data sedia ada.
-- Jalankan di Supabase → SQL Editor.
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id            BIGSERIAL PRIMARY KEY,
  email         TEXT NOT NULL,
  display_name  TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'user',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_login_at TIMESTAMPTZ,
  last_seen_at  TIMESTAMPTZ
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users (lower(email));
CREATE INDEX IF NOT EXISTS idx_users_created ON users (created_at);

-- Kaitkan analitik & feedback kepada pengguna (nullable; tetamu = NULL)
ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS user_id BIGINT;
ALTER TABLE feedback         ADD COLUMN IF NOT EXISTS user_id BIGINT;
CREATE INDEX IF NOT EXISTS idx_events_user   ON analytics_events (user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_user ON feedback (user_id);
