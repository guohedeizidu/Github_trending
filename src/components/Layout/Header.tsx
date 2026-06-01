import { useState } from 'react';
import { Settings, User, Sun, Moon, Monitor } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SettingsModal } from '../SettingsModal';
import { useTheme, cycleTheme } from '../../hooks/useTheme';

export function Header() {
  const [showSettings, setShowSettings] = useState(false);
  const { theme, setTheme } = useTheme();

  const ThemeIcon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor;

  return (
    <>
      <header className="sticky top-0 z-10 bg-[var(--bg-card)]/80 backdrop-blur-md border-b border-[var(--border)] transition-colors duration-300">
        <div className="max-w-3xl mx-auto px-4 h-12 flex items-center justify-between">
          <Link to="/" className="font-semibold text-sm tracking-tight text-[var(--text-primary)] no-underline">
            GitHub Trending
          </Link>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setTheme(cycleTheme(theme))}
              className="p-1.5 rounded-md hover:bg-[var(--bg-hover)] transition-colors duration-200"
              aria-label="切换主题"
              title={theme === 'light' ? '浅色' : theme === 'dark' ? '深色' : '跟随系统'}
            >
              <ThemeIcon className="w-4 h-4 text-[var(--text-muted)]" />
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="p-1.5 rounded-md hover:bg-[var(--bg-hover)] transition-colors duration-200"
              aria-label="设置"
            >
              <Settings className="w-4 h-4 text-[var(--text-muted)]" />
            </button>
            <Link
              to="/my"
              className="p-1.5 rounded-md hover:bg-[var(--bg-hover)] transition-colors duration-200"
              aria-label="我的"
            >
              <User className="w-4 h-4 text-[var(--text-muted)]" />
            </Link>
          </div>
        </div>
      </header>
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </>
  );
}
