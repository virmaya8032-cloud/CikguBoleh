import bcrypt from "bcryptjs";

export { ADMIN_COOKIE } from "@/lib/constants";

// Dev default = bcrypt hash of "admin123". Override with ADMIN_PASSWORD_HASH in production.
const DEV_DEFAULT_HASH = "$2a$10$cVapuJ7DFTBjtsvGb2VoOucYhWOaHerra7fZ2D.r2nXINB72dsItm";

export function adminEmail(): string {
  return process.env.ADMIN_EMAIL || "admin@cikguboleh.my";
}

export function usingDevPassword(): boolean {
  return !process.env.ADMIN_PASSWORD_HASH;
}

function expectedHash(): string {
  return process.env.ADMIN_PASSWORD_HASH || DEV_DEFAULT_HASH;
}

/** Constant-time-ish compare via bcrypt. Returns true only if email+password match. */
export async function verifyCredentials(email: string, password: string): Promise<boolean> {
  const emailOk = email.trim().toLowerCase() === adminEmail().trim().toLowerCase();
  // Always run bcrypt to avoid leaking which field was wrong via timing.
  const passOk = await bcrypt.compare(password, expectedHash()).catch(() => false);
  return emailOk && passOk;
}
