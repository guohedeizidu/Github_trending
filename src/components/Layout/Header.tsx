import { useState } from 'react';
import { Settings, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SettingsModal } from '../SettingsModal';

export function Header() {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 h-12 flex items-center justify-between">
          <Link to="/" className="font-semibold text-sm tracking-tight text-gray-900 no-underline">
            GitHub Trending
          </Link>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowSettings(true)}
              className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
              aria-label="设置"
            >
              <Settings className="w-4 h-4 text-gray-500" />
            </button>
            <Link
              to="/my"
              className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
              aria-label="我的"
            >
              <User className="w-4 h-4 text-gray-500" />
            </Link>
          </div>
        </div>
      </header>
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </>
  );
}
