/**
 * Sesi pengguna (berasingan daripada sesi admin). Token HMAC-SHA256 guna Web
 * Crypto supaya selamat di Edge + Node. Cookie: cb_user.
 */
const enc = new TextEncoder();
export const USER_COOKIE = "cb_user";

function secret(): string {
  return process.env.ADMIN_SESSION_SECRET || "cikguboleh-dev-session-secret-change-me";
}
function b64urlEncode(bytes: Uint8Array): string {
  let bin = ""; bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64urlToBytes(s: string): Uint8Array {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(s.length / 4) * 4, "=");
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}
async function key(): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", enc.encode(secret()), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

export interface UserPayload { uid: string; email: string; name: string; role: "user" | "admin"; exp: number }

export async function createUserToken(u: Omit<UserPayload, "exp">, ttlSeconds = 60 * 60 * 24 * 7): Promise<string> {
  const payload: UserPayload = { ...u, exp: Math.floor(Date.now() / 1000) + ttlSeconds };
  const body = b64urlEncode(enc.encode(JSON.stringify(payload)));
  const sig = await crypto.subtle.sign("HMAC", await key(), enc.encode(body));
  return `${body}.${b64urlEncode(new Uint8Array(sig))}`;
}

export async function verifyUserToken(token?: string | null): Promise<UserPayload | null> {
  if (!token || !token.includes(".")) return null;
  const [body, sig] = token.split(".");
  try {
    const ok = await crypto.subtle.verify("HMAC", await key(), b64urlToBytes(sig), enc.encode(body));
    if (!ok) return null;
    const payload = JSON.parse(new TextDecoder().decode(b64urlToBytes(body))) as UserPayload;
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch { return null; }
}
