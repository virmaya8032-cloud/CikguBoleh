"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Send, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

const CATEGORIES = ["Cadangan", "Penghargaan", "Masalah", "Idea Tool Baru", "Lain-lain"];
const NAME_KEY = "cikguboleh_feedback_name";
const EMAIL_KEY = "cikguboleh_feedback_email";

export default function FeedbackPage() {
  const toast = useToast();
  const [f, setF] = useState({
    name: "", email: "", subject: "", message: "", category: "Cadangan",
    display_name_mode: "penuh", allow_public_display: false, remember: false, website: "",
  });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const set = (k: keyof typeof f, v: string | boolean) => setF((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    const name = localStorage.getItem(NAME_KEY);
    const email = localStorage.getItem(EMAIL_KEY);
    if (name || email) setF((p) => ({ ...p, name: name ?? "", email: email ?? "", remember: true }));

    // Auto-isi daripada akaun jika sudah login (mengatasi nilai localStorage).
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((me) => {
        if (me?.authenticated && me.email) {
          setLoggedIn(true);
          setF((p) => ({ ...p, name: me.name ?? p.name, email: me.email, remember: false }));
        }
      })
      .catch(() => {});
  }, []);

  async function submit() {
    if (!f.name.trim() || !f.email.trim() || !f.message.trim()) {
      toast("Sila lengkapkan nama, email dan mesej.", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f),
      });
      const data = await res.json();
      if (!res.ok) { toast(data.error ?? "Ralat menghantar.", "error"); return; }

      if (f.remember) {
        localStorage.setItem(NAME_KEY, f.name);
        localStorage.setItem(EMAIL_KEY, f.email);
      } else {
        localStorage.removeItem(NAME_KEY);
        localStorage.removeItem(EMAIL_KEY);
      }
      setSent(true);
    } catch {
      toast("Ralat rangkaian. Cuba lagi.", "error");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-teal-600" />
        <h1 className="mt-4 font-display text-2xl font-extrabold">Terima kasih!</h1>
        <p className="mt-2 text-sm muted">
          Mesej anda telah dihantar dan sedang menunggu semakan admin. Ia tidak akan disiarkan secara automatik.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <button onClick={() => { setSent(false); set("message", ""); set("subject", ""); }} className="cb-btn-ghost">Hantar lagi</button>
          <Link href="/maklum-balas/komuniti" className="cb-btn-primary">Lihat Kata Cikgu</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-display text-3xl font-extrabold">Maklum Balas</h1>
      <p className="mt-1 text-sm muted">Kongsi cadangan, penghargaan atau laporkan masalah. Email anda hanya dilihat admin.</p>

      <div className="surface mt-6 rounded-2xl p-5 shadow-card">
        <div className="grid gap-3 sm:grid-cols-2">
          <div><label className="cb-label">Nama</label><input className={`cb-input ${loggedIn ? "opacity-70" : ""}`} value={f.name} onChange={(e) => set("name", e.target.value)} maxLength={100} readOnly={loggedIn} /></div>
          <div><label className="cb-label">Email</label><input type="email" className={`cb-input ${loggedIn ? "opacity-70" : ""}`} value={f.email} onChange={(e) => set("email", e.target.value)} readOnly={loggedIn} /></div>
        {loggedIn && <p className="-mt-1 text-xs muted">Nama dan e-mel diisi automatik daripada akaun anda.</p>}
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div><label className="cb-label">Tajuk (pilihan)</label><input className="cb-input" value={f.subject} onChange={(e) => set("subject", e.target.value)} maxLength={150} /></div>
          <div><label className="cb-label">Kategori</label>
            <select className="cb-input" value={f.category} onChange={(e) => set("category", e.target.value)}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
          </div>
        </div>
        <div className="mt-3"><label className="cb-label">Mesej</label>
          <textarea className="cb-input min-h-[120px]" value={f.message} onChange={(e) => set("message", e.target.value)} maxLength={2000} />
          <p className="mt-1 text-right text-xs muted">{f.message.length}/2000</p>
        </div>

        {/* Honeypot — hidden from real users */}
        <input tabIndex={-1} autoComplete="off" value={f.website} onChange={(e) => set("website", e.target.value)}
          className="hidden" aria-hidden name="website" />

        <div className="mt-3">
          <label className="cb-label">Nama yang dipaparkan (jika disiarkan)</label>
          <select className="cb-input" value={f.display_name_mode} onChange={(e) => set("display_name_mode", e.target.value)}>
            <option value="penuh">Nama penuh</option>
            <option value="pertama">Nama pertama sahaja</option>
            <option value="anonymous">Anonymous / Cikgu</option>
          </select>
        </div>

        <label className="mt-3 flex items-start gap-2 text-sm">
          <input type="checkbox" className="mt-1 accent-teal-600" checked={f.allow_public_display} onChange={(e) => set("allow_public_display", e.target.checked)} />
          <span>Saya membenarkan mesej ini dipaparkan di CikguBoleh selepas diluluskan oleh admin.</span>
        </label>
        {!loggedIn && (
          <label className="mt-2 flex items-start gap-2 text-sm">
            <input type="checkbox" className="mt-1 accent-teal-600" checked={f.remember} onChange={(e) => set("remember", e.target.checked)} />
            <span>Ingat nama dan email saya pada peranti ini.</span>
          </label>
        )}

        <button onClick={submit} disabled={loading} className="cb-btn-accent mt-5 w-full">
          <Send className="h-4 w-4" /> {loading ? "Menghantar…" : "Hantar Mesej"}
        </button>
      </div>
    </div>
  );
}
