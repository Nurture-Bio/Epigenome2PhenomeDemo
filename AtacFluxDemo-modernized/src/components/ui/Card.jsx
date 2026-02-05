import { cn } from '../../lib/utils';

// Card - replaces .panel, .card (9× bg-white/[0.02], 8× border-white/[0.06])
export function Card({ children, className, ...props }) {
  return (
    <div
      className={cn(
        'bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// CardHeader - replaces .panelHeader, .cardHeader
export function CardHeader({ children, className, ...props }) {
  return (
    <div
      className={cn(
        'px-5 py-4 border-b border-white/[0.06] flex justify-between items-center',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// CardTitle - replaces .panelHeader text (27× font-size: 11px)
export function CardTitle({ children, className }) {
  return (
    <span className={cn('text-[11px] font-semibold tracking-wider text-slate-500 uppercase', className)}>
      {children}
    </span>
  );
}

// CardContent - standard padding
export function CardContent({ children, className, ...props }) {
  return (
    <div className={cn('p-4', className)} {...props}>
      {children}
    </div>
  );
}
