-- ============================================================
-- CikguBoleh — migration: Murid Saya (senarai murid per-guru)
-- Idempotent & selamat. Data murid milik pengguna (user_id).
-- Jalankan di Supabase → SQL Editor.
-- ============================================================
CREATE TABLE IF NOT EXISTS students (
  id          BIGSERIAL PRIMARY KEY,
  user_id     BIGINT NOT NULL,
  name        TEXT NOT NULL,
  class_name  TEXT,
  dob         DATE,
  gender      TEXT,
  category    TEXT,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_students_user  ON students (user_id);
CREATE INDEX IF NOT EXISTS idx_students_class ON students (user_id, class_name);
