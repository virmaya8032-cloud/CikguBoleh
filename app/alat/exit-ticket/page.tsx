"use client";

import { useState } from "react";
import { Printer } from "lucide-react";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { printPage } from "@/services/export";

export default function ExitTicketPage() {
  const [subject, setSubject] = useState("");
  const [question, setQuestion] = useState("Terangkan satu perkara yang anda pelajari hari ini.");
  const [count, setCount] = useState(6);

  const tickets = Array.from({ length: count });

  return (
    <ToolLayout slug="/alat/exit-ticket">
      <div className="surface rounded-2xl p-5 shadow-card no-print">
        <div className="grid gap-3 sm:grid-cols-3">
          <div><label className="cb-label">Subjek / Tajuk</label><input className="cb-input" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="cth: Matematik — Darab" /></div>
          <div className="sm:col-span-2"><label className="cb-label">Soalan tambahan</label><input className="cb-input" value={question} onChange={(e) => setQuestion(e.target.value)} /></div>
        </div>
        <div className="mt-3 flex items-end gap-3">
          <div><label className="cb-label">Tiket setiap A4</label>
            <select className="cb-input w-24" value={count} onChange={(e) => setCount(Number(e.target.value))}>
              {[4, 6, 8].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <button onClick={() => printPage("/alat/exit-ticket")} className="cb-btn-primary"><Printer className="h-4 w-4" /> Cetak</button>
        </div>
      </div>

      <div className="print-area mt-6">
        <div className={`grid gap-3 ${count >= 6 ? "grid-cols-2" : "grid-cols-2"}`}>
          {tickets.map((_, i) => (
            <div key={i} className="rounded-xl border-2 border-dashed p-4" style={{ borderColor: "#94a3b8" }}>
              <div className="text-xs font-bold uppercase tracking-wide" style={{ color: "#0b5f59" }}>Exit Ticket</div>
              {subject && <div className="text-xs" style={{ color: "#555" }}>{subject}</div>}
              <div className="mt-2 text-sm">Nama: ____________________</div>
              <div className="mt-2 text-sm font-medium">1. Apa yang saya belajar hari ini?</div>
              <div className="mt-1 h-6 border-b" style={{ borderColor: "#cbd5e1" }} />
              <div className="mt-2 text-sm font-medium">2. Apa yang saya belum faham?</div>
              <div className="mt-1 h-6 border-b" style={{ borderColor: "#cbd5e1" }} />
              <div className="mt-2 text-sm font-medium">Kefahaman saya: 1 &nbsp; 2 &nbsp; 3 &nbsp; 4 &nbsp; 5</div>
              {question && <div className="mt-2 text-sm font-medium">3. {question}</div>}
              {question && <div className="mt-1 h-6 border-b" style={{ borderColor: "#cbd5e1" }} />}
            </div>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
}
