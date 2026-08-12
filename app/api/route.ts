import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Pemeriksa konfigurasi (SELAMAT — tiada nilai rahsia didedahkan, hanya
 * status "set" dan bentuk format). Guna untuk mengesahkan env var di Vercel
 * selepas redeploy. Padam route ini selepas selesai jika mahu.
 */
export async function GET() {
  const email = process.env.ADMIN_EMAIL || "";
  const hash = process.env.ADMIN_PASSWORD_HASH || "";
  const secret = process.env.ADMIN_SESSION_SECRET || "";

  return NextResponse.json({
    ADMIN_EMAIL: {
      set: Boolean(email),
      valid_email_format: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    },
    ADMIN_PASSWORD_HASH: {
      set: Boolean(hash),
      looks_like_bcrypt_OK: hash.startsWith("$2"),          // BETUL jika true
      looks_like_apikey_WRONG: /^(sk_|re_|pk_)/.test(hash), // SALAH jika true
      length: hash.length,
    },
    ADMIN_SESSION_SECRET: {
      set: Boolean(secret),
      length: secret.length,
    },
    DATABASE_URL: { set: Boolean(process.env.DATABASE_URL) },
    NODE_ENV: process.env.NODE_ENV,
  });
}
