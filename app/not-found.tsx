import Link from "next/link";
export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <div className="font-display text-6xl font-extrabold text-teal-600">404</div>
      <h1 className="mt-3 font-display text-2xl font-bold">Halaman tidak dijumpai</h1>
      <p className="mt-2 text-sm muted">Mungkin alat ini masih dalam pembinaan atau pautan telah berubah.</p>
      <div className="mt-6 flex gap-2">
        <Link href="/" className="cb-btn-primary">Ke Utama</Link>
        <Link href="/alat" className="cb-btn-ghost">Semua Alat</Link>
      </div>
    </div>
  );
}
