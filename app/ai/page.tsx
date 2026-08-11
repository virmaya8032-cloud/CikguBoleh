"use client";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { LessonGenerator } from "@/components/tools/LessonGenerator";

export default function AiPage() {
  return (
    <ToolLayout slug="/ai" demoBadge>
      <LessonGenerator toolSlug="/ai" />
    </ToolLayout>
  );
}
