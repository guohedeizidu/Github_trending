export interface Repository {
  id: number;
  rank: number;
  name: string;
  fullName: string;
  owner: string;
  avatar: string;
  url: string;
  description: string;
  language: string | null;
  languageColor: string | null;
  stars: number;
  forks: number;
  starsToday: number;
  starsThisWeek: number;
  starsThisMonth: number;
}

export type TimeRange = 'daily' | 'weekly' | 'monthly';

export type Category = 'all' | 'ai' | 'mcp' | 'agents' | 'coding' | 'automation' | 'devtools' | 'chatbot' | 'rag';

export interface Filter {
  timeRange: TimeRange;
  language: string;
  category: Category;
  query: string;
}

export interface TranslationResult {
  overview: string;
  highlights: string;
  target: string;
  usage: string;
  techStack: string;
  installation: string;
}

export interface FavoriteGroup {
  id: string;
  name: string;
  createdAt: number;
}

export interface FavoriteItem {
  repo: Repository;
  groupId: string;
  addedAt: number;
}

export interface HistoryItem {
  repo: Pick<Repository, 'fullName' | 'owner' | 'name' | 'avatar' | 'description' | 'language'>;
  visitedAt: number;
}
