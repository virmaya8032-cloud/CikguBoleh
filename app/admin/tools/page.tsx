import { AdminShell } from "@/components/admin/AdminShell";
import { TOOLS } from "@/data/tools";

const STATUS_STYLE: Record<string, string> = {
  ready: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
  beta: "bg-marigold-100 text-marigold-700 dark:bg-marigold-900/40 dark:text-marigold-300",
  "coming-soon": "bg-black/5 dark:bg-white/10",
};

export default function AdminTools() {
  return (
    <AdminShell title="Tools">
      <p className="mb-4 text-sm muted">
        Status alat dibaca daripada registri pusat (data/tools.ts). Untuk mengubah status atau ciri
        featured secara dinamik, sambungkan registri kepada pangkalan data.
      </p>
      <div className="surface overflow-hidden rounded-2xl shadow-card">
        <table className="w-full text-sm">
          <thead><tr className="text-left muted">
            <th className="p-3 font-medium">Alat</th><th className="p-3 font-medium">Kategori</th>
            <th className="p-3 font-medium">Status</th><th className="p-3 font-medium">Featured</th>
          </tr></thead>
          <tbody>
            {TOOLS.map((t) => (
              <tr key={t.slug} className="border-t" style={{ borderColor: "var(--border)" }}>
                <td className="p-3 font-medium">{t.name}<div className="text-xs muted">{t.slug}</div></td>
                <td className="p-3 muted">{t.category}</td>
                <td className="p-3"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLE[t.status]}`}>{t.status}</span></td>
                <td className="p-3">{t.featured ? "★" : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
