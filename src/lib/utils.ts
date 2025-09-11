import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const COLORS = [
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#8dd1e1',
  '#a4de6c',
  '#d0ed57',
  '#ffc0cb',
  '#b0e0e6',
];

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(n: number, ccy = 'TWD') {
  if (!isFinite(n)) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: ccy,
    maximumFractionDigits: 0,
  }).format(n);
}
