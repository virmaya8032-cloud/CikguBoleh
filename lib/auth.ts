import crypto from "crypto";

export { ADMIN_COOKIE } from "@/lib/constants";

// SHA-256 of "admin123" — DEV DEFAULT ONLY. Override with ADMIN_PASSWORD_HASH in .env.
const DEV_DEFAULT_HASH = "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9";

export function sha256(s: string): string {
  return crypto.createHash("sha256").update(s).digest("hex");
}

export function expectedHash(): string {
  return process.env.ADMIN_PASSWORD_HASH || DEV_DEFAULT_HASH;
}

export function usingDevPassword(): boolean {
  return !process.env.ADMIN_PASSWORD_HASH;
}

/** Cookie token derived from the password hash + a per-deploy salt. */
export function sessionToken(): string {
  const salt = process.env.ADMIN_SESSION_SALT || "cikguboleh-session";
  return sha256(expectedHash() + salt);
}

export function verifyPassword(password: string): boolean {
  return sha256(password) === expectedHash();
}
