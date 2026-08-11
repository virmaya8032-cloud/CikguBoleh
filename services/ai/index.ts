/**
 * AI provider abstraction.
 *
 * The app never depends on AI to function. When no provider/key is configured,
 * every generator falls back to a deterministic template ("Mode Demo") so tools
 * still produce useful output offline. Swap in a real provider by wiring the
 * `callProvider` branch and setting AI_PROVIDER + AI_API_KEY in .env.
 */

export type AiProvider = "openai" | "anthropic" | "google" | "none";

export function activeProvider(): AiProvider {
  const p = process.env.AI_PROVIDER as AiProvider | undefined;
  const hasKey = Boolean(process.env.AI_API_KEY);
  if (!p || p === "none" || !hasKey) return "none";
  return p;
}

export function isAiConfigured(): boolean {
  return activeProvider() !== "none";
}

export interface GenerateInput {
  schoolLevel: string;
  subject: string;
  year: string;
  topic: string;
  duration: string;
  studentLevel: string;
  objective?: string;
}

export interface GenerateResult {
  mode: "ai" | "demo";
  objektif: string[];
  kriteriaKejayaan: string[];
  aktiviti: string[];
  pentaksiran: string[];
  refleksi: string;
}

/**
 * Server-side generator. Returns AI output when configured, otherwise a
 * structured template. This runs in a route handler, not the browser.
 */
export async function generateLessonBundle(input: GenerateInput): Promise<GenerateResult> {
  if (isAiConfigured()) {
    try {
      return await callProvider(input);
    } catch {
      // Provider failed — degrade gracefully instead of crashing.
      return { ...templateBundle(input), mode: "demo" };
    }
  }
  return templateBundle(input);
}

// ---------------------------------------------------------------------------
// Real provider wiring.
// ---------------------------------------------------------------------------

async function callProvider(input: GenerateInput): Promise<GenerateResult> {
  const provider = activeProvider();
  if (provider === "anthropic") return callAnthropic(input);
  // OpenAI / Google are not wired in this starter — throwing makes
  // generateLessonBundle() degrade gracefully to Mode Demo.
  throw new Error(`Provider "${provider}" belum di-wire. Guna AI_PROVIDER=anthropic.`);
}

/** Build a strict, Bahasa-Melayu prompt that asks for JSON only. */
function buildPrompt(input: GenerateInput): string {
  return [
    "Anda pembantu perancangan pengajaran untuk guru di Malaysia.",
    "Hasilkan kandungan RPH dalam Bahasa Melayu Malaysia (bukan Indonesia).",
    "",
    "Maklumat pelajaran:",
    `- Jenis sekolah: ${input.schoolLevel}`,
    `- Mata pelajaran: ${input.subject}`,
    `- Tahun/Tingkatan: ${input.year}`,
    `- Tajuk: ${input.topic}`,
    `- Tempoh: ${input.duration}`,
    `- Tahap murid: ${input.studentLevel}`,
    input.objective ? `- Objektif diberi guru: ${input.objective}` : "",
    "",
    "Balas HANYA dengan objek JSON sah (tiada teks lain, tiada markdown, tiada tiga-backtick).",
    "Gunakan skema tepat ini:",
    "{",
    '  "objektif": string[],            // 2-4 objektif measurable',
    '  "kriteriaKejayaan": string[],    // 2-4 kriteria "Saya boleh..."',
    '  "aktiviti": string[],            // 4-6 langkah aktiviti mengikut urutan',
    '  "pentaksiran": string[],         // 2-4 kaedah pentaksiran',
    '  "refleksi": string               // satu perenggan cadangan refleksi',
    "}",
  ].filter(Boolean).join("\n");
}

async function callAnthropic(input: GenerateInput): Promise<GenerateResult> {
  const apiKey = process.env.AI_API_KEY!;
  // Set AI_MODEL to a model your account can access (mis. claude-opus-4-8,
  // claude-3-5-sonnet-latest, dsb). Default di bawah hanyalah sandaran.
  const model = process.env.AI_MODEL || "claude-opus-4-8";

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 1500,
        system:
          "Anda hanya membalas dengan JSON sah mengikut skema yang diberi. Jangan sertakan sebarang teks lain.",
        messages: [{ role: "user", content: buildPrompt(input) }],
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`Anthropic API ${res.status}: ${detail.slice(0, 200)}`);
    }

    const data = (await res.json()) as { content?: { type: string; text?: string }[] };
    const text = (data.content ?? [])
      .filter((b) => b.type === "text" && typeof b.text === "string")
      .map((b) => b.text as string)
      .join("\n")
      .trim();

    return parseBundle(text);
  } finally {
    clearTimeout(timeout);
  }
}

/** Robustly parse a model reply into a GenerateResult. Throws on invalid shape. */
export function parseBundle(text: string): GenerateResult {
  // Strip accidental code fences, then isolate the outermost JSON object.
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Respons AI bukan JSON.");
  }
  const parsed = JSON.parse(cleaned.slice(start, end + 1)) as Record<string, unknown>;

  const arr = (v: unknown): string[] =>
    Array.isArray(v) ? v.map((x) => String(x)).filter(Boolean) : [];
  const str = (v: unknown): string => (typeof v === "string" ? v : "");

  const result: GenerateResult = {
    mode: "ai",
    objektif: arr(parsed.objektif),
    kriteriaKejayaan: arr(parsed.kriteriaKejayaan),
    aktiviti: arr(parsed.aktiviti),
    pentaksiran: arr(parsed.pentaksiran),
    refleksi: str(parsed.refleksi),
  };

  // Guard against an empty/garbage response.
  if (!result.objektif.length && !result.aktiviti.length) {
    throw new Error("Respons AI kosong.");
  }
  return result;
}

function templateBundle(input: GenerateInput): GenerateResult {
  const t = input.topic || "tajuk ini";
  const subj = input.subject || "mata pelajaran";
  return {
    mode: "demo",
    objektif: [
      `Pada akhir pengajaran, murid dapat menyatakan konsep asas ${t}.`,
      `Murid dapat menyelesaikan sekurang-kurangnya 3 contoh berkaitan ${t}.`,
      `Murid dapat mengaplikasikan ${t} dalam situasi harian.`,
    ],
    kriteriaKejayaan: [
      `Saya boleh menerangkan maksud ${t} dengan ayat sendiri.`,
      `Saya boleh menjawab soalan ${t} dengan betul.`,
      `Saya boleh menunjukkan cara ${t} kepada rakan.`,
    ],
    aktiviti: [
      `Set induksi: tunjukkan contoh ${t} yang berkaitan kehidupan murid.`,
      `Aktiviti utama: bimbing murid menyelesaikan latihan ${subj} secara berperingkat.`,
      `Aktiviti kumpulan: murid berbincang dan membentangkan hasil.`,
      `Pengukuhan: latihan bertulis mengikut tahap "${input.studentLevel}".`,
    ],
    pentaksiran: [
      `Pemerhatian semasa aktiviti kumpulan.`,
      `Semakan latihan bertulis.`,
      `Soal jawab lisan pada akhir sesi.`,
    ],
    refleksi:
      `Sebahagian besar murid mencapai objektif ${t}. Murid yang memerlukan ` +
      `bimbingan tambahan akan diberi aktiviti pemulihan pada sesi berikutnya.`,
  };
}
