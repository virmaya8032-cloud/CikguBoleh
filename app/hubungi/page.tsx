import Link from "next/link";
export const metadata = { title: "Hubungi" };
export default function HubungiPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-display text-3xl font-extrabold">Hubungi Kami</h1>
      <p className="mt-4 text-sm leading-relaxed muted">
        Cara terbaik untuk menghubungi kami buat masa ini ialah melalui borang maklum balas.
        Kami membaca setiap mesej yang dihantar.
      </p>
      <Link href="/maklum-balas" className="cb-btn-primary mt-5">Buka Borang Maklum Balas</Link>
    </div>
  );
}
