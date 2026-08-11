import { notFound } from "next/navigation";
import { CATEGORIES, toolsByCategory, type ToolCategory } from "@/data/tools";
import { ToolCard } from "@/components/ui/ToolCard";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ cat: c }));
}

export default function CategoryPage({ params }: { params: { cat: string } }) {
  const cat = decodeURIComponent(params.cat) as ToolCategory;
  if (!CATEGORIES.includes(cat)) notFound();
  const tools = toolsByCategory(cat);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <p className="text-sm font-semibold uppercase tracking-wide text-teal-600">Kategori</p>
      <h1 className="font-display text-3xl font-extrabold">{cat}</h1>
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((t) => (
          <ToolCard key={t.slug} tool={t} />
        ))}
      </div>
    </div>
  );
}
