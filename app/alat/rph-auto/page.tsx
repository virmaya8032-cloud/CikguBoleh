"use client";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { LessonGenerator } from "@/components/tools/LessonGenerator";

export default function RphAutoPage() {
  return (
    <ToolLayout slug="/alat/rph-auto" demoBadge>
      <LessonGenerator toolSlug="/alat/rph-auto" />
    </ToolLayout>
  );
}
