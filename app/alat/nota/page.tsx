"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface Note { id: number; title: string; body: string }

export default function NotaPage() {
  const { value: notes, setValue: setNotes } = useLocalStorage<Note[]>("cikguboleh_notes", []);
  const [active, setActive] = useState<number | null>(null);

  const add = () => {
    const n = { id: Date.now(), title: "Nota baharu", body: "" };
    setNotes((p) => [n, ...p]); setActive(n.id);
  };
  const update = (id: number, k: keyof Note, v: string) =>
    setNotes((p) => p.map((n) => (n.id === id ? { ...n, [k]: v } : n)));
  const remove = (id: number) => { setNotes((p) => p.filter((n) => n.id !== id)); if (active === id) setActive(null); };

  const current = notes.find((n) => n.id === active);

  return (
    <ToolLayout slug="/alat/nota">
      <div className="grid gap-4 md:grid-cols-[280px_1fr]">
        <div className="surface rounded-2xl p-4 shadow-card">
          <button onClick={add} className="cb-btn-primary w-full"><Plus className="h-4 w-4" /> Nota baharu</button>
          <ul className="mt-3 space-y-1">
            {notes.map((n) => (
              <li key={n.id}>
                <button onClick={() => setActive(n.id)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${active === n.id ? "bg-teal-50 dark:bg-teal-950/40" : "hover:bg-black/5 dark:hover:bg-white/5"}`}>
                  <span className="truncate">{n.title || "Tanpa tajuk"}</span>
                </button>
              </li>
            ))}
          </ul>
          {notes.length === 0 && <p className="mt-4 text-center text-xs muted">Tiada nota lagi.</p>}
        </div>

        <div className="surface rounded-2xl p-5 shadow-card">
          {current ? (
            <>
              <div className="flex items-center gap-2">
                <input className="cb-input font-display font-bold" value={current.title} onChange={(e) => update(current.id, "title", e.target.value)} />
                <button onClick={() => remove(current.id)} aria-label="Padam nota" className="p-2 muted hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
              </div>
              <textarea className="cb-input mt-3 min-h-[280px]" value={current.body} onChange={(e) => update(current.id, "body", e.target.value)} placeholder="Mula menaip…" />
              <p className="mt-2 text-xs muted">Disimpan pada peranti</p>
            </>
          ) : (
            <p className="py-16 text-center text-sm muted">Pilih atau cipta nota untuk mula.</p>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
