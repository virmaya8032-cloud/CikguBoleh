"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/services/analytics";

export function PageTracker() {
  const path = usePathname();
  useEffect(() => {
    trackEvent("page_view", { page: path });
  }, [path]);
  return null;
}
