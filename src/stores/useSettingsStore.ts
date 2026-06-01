import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AIConfig {
  apiUrl: string;
  apiKey: string;
  model: string;
}

export type Theme = 'light' | 'dark' | 'system';

interface SettingsState {
  githubToken: string;
  aiConfig: AIConfig;
  theme: Theme;
  setGithubToken: (token: string) => void;
  setAIConfig: (config: AIConfig) => void;
  setTheme: (theme: Theme) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      githubToken: '',
      aiConfig: {
        apiUrl: 'https://api.openai.com/v1/chat/completions',
        apiKey: '',
        model: 'gpt-4o-mini',
      },
      theme: 'system',
      setGithubToken: (token) => set({ githubToken: token }),
      setAIConfig: (config) => set({ aiConfig: config }),
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'github-trending-settings' }
  )
);
