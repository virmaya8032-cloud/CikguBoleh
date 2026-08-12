// Best-effort in-memory rate limiter (per serverless instance). Good enough to
// blunt brute force / spam without external infra. For strict global limits,
// back this with a shared store (e.g. Upstash) later.
const g = globalThis as unknown as { __cb_rl?: Map<string, { count: number; reset: number }> };
g.__cb_rl ??= new Map();

export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  const rec = g.__cb_rl!.get(key);
  if (!rec || rec.reset < now) {
    g.__cb_rl!.set(key, { count: 1, reset: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }
  rec.count += 1;
  if (rec.count > limit) return { ok: false, retryAfter: Math.ceil((rec.reset - now) / 1000) };
  return { ok: true, retryAfter: 0 };
}

export function clientIp(req: Request): string {
  const h = req.headers;
  return (h.get("x-forwarded-for")?.split(",")[0].trim()) || h.get("x-real-ip") || "unknown";
}
