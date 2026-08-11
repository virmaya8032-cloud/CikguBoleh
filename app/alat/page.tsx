import type { Metadata } from "next";
import { ToolExplorer } from "@/components/ui/ToolExplorer";

export const metadata: Metadata = {
  title: "Semua Alat",
  description: "Terokai semua alat CikguBoleh: RPH, worksheet, soalan, markah, PPKI, QR dan lagi.",
};

export default function AlatPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="font-display text-3xl font-extrabold">Semua Alat</h1>
      <p className="mt-1 text-sm muted">Cari atau tapis mengikut kategori. Klik untuk mula.</p>
      <div className="mt-6">
        <ToolExplorer />
      </div>
    </div>
  );
}
