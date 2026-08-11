"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { CheckCircle2, XCircle, Info } from "lucide-react";

type ToastKind = "success" | "error" | "info";
interface ToastItem { id: number; msg: string; kind: ToastKind }

const ToastCtx = createContext<(msg: string, kind?: ToastKind) => void>(() => {});

export function useToast() {
  return useContext(ToastCtx);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const show = useCallback((msg: string, kind: ToastKind = "success") => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev, { id, msg, kind }]);
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 3200);
  }, []);

  return (
    <ToastCtx.Provider value={show}>
      {children}
      <div className="fixed bottom-4 left-1/2 z-[100] flex -translate-x-1/2 flex-col gap-2 no-print">
        {items.map((t) => (
          <div
            key={t.id}
            role="status"
            className="surface flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm shadow-lift animate-fade-up"
          >
            {t.kind === "success" && <CheckCircle2 className="h-4 w-4 text-teal-600" />}
            {t.kind === "error" && <XCircle className="h-4 w-4 text-red-500" />}
            {t.kind === "info" && <Info className="h-4 w-4 text-marigold-500" />}
            <span>{t.msg}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
