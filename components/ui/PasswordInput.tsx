"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

/** Input kata laluan dengan toggle tunjuk/sembunyi yang accessible. */
export function PasswordInput(props: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  autoComplete?: string;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={props.value}
        onChange={props.onChange}
        onKeyDown={props.onKeyDown}
        autoComplete={props.autoComplete}
        placeholder={props.placeholder}
        autoFocus={props.autoFocus}
        className={`cb-input pr-10 ${props.className ?? ""}`}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? "Sembunyikan kata laluan" : "Tunjukkan kata laluan"}
        aria-pressed={show}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 muted hover:bg-black/5 hover:text-teal-700 dark:hover:bg-white/10 dark:hover:text-teal-300"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}
