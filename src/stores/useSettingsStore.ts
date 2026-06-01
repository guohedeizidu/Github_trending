import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AIConfig {
  apiUrl: string;
  apiKey: string;
  model: string;
}

interface SettingsState {
  githubToken: string;
  aiConfig: AIConfig;
  setGithubToken: (token: string) => void;
  setAIConfig: (config: AIConfig) => void;
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
      setGithubToken: (token) => set({ githubToken: token }),
      setAIConfig: (config) => set({ aiConfig: config }),
    }),
    { name: 'github-trending-settings' }
  )
);
