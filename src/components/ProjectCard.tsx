import { useState, useEffect, useRef } from 'react';
import { Star, GitFork } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Repository } from '../types';
import { useTrendingStore } from '../stores/useTrendingStore';
import { useFavoritesStore } from '../stores/useFavoritesStore';

interface Props {
  repo: Repository;
}

export function ProjectCard({ repo }: Props) {
  const timeRange = useTrendingStore((s) => s.filter.timeRange);
  const growthLabel = timeRange === 'daily' ? '今日' : timeRange === 'weekly' ? '本周' : '本月';
  const isFavorited = useFavoritesStore((s) => s.favorites.some((f) => f.repo.fullName === repo.fullName));
  const addFavorite = useFavoritesStore((s) => s.addFavorite);
  const removeFavorite = useFavoritesStore((s) => s.removeFavorite);
  const groups = useFavoritesStore((s) => s.groups);
  const favorites = useFavoritesStore((s) => s.favorites);
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showPicker) return;
    const handleClick = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showPicker]);

  const handleStarClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFavorited) {
      const item = favorites.find((f) => f.repo.fullName === repo.fullName);
      if (item) removeFavorite(repo.fullName, item.groupId);
    } else if (groups.length === 1) {
      addFavorite(repo, 'default');
    } else {
      setShowPicker(true);
    }
  };

  const handlePickGroup = (e: React.MouseEvent, groupId: string) => {
    e.preventDefault();
    e.stopPropagation();
    addFavorite(repo, groupId);
    setShowPicker(false);
  };

  return (
    <Link
      to={`/detail/${repo.owner}/${repo.name}`}
      className="flex items-center gap-3 py-3 px-2 hover:bg-gray-50 transition-colors rounded-lg no-underline group"
    >
      <span className="w-7 text-center text-xs font-mono text-gray-300 shrink-0">
        {repo.rank}
      </span>

      <img
        src={repo.avatar}
        alt={repo.owner}
        className="w-8 h-8 rounded-full shrink-0"
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-400">{repo.owner}</span>
          <span className="text-gray-300">/</span>
          <span className="font-semibold text-sm text-gray-900 truncate group-hover:text-blue-600 transition-colors">
            {repo.name}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5 truncate">{repo.description || '暂无描述'}</p>
        <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-400">
          {repo.language && (
            <span className="flex items-center gap-1">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: repo.languageColor || '#ccc' }}
              />
              {repo.language}
            </span>
          )}
          <span className="flex items-center gap-0.5">
            <Star className="w-3 h-3" />
            {formatNumber(repo.stars)}
          </span>
          <span className="flex items-center gap-0.5">
            <GitFork className="w-3 h-3" />
            {formatNumber(repo.forks)}
          </span>
        </div>
      </div>

      <div className="relative shrink-0" ref={pickerRef}>
        <button
          onClick={handleStarClick}
          className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
          aria-label={isFavorited ? '取消收藏' : '收藏'}
        >
          <Star className={`w-4 h-4 ${isFavorited ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
        </button>
        {showPicker && (
          <div
            className="absolute right-0 top-8 z-20 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[100px]"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          >
            {groups.map((g) => (
              <button
                key={g.id}
                onClick={(e) => handlePickGroup(e, g.id)}
                className="block w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
              >
                {g.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="shrink-0 text-right">
        <span className="text-sm font-mono font-bold text-blue-600">
          +{repo.starsToday.toLocaleString()}
        </span>
        <p className="text-[10px] text-gray-400 mt-0.5">{growthLabel}</p>
      </div>
    </Link>
  );
}

function formatNumber(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return n.toString();
}
