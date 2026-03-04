import { cn } from '../../lib/utils';

// Panel: flush geometry — no rounding, single-pixel border
export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn('relative bg-surface-panel border border-border-subtle overflow-hidden', className)}
      style={{ borderRadius: 'var(--radius-panel)' }}
      {...props}
    >
      {children}
    </div>
  );
}

// PanelHeader: compact label — no border-bottom chrome, no tracking, typography hierarchy only
export function CardHeader({ className, children }) {
  return (
    <div
      className={cn('px-4 py-2.5 type-label flex items-center justify-between border-b border-border-subtle', className)}
      style={{ borderRadius: 0 }}
    >
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

// PlotSurface: instrument canvas — no rounding, raised surface
export function PlotSurface({ className, children, ...props }) {
  return (
    <div
      className={cn('bg-surface-raised border border-border-default overflow-hidden', className)}
      style={{ borderRadius: 'var(--radius-panel)' }}
      {...props}
    >
      {children}
    </div>
  );
}
