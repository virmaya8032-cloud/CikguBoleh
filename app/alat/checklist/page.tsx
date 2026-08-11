"use client";

import { useState } from "react";
import { Plus, Trash2, Check } from "lucide-react";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface Task { id: number; text: string; done: boolean; priority: "rendah" | "sederhana" | "tinggi" }
const PRIO: Task["priority"][] = ["rendah", "sederhana", "tinggi"];
const PRIO_COLOR: Record<Task["priority"], string> = {
  rendah: "text-teal-600", sederhana: "text-marigold-500", tinggi: "text-red-500",
};

export default function ChecklistPage() {
  const { value: tasks, setValue: setTasks } = useLocalStorage<Task[]>("cikguboleh_checklist", []);
  const [text, setText] = useState("");

  const add = () => {
    if (!text.trim()) return;
    setTasks((p) => [{ id: Date.now(), text: text.trim(), done: false, priority: "sederhana" }, ...p]);
    setText("");
  };
  const toggle = (id: number) => setTasks((p) => p.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  const cyclePrio = (id: number) => setTasks((p) => p.map((t) => t.id === id ? { ...t, priority: PRIO[(PRIO.indexOf(t.priority) + 1) % 3] } : t));
  const remove = (id: number) => setTasks((p) => p.filter((t) => t.id !== id));

  const done = tasks.filter((t) => t.done).length;

  return (
    <ToolLayout slug="/alat/checklist">
      <div className="surface rounded-2xl p-5 shadow-card">
        <div className="flex gap-2">
          <input className="cb-input" value={text} onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()} placeholder="Tambah tugasan… (Enter)" />
          <button onClick={add} className="cb-btn-primary"><Plus className="h-4 w-4" /></button>
        </div>
        {tasks.length > 0 && <p className="mt-2 text-xs muted">{done}/{tasks.length} selesai · disimpan pada peranti</p>}

        <ul className="mt-4 space-y-2">
          {tasks.map((t) => (
            <li key={t.id} className="flex items-center gap-3 rounded-xl border p-3" style={{ borderColor: "var(--border)" }}>
              <button onClick={() => toggle(t.id)} aria-label="Tanda selesai"
                className={`flex h-5 w-5 items-center justify-center rounded border ${t.done ? "bg-teal-600 text-white" : ""}`}
                style={{ borderColor: "var(--border)" }}>
                {t.done && <Check className="h-3.5 w-3.5" />}
              </button>
              <span className={`flex-1 text-sm ${t.done ? "line-through muted" : ""}`}>{t.text}</span>
              <button onClick={() => cyclePrio(t.id)} className={`text-xs font-semibold ${PRIO_COLOR[t.priority]}`}>{t.priority}</button>
              <button onClick={() => remove(t.id)} aria-label="Padam" className="muted hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
            </li>
          ))}
        </ul>
        {tasks.length === 0 && <p className="mt-6 text-center text-sm muted">Belum ada tugasan. Tambah satu untuk bermula.</p>}
      </div>
    </ToolLayout>
  );
}
