import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function StockBadge({ stock = 0, lowStockThreshold = 10, showCount = true }) {
  const { isDark } = useTheme();
  const numStock = Number(stock);
  const threshold = Number(lowStockThreshold || 10);

  if (numStock <= 0) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
        isDark ? 'bg-rose-500/15 text-rose-400 border-rose-500/30' : 'bg-rose-50 text-rose-700 border-rose-300'
      }`}>
        <XCircle className={`w-3.5 h-3.5 ${isDark ? 'text-rose-400' : 'text-rose-600'}`} />
        <span>Out of Stock</span>
      </span>
    );
  }

  if (numStock <= threshold) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
        isDark ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' : 'bg-amber-50 text-amber-800 border-amber-300'
      }`}>
        <AlertTriangle className={`w-3.5 h-3.5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
        <span>{showCount ? `Low Stock (${numStock} left)` : 'Low Stock'}</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
      isDark ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-emerald-50 text-emerald-800 border-emerald-300'
    }`}>
      <CheckCircle2 className={`w-3.5 h-3.5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
      <span>{showCount ? `In Stock (${numStock})` : 'In Stock'}</span>
    </span>
  );
}
