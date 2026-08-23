import React from 'react';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export default function StockBadge({ stock, lowStockThreshold = 5, showCount = true }) {
  const stockNum = Number(stock || 0);

  if (stockNum <= 0) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
        <XCircle className="w-3.5 h-3.5" />
        <span>Out of Stock</span>
      </span>
    );
  }

  if (stockNum <= lowStockThreshold) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse">
        <AlertTriangle className="w-3.5 h-3.5" />
        <span>{showCount ? `Low Stock (${stockNum} left)` : 'Low Stock'}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
      <CheckCircle className="w-3.5 h-3.5" />
      <span>{showCount ? `In Stock (${stockNum})` : 'In Stock'}</span>
    </span>
  );
}
