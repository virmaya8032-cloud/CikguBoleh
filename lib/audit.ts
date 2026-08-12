import { dbEnabled, query } from "@/lib/db";

const g = globalThis as unknown as { __cb_audit?: Array<Record<string, unknown>> };
g.__cb_audit ??= [];

export async function audit(action: string, targetType?: string, targetId?: string, metadata?: Record<string, unknown>) {
  // Never record secrets.
  try {
    if (dbEnabled()) {
      await query(
        `INSERT INTO admin_audit_log (action, target_type, target_id, metadata) VALUES ($1,$2,$3,$4)`,
        [action, targetType ?? null, targetId ?? null, JSON.stringify(metadata ?? {})]
      );
    } else {
      g.__cb_audit!.unshift({ action, targetType, targetId, metadata, created_at: new Date().toISOString() });
    }
  } catch {
    /* audit must never break the request */
  }
}
