"use client";

import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";

const FAV_KEY = "cikguboleh_favorites";
const RECENT_KEY = "cikguboleh_recent";
const MAX_RECENT = 8;

export function useFavorites() {
  const { value, setValue, ready } = useLocalStorage<string[]>(FAV_KEY, []);

  const toggle = useCallback(
    (slug: string) => {
      setValue((prev) =>
        prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
      );
    },
    [setValue]
  );

  const isFavorite = useCallback((slug: string) => value.includes(slug), [value]);

  return { favorites: value, toggle, isFavorite, ready };
}

export function useRecent() {
  const { value, setValue, ready } = useLocalStorage<string[]>(RECENT_KEY, []);

  const push = useCallback(
    (slug: string) => {
      setValue((prev) => [slug, ...prev.filter((s) => s !== slug)].slice(0, MAX_RECENT));
    },
    [setValue]
  );

  return { recent: value, push, ready };
}
