import type { MetadataRoute } from "next";
import { TOOLS, CATEGORIES } from "@/data/tools";

const BASE = process.env.NEXT_PUBLIC_APP_URL || "https://cikgu-boleh.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = ["", "/alat", "/ppki", "/ai", "/saya", "/maklum-balas", "/maklum-balas/komuniti", "/tentang", "/privasi", "/terma", "/hubungi"];
  const toolPaths = TOOLS.filter((t) => t.status !== "coming-soon").map((t) => t.slug);
  const catPaths = CATEGORIES.map((c) => `/kategori/${encodeURIComponent(c)}`);
  const all = [...staticPaths, ...toolPaths, ...catPaths];
  return all.map((p) => ({ url: `${BASE}${p}`, lastModified: new Date(), changeFrequency: "weekly", priority: p === "" ? 1 : 0.7 }));
}
