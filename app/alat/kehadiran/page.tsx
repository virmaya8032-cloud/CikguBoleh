"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2, Download, RotateCcw, Users } from "lucide-react";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useToast } from "@/components/ui/Toast";
import { downloadCSV } from "@/services/export";

type Status = "H" | "T" | "S" | "C"; // Hadir, Tidak hadir, Sakit, Cuti
interface Murid { id: number; nama: string; rekod: Record<string, Status> }
interface State { kelas: string; tarikh: string; murid: Murid[] }

const LABELS: Record<Status, string> = { H: "Hadir", T: "Tidak Hadir", S: "Sakit", C: "Cuti" };
const CYCLE: Status[] = ["H", "T", "S", "C"];
const COLOR: Record<Status, string> = {
  H: "bg-teal-500 text-white", T: "bg-red-500 text-white",
  S: "bg-marigold-400 text-white", C: "bg-slate-400 text-white",
};

const today = () => new Date().toISOString().slice(0, 10);
const EMPTY: State = { kelas: "", tarikh: today(), murid: [] };

export default function KehadiranPage() {
  const toast = useToast();
  const { value: st, setValue: setSt, reset } = useLocalStorage<State>("cikguboleh_kehadiran", EMPTY);
  const [bulk, setBulk] = useState("");

  const setKelas = (v: string) => setSt((p) => ({ ...p, kelas: v }));
  const setTarikh = (v: string) => setSt((p) => ({ ...p, tarikh: v }));
  const addOne = () => setSt((p) => ({ ...p, murid: [...p.murid, { id: Date.now(), nama: "", rekod: {} }] }));
  const setNama = (id: number, v: string) => setSt((p) => ({ ...p, murid: p.murid.map((m) => m.id === id ? { ...m, nama: v } : m) }));
  const rm = (id: number) => setSt((p) => ({ ...p, murid: p.murid.filter((m) => m.id !== id) }));

  function addBulk() {
    const names = bulk.split(/\n|,/).map((s) => s.trim()).filter(Boolean);
    if (!names.length) return;
    setSt((p) => ({ ...p, murid: [...p.murid, ...names.map((n, i) => ({ id: Date.now() + i, nama: n, rekod: {} }))] }));
    setBulk("");
    toast(`${names.length} murid ditambah.`);
  }

  function cycle(id: number) {
    const d = st.tarikh;
    setSt((p) => ({
      ...p,
      murid: p.murid.map((m) => {
        if (m.id !== id) return m;
        const cur = m.rekod[d];
        const next = cur === undefined ? "H" : CYCLE[(CYCLE.indexOf(cur) + 1) % CYCLE.length];
        return { ...m, rekod: { ...m.rekod, [d]: next } };
      }),
    }));
  }

  function markAll(s: Status) {
    const d = st.tarikh;
    setSt((p) => ({ ...p, murid: p.murid.map((m) => ({ ...m, rekod: { ...m.rekod, [d]: s } })) }));
  }

  const stats = useMemo(() => {
    const days = new Set<string>();
    st.murid.forEach((m) => Object.keys(m.rekod).forEach((d) => days.add(d)));
    const totalDays = days.size || 1;
    return st.murid.map((m) => {
      const hadir = Object.values(m.rekod).filter((v) => v === "H").length;
      const direkod = Object.keys(m.rekod).length || 0;
      const pct = direkod ? Math.round((hadir / direkod) * 100) : 0;
      return { hadir, direkod, pct };
    });
  }, [st.murid]);

  const todayCount = st.murid.reduce((a, m) => { const v = m.rekod[st.tarikh]; if (v === "H") a.h++; else if (v === "T") a.t++; return a; }, { h: 0, t: 0 });

  function exportCsv() {
    const rows: (string | number)[][] = [["Nama", "Hari Direkod", "Hari Hadir", "Peratus Hadir", `Status ${st.tarikh}`]];
    st.murid.forEach((m, i) => rows.push([m.nama, stats[i].direkod, stats[i].hadir, `${stats[i].pct}%`, m.rekod[st.tarikh] ? LABELS[m.rekod[st.tarikh]] : "-"]));
    downloadCSV(`kehadiran-${st.kelas || "kelas"}.csv`, rows, "/alat/kehadiran");
    toast("CSV dimuat turun.");
  }

  return (
    <ToolLayout slug="/alat/kehadiran">
      <div className="surface rounded-2xl p-5 shadow-card">
        <div className="grid gap-3 sm:grid-cols-2">
          <div><label className="cb-label">Kelas</label><input className="cb-input" value={st.kelas} onChange={(e) => setKelas(e.target.value)} placeholder="cth: 4 Bestari" /></div>
          <div><label className="cb-label">Tarikh</label><input type="date" className="cb-input" value={st.tarikh} onChange={(e) => setTarikh(e.target.value)} /></div>
        </div>

        <div className="mt-4">
          <label className="cb-label">Tambah senarai murid (satu nama satu baris)</label>
          <textarea className="cb-input min-h-[70px]" value={bulk} onChange={(e) => setBulk(e.target.value)} placeholder={"Ali bin Ahmad\nSiti binti Kassim"} />
          <div className="mt-2 flex gap-2">
            <button onClick={addBulk} className="cb-btn-primary"><Users className="h-4 w-4" /> Tambah senarai</button>
            <button onClick={addOne} className="cb-btn-ghost"><Plus className="h-4 w-4" /> Satu murid</button>
          </div>
        </div>
      </div>

      {st.murid.length > 0 && (
        <>
          <div className="surface mt-4 flex flex-wrap items-center gap-2 rounded-2xl p-4 shadow-card">
            <span className="text-sm font-semibold">Tanda semua:</span>
            {CYCLE.map((s) => <button key={s} onClick={() => markAll(s)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${COLOR[s]}`}>{LABELS[s]}</button>)}
            <span className="ml-auto text-sm muted">Hari ini — Hadir: <b className="text-teal-600">{todayCount.h}</b> · Tidak hadir: <b className="text-red-500">{todayCount.t}</b></span>
            <button onClick={exportCsv} className="cb-btn-ghost !py-1.5"><Download className="h-4 w-4" /> CSV</button>
            <button onClick={() => { if (confirm("Reset semua data kehadiran?")) { reset(); toast("Direset."); } }} className="cb-btn-ghost !px-2.5 !py-1.5"><RotateCcw className="h-4 w-4" /></button>
          </div>

          <div className="surface mt-4 overflow-hidden rounded-2xl shadow-card">
            <table className="w-full text-sm">
              <thead><tr className="text-left muted">
                <th className="p-3 font-medium">#</th><th className="p-3 font-medium">Nama</th>
                <th className="p-3 font-medium text-center">{st.tarikh}</th>
                <th className="p-3 font-medium text-center">% Hadir</th><th className="p-3"></th>
              </tr></thead>
              <tbody>
                {st.murid.map((m, i) => {
                  const s = m.rekod[st.tarikh];
                  return (
                    <tr key={m.id} className="border-t" style={{ borderColor: "var(--border)" }}>
                      <td className="p-3 muted">{i + 1}</td>
                      <td className="p-2"><input className="cb-input !py-1.5" value={m.nama} onChange={(e) => setNama(m.id, e.target.value)} placeholder="Nama murid" /></td>
                      <td className="p-2 text-center">
                        <button onClick={() => cycle(m.id)} className={`min-w-[92px] rounded-lg px-3 py-1.5 text-xs font-bold ${s ? COLOR[s] : "surface muted"}`}>{s ? LABELS[s] : "Tanda"}</button>
                      </td>
                      <td className="p-3 text-center font-semibold">{stats[i].direkod ? `${stats[i].pct}%` : "—"}</td>
                      <td className="p-3 text-right"><button onClick={() => rm(m.id)} className="muted hover:text-red-500"><Trash2 className="h-4 w-4" /></button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-center text-xs muted">Tekan butang status untuk kitar: Hadir → Tidak Hadir → Sakit → Cuti. Disimpan pada peranti.</p>
        </>
      )}
    </ToolLayout>
  );
}
