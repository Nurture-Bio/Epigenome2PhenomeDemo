import { cn } from '../../lib/utils';

// ProgressBar - replaces .markBar, .progressBar patterns
export function ProgressBar({ value, max = 100, color = 'green', className, showLabel, label }) {
  const percent = Math.min((value / max) * 100, 100);
  
  const colors = {
    green: 'from-green-700 to-green-500',
    red: 'from-red-700 to-red-500',
    amber: 'from-amber-700 to-amber-500',
    blue: 'from-blue-700 to-blue-500',
  };

  return (
    <div className={cn('relative', className)}>
      <div className="h-2 bg-slate-800 rounded overflow-hidden">
        <div
          className={cn('h-full rounded bg-gradient-to-r transition-all duration-500', colors[color])}
          style={{ width: `${percent}%` }}
        />
      </div>
      {showLabel && (
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-semibold">
          {label || `${Math.round(percent)}%`}
        </span>
      )}
    </div>
  );
}

// ComparisonBar - for gene expression/accessibility comparisons
export function ComparisonBar({ gene, value, unit = '%', isBottleneck = false, role }) {
  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[11px]">
          <span className={cn('font-mono', isBottleneck && 'text-red-400')}>{gene}</span>
          {role && <span className="text-slate-500 ml-1">({role})</span>}
        </span>
        <span className={cn('font-mono text-[11px]', isBottleneck ? 'text-red-500' : 'text-green-500')}>
          {value}{unit}
        </span>
      </div>
      <div className="h-4 bg-slate-800 rounded relative overflow-hidden">
        <div
          className={cn(
            'h-full rounded transition-all duration-500',
            isBottleneck
              ? 'bg-gradient-to-r from-red-700/50 to-red-500'
              : 'bg-gradient-to-r from-green-700/50 to-green-500'
          )}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
        {isBottleneck && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-semibold text-red-300">
            BOTTLENECK
          </span>
        )}
      </div>
    </div>
  );
}
