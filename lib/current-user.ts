import { cookies } from "next/headers";
import { USER_COOKIE, verifyUserToken, type UserPayload } from "@/lib/user-session";

/** Identiti pengguna daripada sesi (server-side). Jangan percaya frontend. */
export async function currentUser(): Promise<UserPayload | null> {
  return verifyUserToken(cookies().get(USER_COOKIE)?.value);
}
