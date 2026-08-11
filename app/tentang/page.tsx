export const metadata = { title: "Tentang" };
export default function TentangPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-display text-3xl font-extrabold">Tentang CikguBoleh</h1>
      <p className="mt-4 text-sm leading-relaxed muted">
        CikguBoleh dibina untuk membantu guru mengurangkan kerja berulang dengan menyediakan alat
        pengajaran, pentaksiran, pengurusan murid dan dokumen sekolah dalam satu platform.
        Konsepnya mudah: isi maklumat sekali, dan gunakan semula untuk pelbagai bahan.
      </p>
      <p className="mt-3 text-sm leading-relaxed muted">
        Majoriti alat boleh digunakan tanpa log masuk dan memproses data pada peranti anda.
        CikguBoleh ialah platform bebas dan bukan laman rasmi Kementerian Pendidikan Malaysia.
      </p>
    </div>
  );
}
