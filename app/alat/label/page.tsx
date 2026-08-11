"use client";

import { useState } from "react";
import { Printer } from "lucide-react";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { printPage } from "@/services/export";
import { trackEvent } from "@/services/analytics";

export default function LabelPage() {
  const [names, setNames] = useState("");
  const [cols, setCols] = useState(3);
  const [sub, setSub] = useState("");
  const [style, setStyle] = useState<"garis" | "penuh" | "minimal">("garis");
  const [upper, setUpper] = useState(false);

  const list = names.split(/\n/).map((s) => s.trim()).filter(Boolean);

  const cardStyle: React.CSSProperties =
    style === "penuh" ? { background: "#0d7c74", color: "#fff", border: "none" }
    : style === "minimal" ? { background: "#fff", color: "#111", border: "1px dashed #999" }
    : { background: "#fff", color: "#111", border: "2px solid #0d7c74" };

  return (
    <ToolLayout slug="/alat/label">
      <div className="surface rounded-2xl p-5 shadow-card no-print">
        <label className="cb-label">Senarai nama (satu nama satu baris)</label>
        <textarea className="cb-input min-h-[120px]" value={names} onChange={(e) => setNames(e.target.value)} placeholder={"Ali bin Ahmad\nSiti binti Kassim\nRaj a/l Kumar"} />
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div><label className="cb-label">Teks kecil (pilihan)</label><input className="cb-input" value={sub} onChange={(e) => setSub(e.target.value)} placeholder="cth: 4 Bestari 2026" /></div>
          <div><label className="cb-label">Lajur</label>
            <select className="cb-input" value={cols} onChange={(e) => setCols(Number(e.target.value))}>{[2, 3, 4].map((c) => <option key={c} value={c}>{c} lajur</option>)}</select>
          </div>
          <div><label className="cb-label">Gaya</label>
            <select className="cb-input" value={style} onChange={(e) => setStyle(e.target.value as typeof style)}>
              <option value="garis">Garisan teal</option><option value="penuh">Latar penuh</option><option value="minimal">Minimal</option>
            </select>
          </div>
          <div className="flex items-end"><label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-teal-600" checked={upper} onChange={(e) => setUpper(e.target.checked)} /> HURUF BESAR</label></div>
        </div>
        <button onClick={() => { printPage("/alat/label"); trackEvent("label_generate", { toolSlug: "/alat/label", metadata: { n: list.length, cols } }); }} disabled={!list.length} className="cb-btn-accent mt-4"><Printer className="h-4 w-4" /> Cetak / PDF</button>
        {list.length > 0 && <p className="mt-2 text-xs muted">{list.length} label · {cols} lajur. Tip: margin cetak &quot;Default&quot;, saiz A4.</p>}
      </div>

      {list.length > 0 && (
        <div id="label-print" className="print-area mt-6">
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 10 }}>
            {list.map((n, i) => (
              <div key={i} style={{ ...cardStyle, borderRadius: 12, padding: "16px 12px", textAlign: "center", minHeight: 84, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: cols === 4 ? 15 : 18, lineHeight: 1.2 }}>{upper ? n.toUpperCase() : n}</div>
                {sub && <div style={{ fontSize: 11, marginTop: 4, opacity: 0.8 }}>{sub}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
