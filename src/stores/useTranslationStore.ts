import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TranslationResult } from '../types';

interface TranslationState {
  cache: Record<string, TranslationResult>;
  setTranslation: (key: string, result: TranslationResult) => void;
  getTranslation: (key: string) => TranslationResult | undefined;
}

export const useTranslationStore = create<TranslationState>()(
  persist(
    (set, get) => ({
      cache: {},
      setTranslation: (key, result) =>
        set((s) => ({ cache: { ...s.cache, [key]: result } })),
      getTranslation: (key) => get().cache[key],
    }),
    { name: 'github-trending-translations' }
  )
);
