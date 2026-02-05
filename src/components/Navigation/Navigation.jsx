import { useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/utils';

const pages = ['Flavor Search', 'Metabolism', 'Gene Topology', 'Simulation', 'Guide Design'];

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
      setIndicator({ left: tabRect.left - navRect.left, width: tabRect.width });
    }
  }, [activePage]);

  return (
    <header className="flex items-center justify-between px-10 py-5 border-b border-white/[0.06]">
      <div className="flex items-center gap-4">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm">
          AF
        </div>
        <div>
          <div className="text-base font-semibold tracking-tight">atacflux</div>
          <div className="text-[11px] text-slate-500">Metabolic Engineering Platform</div>
        </div>
      </div>

      <nav className="relative flex gap-1" ref={navRef}>
        {pages.map((page, i) => (
          <button
            key={page}
            onClick={() => setActivePage(i)}
            className={cn(
              'px-6 py-3 bg-transparent border-none text-[13px] font-medium tracking-[0.5px] cursor-pointer transition-colors duration-250 relative',
              activePage === i ? 'text-slate-50' : 'text-slate-500 hover:text-slate-400'
            )}
          >
            {page}
          </button>
        ))}
        <div
          className="absolute bottom-0 h-0.5 bg-gradient-to-r from-blue-500 to-violet-500 rounded-sm transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] pointer-events-none"
          style={{ left: indicator.left, width: indicator.width }}
        />
      </nav>

      <div className="text-[11px] text-slate-600">
        <span className="mono">v0.9.2-beta</span> • S. cerevisiae S288C
      </div>
    </header>
  );
}
