import type { Repository, TimeRange } from '../types';
import { getCache, setCache } from '../utils/cache';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

async function fetchTrendingHtml(since: string, language: string): Promise<string> {
  const params = new URLSearchParams({ since });
  if (language) params.set('language', language);

  const res = await fetch(`${API_BASE}/api/trending?${params}`);
  if (!res.ok) throw new Error(`获取趋势数据失败: ${res.status}`);
  const text = await res.text();
  if (!text.includes('Box-row') && !text.includes('article')) {
    throw new Error('返回数据格式异常，请检查网络代理配置');
  }
  return text;
}

function parseNumber(str: string): number {
  return parseInt(str.replace(/,/g, ''), 10) || 0;
}

function parseTrendingHtml(html: string, timeRange: TimeRange): Repository[] {
  const repos: Repository[] = [];
  const rowRegex = /<article class="Box-row">([\s\S]*?)<\/article>/g;
  let match;
  let rank = 0;

  while ((match = rowRegex.exec(html)) !== null) {
    rank++;
    const row = match[1];

    const nameMatch = row.match(/<h2[^>]*>[\s\S]*?href="\/([^"]+)"/);
    if (!nameMatch) continue;
    const fullName = nameMatch[1].trim();
    const [owner, name] = fullName.split('/');

    const descMatch = row.match(/<p class="col-9[^"]*">\s*([\s\S]*?)\s*<\/p>/);
    const description = descMatch ? descMatch[1].trim() : '';

    const langMatch = row.match(/itemprop="programmingLanguage">(.*?)</);
    const language = langMatch ? langMatch[1] : null;

    const colorMatch = row.match(/repo-language-color"[^>]*style="background-color:\s*([^"]+)"/);
    const languageColor = colorMatch ? colorMatch[1] : null;

    const starsMatch = row.match(/href="\/[^/]+\/[^/]+\/stargazers"[^>]*>\s*<svg[\s\S]*?<\/svg>\s*([\d,]+)/);
    const stars = starsMatch ? parseNumber(starsMatch[1]) : 0;

    const forksMatch = row.match(/href="\/[^/]+\/[^/]+\/forks"[^>]*>\s*<svg[\s\S]*?<\/svg>\s*([\d,]+)/);
    const forks = forksMatch ? parseNumber(forksMatch[1]) : 0;

    const growthMatch = row.match(/([\d,]+)\s*stars\s*(today|this week|this month)/);
    const starsGrowth = growthMatch ? parseNumber(growthMatch[1]) : 0;

    repos.push({
      id: rank,
      rank,
      name,
      fullName,
      owner,
      avatar: `https://github.com/${owner}.png`,
      url: `https://github.com/${fullName}`,
      description,
      language,
      languageColor,
      stars,
      forks,
      starsToday: starsGrowth,
      starsThisWeek: starsGrowth,
      starsThisMonth: starsGrowth,
    });
  }

  return repos;
}

export async function fetchTrending(
  timeRange: TimeRange,
  language: string
): Promise<Repository[]> {
  const since = timeRange === 'daily' ? 'daily' : timeRange === 'weekly' ? 'weekly' : 'monthly';
  const lang = language === '全部' ? '' : language.toLowerCase();

  const cacheKey = `trending:${since}:${lang}`;
  const ttl = timeRange === 'daily' ? 10 * 60 * 1000 : 30 * 60 * 1000;
  const cached = getCache<Repository[]>(cacheKey);
  if (cached) return cached;

  const html = await fetchTrendingHtml(since, lang);
  const repos = parseTrendingHtml(html, timeRange);

  if (repos.length > 0) {
    setCache(cacheKey, repos, ttl);
  }

  return repos;
}

export async function getReadme(owner: string, repo: string, token?: string): Promise<string> {
  const effectiveToken = token || getStoredToken();
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3.raw',
  };
  if (effectiveToken) headers['X-GitHub-Token'] = effectiveToken;

  const res = await fetch(`${API_BASE}/api/github/repos/${owner}/${repo}/readme`, { headers });
  if (!res.ok) return '';
  return res.text();
}

export async function getRepoInfo(owner: string, repo: string, token?: string) {
  const effectiveToken = token || getStoredToken();
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  };
  if (effectiveToken) headers['X-GitHub-Token'] = effectiveToken;

  const res = await fetch(`${API_BASE}/api/github/repos/${owner}/${repo}`, { headers });
  if (!res.ok) throw new Error(`获取项目信息失败: ${res.status}`);
  const data = await res.json();
  if (data.message) throw new Error(data.message);
  return data;
}

function getStoredToken(): string {
  try {
    const raw = localStorage.getItem('github-trending-settings');
    if (!raw) return '';
    const parsed = JSON.parse(raw);
    return parsed?.state?.githubToken || '';
  } catch {
    return '';
  }
}
