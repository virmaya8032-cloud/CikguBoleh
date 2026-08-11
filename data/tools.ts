export type ToolStatus = "ready" | "beta" | "coming-soon";

export type ToolCategory =
  | "Pengajaran"
  | "Pentaksiran"
  | "Pengurusan Murid"
  | "PPKI"
  | "Dokumen Sekolah"
  | "Toolbox Guru"
  | "AI CikguBoleh";

export interface Tool {
  name: string;
  slug: string;          // route path, e.g. /alat/qr
  description: string;
  category: ToolCategory;
  icon: string;          // lucide icon name
  keywords: string[];
  featured?: boolean;
  status: ToolStatus;
  privacyMode: "local" | "server";
  requiresAI?: boolean;
}

export const CATEGORIES: ToolCategory[] = [
  "Pengajaran",
  "Pentaksiran",
  "Pengurusan Murid",
  "PPKI",
  "Dokumen Sekolah",
  "Toolbox Guru",
  "AI CikguBoleh",
];

export const TOOLS: Tool[] = [
  // ---- Pengajaran ----
  {
    name: "RPH CikguBoleh",
    slug: "/alat/rph",
    description: "Bina Rancangan Pengajaran Harian yang kemas, boleh cetak dan simpan pada peranti.",
    category: "Pengajaran",
    icon: "NotebookPen",
    keywords: ["rph", "rancangan", "pengajaran", "harian", "lesson plan"],
    featured: true,
    status: "ready",
    privacyMode: "local",
  },
  {
    name: "Jana RPH Automatik",
    slug: "/alat/rph-auto",
    description: "Masukkan beberapa maklumat asas, dapatkan draf objektif, aktiviti dan pentaksiran.",
    category: "Pengajaran",
    icon: "Wand2",
    keywords: ["rph", "auto", "jana", "automatik", "ai"],
    featured: true,
    status: "beta",
    privacyMode: "local",
    requiresAI: true,
  },
  {
    name: "Objektif Pembelajaran",
    slug: "/alat/objektif",
    description: "Hasilkan objektif measurable dan kriteria kejayaan mengikut tajuk.",
    category: "Pengajaran",
    icon: "Target",
    keywords: ["objektif", "kriteria", "kejayaan", "pembelajaran"],
    status: "beta",
    privacyMode: "local",
  },
  {
    name: "Exit Ticket",
    slug: "/alat/exit-ticket",
    description: "Cetak tiket keluar berbilang pada satu A4 untuk semak kefahaman murid.",
    category: "Pengajaran",
    icon: "Ticket",
    keywords: ["exit", "ticket", "tiket", "refleksi", "kefahaman"],
    status: "ready",
    privacyMode: "local",
  },
  {
    name: "Refleksi RPH",
    slug: "/alat/refleksi",
    description: "Jana ayat refleksi mengikut tahap pencapaian murid.",
    category: "Pengajaran",
    icon: "MessageSquareText",
    keywords: ["refleksi", "rph", "pencapaian"],
    status: "ready",
    privacyMode: "local",
  },

  // ---- Pentaksiran ----
  {
    name: "Kira Markah & Gred",
    slug: "/alat/markah",
    description: "Kira peratus dan gred automatik dengan julat gred boleh ubah.",
    category: "Pentaksiran",
    icon: "Calculator",
    keywords: ["markah", "gred", "kira", "peratus", "grade"],
    featured: true,
    status: "ready",
    privacyMode: "local",
  },
  {
    name: "Analisis Markah",
    slug: "/alat/analisis-markah",
    description: "Min, median, tertinggi, terendah, peratus lulus dan taburan gred.",
    category: "Pentaksiran",
    icon: "BarChart3",
    keywords: ["analisis", "markah", "min", "median", "statistik"],
    status: "ready",
    privacyMode: "local",
  },
  {
    name: "Generator Soalan",
    slug: "/alat/soalan",
    description: "Hasilkan bank soalan objektif, struktur dan KBAT (mod templat).",
    category: "Pentaksiran",
    icon: "ListChecks",
    keywords: ["soalan", "generator", "kbat", "kuiz", "objektif"],
    status: "beta",
    privacyMode: "local",
    requiresAI: true,
  },
  {
    name: "Worksheet Generator",
    slug: "/alat/worksheet",
    description: "Bina lembaran kerja pelbagai jenis dengan skema jawapan.",
    category: "Pentaksiran",
    icon: "FileText",
    keywords: ["worksheet", "lembaran", "kerja", "latihan"],
    status: "beta",
    privacyMode: "local",
    requiresAI: true,
  },

  // ---- Pengurusan Murid ----
  {
    name: "Random Nama",
    slug: "/alat/random-nama",
    description: "Roda pemilih nama murid — tanpa ulang, penuh skrin, boleh simpan senarai.",
    category: "Pengurusan Murid",
    icon: "Shuffle",
    keywords: ["random", "nama", "pilih", "roda", "spinner"],
    featured: true,
    status: "ready",
    privacyMode: "local",
  },
  {
    name: "Bahagi Kumpulan",
    slug: "/alat/bahagi-kumpulan",
    description: "Bahagi murid kepada kumpulan seimbang secara rawak.",
    category: "Pengurusan Murid",
    icon: "Users",
    keywords: ["kumpulan", "bahagi", "group", "rawak"],
    featured: true,
    status: "ready",
    privacyMode: "local",
  },
  {
    name: "Kira Umur",
    slug: "/alat/kira-umur",
    description: "Kira umur tepat (tahun, bulan, hari) — sokong senarai pukal.",
    category: "Pengurusan Murid",
    icon: "Cake",
    keywords: ["umur", "kira", "tarikh lahir", "age"],
    status: "ready",
    privacyMode: "local",
  },
  {
    name: "Susun Nama",
    slug: "/alat/susun-nama",
    description: "Susun A–Z, buang pendua, kemas ruang dan tukar huruf besar/kecil.",
    category: "Pengurusan Murid",
    icon: "ArrowDownAZ",
    keywords: ["susun", "nama", "sort", "senarai"],
    status: "ready",
    privacyMode: "local",
  },
  {
    name: "Kehadiran",
    slug: "/alat/kehadiran",
    description: "Rekod kehadiran harian dan kira peratus automatik.",
    category: "Pengurusan Murid",
    icon: "CalendarCheck",
    keywords: ["kehadiran", "attendance", "hadir"],
    status: "ready",
    privacyMode: "local",
  },

  // ---- PPKI ----
  {
    name: "CikguBoleh PPKI",
    slug: "/ppki",
    description: "Ruang khas Pendidikan Khas: RPI, intervensi, task analysis dan lagi.",
    category: "PPKI",
    icon: "HeartHandshake",
    keywords: ["ppki", "pendidikan khas", "rpi", "intervensi"],
    featured: true,
    status: "beta",
    privacyMode: "local",
  },
  {
    name: "RPI",
    slug: "/ppki/rpi",
    description: "Rancangan Pendidikan Individu dengan matlamat jangka pendek & panjang.",
    category: "PPKI",
    icon: "ClipboardList",
    keywords: ["rpi", "individu", "ppki"],
    status: "beta",
    privacyMode: "local",
  },
  {
    name: "Task Analysis",
    slug: "/ppki/task-analysis",
    description: "Pecahkan kemahiran kepada langkah kecil yang boleh dijejak.",
    category: "PPKI",
    icon: "ListTree",
    keywords: ["task", "analysis", "langkah", "ppki"],
    status: "ready",
    privacyMode: "local",
  },

  // ---- Dokumen Sekolah ----
  {
    name: "Generator Sijil",
    slug: "/alat/sijil",
    description: "Cipta sijil penghargaan & penyertaan, muat naik logo dan cetak.",
    category: "Dokumen Sekolah",
    icon: "Award",
    keywords: ["sijil", "certificate", "penghargaan"],
    featured: true,
    status: "ready",
    privacyMode: "local",
  },
  {
    name: "Generator Surat Sekolah",
    slug: "/alat/surat",
    description: "Surat makluman, kebenaran ibu bapa, jemputan dan surat rasmi.",
    category: "Dokumen Sekolah",
    icon: "Mail",
    keywords: ["surat", "makluman", "kebenaran", "rasmi"],
    status: "beta",
    privacyMode: "local",
  },
  {
    name: "Label Nama",
    slug: "/alat/label",
    description: "Cetak label nama murid dalam susunan A4 yang kemas.",
    category: "Dokumen Sekolah",
    icon: "Tags",
    keywords: ["label", "nama", "cetak"],
    status: "ready",
    privacyMode: "local",
  },

  // ---- Toolbox Guru ----
  {
    name: "QR Generator",
    slug: "/alat/qr",
    description: "Jana kod QR untuk pautan, teks, WiFi, WhatsApp dan muat turun PNG/SVG.",
    category: "Toolbox Guru",
    icon: "QrCode",
    keywords: ["qr", "kod", "generator", "pautan", "wifi"],
    featured: true,
    status: "ready",
    privacyMode: "local",
  },
  {
    name: "Text Toolbox",
    slug: "/toolbox/teks",
    description: "Tukar huruf, kira perkataan, buang pendua dan ruang berlebihan.",
    category: "Toolbox Guru",
    icon: "Type",
    keywords: ["teks", "text", "huruf", "kira perkataan"],
    status: "ready",
    privacyMode: "local",
  },
  {
    name: "Kalkulator Tarikh",
    slug: "/alat/tarikh",
    description: "Beza tarikh, tambah/tolak hari dan kira hari bekerja.",
    category: "Toolbox Guru",
    icon: "CalendarClock",
    keywords: ["tarikh", "kira", "hari", "countdown"],
    status: "ready",
    privacyMode: "local",
  },
  {
    name: "Checklist Guru",
    slug: "/alat/checklist",
    description: "Senarai tugasan dengan keutamaan — disimpan pada peranti.",
    category: "Toolbox Guru",
    icon: "SquareCheckBig",
    keywords: ["checklist", "tugasan", "todo"],
    status: "ready",
    privacyMode: "local",
  },
  {
    name: "Nota Pantas",
    slug: "/alat/nota",
    description: "Catat nota ringkas dengan autosave pada peranti.",
    category: "Toolbox Guru",
    icon: "StickyNote",
    keywords: ["nota", "notes", "catat"],
    status: "ready",
    privacyMode: "local",
  },

  // ---- AI CikguBoleh ----
  {
    name: "CikguBoleh AI",
    slug: "/ai",
    description: "Isi sekali — jana RPH, worksheet, soalan, skema dan lagi (mod demo).",
    category: "AI CikguBoleh",
    icon: "Sparkles",
    keywords: ["ai", "jana semua", "cikguboleh ai"],
    featured: true,
    status: "beta",
    privacyMode: "local",
    requiresAI: true,
  },
];

export function getTool(slug: string): Tool | undefined {
  return TOOLS.find((t) => t.slug === slug);
}

export function toolsByCategory(cat: ToolCategory): Tool[] {
  return TOOLS.filter((t) => t.category === cat);
}

export function featuredTools(): Tool[] {
  return TOOLS.filter((t) => t.featured);
}

export function searchTools(q: string): Tool[] {
  const s = q.trim().toLowerCase();
  if (!s) return TOOLS;
  return TOOLS.filter((t) => {
    const hay = [t.name, t.description, t.category, ...t.keywords].join(" ").toLowerCase();
    return hay.includes(s);
  });
}
