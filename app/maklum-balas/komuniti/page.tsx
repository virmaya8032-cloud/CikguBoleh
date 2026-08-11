"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Quote, ArrowLeft } from "lucide-react";

interface PublicMsg { display_name: string; message: string; admin_reply?: string | null }

export default function KomunitiPage() {
  const [msgs, setMsgs] = useState<PublicMsg[] | null>(null);

  useEffect(() => {
    fetch("/api/feedback?public=1&limit=100")
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((d) => setMsgs(d.items ?? []))
      .catch(() => setMsgs([]));
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link href="/maklum-balas" className="mb-4 inline-flex items-center gap-1 text-sm muted hover:text-teal-600"><ArrowLeft className="h-4 w-4" /> Hantar maklum balas</Link>
      <h1 className="font-display text-3xl font-extrabold">Kata Cikgu</h1>
      <p className="mt-1 text-sm muted">Maklum balas yang diluluskan daripada pengguna CikguBoleh.</p>

      {msgs === null && <p className="mt-6 text-sm muted">Memuatkan…</p>}
      {msgs !== null && msgs.length === 0 && (
        <div className="surface mt-6 rounded-2xl p-8 text-center">
          <p className="font-medium">Belum ada mesej untuk dipaparkan.</p>
        </div>
      )}
      {msgs && msgs.length > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
          {msgs.map((m, i) => (
            <div key={i} className="surface rounded-2xl p-5 shadow-card">
              <Quote className="h-5 w-5 text-marigold-400" />
              <p className="mt-2 text-sm">{m.message}</p>
              <p className="mt-3 text-sm font-semibold">{m.display_name}</p>
              {m.admin_reply && (
                <div className="mt-3 rounded-lg bg-teal-50 p-3 text-sm dark:bg-teal-950/40">
                  <span className="font-semibold text-teal-700 dark:text-teal-300">Balasan CikguBoleh: </span>{m.admin_reply}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
