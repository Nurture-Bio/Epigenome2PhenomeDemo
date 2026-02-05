import { cn } from '../../lib/utils';

// DataRow: flex justify-between, py-2 (8px), border-b white/0.04, text-[13px]
export function DataRow({ label, value, className, valueClassName, style }) {
  return (
    <div className={cn('flex justify-between py-1.5 border-b border-white/[0.04] last:border-b-0 text-[13px]', className)} style={style}>
      <span className="text-slate-500">{label}</span>
      <span className={cn('text-slate-200 font-medium', valueClassName)}>{value}</span>
    </div>
  );
}

// Badge: px-2 py-0.5 (2px 8px), rounded (4px), text-[9px], font-semibold
export function Badge({ variant, className, children }) {
  const variants = {
    blocked: 'bg-red-500/20 border border-red-500/40 text-red-500',
    reduced: 'bg-orange-400/20 border border-orange-400/40 text-orange-400',
    limited: 'bg-orange-400/20 border border-orange-400/40 text-orange-400',
    increased: 'bg-green-500/20 border border-green-500/40 text-green-500',
    success: 'bg-green-500/20 border border-green-500/40 text-green-500',
    warning: 'bg-amber-500/20 border border-amber-500/40 text-amber-500',
    info: 'bg-blue-400/20 border border-blue-400/40 text-blue-400',
    purple: 'bg-violet-400/20 border border-violet-400/40 text-violet-400',
    muted: 'bg-white/10 text-slate-400',
    keyGene: 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-500',
  };
  return (
    <span className={cn('px-2 py-0.5 rounded text-[9px] font-semibold', variants[variant], className)}>
      {children}
    </span>
  );
}

// Button: px-4 py-2.5 (10px 16px), rounded-md (6px), text-xs (12px)
export function Button({ variant = 'primary', className, children, ...props }) {
  const variants = {
    primary: 'bg-gradient-to-r from-green-800 to-green-700 text-white hover:brightness-110',
    secondary: 'bg-black/20 border border-white/20 rounded text-white text-xs',
    ghost: 'bg-transparent text-slate-400 hover:text-slate-200',
  };
  return (
    <button className={cn('px-4 py-2.5 rounded-md text-xs font-medium cursor-pointer transition-all', variants[variant], className)} {...props}>
      {children}
    </button>
  );
}

// Select: same as original glucoseSelect
export function Select({ className, children, ...props }) {
  return (
    <select className={cn('bg-slate-800 border border-white/20 rounded text-slate-200 text-xs px-2 py-1 cursor-pointer outline-none', className)} {...props}>
      {children}
    </select>
  );
}

// ProgressBar: h-2 (8px), bg-slate-800, rounded (4px)
export function ProgressBar({ value, variant = 'success', className }) {
  const fills = {
    success: 'bg-gradient-to-r from-green-800 to-green-500',
    danger: 'bg-gradient-to-r from-red-700 to-red-500',
    amber: 'bg-gradient-to-r from-amber-600 to-amber-400',
  };
  return (
    <div className={cn('h-2 bg-slate-800 rounded overflow-hidden relative', className)}>
      <div
        className={cn('absolute left-0 top-0 bottom-0 rounded transition-[width] duration-500', fills[variant])}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

// InfoBox: colored background with border
export function InfoBox({ variant = 'blue', className, children }) {
  const variants = {
    blue: 'bg-blue-500/[0.08] border-blue-500/20',
    purple: 'bg-violet-500/[0.08] border-violet-500/20',
    amber: 'bg-amber-500/[0.08] border-amber-500/20',
    green: 'bg-green-500/10 border-green-500/20',
  };
  return (
    <div className={cn('p-4 rounded-lg border', variants[variant], className)}>
      {children}
    </div>
  );
}

// Empty state placeholder for cards awaiting selection or data
export function EmptyState({ title, children, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center h-full p-8 text-center', className)}>
      {title && <div className="text-sm text-slate-300 mb-1.5">{title}</div>}
      <div className="text-[13px] text-slate-500 max-w-[260px] leading-relaxed">{children}</div>
    </div>
  );
}
export function Selectable({ selected, className, children, ...props }) {
  return (
    <div
      className={cn(
        'cursor-pointer relative z-[1] transition-all duration-150',
        !selected && 'hover:shadow-[inset_0_0_0_100px_rgba(255,255,255,0.04)]',
        selected && 'shadow-[0_0_0_1px_rgba(255,255,255,0.1),_0_4px_12px_rgba(0,0,0,0.4)] bg-white/[0.04]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
