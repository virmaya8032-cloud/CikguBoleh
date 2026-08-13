"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Pencil, Trash2, X, Users } from "lucide-react";
import { BackButton } from "@/components/ui/BackButton";

interface Student {
  id: string; name: string; class_name: string | null; dob: string | null;
  gender: string | null; category: string | null; notes: string | null;
}
const EMPTY = { name: "", class_name: "", dob: "", gender: "", category: "", notes: "" };

function umur(dob: string | null): string {
  if (!dob) return "—";
  const d = new Date(dob); if (isNaN(d.getTime())) return "—";
  const now = new Date();
  let y = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) y--;
  return `${y} tahun`;
}

export default function MuridSaya() {
  const router = useRouter();
  const [state, setState] = useState<"load" | "ok" | "guest" | "error">("load");
  const [rows, setRows] = useState<Student[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [q, setQ] = useState("");
  const [kelas, setKelas] = useState("");
  const [form, setForm] = useState<typeof EMPTY & { id?: string }>({ ...EMPTY });
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    setState("load");
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000); // jangan gantung selamanya
    try {
      const p = new URLSearchParams();
      if (q) p.set("q", q); if (kelas) p.set("kelas", kelas);
      const res = await fetch(`/api/murid?${p}`, { cache: "no-store", signal: controller.signal });
      if (res.status === 401) { setState("guest"); return; }
      if (!res.ok) { setState("error"); return; }
      const d = await res.json();
      setRows(d.students ?? []); setClasses(d.classes ?? []); setState("ok");
    } catch {
      setState("error"); // termasuk timeout/abort/rangkaian — loading tetap berakhir
    } finally {
      clearTimeout(timer);
    }
  }, [q, kelas]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (state === "guest") router.replace("/log-masuk"); }, [state, router]);

  function openAdd() { setForm({ ...EMPTY }); setErr(""); setShowForm(true); }
  function openEdit(s: Student) {
    setForm({ id: s.id, name: s.name, class_name: s.class_name ?? "", dob: s.dob ?? "", gender: s.gender ?? "", category: s.category ?? "", notes: s.notes ?? "" });
    setErr(""); setShowForm(true);
  }
  async function save() {
    if (form.name.trim().length < 2) { setErr("Nama murid diperlukan."); return; }
    setSaving(true); setErr("");
    try {
      const url = form.id ? `/api/murid/${form.id}` : "/api/murid";
      const res = await fetch(url, { method: form.id ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const d = await res.json().catch(() => ({}));
      if (res.ok) { setShowForm(false); load(); }
      else setErr(d.error ?? "Gagal menyimpan.");
    } catch { setErr("Ralat rangkaian."); }
    finally { setSaving(false); }
  }
  async function del(s: Student) {
    if (!confirm(`Padam murid "${s.name}"? Tindakan ini tidak boleh diundur.`)) return;
    await fetch(`/api/murid/${s.id}`, { method: "DELETE" });
    load();
  }
  const setF = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm((p) => ({ ...p, [k]: e.target.value }));

  if (state === "load") return <div className="mx-auto max-w-5xl px-4 py-16 text-center text-sm muted">Memuatkan…</div>;
  if (state === "error") return <div className="mx-auto max-w-5xl px-4 py-16 text-center"><p className="text-sm text-red-500">Gagal memuatkan data. Sila cuba lagi.</p><button onClick={load} className="cb-btn-ghost mt-3">Cuba Lagi</button></div>;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <BackButton fallback="/" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold">Murid Saya</h1>
          <p className="text-sm muted">Simpan senarai murid anda — boleh diguna semula dalam modul lain.</p>
        </div>
        <button onClick={openAdd} className="cb-btn-primary"><Plus className="h-4 w-4" /> Tambah Murid</button>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama murid…" className="cb-input !py-2 !pl-8 w-56" />
        </div>
        <select value={kelas} onChange={(e) => setKelas(e.target.value)} className="cb-input !py-2 w-44">
          <option value="">Semua kelas</option>
          {classes.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <span className="ml-auto text-sm muted">{rows.length} murid</span>
      </div>

      {rows.length === 0 ? (
        <div className="mt-6 glass rounded-2xl p-12 text-center shadow-card">
          <Users className="mx-auto h-10 w-10 muted" />
          <p className="mt-3 font-medium">Belum ada murid.</p>
          <p className="text-sm muted">Klik “Tambah Murid” untuk mula membina senarai kelas anda.</p>
          <button onClick={openAdd} className="cb-btn-primary mt-4"><Plus className="h-4 w-4" /> Tambah Murid</button>
        </div>
      ) : (
        <div className="mt-4 glass overflow-x-auto rounded-2xl shadow-card">
          <table className="w-full min-w-[720px] text-sm">
            <thead><tr className="text-left muted">{["Nama", "Kelas", "Umur", "Jantina", "Kategori", "Catatan", ""].map((h) => <th key={h} className="p-3 font-medium">{h}</th>)}</tr></thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id} className="border-t" style={{ borderColor: "var(--border)" }}>
                  <td className="p-3 font-medium">{s.name}</td>
                  <td className="p-3">{s.class_name ?? "—"}</td>
                  <td className="p-3 text-xs">{umur(s.dob)}</td>
                  <td className="p-3 text-xs">{s.gender ?? "—"}</td>
                  <td className="p-3 text-xs">{s.category ?? "—"}</td>
                  <td className="max-w-[180px] truncate p-3 text-xs muted">{s.notes ?? "—"}</td>
                  <td className="whitespace-nowrap p-3">
                    <button onClick={() => openEdit(s)} className="mr-1 rounded-lg p-1.5 hover:bg-black/5 dark:hover:bg-white/10" title="Edit"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => del(s)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30" title="Padam"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowForm(false)}>
          <div className="glass w-full max-w-lg rounded-2xl p-5 shadow-lift" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold">{form.id ? "Edit Murid" : "Tambah Murid"}</h3>
              <button onClick={() => setShowForm(false)} className="rounded-lg p-1 hover:bg-black/5 dark:hover:bg-white/10"><X className="h-4 w-4" /></button>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2"><label className="cb-label">Nama <span className="text-red-500">*</span></label><input className="cb-input" value={form.name} onChange={setF("name")} autoFocus /></div>
              <div><label className="cb-label">Kelas</label><input className="cb-input" value={form.class_name} onChange={setF("class_name")} placeholder="cth: 4 Bestari" /></div>
              <div><label className="cb-label">Tarikh Lahir</label><input type="date" className="cb-input" value={form.dob} onChange={setF("dob")} /></div>
              <div><label className="cb-label">Jantina</label>
                <select className="cb-input" value={form.gender} onChange={setF("gender")}><option value="">—</option><option>Lelaki</option><option>Perempuan</option></select>
              </div>
              <div><label className="cb-label">Kategori</label><input className="cb-input" value={form.category} onChange={setF("category")} placeholder="cth: PPKI, Pemulihan" /></div>
              <div className="sm:col-span-2"><label className="cb-label">Catatan</label><textarea className="cb-input min-h-[70px]" value={form.notes} onChange={setF("notes")} /></div>
            </div>
            {form.dob && <p className="mt-1 text-xs muted">Umur: {umur(form.dob)}</p>}
            {err && <p className="mt-2 text-sm text-red-500">{err}</p>}
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setShowForm(false)} className="cb-btn-ghost">Batal</button>
              <button onClick={save} disabled={saving} className="cb-btn-primary">{saving ? "Menyimpan…" : "Simpan"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
