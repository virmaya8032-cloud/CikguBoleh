export const metadata = { title: "Privasi" };
export default function PrivasiPage() {
  const points = [
    "Majoriti alat memproses data pada peranti anda (local processing) menggunakan localStorage.",
    "Analitik hanya menyimpan metadata tanpa nama: sesi anonim, jenis peristiwa, alat, halaman, jenis peranti dan masa.",
    "Data murid (nama, markah, kandungan dokumen) TIDAK digunakan untuk analitik.",
    "Email dalam maklum balas hanya dilihat oleh admin dan tidak dipaparkan kepada umum.",
    "Kami tidak menjual data anda.",
    "Fail hanya dimuat naik apabila sesuatu alat memerlukannya.",
  ];
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-display text-3xl font-extrabold">Privasi</h1>
      <ul className="mt-4 space-y-2 text-sm leading-relaxed muted">
        {points.map((p) => <li key={p}>• {p}</li>)}
      </ul>
    </div>
  );
}
