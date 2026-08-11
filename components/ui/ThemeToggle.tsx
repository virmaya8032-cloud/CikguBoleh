"use client";

import { useEffect, useState } from "react";
import { Moon, Sun, Monitor } from "lucide-react";

type Mode = "light" | "dark" | "system";

function apply(mode: Mode) {
  const dark =
    mode === "dark" ||
    (mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

export function ThemeToggle() {
  const [mode, setMode] = useState<Mode>("system");

  useEffect(() => {
    const saved = (localStorage.getItem("cikguboleh_theme") as Mode) || "system";
    setMode(saved);
    apply(saved);
  }, []);

  const cycle = () => {
    const next: Mode = mode === "light" ? "dark" : mode === "dark" ? "system" : "light";
    setMode(next);
    localStorage.setItem("cikguboleh_theme", next);
    apply(next);
  };

  return (
    <button
      onClick={cycle}
      className="cb-btn-ghost !px-2.5 !py-2"
      aria-label={`Tema: ${mode}. Tekan untuk tukar.`}
      title={`Tema: ${mode}`}
    >
      {mode === "light" && <Sun className="h-4 w-4" />}
      {mode === "dark" && <Moon className="h-4 w-4" />}
      {mode === "system" && <Monitor className="h-4 w-4" />}
    </button>
  );
}
