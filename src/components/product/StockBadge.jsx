import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

export default function StockBadge({ stock = 0, lowStockThreshold = 10, showCount = true }) {
  const numStock = Number(stock);
  const threshold = Number(lowStockThreshold || 10);

  if (numStock <= 0) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
        <XCircle className="w-3.5 h-3.5 text-rose-400" />
        <span>Out of Stock</span>
      </span>
    );
  }

  if (numStock <= threshold) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
        <span>{showCount ? `Low Stock (${numStock} left)` : 'Low Stock'}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
      <span>{showCount ? `In Stock (${numStock})` : 'In Stock'}</span>
    </span>
  );
}
