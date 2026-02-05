import { cn } from '../../lib/utils';

// Button variants
const buttonVariants = {
  primary: 'bg-gradient-to-r from-green-800 to-green-700 text-white',
  secondary: 'bg-black/20 border border-white/20 text-white hover:bg-white/5',
  ghost: 'bg-white/[0.06] border border-white/10 text-slate-400 hover:bg-white/10 hover:text-slate-200',
};

export function Button({ children, variant = 'primary', className, ...props }) {
  return (
    <button
      className={cn(
        'px-4 py-2 rounded-md text-xs font-semibold cursor-pointer transition-all',
        buttonVariants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

// Select - replaces .select, .glucoseSelect, .targetSelect
export function Select({ children, className, ...props }) {
  return (
    <select
      className={cn(
        'w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-md',
        'type-title cursor-pointer',
        'focus:outline-none focus:border-green-500/50',
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
