import { useTrendingStore } from '../stores/useTrendingStore';
import { useTrending } from '../hooks/useTrending';
import { FilterBar } from '../components/FilterBar';
import { ProjectCard } from '../components/ProjectCard';
import { Loader2, TrendingUp } from 'lucide-react';

export function HomePage() {
  const { filteredRepos, loading, error } = useTrendingStore();
  useTrending();

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h1 className="text-xl font-semibold text-gray-900">Trending Repos</h1>
        </div>
        <p className="text-xs text-gray-400">按 Star 增长速度排名，发现最热门的开源项目</p>
      </div>

      <FilterBar />

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          <span className="ml-2 text-sm text-gray-500">加载中...</span>
        </div>
      ) : (
        <div className="mt-4 divide-y divide-gray-100">
          {filteredRepos.map((repo) => (
            <ProjectCard key={`${repo.fullName}-${repo.rank}`} repo={repo} />
          ))}
          {filteredRepos.length === 0 && !error && (
            <p className="text-center text-gray-400 py-16 text-sm">暂无数据</p>
          )}
        </div>
      )}
    </div>
  );
}
