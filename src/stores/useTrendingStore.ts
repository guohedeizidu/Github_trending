import { create } from 'zustand';
import type { Filter, Repository, TimeRange, Category } from '../types';

interface TrendingState {
  repos: Repository[];
  filteredRepos: Repository[];
  loading: boolean;
  error: string | null;
  filter: Filter;
  page: number;
  pageSize: number;
  setRepos: (repos: Repository[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setTimeRange: (range: TimeRange) => void;
  setLanguage: (lang: string) => void;
  setCategory: (cat: Category) => void;
  setQuery: (query: string) => void;
  setPage: (page: number) => void;
  applyFilters: () => void;
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  ai: ['ai', 'machine-learning', 'deep-learning', 'neural', 'llm', 'gpt', 'transformer', 'model'],
  mcp: ['mcp', 'model-context-protocol'],
  agents: ['agent', 'agents', 'autonomous', 'agentic'],
  coding: ['code', 'coding', 'ide', 'editor', 'copilot', 'programming'],
  automation: ['automation', 'workflow', 'pipeline', 'ci', 'cd'],
  devtools: ['devtools', 'developer', 'cli', 'tool', 'debug', 'testing'],
  chatbot: ['chat', 'chatbot', 'conversational', 'assistant'],
  rag: ['rag', 'retrieval', 'embedding', 'vector', 'knowledge-base'],
};

function matchCategory(repo: Repository, category: Category): boolean {
  if (category === 'all') return true;
  const keywords = CATEGORY_KEYWORDS[category] || [];
  const text = `${repo.description} ${repo.name} ${repo.fullName}`.toLowerCase();
  return keywords.some((kw) => text.includes(kw));
}

export function getRepoCategories(repo: Repository): string[] {
  const text = `${repo.description} ${repo.name} ${repo.fullName}`.toLowerCase();
  return Object.entries(CATEGORY_KEYWORDS)
    .filter(([, keywords]) => keywords.some((kw) => text.includes(kw)))
    .map(([key]) => key);
}

export const useTrendingStore = create<TrendingState>((set, get) => ({
  repos: [],
  filteredRepos: [],
  loading: false,
  error: null,
  filter: { timeRange: 'weekly', language: '全部', category: 'all', query: '' },
  page: 1,
  pageSize: 20,
  setRepos: (repos) => {
    set({ repos });
    get().applyFilters();
  },
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setTimeRange: (range) => {
    set((s) => ({ filter: { ...s.filter, timeRange: range }, page: 1 }));
  },
  setLanguage: (lang) => {
    set((s) => ({ filter: { ...s.filter, language: lang }, page: 1 }));
  },
  setCategory: (cat) => {
    set((s) => ({ filter: { ...s.filter, category: cat }, page: 1 }));
    get().applyFilters();
  },
  setQuery: (query) => {
    set((s) => ({ filter: { ...s.filter, query }, page: 1 }));
    get().applyFilters();
  },
  setPage: (page) => set({ page }),
  applyFilters: () => {
    const { repos, filter } = get();
    let result = repos;
    if (filter.category !== 'all') {
      result = result.filter((r) => matchCategory(r, filter.category));
    }
    if (filter.query) {
      const q = filter.query.toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.fullName.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q)
      );
    }
    const growthKey = filter.timeRange === 'daily' ? 'starsToday'
      : filter.timeRange === 'weekly' ? 'starsThisWeek' : 'starsThisMonth';
    result = [...result].sort((a, b) => b[growthKey] - a[growthKey]);
    result = result.map((r, i) => ({ ...r, rank: i + 1 }));
    set({ filteredRepos: result });
  },
}));
