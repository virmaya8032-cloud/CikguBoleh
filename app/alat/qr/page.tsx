"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Download } from "lucide-react";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { useToast } from "@/components/ui/Toast";
import { downloadText } from "@/services/export";
import { trackEvent } from "@/services/analytics";

type Kind = "url" | "teks" | "wifi" | "telefon" | "whatsapp" | "email";

const KINDS: { id: Kind; label: string }[] = [
  { id: "url", label: "URL" },
  { id: "teks", label: "Teks" },
  { id: "wifi", label: "WiFi" },
  { id: "telefon", label: "Telefon" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "email", label: "Email" },
];

export default function QrPage() {
  const toast = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [kind, setKind] = useState<Kind>("url");
  const [fields, setFields] = useState({ text: "https://cikguboleh.vercel.app", ssid: "", pass: "", enc: "WPA", phone: "", msg: "", email: "", subject: "" });
  const [size, setSize] = useState(320);
  const [payload, setPayload] = useState("");

  function build(): string {
    const f = fields;
    switch (kind) {
      case "wifi": return `WIFI:T:${f.enc};S:${f.ssid};P:${f.pass};;`;
      case "telefon": return `tel:${f.phone}`;
      case "whatsapp": return `https://wa.me/${f.phone.replace(/\D/g, "")}${f.msg ? `?text=${encodeURIComponent(f.msg)}` : ""}`;
      case "email": return `mailto:${f.email}${f.subject ? `?subject=${encodeURIComponent(f.subject)}` : ""}`;
      default: return f.text;
    }
  }

  useEffect(() => {
    const data = build();
    setPayload(data);
    if (canvasRef.current && data) {
      QRCode.toCanvas(canvasRef.current, data, { width: size, margin: 2, color: { dark: "#0b5f59", light: "#ffffff" } }).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, fields, size]);

  async function downloadPNG() {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url; a.download = "qr-cikguboleh.png"; a.click();
    trackEvent("qr_generate", { toolSlug: "/alat/qr", metadata: { fmt: "png" } });
    toast("Kod QR dimuat turun (PNG).");
  }

  async function downloadSVG() {
    const svg = await QRCode.toString(payload, { type: "svg", margin: 2, color: { dark: "#0b5f59", light: "#ffffff" } });
    downloadText("qr-cikguboleh.svg", svg, "image/svg+xml");
    trackEvent("qr_generate", { toolSlug: "/alat/qr", metadata: { fmt: "svg" } });
    toast("Kod QR dimuat turun (SVG).");
  }

  const set = (k: keyof typeof fields, v: string) => setFields((p) => ({ ...p, [k]: v }));

  return (
    <ToolLayout slug="/alat/qr">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="surface rounded-2xl p-5 shadow-card">
          <div className="mb-4 flex flex-wrap gap-2">
            {KINDS.map((k) => (
              <button key={k.id} onClick={() => setKind(k.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${kind === k.id ? "bg-teal-600 text-white" : "surface muted"}`}>
                {k.label}
              </button>
            ))}
          </div>

          {(kind === "url" || kind === "teks") && (
            <div>
              <label className="cb-label">{kind === "url" ? "Pautan" : "Teks"}</label>
              <textarea className="cb-input min-h-[80px]" value={fields.text} onChange={(e) => set("text", e.target.value)} />
            </div>
          )}
          {kind === "wifi" && (
            <div className="space-y-3">
              <div><label className="cb-label">Nama WiFi (SSID)</label><input className="cb-input" value={fields.ssid} onChange={(e) => set("ssid", e.target.value)} /></div>
              <div><label className="cb-label">Kata laluan</label><input className="cb-input" value={fields.pass} onChange={(e) => set("pass", e.target.value)} /></div>
              <div><label className="cb-label">Enkripsi</label>
                <select className="cb-input" value={fields.enc} onChange={(e) => set("enc", e.target.value)}>
                  <option value="WPA">WPA/WPA2</option><option value="WEP">WEP</option><option value="nopass">Tiada</option>
                </select>
              </div>
            </div>
          )}
          {(kind === "telefon" || kind === "whatsapp") && (
            <div className="space-y-3">
              <div><label className="cb-label">Nombor telefon</label><input className="cb-input" placeholder="60123456789" value={fields.phone} onChange={(e) => set("phone", e.target.value)} /></div>
              {kind === "whatsapp" && <div><label className="cb-label">Mesej (pilihan)</label><input className="cb-input" value={fields.msg} onChange={(e) => set("msg", e.target.value)} /></div>}
            </div>
          )}
          {kind === "email" && (
            <div className="space-y-3">
              <div><label className="cb-label">Email</label><input className="cb-input" value={fields.email} onChange={(e) => set("email", e.target.value)} /></div>
              <div><label className="cb-label">Subjek (pilihan)</label><input className="cb-input" value={fields.subject} onChange={(e) => set("subject", e.target.value)} /></div>
            </div>
          )}

          <div className="mt-4">
            <label className="cb-label">Saiz: {size}px</label>
            <input type="range" min={160} max={640} step={16} value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-full accent-teal-600" />
          </div>
        </div>

        <div className="surface flex flex-col items-center justify-center gap-4 rounded-2xl p-5 shadow-card">
          <canvas ref={canvasRef} className="max-w-full rounded-xl" />
          <div className="flex gap-2">
            <button onClick={downloadPNG} className="cb-btn-primary"><Download className="h-4 w-4" /> PNG</button>
            <button onClick={downloadSVG} className="cb-btn-ghost"><Download className="h-4 w-4" /> SVG</button>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
