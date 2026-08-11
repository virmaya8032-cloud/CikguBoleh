# CikguBoleh

**Isi Sekali. Semua Siap.** — Platform alat, AI dan toolbox untuk guru Malaysia.

Dibina dengan **Next.js 14 (App Router) + TypeScript + Tailwind CSS**. Majoriti alat berfungsi **tanpa log masuk** dan memproses data **pada peranti anda** (localStorage). Boleh terus di-deploy ke **Vercel**.

---

## ⚡ Ringkasan jujur (baca dahulu)

Projek ini ialah **foundation sebenar yang berfungsi**, bukan mockup. Setiap alat yang bertanda *Siap* betul-betul jalan (borang, kiraan, cetak, muat turun). Dua perkara memerlukan konfigurasi anda untuk "hidup" sepenuhnya di produksi:

| Ciri | Tanpa konfigurasi | Dengan konfigurasi |
|------|-------------------|--------------------|
| **AI** (RPH Auto, Jana Semua, Soalan) | Mode Demo — output templat yang berfungsi penuh | Sambung `AI_API_KEY` untuk output AI sebenar |
| **Simpanan kekal** (feedback, analitik) | In-memory (demo, reset bila deploy) | Sambung `DATABASE_URL` (Postgres/Supabase) untuk kekal |

Semua yang lain — alat, cetak/PDF/Word, admin, moderasi, tema gelap, PWA, SEO — berfungsi terus.

---

## ✅ Apa yang sudah siap & berfungsi

**Alat berfungsi penuh (client-side):**
- RPH (borang penuh, tambah langkah, autosave, cetak/PDF, eksport Word)
- RPH Auto & CikguBoleh AI "Jana Semua" (Mode Demo templat)
- Generator Soalan (6 jenis: Objektif, Struktur, Subjektif, Betul/Salah, Isi tempat kosong, KBAT)
- Jadual Markah + Analisis Markah (min/median/purata/gred + carta)
- QR Generator (URL/teks/WiFi/telefon/WhatsApp/email → PNG & SVG)
- Pemilih Nama Rawak, Bahagi Kumpulan, Kira Umur (pukal + CSV), Susun Nama
- Exit Ticket (cetak 4/6/8 satu A4), Refleksi RPH, Objektif Pembelajaran
- Toolbox Teks, Checklist, Nota Pantas, Kalkulator Tarikh
- **PPKI:** RPI penuh + Task Analysis (jejak penguasaan langkah) + hub PPKI
- **Dokumen Sekolah:** Generator Sijil (muat naik logo, cetak landskap), Generator Surat Sekolah (4 templat + Word), Label Nama (grid A4)
- **Pengurusan Murid:** Kehadiran harian (kitar Hadir/Tidak/Sakit/Cuti, % automatik, CSV)
- **Pentaksiran:** Worksheet Generator (soalan + skema, cetak/Word)

**Sistem:**
- Admin berkunci (`/admin`) — auth kuki + kata laluan **hash SHA-256** (bukan plaintext), dilindungi **server-side** melalui middleware
- Dashboard analitik, moderasi feedback (lulus/tolak/sembunyi/balas/padam), senarai tools, status sistem
- "Kata Cikgu" — feedback **tidak** disiarkan automatik: `pending → admin lulus → (jika izin awam) → papar`. **Email tidak pernah dipaparkan kepada umum.**
- Analitik anonim (metadata sahaja — tiada nama/markah/kandungan murid)
- Ruang Saya (kegemaran, terkini, draf, padam semua data peranti)
- Tema terang/gelap/sistem, PWA (manifest + ikon), SEO (sitemap, robots, OG), 404, halaman statik (Tentang/Privasi/Terma/Hubungi)

## 🚧 Perlu konfigurasi anda (jujur)
- **Kesemua 26 alat kini dibina dan berfungsi** (18 *ready*, 8 *beta* templat). Tiada lagi "Akan Datang" dan tiada butang mati.
- Wiring AI provider sebenar (OpenAI/Anthropic/Google) ialah stub yang jelas — masukkan kunci untuk mengaktifkan output AI (jika tidak, Mode Demo templat digunakan).
- Lapisan DB ialah abstraksi in-memory yang boleh ditukar; fungsi query Postgres perlu diisi mengikut `database/schema.sql` untuk simpanan kekal.

---

## 🛠️ Jalankan secara tempatan

Perlu **Node.js 18.17+** (disyorkan 20/22).

```bash
npm install
cp .env.example .env.local   # pilihan — ada nilai lalai
npm run dev                  # http://localhost:3000
```

Bina produksi:
```bash
npm run build
npm run start
```

Skrip lain: `npm run lint`, `npm run typecheck`.

---

## 🔐 Admin

- URL: `/admin` (auto-redirect ke `/admin/login` jika belum log masuk)
- Kata laluan lalai pembangunan: **`admin123`** — **WAJIB tukar untuk produksi.**
- Jana hash kata laluan anda:
  ```bash
  node -e "console.log(require('crypto').createHash('sha256').update('KATA_LALUAN_ANDA').digest('hex'))"
  ```
  Letak nilai itu dalam `ADMIN_PASSWORD_HASH`, dan set `ADMIN_SESSION_SALT` kepada rentetan rawak.

> Nota keselamatan: ini auth kuki ringkas yang sesuai untuk satu admin. Untuk pasukan/berbilang admin, sambungkan Supabase Auth atau NextAuth.

---

## 🗄️ Pangkalan data (pilihan tetapi disyorkan untuk produksi)

1. Cipta Postgres (Supabase / Neon).
2. Jalankan `database/schema.sql`.
3. Set `DATABASE_URL` di `.env.local` / Vercel.
4. Ganti isi fungsi dalam `lib/store.ts` dengan query sebenar (tandatangan fungsi kekal sama, jadi tiada perubahan lain diperlukan).

Tanpa `DATABASE_URL`, feedback & analitik guna storan in-memory (tidak kekal).

---

## 🤖 AI

**Anthropic (Claude) sudah di-wire penuh** dalam `services/ai/index.ts` (`callAnthropic`) — bina prompt BM, panggil Messages API, parse JSON jadi objektif/aktiviti/pentaksiran, dengan timeout 30s dan fallback selamat ke Mode Demo jika gagal.

Untuk mengaktifkan, set di `.env.local` / Vercel:
```
AI_PROVIDER=anthropic
AI_API_KEY=sk-ant-...          # dari console.anthropic.com (berbayar)
AI_MODEL=claude-opus-4-8     # atau model lain yang akaun anda boleh akses
```

Tanpa kunci, alat AI kekal berfungsi dalam **Mode Demo** (templat).

**Apa yang telah diuji:** logik parse respons (fences markdown, teks pembuka, coercion, tolak sampah) dan aliran penuh dengan `fetch` yang dimock — endpoint, header, model, prompt BM, kejayaan → `mode: "ai"`, ralat 401/rangkaian → fallback Demo tanpa crash. **Belum diuji:** panggilan hidup sebenar ke pelayan Anthropic (perlu kunci + rangkaian anda).

OpenAI dan Google: struktur `callProvider` sedia menerima mereka, tetapi belum di-wire — hubungi jika perlu.

---

## ▲ Deploy ke Vercel

1. Muat naik projek ke GitHub.
2. Di Vercel: **New Project → import repo**.
3. Framework auto-dikesan (Next.js). Tiada tetapan khas diperlukan.
4. Tambah *Environment Variables* (`NEXT_PUBLIC_APP_URL`, dan `DATABASE_URL`/`AI_API_KEY`/`ADMIN_PASSWORD_HASH` jika ada).
5. Deploy.

---

## 📁 Struktur ringkas

```
app/            Halaman & API routes (App Router)
  alat/         Alat guru
  ppki/         Modul PPKI (RPI, hub)
  admin/        Dashboard admin (dilindungi middleware)
  api/          generate, feedback, analytics, admin/*
components/     UI, tools, feedback, admin
services/       ai/ analytics/ export/ (abstraksi)
lib/            store (DB abstraksi), auth, constants
data/tools.ts   REGISTRI PUSAT semua alat
database/       schema.sql
hooks/          useLocalStorage, useToolMemory
```

Menambah alat baharu = tambah satu entri dalam `data/tools.ts` + cipta `app/.../page.tsx`. Homepage, carian, kategori, sitemap dan admin semua membacanya automatik.

---

## 🔏 Privasi

- Alat memproses data pada peranti (localStorage) di mana mungkin.
- Analitik: metadata anonim sahaja (tiada nama/markah/kandungan).
- Email feedback: **admin sahaja**, tidak pernah dipapar umum.
- Tiada penjualan data.

---

## 📝 Nota keselamatan pakej

Build menggunakan Next.js 14.2.35 (versi bertampung untuk advisori keselamatan Next). Satu salinan `postcss` terbenam dalam Next masih menunjukkan amaran audit yang hanya boleh diselesaikan dengan naik taraf ke Next 16 (perubahan besar). Ini hanya memberi kesan pada masa-build, bukan runtime.

---

*CikguBoleh ialah platform bebas dan **bukan** laman rasmi Kementerian Pendidikan Malaysia.*
