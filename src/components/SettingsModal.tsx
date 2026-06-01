import { useState } from 'react';
import { X } from 'lucide-react';
import { useSettingsStore } from '../stores/useSettingsStore';

interface Props {
  onClose: () => void;
}

export function SettingsModal({ onClose }: Props) {
  const { githubToken, aiConfig, setGithubToken, setAIConfig } = useSettingsStore();
  const [token, setToken] = useState(githubToken);
  const [apiUrl, setApiUrl] = useState(aiConfig.apiUrl);
  const [apiKey, setApiKey] = useState(aiConfig.apiKey);
  const [model, setModel] = useState(aiConfig.model);

  const handleSave = () => {
    setGithubToken(token.trim());
    setAIConfig({
      apiUrl: apiUrl.trim(),
      apiKey: apiKey.trim(),
      model: model.trim(),
    });
    onClose();
  };

  const inputClass = "w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-colors duration-200";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[var(--bg-card)] rounded-xl p-6 w-full max-w-md mx-4 shadow-xl border border-[var(--border)]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">设置</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-[var(--bg-hover)] transition-colors duration-200">
            <X className="w-5 h-5 text-[var(--text-muted)]" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">GitHub Token</label>
            <input type="password" value={token} onChange={(e) => setToken(e.target.value)} placeholder="ghp_xxxxxxxxxxxx" className={inputClass} />
            <p className="text-xs text-[var(--text-muted)] mt-1">用于提高 GitHub API 请求限额</p>
          </div>

          <div className="border-t border-[var(--border)] pt-4">
            <h3 className="text-sm font-medium text-[var(--text-primary)] mb-3">AI 翻译模型配置</h3>
            <p className="text-xs text-[var(--text-muted)] mb-3">支持任何兼容 OpenAI 接口格式的模型供应商</p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">API 地址</label>
                <input type="text" value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} placeholder="https://api.openai.com/v1/chat/completions" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">API Key</label>
                <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="sk-xxxxxxxxxxxx" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">模型名称</label>
                <input type="text" value={model} onChange={(e) => setModel(e.target.value)} placeholder="gpt-4o-mini" className={inputClass} />
                <p className="text-xs text-[var(--text-muted)] mt-1">如 gpt-4o-mini、claude-3-haiku、deepseek-chat 等</p>
              </div>
            </div>
          </div>
        </div>

        <button onClick={handleSave} className="mt-6 w-full py-2 bg-[var(--accent)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity duration-200">
          保存
        </button>
      </div>
    </div>
  );
}
