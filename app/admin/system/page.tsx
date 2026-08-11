import { AdminShell } from "@/components/admin/AdminShell";
import { isAiConfigured, activeProvider } from "@/services/ai";
import { usingDevPassword } from "@/lib/auth";

export default function AdminSystem() {
  const rows: [string, string, boolean][] = [
    ["Pangkalan data", process.env.DATABASE_URL ? "Disambung" : "In-memory (demo)", Boolean(process.env.DATABASE_URL)],
    ["Analitik", process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === "false" ? "Dimatikan" : "Aktif", process.env.NEXT_PUBLIC_ANALYTICS_ENABLED !== "false"],
    ["AI", isAiConfigured() ? `Dikonfigur (${activeProvider()})` : "Mode Demo (templat)", isAiConfigured()],
    ["Kata laluan admin", usingDevPassword() ? "Lalai pembangunan — sila tukar!" : "Ditetapkan (hash)", !usingDevPassword()],
    ["Persekitaran", process.env.NODE_ENV ?? "unknown", true],
  ];
  return (
    <AdminShell title="System">
      <div className="surface rounded-2xl p-5 shadow-card">
        <div className="space-y-3">
          {rows.map(([k, v, ok]) => (
            <div key={k} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0" style={{ borderColor: "var(--border)" }}>
              <span className="text-sm font-medium">{k}</span>
              <span className="flex items-center gap-2 text-sm muted">
                <span className={`h-2 w-2 rounded-full ${ok ? "bg-teal-500" : "bg-marigold-400"}`} />{v}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs muted">Rahsia (kunci API, kata laluan) tidak pernah dipaparkan di sini.</p>
      </div>
    </AdminShell>
  );
}
