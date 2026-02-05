import { cn } from '../../lib/utils';

// DataRow - replaces .dataRow pattern (found many times)
export function DataRow({ label, value, className, mono = false, valueColor }) {
  return (
    <div className={cn('flex justify-between py-1.5 type-sm', className)}>
      <span className="text-slate-500">{label}</span>
      <span
        className={cn('font-semibold', mono && 'font-mono', valueColor || 'text-slate-200')}
      >
        {value}
      </span>
    </div>
  );
}

// InfoBox - replaces .findingBox, .implicationBox (7× bg-black/30)
export function InfoBox({ label, icon, children, variant = 'blue', className }) {
  const variants = {
    blue: 'bg-blue-500/[0.08] border-blue-500/20',
    purple: 'bg-violet-500/[0.08] border-violet-500/20',
    amber: 'bg-amber-500/[0.08] border-amber-500/20',
    green: 'bg-green-500/[0.08] border-green-500/20',
  };
  const labelColors = {
    blue: 'text-blue-400',
    purple: 'text-violet-400',
    amber: 'text-amber-400',
    green: 'text-green-400',
  };

  return (
    <div className={cn('p-4 rounded-lg border', variants[variant], className)}>
      {label && (
        <div className={cn('type-label mb-2', labelColors[variant])}>
          {label}
        </div>
      )}
      <div className="flex gap-3">
        {icon && <span className="text-lg shrink-0">{icon}</span>}
        <div className="type-body leading-relaxed">{children}</div>
      </div>
    </div>
  );
}
