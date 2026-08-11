"use client";

import { useState } from "react";
import { Printer, FileText } from "lucide-react";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { useToast } from "@/components/ui/Toast";
import { printPage } from "@/services/export";
import { downloadWord } from "@/services/export/word";
import { trackEvent } from "@/services/analytics";

const TEMPLATES: Record<string, { tajuk: string; body: (v: Vars) => string }> = {
  "Surat Makluman": {
    tajuk: "SURAT MAKLUMAN",
    body: (v) => `Tuan/Puan,\n\nPERKARA: ${v.perkara || "Makluman Program Sekolah"}\n\nDengan segala hormatnya perkara di atas adalah dirujuk.\n\n2. Sukacita dimaklumkan bahawa pihak sekolah akan mengadakan ${v.perkara || "program"} pada ${v.tarikhAcara || "(tarikh)"} bertempat di ${v.tempat || "(tempat)"}. ${v.butiran || ""}\n\n3. Kerjasama dan perhatian tuan/puan amatlah dihargai dan didahului dengan ucapan terima kasih.\n\nSekian, terima kasih.`,
  },
  "Surat Kebenaran Ibu Bapa": {
    tajuk: "SURAT KEBENARAN IBU BAPA / PENJAGA",
    body: (v) => `Tuan/Puan,\n\nPERKARA: KEBENARAN MENYERTAI ${(v.perkara || "AKTIVITI").toUpperCase()}\n\nDengan hormatnya dimaklumkan bahawa anak/jagaan tuan/puan telah dipilih untuk menyertai ${v.perkara || "aktiviti"} pada ${v.tarikhAcara || "(tarikh)"} di ${v.tempat || "(tempat)"}.\n\n2. ${v.butiran || "Segala perbelanjaan dan pengangkutan akan diuruskan oleh pihak sekolah."}\n\n3. Sila lengkapkan slip kebenaran di bawah dan kembalikan kepada guru kelas.\n\n———————————————————————\nSlip Kebenaran\nSaya ______________________ (nama ibu bapa/penjaga) *membenarkan / tidak membenarkan anak saya ______________________ menyertai aktiviti tersebut.\n\nTandatangan: ____________  Tarikh: ____________`,
  },
  "Surat Jemputan": {
    tajuk: "SURAT JEMPUTAN",
    body: (v) => `Tuan/Puan,\n\nPERKARA: JEMPUTAN KE ${(v.perkara || "MAJLIS").toUpperCase()}\n\nSukacitanya pihak kami ingin menjemput tuan/puan untuk hadir ke ${v.perkara || "majlis"} seperti butiran berikut:\n\nTarikh : ${v.tarikhAcara || "(tarikh)"}\nMasa   : ${v.masa || "(masa)"}\nTempat : ${v.tempat || "(tempat)"}\n\n2. ${v.butiran || "Kehadiran tuan/puan amatlah dialu-alukan."}\n\nSekian, terima kasih.`,
  },
  "Surat Rasmi (Kosong)": {
    tajuk: "SURAT RASMI",
    body: (v) => `Tuan/Puan,\n\nPERKARA: ${v.perkara || "(perkara)"}\n\n${v.butiran || "(isi kandungan surat)"}\n\nSekian, terima kasih.`,
  },
};

interface Vars { perkara: string; tarikhAcara: string; masa: string; tempat: string; butiran: string }

export default function SuratPage() {
  const toast = useToast();
  const [jenis, setJenis] = useState<keyof typeof TEMPLATES>("Surat Makluman");
  const [head, setHead] = useState({ sekolah: "", alamat: "", rujukan: "", tarikh: "", penerima: "Ibu Bapa / Penjaga", pengirim: "", jawatan: "Guru Besar" });
  const [v, setV] = useState<Vars>({ perkara: "", tarikhAcara: "", masa: "", tempat: "", butiran: "" });
  const setH = (k: keyof typeof head, val: string) => setHead((p) => ({ ...p, [k]: val }));
  const setVar = (k: keyof Vars, val: string) => setV((p) => ({ ...p, [k]: val }));

  const tpl = TEMPLATES[jenis];
  const body = tpl.body(v);

  function exportWord() {
    const el = document.getElementById("surat-print");
    if (el) downloadWord(`surat-${jenis.toLowerCase().replace(/\s+/g, "-")}.doc`, jenis, el.innerHTML, "/alat/surat");
    trackEvent("letter_generate", { toolSlug: "/alat/surat", metadata: { jenis } });
    toast("Surat dimuat turun (Word).");
  }

  return (
    <ToolLayout slug="/alat/surat">
      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <div className="surface h-fit rounded-2xl p-5 shadow-card no-print">
          <label className="cb-label">Jenis surat</label>
          <select className="cb-input" value={jenis} onChange={(e) => setJenis(e.target.value as keyof typeof TEMPLATES)}>
            {Object.keys(TEMPLATES).map((k) => <option key={k}>{k}</option>)}
          </select>

          <h3 className="mt-4 mb-2 font-display text-sm font-bold">Kepala surat</h3>
          <div className="space-y-2">
            <input className="cb-input" value={head.sekolah} onChange={(e) => setH("sekolah", e.target.value)} placeholder="Nama sekolah" />
            <input className="cb-input" value={head.alamat} onChange={(e) => setH("alamat", e.target.value)} placeholder="Alamat sekolah" />
            <div className="grid grid-cols-2 gap-2">
              <input className="cb-input" value={head.rujukan} onChange={(e) => setH("rujukan", e.target.value)} placeholder="No. rujukan" />
              <input className="cb-input" value={head.tarikh} onChange={(e) => setH("tarikh", e.target.value)} placeholder="Tarikh" />
            </div>
            <input className="cb-input" value={head.penerima} onChange={(e) => setH("penerima", e.target.value)} placeholder="Penerima" />
          </div>

          <h3 className="mt-4 mb-2 font-display text-sm font-bold">Butiran</h3>
          <div className="space-y-2">
            <input className="cb-input" value={v.perkara} onChange={(e) => setVar("perkara", e.target.value)} placeholder="Perkara / nama program" />
            <div className="grid grid-cols-2 gap-2">
              <input className="cb-input" value={v.tarikhAcara} onChange={(e) => setVar("tarikhAcara", e.target.value)} placeholder="Tarikh acara" />
              <input className="cb-input" value={v.masa} onChange={(e) => setVar("masa", e.target.value)} placeholder="Masa" />
            </div>
            <input className="cb-input" value={v.tempat} onChange={(e) => setVar("tempat", e.target.value)} placeholder="Tempat" />
            <textarea className="cb-input min-h-[70px]" value={v.butiran} onChange={(e) => setVar("butiran", e.target.value)} placeholder="Butiran tambahan (pilihan)" />
          </div>

          <h3 className="mt-4 mb-2 font-display text-sm font-bold">Pengirim</h3>
          <div className="grid grid-cols-2 gap-2">
            <input className="cb-input" value={head.pengirim} onChange={(e) => setH("pengirim", e.target.value)} placeholder="Nama" />
            <input className="cb-input" value={head.jawatan} onChange={(e) => setH("jawatan", e.target.value)} placeholder="Jawatan" />
          </div>

          <div className="mt-4 flex gap-2">
            <button onClick={() => printPage("/alat/surat")} className="cb-btn-accent flex-1"><Printer className="h-4 w-4" /> Cetak / PDF</button>
            <button onClick={exportWord} className="cb-btn-ghost"><FileText className="h-4 w-4" /> Word</button>
          </div>
        </div>

        {/* Preview / print */}
        <div id="surat-print" className="print-area rounded-2xl bg-white p-8 text-black shadow-card" style={{ background: "#fff", color: "#000", fontSize: 14, lineHeight: 1.7 }}>
          <div style={{ textAlign: "center", borderBottom: "2px solid #333", paddingBottom: 8 }}>
            <div style={{ fontWeight: 800, fontSize: 16 }}>{head.sekolah || "NAMA SEKOLAH"}</div>
            <div style={{ fontSize: 12 }}>{head.alamat || "Alamat sekolah"}</div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontSize: 13 }}>
            <span>Ruj. Kami: {head.rujukan || "___________"}</span>
            <span>{head.tarikh || "Tarikh: ___________"}</span>
          </div>
          <div style={{ marginTop: 10, fontSize: 13 }}>{head.penerima}</div>
          <h1 style={{ textAlign: "center", fontWeight: 800, fontSize: 15, margin: "16px 0", textDecoration: "underline" }}>{tpl.tajuk}</h1>
          <div style={{ whiteSpace: "pre-wrap" }}>{body}</div>
          <div style={{ marginTop: 30 }}>
            <div>Yang menjalankan tugas,</div>
            <div style={{ marginTop: 40, fontWeight: 700 }}>………………………………</div>
            <div>({head.pengirim || "Nama Pengirim"})</div>
            <div>{head.jawatan}</div>
            <div>{head.sekolah}</div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
