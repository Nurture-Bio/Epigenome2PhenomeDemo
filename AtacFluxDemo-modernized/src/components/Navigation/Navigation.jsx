import { useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/utils';

const pages = ['Biochemistry', 'Epigenome', 'Flux Dynamics', 'Guide Design'];

export function Navigation({ activePage, setActivePage }) {
  const navRef = useRef(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const activeTab = nav.children[activePage];
    if (activeTab) {
      const navRect = nav.getBoundingClientRect();
      const tabRect = activeTab.getBoundingClientRect();
      setIndicator({
        left: tabRect.left - navRect.left,
        width: tabRect.width,
      });
    }
  }, [activePage]);

  return (
    <header className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm">
          AF
        </div>
        <div>
          <div className="font-semibold text-slate-200">atacflux</div>
          <div className="text-[10px] text-slate-500">Metabolic Engineering Platform</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="relative flex items-center gap-1" ref={navRef}>
        {pages.map((page, i) => (
          <button
            key={page}
            onClick={() => setActivePage(i)}
            className={cn(
              'px-4 py-2 text-[13px] font-medium rounded-md transition-colors',
              activePage === i 
                ? 'text-slate-100' 
                : 'text-slate-500 hover:text-slate-300'
            )}
          >
            {page}
          </button>
        ))}
        {/* Sliding indicator */}
        <div
          className="absolute bottom-0 h-0.5 bg-green-500 rounded-full transition-all duration-200"
          style={{ left: indicator.left, width: indicator.width }}
        />
      </nav>

      {/* Version */}
      <div className="text-[11px] text-slate-500">
        <span className="font-mono">v0.9.2-beta</span> • S. cerevisiae S288C
      </div>
    </header>
  );
}
