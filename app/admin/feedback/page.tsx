"use client";

import { useCallback, useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AdminShell, waktuMY } from "@/components/admin/AdminShell";
import { Check, X, EyeOff, Trash2, Reply, Download, Search } from "lucide-react";

interface Fb {
  id: string; name: string; email: string; subject: string; message: string; category: string;
  status: string; allow_public_display: boolean; admin_reply: string | null; created_at: string;
  admin_reply_email_status?: string | null; auto_reply_status?: string | null;
}
interface Counts { pending: number; approved: number; rejected: number; hidden: number; replied: number; public: number; total: number }
const FILTERS = ["all", "pending", "approved", "rejected", "hidden"] as const;

function AdminFeedbackInner() {
  const [items, setItems] = useState<Fb[]>([]);
  const [counts, setCounts] = useState<Counts | null>(null);
  const searchParams = useSearchParams();
  const initialStatus = (FILTERS as readonly string[]).includes(searchParams.get("status") ?? "") ? (searchParams.get("status") as (typeof FILTERS)[number]) : "pending";
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>(initialStatus);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [replyFor, setReplyFor] = useState<Fb | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    const p = new URLSearchParams();
    if (filter !== "all") p.set("status", filter);
    if (q) p.set("q", q);
    p.set("page", String(page));
    const res = await fetch(`/api/admin/feedback?${p}`);
    if (res.ok) { const d = await res.json(); setItems(d.items); setCounts(d.counts); }
  }, [filter, q, page]);
  useEffect(() => { load(); }, [load]);

  async function act(id: string, patch: Record<string, unknown>) {
    await fetch("/api/admin/feedback", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, ...patch }) });
    load();
  }
  async function del(id: string) {
    if (!confirm("Adakah anda pasti mahu memadam mesej ini?")) return;
    await fetch("/api/admin/feedback", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    load();
  }
  async function sendReply() {
    if (!replyFor || !replyText.trim()) return;
    setSending(true);
    const res = await fetch("/api/admin/feedback/reply", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: replyFor.id, message: replyText }) });
    setSending(false);
    if (res.ok) { setReplyFor(null); setReplyText(""); load(); }
  }
  function exportCsv() {
    const p = new URLSearchParams();
    if (filter !== "all") p.set("status", filter);
    if (q) p.set("q", q);
    window.open(`/api/admin/feedback/export?${p}`, "_blank");
  }

  return (
    <AdminShell title="Maklum Balas" subtitle="Semak, luluskan dan balas maklum balas pengguna." onRefresh={load}>
      {counts && (
        <div className="mb-4 flex flex-wrap gap-2 text-xs">
          {[["Pending", counts.pending], ["Approved", counts.approved], ["Rejected", counts.rejected], ["Telah Dibalas", counts.replied], ["Public", counts.public]].map(([k, v]) => (
            <span key={k as string} className="glass rounded-full px-3 py-1 font-semibold shadow-card">{k}: {v}</span>
          ))}
        </div>
      )}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => { setFilter(f); setPage(1); }} className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${filter === f ? "bg-teal-600 text-white" : "glass muted"}`}>{f}</button>
        ))}
        <div className="relative ml-auto">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 muted" />
          <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Cari nama/email/mesej…" className="cb-input !py-1.5 !pl-8 w-56" />
        </div>
        <button onClick={exportCsv} className="cb-btn-ghost !py-1.5 text-xs"><Download className="h-3.5 w-3.5" /> CSV</button>
      </div>

      {items.length === 0 && <p className="text-sm muted">Tiada mesej dalam kategori ini.</p>}
      <div className="space-y-3">
        {items.map((f) => (
          <div key={f.id} className="glass rounded-2xl p-4 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="font-semibold">{f.name}</span>
                <span className="ml-2 text-xs muted">{f.email}</span>
                <span className="ml-2 rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-semibold uppercase dark:bg-white/10">{f.category}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className={`rounded-full px-2 py-0.5 font-semibold ${f.status === "approved" ? "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300" : f.status === "pending" ? "bg-marigold-100 text-marigold-700 dark:bg-marigold-900/40 dark:text-marigold-300" : "bg-black/5 dark:bg-white/10 muted"}`}>{f.status}</span>
                <span className="muted">{waktuMY(f.created_at)}</span>
              </div>
            </div>
            {f.subject && <p className="mt-2 text-sm font-medium">{f.subject}</p>}
            <p className="mt-1 text-sm">{f.message}</p>
            {f.admin_reply && <div className="mt-2 rounded-lg bg-teal-50 p-2 text-sm dark:bg-teal-950/40"><b className="text-teal-700 dark:text-teal-300">Balasan: </b>{f.admin_reply}{f.admin_reply_email_status && <span className="ml-2 text-xs muted">(email: {f.admin_reply_email_status})</span>}</div>}

            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={() => act(f.id, { status: "approved" })} className="cb-btn-ghost !py-1.5 text-xs"><Check className="h-3.5 w-3.5" /> Luluskan</button>
              <button onClick={() => act(f.id, { status: "rejected" })} className="cb-btn-ghost !py-1.5 text-xs"><X className="h-3.5 w-3.5" /> Tolak</button>
              <button onClick={() => act(f.id, { status: "hidden" })} className="cb-btn-ghost !py-1.5 text-xs"><EyeOff className="h-3.5 w-3.5" /> Sembunyi</button>
              <button onClick={() => { setReplyFor(f); setReplyText(f.admin_reply ?? ""); }} className="cb-btn-ghost !py-1.5 text-xs"><Reply className="h-3.5 w-3.5" /> Balas Email</button>
              <button onClick={() => del(f.id)} className="cb-btn !py-1.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"><Trash2 className="h-3.5 w-3.5" /> Padam</button>
            </div>
            {f.allow_public_display && f.status === "approved" && <p className="mt-2 text-xs text-teal-600">✓ Layak dipaparkan di Kata Cikgu.</p>}
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-center gap-2">
        <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="cb-btn-ghost !py-1.5 text-xs disabled:opacity-40">Sebelum</button>
        <span className="px-2 py-1.5 text-xs muted">Halaman {page}</span>
        <button disabled={items.length < 20} onClick={() => setPage((p) => p + 1)} className="cb-btn-ghost !py-1.5 text-xs disabled:opacity-40">Seterusnya</button>
      </div>

      {replyFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setReplyFor(null)}>
          <div className="glass w-full max-w-lg rounded-2xl p-5 shadow-lift" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display font-bold">Balas kepada {replyFor.name}</h3>
            <p className="mt-1 text-xs muted">To: {replyFor.email}</p>
            <div className="mt-3 rounded-lg bg-black/5 p-2 text-xs dark:bg-white/5"><b>Mesej asal:</b> {replyFor.message}</div>
            <textarea className="cb-input mt-3 min-h-[120px]" value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Taip balasan anda…" />
            <div className="mt-3 flex justify-end gap-2">
              <button onClick={() => setReplyFor(null)} className="cb-btn-ghost">Batal</button>
              <button onClick={sendReply} disabled={sending || !replyText.trim()} className="cb-btn-primary">{sending ? "Menghantar…" : "Hantar Balasan"}</button>
            </div>
            <p className="mt-2 text-xs muted">Jika email belum diaktifkan (RESEND_API_KEY), balasan tetap disimpan tetapi email tidak dihantar.</p>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

export default function AdminFeedback() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-8 text-sm muted">Memuatkan…</div>}>
      <AdminFeedbackInner />
    </Suspense>
  );
}
