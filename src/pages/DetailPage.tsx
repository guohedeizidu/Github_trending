import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Star, GitFork, Loader2, Sparkles, Target, Rocket, Layers, Download } from 'lucide-react';
import { getRepoInfo, getReadme } from '../services/github';
import { useTranslation } from '../hooks/useTranslation';
import { useSettingsStore } from '../stores/useSettingsStore';
import { useFavoritesStore } from '../stores/useFavoritesStore';
import { LANGUAGE_COLORS } from '../utils/constants';

interface RepoInfo {
  full_name: string;
  description: string;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  owner: { avatar_url: string; login: string };
  topics: string[];
}

export function DetailPage() {
  const { owner, repo } = useParams<{ owner: string; repo: string }>();
  const [repoData, setRepoData] = useState<RepoInfo | null>(null);
  const [readme, setReadme] = useState('');
  const [loadingRepo, setLoadingRepo] = useState(true);
  const [repoError, setRepoError] = useState<string | null>(null);
  const githubToken = useSettingsStore((s) => s.githubToken);
  const { result, loading: translating, error: transError, translate } = useTranslation(owner!, repo!);
  const addHistory = useFavoritesStore((s) => s.addHistory);
  const isFavorited = useFavoritesStore((s) => s.favorites.some((f) => f.repo.fullName === `${owner}/${repo}`));
  const addFavorite = useFavoritesStore((s) => s.addFavorite);
  const removeFavorite = useFavoritesStore((s) => s.removeFavorite);

  useEffect(() => {
    if (!owner || !repo) return;
    setLoadingRepo(true);
    setRepoError(null);
    Promise.all([
      getRepoInfo(owner, repo, githubToken || undefined),
      getReadme(owner, repo, githubToken || undefined),
    ]).then(([data, md]) => {
      setRepoData(data);
      setReadme(md);
      setLoadingRepo(false);
      addHistory({
        fullName: `${owner}/${repo}`,
        owner: owner!,
        name: repo!,
        avatar: data.owner?.avatar_url || `https://github.com/${owner}.png`,
        description: data.description || '',
        language: data.language || null,
      });
      translate(md, data.description || '');
    }).catch((e) => {
      setRepoError(e instanceof Error ? e.message : '加载失败');
      setLoadingRepo(false);
    });
  }, [owner, repo, githubToken]);

  if (loadingRepo) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
      </div>
    );
  }

  if (repoError || !repoData) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <Link to="/" className="text-sm text-blue-600 hover:underline flex items-center gap-1 mb-4">
          <ArrowLeft className="w-4 h-4" /> 返回
        </Link>
        <div className="text-center text-gray-500 py-10">{repoError || '项目未找到'}</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-5">
        <ArrowLeft className="w-4 h-4" /> 返回列表
      </Link>

      <div className="flex items-start gap-4 mb-5">
        <img src={repoData.owner?.avatar_url || `https://github.com/${owner}.png`} alt="" className="w-12 h-12 rounded-full shrink-0" />
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-gray-900">{repoData.full_name}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{repoData.description}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
            {repoData.language && (
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: LANGUAGE_COLORS[repoData.language] || '#ccc' }} />
                {repoData.language}
              </span>
            )}
            <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5" />{(repoData.stargazers_count ?? 0).toLocaleString()}</span>
            <span className="flex items-center gap-1"><GitFork className="w-3.5 h-3.5" />{(repoData.forks_count ?? 0).toLocaleString()}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              if (isFavorited) {
                removeFavorite(`${owner}/${repo}`, 'default');
              } else {
                addFavorite({
                  id: 0, rank: 0, name: repo!, fullName: `${owner}/${repo}`, owner: owner!,
                  avatar: repoData.owner?.avatar_url || `https://github.com/${owner}.png`,
                  url: repoData.html_url, description: repoData.description || '',
                  language: repoData.language, languageColor: null,
                  stars: repoData.stargazers_count ?? 0, forks: repoData.forks_count ?? 0,
                  starsToday: 0, starsThisWeek: 0, starsThisMonth: 0,
                });
              }
            }}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg shrink-0 border ${isFavorited ? 'bg-yellow-50 border-yellow-200 text-yellow-600' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            <Star className={`w-3.5 h-3.5 ${isFavorited ? 'fill-yellow-400 text-yellow-400' : ''}`} />
            {isFavorited ? '已收藏' : '收藏'}
          </button>
          <a
            href={repoData.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-gray-800 shrink-0"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            GitHub
          </a>
        </div>
      </div>

      {repoData.topics && repoData.topics.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-5">
          {repoData.topics.slice(0, 10).map((t) => (
            <span key={t} className="px-2 py-0.5 text-[11px] bg-blue-50 text-blue-600 rounded-md">{t}</span>
          ))}
        </div>
      )}

      {translating && (
        <div className="flex items-center gap-2 py-10 justify-center text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">AI 翻译中...</span>
        </div>
      )}

      {transError && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg mb-4">{transError}</div>}

      {result && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
            <h2 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-500" />项目简介
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">{result.overview}</p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1.5">
              <Star className="w-4 h-4 text-yellow-500" />核心亮点
            </h2>
            <div className="space-y-2">
              {(result.highlights || '').split('\n').filter(Boolean).map((line, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-blue-500 mt-0.5 shrink-0">•</span>
                  <span className="leading-relaxed">{line.replace(/^[•·\-]\s*/, '')}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <h2 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-green-500" />项目目标
            </h2>
            <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">{result.target || ''}</p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <h2 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
              <Rocket className="w-4 h-4 text-orange-500" />快速上手
            </h2>
            <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap font-mono bg-gray-50 rounded-lg p-3">{result.usage || ''}</div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <h2 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-purple-500" />技术架构
            </h2>
            <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">{result.techStack || ''}</p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <h2 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
              <Download className="w-4 h-4 text-teal-500" />安装部署
            </h2>
            <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap font-mono bg-gray-50 rounded-lg p-3">{result.installation || ''}</div>
          </div>
        </div>
      )}

      {!result && !translating && !transError && readme && (
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">README</h2>
          <pre className="whitespace-pre-wrap text-xs text-gray-600 leading-relaxed">{readme.slice(0, 5000)}</pre>
        </div>
      )}
    </div>
  );
}

