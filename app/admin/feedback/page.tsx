"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Check, X, EyeOff, Trash2, Reply } from "lucide-react";

interface Fb {
  id: string; name: string; email: string; subject: string; message: string; category: string;
  status: string; allow_public_display: boolean; admin_reply: string | null; created_at: string;
  display_name_mode: string;
}
interface Counts { baru: number; pending: number; approved: number; rejected: number; public: number }

const FILTERS = ["all", "pending", "approved", "rejected", "hidden"] as const;

export default function AdminFeedback() {
  const [items, setItems] = useState<Fb[]>([]);
  const [counts, setCounts] = useState<Counts | null>(null);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("pending");
  const [replyFor, setReplyFor] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const load = useCallback(async () => {
    const q = filter === "all" ? "" : `?status=${filter}`;
    const res = await fetch(`/api/admin/feedback${q}`);
    if (res.ok) { const d = await res.json(); setItems(d.items); setCounts(d.counts); }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  async function act(id: string, patch: Record<string, unknown>) {
    await fetch("/api/admin/feedback", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, ...patch }) });
    load();
  }
  async function del(id: string) {
    if (!confirm("Padam mesej ini?")) return;
    await fetch("/api/admin/feedback", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    load();
  }
  async function sendReply(id: string) {
    await act(id, { admin_reply: replyText });
    setReplyFor(null); setReplyText("");
  }

  return (
    <AdminShell title="Feedback">
      {counts && (
        <div className="mb-4 flex flex-wrap gap-2 text-xs">
          {[["Pending", counts.pending], ["Approved", counts.approved], ["Rejected", counts.rejected], ["Public", counts.public]].map(([k, v]) => (
            <span key={k as string} className="surface rounded-full px-3 py-1 font-semibold">{k}: {v}</span>
          ))}
        </div>
      )}
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${filter === f ? "bg-teal-600 text-white" : "surface muted"}`}>{f}</button>
        ))}
      </div>

      {items.length === 0 && <p className="text-sm muted">Tiada mesej dalam kategori ini.</p>}
      <div className="space-y-3">
        {items.map((f) => (
          <div key={f.id} className="surface rounded-2xl p-4 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-semibold">{f.name}</span>
                <span className="ml-2 text-xs muted">{f.email}</span>
                <span className="ml-2 rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-semibold uppercase dark:bg-white/10">{f.category}</span>
              </div>
              <div className="flex items-center gap-2 text-xs muted">
                <span className={`rounded-full px-2 py-0.5 font-semibold ${f.status === "approved" ? "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300" : f.status === "pending" ? "bg-marigold-100 text-marigold-700 dark:bg-marigold-900/40 dark:text-marigold-300" : "bg-black/5 dark:bg-white/10"}`}>{f.status}</span>
                {f.allow_public_display && <span>· izin awam</span>}
              </div>
            </div>
            {f.subject && <p className="mt-2 text-sm font-medium">{f.subject}</p>}
            <p className="mt-1 text-sm">{f.message}</p>
            {f.admin_reply && <div className="mt-2 rounded-lg bg-teal-50 p-2 text-sm dark:bg-teal-950/40"><b className="text-teal-700 dark:text-teal-300">Balasan: </b>{f.admin_reply}</div>}

            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={() => act(f.id, { status: "approved" })} className="cb-btn-ghost !py-1.5 text-xs"><Check className="h-3.5 w-3.5" /> Luluskan</button>
              <button onClick={() => act(f.id, { status: "rejected" })} className="cb-btn-ghost !py-1.5 text-xs"><X className="h-3.5 w-3.5" /> Tolak</button>
              <button onClick={() => act(f.id, { status: "hidden" })} className="cb-btn-ghost !py-1.5 text-xs"><EyeOff className="h-3.5 w-3.5" /> Sembunyi</button>
              <button onClick={() => { setReplyFor(f.id); setReplyText(f.admin_reply ?? ""); }} className="cb-btn-ghost !py-1.5 text-xs"><Reply className="h-3.5 w-3.5" /> Balas</button>
              <button onClick={() => del(f.id)} className="cb-btn !py-1.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"><Trash2 className="h-3.5 w-3.5" /> Padam</button>
            </div>

            {replyFor === f.id && (
              <div className="mt-3 flex gap-2">
                <input className="cb-input" value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Balasan admin…" />
                <button onClick={() => sendReply(f.id)} className="cb-btn-primary !py-1.5">Hantar</button>
              </div>
            )}
            {f.allow_public_display && f.status === "approved" && (
              <p className="mt-2 text-xs text-teal-600">✓ Layak dipaparkan di Kata Cikgu (izin awam + diluluskan).</p>
            )}
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
