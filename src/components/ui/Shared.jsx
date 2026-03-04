import * as SelectPrimitive from '@radix-ui/react-select';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

// DataRow: label/value pair. type-sm throughout — consistent with dense sidebar density.
// Label: text-text-muted. Value: text-text-primary, semibold, mono.
export function DataRow({ label, value, className, valueClassName }) {
  return (
    <div
      className={cn('flex justify-between py-1.5 border-b border-border-subtle last:border-b-0', className)}
    >
      <span className="type-sm text-text-muted">{label}</span>
      <span className={cn('type-sm font-semibold text-text-primary mono', valueClassName)}>{value}</span>
    </div>
  );
}

// Badge: inline state indicator — color communicates function
export function Badge({ variant, className, children }) {
  const variantStyles = {
    blocked:  { background: 'color-mix(in srgb, var(--color-danger)  12%, transparent)', border: '1px solid color-mix(in srgb, var(--color-danger)  25%, transparent)', color: 'var(--color-danger)' },
    reduced:  { background: 'color-mix(in srgb, var(--color-warning) 12%, transparent)', border: '1px solid color-mix(in srgb, var(--color-warning) 25%, transparent)', color: 'var(--color-warning)' },
    limited:  { background: 'color-mix(in srgb, var(--color-warning) 12%, transparent)', border: '1px solid color-mix(in srgb, var(--color-warning) 25%, transparent)', color: 'var(--color-warning)' },
    increased:{ background: 'color-mix(in srgb, var(--color-success) 12%, transparent)', border: '1px solid color-mix(in srgb, var(--color-success) 25%, transparent)', color: 'var(--color-success)' },
    success:  { background: 'color-mix(in srgb, var(--color-success) 12%, transparent)', border: '1px solid color-mix(in srgb, var(--color-success) 25%, transparent)', color: 'var(--color-success)' },
    warning:  { background: 'color-mix(in srgb, var(--color-warning) 12%, transparent)', border: '1px solid color-mix(in srgb, var(--color-warning) 25%, transparent)', color: 'var(--color-warning)' },
    info:     { background: 'color-mix(in srgb, var(--color-accent)  12%, transparent)', border: '1px solid color-mix(in srgb, var(--color-accent)  25%, transparent)', color: 'var(--color-accent)' },
    purple:   { background: 'color-mix(in srgb, var(--color-purple)  12%, transparent)', border: '1px solid color-mix(in srgb, var(--color-purple)  25%, transparent)', color: 'var(--color-purple)' },
    muted:    { background: 'var(--surface-hover)', color: 'var(--text-muted)' },
    keyGene:  { background: 'color-mix(in srgb, #ca8a04 12%, transparent)', border: '1px solid color-mix(in srgb, #ca8a04 25%, transparent)', color: '#ca8a04' },
  };
  return (
    <span
      className={cn('px-2 py-0.5 type-badge', className)}
      style={{ borderRadius: 'var(--radius-sm)', ...variantStyles[variant] }}
    >
      {children}
    </span>
  );
}

// Button — .btn CSS class variant system, real interaction mechanics
export function Button({ variant = 'primary', className, children, ...props }) {
  return (
    <button className={cn('btn', `btn-${variant}`, className)} {...props}>
      {children}
    </button>
  );
}

// ChevronDown SVG — no emoji, no unicode
function ChevronDown() {
  return (
    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden>
      <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ComboBox — Radix Select, accepts options: [{value, label}]
export function ComboBox({ value, defaultValue, onValueChange, options = [], className, placeholder = 'Select...' }) {
  return (
    <SelectPrimitive.Root
      value={value !== undefined ? String(value) : undefined}
      defaultValue={defaultValue !== undefined ? String(defaultValue) : undefined}
      onValueChange={onValueChange}
    >
      <SelectPrimitive.Trigger className={cn('combobox-trigger', className)}>
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon className="combobox-trigger-icon">
          <ChevronDown />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content className="combobox-content" position="popper" sideOffset={3}>
          <SelectPrimitive.Viewport className="combobox-viewport">
            {options.map(opt => {
              const val = String(opt.value ?? opt);
              const label = opt.label ?? opt;
              return (
                <SelectPrimitive.Item key={val} value={val} className="combobox-item">
                  <SelectPrimitive.ItemText>{label}</SelectPrimitive.ItemText>
                </SelectPrimitive.Item>
              );
            })}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}

// Select — keep for internal compatibility (wraps ComboBox with children API)
export function Select({ className, value, onChange, children, ...props }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className={cn('combobox-trigger', className)}
      style={{ appearance: 'none', paddingRight: '28px', backgroundImage: 'var(--select-arrow)', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
      {...props}
    >
      {children}
    </select>
  );
}

// ProgressBar — CSS var fill colors, no Tailwind semantic override
export function ProgressBar({ value, variant = 'success', className }) {
  const fillColors = {
    success: 'var(--color-success)',
    danger:  'var(--color-danger)',
    amber:   'var(--color-warning)',
  };
  return (
    <div
      className={cn('h-1.5 overflow-hidden relative', className)}
      style={{ background: 'var(--surface-hover)', borderRadius: 'var(--radius-sm)' }}
    >
      <div
        className="absolute left-0 top-0 bottom-0 transition-[width] duration-500"
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: fillColors[variant], borderRadius: 'var(--radius-sm)' }}
      />
    </div>
  );
}

// Callout — left-border accent, instrument-grade. Replaces InfoBox gradient.
export function Callout({ variant = 'accent', className, children }) {
  const colors = {
    accent:  'var(--color-accent)',
    success: 'var(--color-success)',
    warning: 'var(--color-warning)',
    danger:  'var(--color-danger)',
    purple:  'var(--color-purple)',
  };
  return (
    <div
      className={cn('callout', className)}
      style={{ '--callout-color': colors[variant] ?? colors.accent }}
    >
      {children}
    </div>
  );
}

// InfoBox — left-border callout alias (backwards compatibility for callers)
export function InfoBox({ variant = 'blue', className, children }) {
  const variantMap = { blue: 'accent', purple: 'purple', amber: 'warning', green: 'success' };
  return <Callout variant={variantMap[variant] ?? 'accent'} className={className}>{children}</Callout>;
}

// EmptyState — minimal, no centered box spectacle
export function EmptyState({ title, children, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center h-full p-8 text-center', className)}>
      {title && <div className="type-body mb-1 text-text-secondary">{title}</div>}
      <div className="type-body text-text-muted max-w-[240px] leading-relaxed">{children}</div>
    </div>
  );
}

// Selectable — .dr pattern. statusColor sets the left-border signal via CSS var.
export function Selectable({ selected, statusColor, className, style, children, ...props }) {
  return (
    <div
      className={cn('dr', selected && 'dr--selected', className)}
      style={statusColor ? { '--dr-status': statusColor, ...style } : style}
      {...props}
    >
      {children}
    </div>
  );
}

// InteractiveRow — Tailwind-native div row. No .dr CSS class dependency.
// Rest:     border-b border-border-subtle, transparent left accent (reserved).
// Hover:    bg-surface-hover (pure background-color, no compositor hacks).
// Selected: bg-surface-selected + var(--color-accent) left accent.
// Keyboard: Enter/Space fires onSelect.
export function InteractiveRow({ selected, onSelect, className, children, ...props }) {
  return (
    <div
      role="row"
      aria-selected={selected}
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect?.(); } }}
      className={cn(
        'flex items-center border-b border-border-subtle cursor-pointer transition-colors duration-150',
        selected ? 'bg-surface-selected' : 'hover:bg-surface-hover',
        className,
      )}
      style={{ borderLeft: `2px solid ${selected ? 'var(--color-accent)' : 'transparent'}` }}
      {...props}
    >
      {children}
    </div>
  );
}

// ActionCard — .ac pattern. Grid-based selectable tile with lift-on-hover.
// accentColor drives the left border and hover glow (set as --ac-accent).
// disabled locks out interaction and dims to 40%.
export function ActionCard({ selected, accentColor, disabled, className, style, children, ...props }) {
  return (
    <div
      className={cn('ac', selected && 'ac--selected', disabled && 'ac--disabled', className)}
      style={accentColor ? { '--ac-accent': accentColor, ...style } : style}
      {...props}
    >
      {children}
    </div>
  );
}

// MetricBar — Framer Motion spring width animation.
// dataColor: raw CSS color from the diverging scale (same --data-color as the table).
// variant:   fallback fill when no dataColor is provided.
const MB_FILL = {
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  danger:  'var(--color-danger)',
  neutral: 'var(--color-accent)',
  purple:  'var(--color-purple)',
};

export function MetricBar({ value, label, unit, variant = 'neutral', dataColor, baseline, className }) {
  const pct  = Math.min(100, Math.max(0, value ?? 0));
  const fill = dataColor ?? MB_FILL[variant] ?? MB_FILL.neutral;

  return (
    <div className={cn('', className)}>
      {(label != null || unit != null) && (
        <div className="mb-header">
          <span className="mb-label">{label}</span>
          {unit != null && <span className="mb-value">{value}{unit}</span>}
        </div>
      )}
      <div
        className="relative overflow-hidden"
        style={{ height: 8, background: 'var(--surface-input)', borderRadius: 'var(--radius-sm)' }}
      >
        <motion.div
          className="absolute left-0 top-0 bottom-0"
          animate={{ width: `${pct}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          style={{ background: fill, borderRadius: 'var(--radius-sm)' }}
        />
        {baseline != null && (
          <div
            className="absolute top-0 bottom-0"
            style={{ left: `${baseline}%`, width: 2, background: 'var(--border-strong)' }}
          />
        )}
      </div>
    </div>
  );
}

// DataTable — TanStack Table (headless) + data-cell overlay pattern.
//
// TanStack owns: row models, column definitions, cell rendering, row identity.
// This component owns: markup, WAI-ARIA grid roles, two-layer compositing.
//
// Two-layer compositing (defined in global.css .data-row / .data-cell):
//   Layer 1 — --data-color CSS var on <tr> (heatmap signal, inherited by all cells)
//   Layer 2 — ::after pseudo-element per cell (hover tint / selection highlight over data)
//
// Column definition meta fields (all optional):
//   align: 'right' | 'left'  — numeric columns use 'right' + tabular-nums
//   mono:  boolean           — renders cell content in monospace
//   className: string        — extra classes applied to each <td>
//
// Props:
//   data         — array of row objects
//   columns      — TanStack ColumnDef[]
//   rowId        — key name used as row id string (default: 'id')
//   selectedId   — id of the currently selected row
//   onSelect     — fn(id: string) called on click or Enter/Space
//   getDataColor — optional fn(row) → CSS color string → applied as --data-color
export function DataTable({ data, columns, rowId = 'id', selectedId, onSelect, getDataColor }) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: row => String(row[rowId]),
  });

  return (
    <table
      role="grid"
      className="w-full"
      style={{ borderCollapse: 'collapse', tableLayout: 'fixed' }}
    >
      <thead>
        {table.getHeaderGroups().map(hg => (
          <tr key={hg.id} role="row">
            {hg.headers.map(header => (
              <th
                key={header.id}
                role="columnheader"
                scope="col"
                style={{ width: header.column.columnDef.size }}
                className={cn(
                  'type-badge text-text-muted px-3 py-1.5 border-b border-border-subtle tracking-[0.5px]',
                  header.column.columnDef.meta?.align === 'right' ? 'text-right' : 'text-left',
                )}
              >
                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
              </th>
            ))}
          </tr>
        ))}
      </thead>

      <tbody>
        {table.getRowModel().rows.map(row => {
          const isSelected = row.id === String(selectedId);
          const dataColor  = getDataColor?.(row.original);

          return (
            <tr
              key={row.id}
              role="row"
              aria-selected={isSelected}
              tabIndex={0}
              onClick={() => onSelect?.(row.id)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect?.(row.id); }
              }}
              className="data-row"
              style={dataColor ? { '--data-color': dataColor } : undefined}
            >
              {row.getVisibleCells().map(cell => (
                <td
                  key={cell.id}
                  role="gridcell"
                  className={cn(
                    'data-cell type-sm px-3 py-2 border-b border-border-subtle overflow-hidden text-ellipsis whitespace-nowrap',
                    cell.column.columnDef.meta?.align === 'right' ? 'text-right tabular-nums' : 'text-left',
                    cell.column.columnDef.meta?.mono     && 'mono',
                    cell.column.columnDef.meta?.className,
                  )}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
