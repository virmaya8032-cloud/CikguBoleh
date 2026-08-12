import { Pool, type PoolClient, type QueryResultRow } from "pg";

/**
 * Serverless-safe Postgres access.
 *
 * A single Pool is cached on globalThis so repeated serverless invocations on a
 * warm Lambda reuse connections instead of opening a new one per request.
 * DATABASE_URL should point at Supabase's connection pooler (port 6543) in
 * production. When DATABASE_URL is absent the app falls back to an in-memory
 * store (see lib/store.ts) so local/dev still runs with zero setup.
 */

const g = globalThis as unknown as { __cb_pool?: Pool };

export function dbEnabled(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export function getPool(): Pool {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL tidak ditetapkan.");
  }
  if (!g.__cb_pool) {
    g.__cb_pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      // Supabase requires SSL; the pooler cert is managed, so don't hard-fail.
      ssl: { rejectUnauthorized: false },
      max: 3, // keep small: many serverless instances share the DB
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 8_000,
    });
  }
  return g.__cb_pool;
}

/** Parameterized query helper. Never interpolate user input into SQL text. */
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<T[]> {
  const pool = getPool();
  const res = await pool.query<T>(text, params as never[]);
  return res.rows;
}

export async function withClient<T>(fn: (c: PoolClient) => Promise<T>): Promise<T> {
  const client = await getPool().connect();
  try {
    return await fn(client);
  } finally {
    client.release();
  }
}

/** Light health check for the admin System tab. Never leaks credentials. */
export async function dbHealth(): Promise<{ ok: boolean; detail: string }> {
  if (!dbEnabled()) return { ok: false, detail: "In-memory (DATABASE_URL tidak ditetapkan)" };
  try {
    await query("SELECT 1");
    return { ok: true, detail: "Connected" };
  } catch {
    return { ok: false, detail: "Error" };
  }
}
