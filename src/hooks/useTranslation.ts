import { useState } from 'react';
import { useTranslationStore } from '../stores/useTranslationStore';
import { useSettingsStore } from '../stores/useSettingsStore';
import { translateProject } from '../services/translator';
import type { TranslationResult } from '../types';

export function useTranslation(owner: string, repo: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TranslationResult | null>(null);
  const { getTranslation, setTranslation } = useTranslationStore();
  const aiConfig = useSettingsStore((s) => s.aiConfig);

  const cacheKey = `${owner}/${repo}`;

  const translate = async (readme: string, description: string) => {
    const cached = getTranslation(cacheKey);
    if (cached) {
      setResult(cached);
      return;
    }

    if (!aiConfig.apiKey) {
      setError('请先在设置中配置 AI 模型的 API Key');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await translateProject(readme, description || '', `${owner}/${repo}`, aiConfig);
      setTranslation(cacheKey, data);
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : '翻译失败');
    } finally {
      setLoading(false);
    }
  };

  return { result, loading, error, translate };
}
