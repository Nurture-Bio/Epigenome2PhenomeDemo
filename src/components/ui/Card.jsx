import { cn } from '../../lib/utils';

// Panel: bg white/0.02, border white/0.06, rounded-xl (12px)
export function Card({ className, children, ...props }) {
  return (
    <div className={cn('bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden', className)} {...props}>
      {children}
    </div>
  );
}

// PanelHeader: px-5 py-4 (16px 20px), 11px, semibold, tracking 1.5px, slate-500, uppercase
export function CardHeader({ className, children }) {
  return (
    <div className={cn('px-5 py-4 border-b border-white/[0.06] text-[11px] font-semibold tracking-[1.5px] text-slate-500 uppercase flex items-center justify-between', className)}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children }) {
  return <span className={cn('', className)}>{children}</span>;
}

export function CardContent({ className, children, ...props }) {
  return (
    <div className={cn('p-4', className)} {...props}>
      {children}
    </div>
  );
}

// Visual backdrop for plots, diagrams, SVG canvases — no header chrome
export function PlotSurface({ className, children, ...props }) {
  return (
    <div className={cn(
      'bg-gradient-to-br from-slate-900/80 to-slate-800/60 backdrop-blur-sm border border-white/[0.08] rounded-xl overflow-hidden',
      className
    )} {...props}>
      {children}
    </div>
  );
}
