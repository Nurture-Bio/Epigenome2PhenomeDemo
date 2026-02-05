import { cn } from '../../lib/utils';

const variants = {
  success: 'bg-green-500/20 border-green-500/40 text-green-500',
  danger: 'bg-red-500/20 border-red-500/40 text-red-500',
  warning: 'bg-orange-400/20 border-orange-400/40 text-orange-400',
  info: 'bg-blue-400/20 border-blue-400/40 text-blue-400',
  purple: 'bg-violet-500/20 border-violet-500/40 text-violet-400',
  muted: 'bg-slate-500/20 border-slate-500/40 text-slate-400',
};

export function Badge({ children, variant = 'muted', className, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded type-badge border',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

// Status badge shortcuts
export function StatusBadge({ status }) {
  const config = {
    blocked: { variant: 'danger', label: 'BLOCKED' },
    reduced: { variant: 'warning', label: 'REDUCED' },
    limited: { variant: 'warning', label: 'LIMITED' },
    increased: { variant: 'success', label: 'INCREASED' },
  };
  const { variant, label } = config[status] || { variant: 'muted', label: status };
  return <Badge variant={variant}>{label}</Badge>;
}

// Thermo badge for ΔG values
export function ThermoBadge({ dG, className }) {
  let variant = 'info';
  if (dG < -10) variant = 'success';
  else if (dG > 10) variant = 'warning';
  return (
    <Badge variant={variant} className={cn('font-mono', className)}>
      {dG === 0 ? '—' : dG}
    </Badge>
  );
}
