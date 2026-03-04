import { useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/utils';

const pages = ['Phenotype Search', 'Metabolism', 'Gene Topology', 'Simulation', 'Guide Design'];

export function Navigation({ activePage, setActivePage }) {
  const navRef = useRef(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  // Theme toggle — sets data-theme on <html>; CSS primitive tokens in global.css
  // cascade through semantic tokens automatically. No component touches needed.
  const [theme, setTheme] = useState(
    () => localStorage.getItem('theme') ?? 'light'
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const activeTab = nav.children[activePage];
    if (activeTab) {
      const navRect = nav.getBoundingClientRect();
      const tabRect = activeTab.getBoundingClientRect();
      setIndicator({ left: tabRect.left - navRect.left, width: tabRect.width });
    }
  }, [activePage]);

  return (
    <header className="bg-nav-background border-b border-nav-border flex items-center justify-between px-10 py-5">
      <div className="flex items-center gap-4">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-text-on-color font-bold text-sm">
          E2P
        </div>
        <div>
          <div className="type-title text-base tracking-tight text-text-primary">E2P</div>
          <div className="type-sm text-text-muted">Epigenome2Phenome</div>
        </div>
      </div>

      <nav className="relative flex gap-1" ref={navRef}>
        {pages.map((page, i) => (
          <button
            key={page}
            onClick={() => setActivePage(i)}
            className={cn(
              'px-6 py-3 bg-transparent border-none type-body tracking-[0.5px] cursor-pointer transition-colors duration-250 relative',
              activePage === i ? 'text-text-primary' : 'text-text-muted'
            )}
          >
            {page}
          </button>
        ))}
        <div
          className="absolute bottom-0 h-0.5 bg-gradient-to-r from-blue-500 to-violet-600 rounded-sm transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] pointer-events-none"
          style={{ left: indicator.left, width: indicator.width }}
        />
      </nav>

      <div className="flex items-center gap-3">
        <div className="type-sm text-text-muted">
          <span className="mono">v0.9.2-beta</span> • S. cerevisiae S288C
        </div>
        <button
          onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
          title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          className="bg-surface-input border border-border-default text-text-muted rounded-md flex items-center justify-center transition-all duration-150 text-sm w-8 h-8"
        >
          {theme === 'dark' ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>
      </div>
    </header>
  );
}
