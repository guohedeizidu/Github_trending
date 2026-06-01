import { Search } from 'lucide-react';
import { useTrendingStore } from '../stores/useTrendingStore';
import { TIME_RANGES, CATEGORIES, LANGUAGES } from '../utils/constants';
import type { TimeRange, Category } from '../types';

export function FilterBar() {
  const { filter, setTimeRange, setLanguage, setCategory, setQuery } = useTrendingStore();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {TIME_RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setTimeRange(r.key as TimeRange)}
              className={`px-3 py-1.5 text-xs md:text-sm font-medium rounded-md transition-all ${
                filter.timeRange === r.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filter.language}
            onChange={(e) => setLanguage(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>

          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              value={filter.query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索..."
              className="w-36 md:w-48 pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setCategory(cat.key as Category)}
            className={`px-3 py-1.5 text-xs font-semibold whitespace-nowrap rounded-md transition-all ${
              filter.category === cat.key
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
}
