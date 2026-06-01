import type { TimeRange, Category } from '../types';

export const TIME_RANGES: { key: TimeRange; label: string }[] = [
  { key: 'daily', label: '今日' },
  { key: 'weekly', label: '本周' },
  { key: 'monthly', label: '本月' },
];

export const CATEGORIES: { key: Category; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'ai', label: 'AI' },
  { key: 'mcp', label: 'MCP' },
  { key: 'agents', label: 'Agents' },
  { key: 'coding', label: 'Coding' },
  { key: 'automation', label: 'Automation' },
  { key: 'devtools', label: 'DevTools' },
  { key: 'chatbot', label: 'Chatbot' },
  { key: 'rag', label: 'RAG' },
];

export const LANGUAGES = [
  '全部',
  'Python',
  'JavaScript',
  'TypeScript',
  'Rust',
  'Go',
  'Java',
  'C++',
  'C',
  'C#',
  'Swift',
  'Kotlin',
  'PHP',
  'Ruby',
  'Dart',
  'Shell',
  'Vue',
];

export const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Java: '#b07219',
  Go: '#00ADD8',
  Rust: '#dea584',
  'C++': '#f34b7d',
  C: '#555555',
  'C#': '#178600',
  PHP: '#4F5D95',
  Ruby: '#701516',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  Shell: '#89e051',
  Vue: '#41b883',
};
