"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { useToast } from "@/components/ui/Toast";
import { copyText } from "@/services/export";

const OPTIONS: { id: string; label: string; build: (n: string) => string }[] = [
  { id: "semua", label: "Semua murid capai", build: (n) => `Pada hari ini, ${n} orang murid telah mencapai objektif pembelajaran yang ditetapkan. Aktiviti pengukuhan akan diberikan pada sesi seterusnya.` },
  { id: "sebahagian", label: "Sebahagian murid capai", build: (n) => `Sebahagian daripada ${n} orang murid mencapai objektif. Murid yang belum menguasai akan diberi bimbingan tambahan pada sesi berikutnya.` },
  { id: "majoriti", label: "Majoriti belum capai", build: (n) => `Majoriti daripada ${n} orang murid masih belum mencapai objektif. Kaedah pengajaran akan diubah suai dan aktiviti pemulihan disediakan.` },
  { id: "pemulihan", label: "Perlu pemulihan", build: (n) => `Beberapa orang daripada ${n} murid memerlukan aktiviti pemulihan bagi menguasai kemahiran asas sebelum meneruskan tajuk seterusnya.` },
  { id: "pengayaan", label: "Perlu pengayaan", build: (n) => `${n} orang murid telah menguasai objektif dengan baik dan sesuai diberi aktiviti pengayaan yang lebih mencabar.` },
];

export default function RefleksiPage() {
  const toast = useToast();
  const [opt, setOpt] = useState(OPTIONS[1].id);
  const [count, setCount] = useState("25");
  const chosen = OPTIONS.find((o) => o.id === opt)!;
  const text = chosen.build(count || "semua");

  return (
    <ToolLayout slug="/alat/refleksi">
      <div className="surface rounded-2xl p-5 shadow-card">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="cb-label">Tahap pencapaian</label>
            <select className="cb-input" value={opt} onChange={(e) => setOpt(e.target.value)}>
              {OPTIONS.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="cb-label">Bilangan murid</label>
            <input className="cb-input" value={count} onChange={(e) => setCount(e.target.value)} />
          </div>
        </div>
        <div className="mt-4 rounded-xl bg-teal-50 p-4 text-sm dark:bg-teal-950/40">{text}</div>
        <button onClick={async () => { if (await copyText(text, "/alat/refleksi")) toast("Refleksi disalin."); }} className="cb-btn-primary mt-3"><Copy className="h-4 w-4" /> Salin refleksi</button>
      </div>
    </ToolLayout>
  );
}
