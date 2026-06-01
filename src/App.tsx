import { Outlet } from 'react-router-dom';
import { Header } from './components/Layout/Header';
import { useTheme } from './hooks/useTheme';

export function App() {
  useTheme();

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] transition-colors duration-300">
      <Header />
      <div className="animate-fadeIn">
        <Outlet />
      </div>
    </div>
  );
}
