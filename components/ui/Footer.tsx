import Link from "next/link";

const LINKS = [
  { label: "Tentang", href: "/tentang" },
  { label: "Privasi", href: "/privasi" },
  { label: "Terma", href: "/terma" },
  { label: "Hubungi", href: "/hubungi" },
  { label: "Maklum Balas", href: "/maklum-balas" },
  { label: "Semua Alat", href: "/alat" },
];

export function Footer() {
  return (
    <footer className="mt-16 border-t no-print" style={{ borderColor: "var(--border)" }}>
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <div className="font-display text-lg font-extrabold">
              Cikgu<span className="text-marigold-500">Boleh</span>
            </div>
            <p className="mt-1 text-sm muted">Isi Sekali. Semua Siap.</p>
            <p className="mt-3 text-xs muted">
              Platform bebas untuk guru Malaysia. Bukan laman rasmi Kementerian Pendidikan Malaysia.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="text-sm muted hover:text-teal-600">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="mt-8 text-xs muted">
          © {new Date().getFullYear()} CikguBoleh · dibina oleh <span className="font-semibold">VMY</span>.
          <span className="ml-1 opacity-70">Versi {process.env.NEXT_PUBLIC_BUILD_VERSION ?? "dev"}</span>
        </div>
      </div>
    </footer>
  );
}
