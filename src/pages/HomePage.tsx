import { useMemo } from 'react';
import { useTrendingStore } from '../stores/useTrendingStore';
import { useTrending } from '../hooks/useTrending';
import { FilterBar } from '../components/FilterBar';
import { ProjectCard } from '../components/ProjectCard';
import { Loader2, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';

export function HomePage() {
  const { filteredRepos, loading, error, page, pageSize, setPage } = useTrendingStore();
  useTrending();

  const totalPages = Math.ceil(filteredRepos.length / pageSize);
  const paginatedRepos = useMemo(
    () => filteredRepos.slice((page - 1) * pageSize, page * pageSize),
    [filteredRepos, page, pageSize]
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-5 h-5 text-[var(--accent)]" />
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Trending Repos</h1>
        </div>
        <p className="text-xs text-[var(--text-muted)]">按 Star 增长速度排名，发现最热门的开源项目</p>
      </div>

      <FilterBar />

      {error && (
        <div className="mt-4 p-3 bg-red-500/10 text-red-400 text-sm rounded-lg">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-5 h-5 animate-spin text-[var(--accent)]" />
          <span className="ml-2 text-sm text-[var(--text-muted)]">加载中...</span>
        </div>
      ) : (
        <>
          <div className="mt-4 divide-y divide-[var(--border)]">
            {paginatedRepos.map((repo) => (
              <ProjectCard key={`${repo.fullName}-${repo.rank}`} repo={repo} />
            ))}
            {filteredRepos.length === 0 && !error && (
              <p className="text-center text-[var(--text-muted)] py-16 text-sm">暂无数据</p>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6 pb-4">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                className="p-1.5 rounded-md border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 text-xs font-medium rounded-md transition-colors duration-200 ${
                    p === page
                      ? 'bg-[var(--accent)] text-white'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
                className="p-1.5 rounded-md border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
