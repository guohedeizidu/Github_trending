import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TranslationResult } from '../types';

interface TranslationState {
  cache: Record<string, TranslationResult>;
  setTranslation: (key: string, result: TranslationResult) => void;
  getTranslation: (key: string) => TranslationResult | undefined;
  removeTranslation: (key: string) => void;
  clearAll: () => void;
}

export const useTranslationStore = create<TranslationState>()(
  persist(
    (set, get) => ({
      cache: {},
      setTranslation: (key, result) =>
        set((s) => ({ cache: { ...s.cache, [key]: result } })),
      getTranslation: (key) => get().cache[key],
      removeTranslation: (key) =>
        set((s) => {
          const { [key]: _, ...rest } = s.cache;
          return { cache: rest };
        }),
      clearAll: () => set({ cache: {} }),
    }),
    { name: 'github-trending-translations' }
  )
);
