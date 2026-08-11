export const metadata = { title: "Terma" };
export default function TermaPage() {
  const points = [
    "CikguBoleh ialah alat bantuan untuk guru.",
    "Output yang dijana (termasuk AI) perlu disemak sebelum digunakan.",
    "Guru bertanggungjawab menyemak ketepatan dokumen.",
    "CikguBoleh bukan laman rasmi Kementerian Pendidikan Malaysia.",
    "Pengguna bertanggungjawab terhadap data yang dimasukkan.",
  ];
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-display text-3xl font-extrabold">Terma Penggunaan</h1>
      <ul className="mt-4 space-y-2 text-sm leading-relaxed muted">
        {points.map((p) => <li key={p}>• {p}</li>)}
      </ul>
    </div>
  );
}
