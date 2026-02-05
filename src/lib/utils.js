import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function getChromatinColor(value) {
  if (value > 0.6) return '#22c55e';
  if (value > 0.3) return '#f59e0b';
  return '#ef4444';
}
