import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Chromatin color helpers
export function getChromatinColorClass(chromatin) {
  const colors = {
    open: 'text-green-500',
    partial: 'text-amber-500',
    closed: 'text-red-500',
  };
  return colors[chromatin] || 'text-slate-400';
}

export function getChromatinColor(chromatin) {
  const colors = {
    open: '#22c55e',
    partial: '#f59e0b',
    closed: '#ef4444',
  };
  return colors[chromatin] || '#94a3b8';
}

export function formatPercent(value, decimals = 0) {
  return `${(value * 100).toFixed(decimals)}%`;
}
