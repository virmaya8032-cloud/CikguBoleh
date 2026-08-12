import { cookies } from "next/headers";
import { ADMIN_COOKIE } from "@/lib/constants";
import { verifySessionToken, type SessionPayload } from "@/lib/session";

/** Authoritative server-side check for admin API routes. */
export async function requireAdmin(): Promise<SessionPayload | null> {
  return verifySessionToken(cookies().get(ADMIN_COOKIE)?.value);
}
