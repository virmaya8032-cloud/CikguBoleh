"use client";

import { useEffect, useState } from "react";
import { Quote } from "lucide-react";

interface PublicMsg {
  display_name: string;
  message: string;
  admin_reply?: string | null;
  created_at?: string;
}

export function KataCikgu() {
  const [msgs, setMsgs] = useState<PublicMsg[] | null>(null);

  useEffect(() => {
    fetch("/api/feedback?public=1&limit=6")
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((d) => setMsgs(d.items ?? []))
      .catch(() => setMsgs([]));
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <h2 className="font-display text-2xl font-extrabold">Kata Cikgu</h2>
      <p className="mt-1 text-sm muted">Maklum balas daripada pengguna CikguBoleh.</p>

      {msgs === null && <p className="mt-6 text-sm muted">Memuatkan…</p>}

      {msgs !== null && msgs.length === 0 && (
        <div className="surface mt-6 rounded-2xl p-8 text-center">
          <p className="font-medium">Belum ada mesej untuk dipaparkan.</p>
          <p className="mt-1 text-sm muted">
            Mesej yang diluluskan admin dan dibenarkan untuk paparan awam akan muncul di sini.
          </p>
        </div>
      )}

      {msgs && msgs.length > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {msgs.map((m, i) => (
            <div key={i} className="surface rounded-2xl p-5 shadow-card">
              <Quote className="h-5 w-5 text-marigold-400" />
              <p className="mt-2 text-sm">{m.message}</p>
              <p className="mt-3 text-sm font-semibold">{m.display_name}</p>
              {m.admin_reply && (
                <div className="mt-3 rounded-lg bg-teal-50 p-3 text-sm dark:bg-teal-950/40">
                  <span className="font-semibold text-teal-700 dark:text-teal-300">Balasan CikguBoleh: </span>
                  {m.admin_reply}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
