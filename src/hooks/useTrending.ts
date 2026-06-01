import { useCallback, useEffect } from 'react';
import { useTrendingStore } from '../stores/useTrendingStore';
import { fetchTrending } from '../services/github';

export function useTrending() {
  const { filter, setRepos, setLoading, setError } = useTrendingStore();

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const repos = await fetchTrending(filter.timeRange, filter.language);
      setRepos(repos);
    } catch (e) {
      setError(e instanceof Error ? e.message : '请求失败');
    } finally {
      setLoading(false);
    }
  }, [filter.timeRange, filter.language, setRepos, setLoading, setError]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { refetch: fetch };
}
