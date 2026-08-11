"use client";

import { useRef, useState } from "react";
import { Printer, Upload, X } from "lucide-react";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { useToast } from "@/components/ui/Toast";
import { printPage } from "@/services/export";
import { trackEvent } from "@/services/analytics";

const STYLES = [
  { key: "teal", ring: "#0d7c74", soft: "#e6f3f1" },
  { key: "emas", ring: "#b8860b", soft: "#fdf6e3" },
  { key: "biru", ring: "#1e3a8a", soft: "#eef2ff" },
  { key: "merah", ring: "#991b1b", soft: "#fdeeee" },
];

export default function SijilPage() {
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [f, setF] = useState({
    tajuk: "Sijil Penghargaan", nama: "", teks: "atas pencapaian cemerlang dan komitmen sepanjang",
    acara: "Program Kecemerlangan 2026", tarikh: "", tandatangan: "", jawatan: "Guru Besar", sekolah: "",
  });
  const [logo, setLogo] = useState<string | null>(null);
  const [style, setStyle] = useState(STYLES[0]);
  const set = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }));

  function onLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1.5 * 1024 * 1024) { toast("Logo terlalu besar (maks 1.5MB).", "error"); return; }
    const r = new FileReader();
    r.onload = () => setLogo(String(r.result));
    r.readAsDataURL(file);
  }

  return (
    <ToolLayout slug="/alat/sijil">
      <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
        <div className="surface h-fit rounded-2xl p-5 shadow-card no-print">
          <div className="space-y-3">
            <div><label className="cb-label">Tajuk sijil</label><input className="cb-input" value={f.tajuk} onChange={(e) => set("tajuk", e.target.value)} /></div>
            <div><label className="cb-label">Nama penerima</label><input className="cb-input" value={f.nama} onChange={(e) => set("nama", e.target.value)} placeholder="Nama penuh" /></div>
            <div><label className="cb-label">Teks penghargaan</label><textarea className="cb-input min-h-[60px]" value={f.teks} onChange={(e) => set("teks", e.target.value)} /></div>
            <div><label className="cb-label">Acara / program</label><input className="cb-input" value={f.acara} onChange={(e) => set("acara", e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><label className="cb-label">Tarikh</label><input className="cb-input" value={f.tarikh} onChange={(e) => set("tarikh", e.target.value)} placeholder="10 Ogos 2026" /></div>
              <div><label className="cb-label">Sekolah</label><input className="cb-input" value={f.sekolah} onChange={(e) => set("sekolah", e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><label className="cb-label">Nama penandatangan</label><input className="cb-input" value={f.tandatangan} onChange={(e) => set("tandatangan", e.target.value)} /></div>
              <div><label className="cb-label">Jawatan</label><input className="cb-input" value={f.jawatan} onChange={(e) => set("jawatan", e.target.value)} /></div>
            </div>
            <div>
              <label className="cb-label">Logo (pilihan)</label>
              <div className="flex gap-2">
                <button onClick={() => fileRef.current?.click()} className="cb-btn-ghost !py-1.5"><Upload className="h-4 w-4" /> Muat naik</button>
                {logo && <button onClick={() => setLogo(null)} className="cb-btn-ghost !py-1.5 !px-2.5"><X className="h-4 w-4" /></button>}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onLogo} />
            </div>
            <div>
              <label className="cb-label">Warna</label>
              <div className="flex gap-2">
                {STYLES.map((s) => (
                  <button key={s.key} onClick={() => setStyle(s)} className={`h-8 w-8 rounded-full border-2 ${style.key === s.key ? "ring-2 ring-offset-2" : ""}`} style={{ background: s.ring, borderColor: "#fff" }} aria-label={s.key} />
                ))}
              </div>
            </div>
            <button onClick={() => { printPage("/alat/sijil"); trackEvent("certificate_generate", { toolSlug: "/alat/sijil" }); }} disabled={!f.nama} className="cb-btn-accent w-full"><Printer className="h-4 w-4" /> Cetak / PDF (Landskap)</button>
            <p className="text-xs muted">Tip: dalam dialog cetak, pilih orientasi <b>Landscape</b> dan margin <b>None</b>.</p>
          </div>
        </div>

        {/* Preview / print */}
        <div className="overflow-auto">
          <div id="sijil-print" className="print-area mx-auto" style={{ width: "100%", maxWidth: 900 }}>
            <div style={{ background: "#fff", color: "#111", border: `10px solid ${style.ring}`, outline: `2px solid ${style.ring}`, outlineOffset: 6, padding: "48px 56px", textAlign: "center", aspectRatio: "1.414 / 1", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {logo && <img src={logo} alt="logo" style={{ height: 64, margin: "0 auto 12px", objectFit: "contain" }} />}
              <div style={{ letterSpacing: 4, fontSize: 13, color: style.ring, fontWeight: 700 }}>{f.sekolah || "SEKOLAH"}</div>
              <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 34, fontWeight: 800, margin: "10px 0 4px" }}>{f.tajuk}</h1>
              <div style={{ width: 80, height: 3, background: style.ring, margin: "6px auto 18px" }} />
              <p style={{ fontSize: 13, color: "#555" }}>Dengan ini disahkan bahawa</p>
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 28, fontWeight: 800, color: style.ring, margin: "8px 0" }}>{f.nama || "________________"}</p>
              <p style={{ fontSize: 14, maxWidth: 560, margin: "0 auto", lineHeight: 1.6 }}>{f.teks} <b>{f.acara}</b>.</p>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 40, padding: "0 20px" }}>
                <div style={{ textAlign: "center", fontSize: 13 }}>
                  <div style={{ borderTop: "1px solid #333", paddingTop: 4, minWidth: 160 }}>{f.tarikh || "Tarikh"}</div>
                </div>
                <div style={{ textAlign: "center", fontSize: 13 }}>
                  <div style={{ borderTop: "1px solid #333", paddingTop: 4, minWidth: 180 }}><b>{f.tandatangan || "Nama"}</b><br />{f.jawatan}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
