import React, { useState } from 'react';
import {
  Boxes,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Save,
  Search,
  Filter,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AdminStock() {
  const { products, refreshProducts } = useProducts();
  const { addToast } = useToast();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [stockInputs, setStockInputs] = useState({});
  const [savingId, setSavingId] = useState(null);

  // Local stock input tracking
  const handleInputChange = (productId, val) => {
    setStockInputs((prev) => ({ ...prev, [productId]: val }));
  };

  const handleUpdateStock = async (product) => {
    const id = product._id || product.id;
    const rawVal = stockInputs[id];
    const newStock = rawVal !== undefined ? Number(rawVal) : Number(product.stock);

    if (isNaN(newStock) || newStock < 0) {
      addToast('Please enter a valid stock number', 'warning');
      return;
    }

    try {
      setSavingId(id);
      await api.updateStock(id, { stock: newStock });
      addToast(`Updated stock for "${product.name}" to ${newStock} units (Live Broadcasted)`, 'success');
      refreshProducts();
    } catch (err) {
      addToast(err.message || 'Failed to update stock', 'error');
    } finally {
      setSavingId(null);
    }
  };

  // Filter calculations
  const totalProducts = products.length;
  const inStockCount = products.filter((p) => Number(p.stock) > (p.lowStockThreshold || 10)).length;
  const lowStockCount = products.filter((p) => Number(p.stock) > 0 && Number(p.stock) <= (p.lowStockThreshold || 10)).length;
  const outOfStockCount = products.filter((p) => Number(p.stock) <= 0).length;

  const filtered = products.filter((p) => {
    if (statusFilter === 'in_stock' && (Number(p.stock) <= (p.lowStockThreshold || 10))) return false;
    if (statusFilter === 'low_stock' && (Number(p.stock) <= 0 || Number(p.stock) > (p.lowStockThreshold || 10))) return false;
    if (statusFilter === 'out_of_stock' && Number(p.stock) > 0) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = p.name?.toLowerCase().includes(q);
      const matchBrand = p.brand?.toLowerCase().includes(q);
      if (!matchName && !matchBrand) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Inventory & Live Stock Controller
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Real-time stock adjustments immediately update customer checkout limits and stock badges
          </p>
        </div>

        <button
          onClick={refreshProducts}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white self-start sm:self-auto"
          title="Refresh Stock List"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Status Filter Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          onClick={() => setStatusFilter('All')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            statusFilter === 'All'
              ? 'bg-cyan-500/15 border-cyan-500/40 text-white shadow-lg shadow-cyan-950/40'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <p className="text-xs font-bold uppercase tracking-wider">All Stock Items</p>
          <p className="text-2xl font-black text-white mt-1">{totalProducts}</p>
        </button>

        <button
          onClick={() => setStatusFilter('in_stock')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            statusFilter === 'in_stock'
              ? 'bg-emerald-500/15 border-emerald-500/40 text-white shadow-lg shadow-emerald-950/40'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" /> In Stock
          </div>
          <p className="text-2xl font-black text-emerald-300 mt-1">{inStockCount}</p>
        </button>

        <button
          onClick={() => setStatusFilter('low_stock')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            statusFilter === 'low_stock'
              ? 'bg-amber-500/15 border-amber-500/40 text-white shadow-lg shadow-amber-950/40'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-amber-400">
            <AlertTriangle className="w-3.5 h-3.5" /> Low Stock
          </div>
          <p className="text-2xl font-black text-amber-300 mt-1">{lowStockCount}</p>
        </button>

        <button
          onClick={() => setStatusFilter('out_of_stock')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            statusFilter === 'out_of_stock'
              ? 'bg-rose-500/15 border-rose-500/40 text-white shadow-lg shadow-rose-950/40'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-rose-400">
            <XCircle className="w-3.5 h-3.5" /> Out of Stock
          </div>
          <p className="text-2xl font-black text-rose-300 mt-1">{outOfStockCount}</p>
        </button>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <input
          type="text"
          placeholder="Filter supplements by name or brand..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
      </div>

      {/* Stock Management Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-950/80 text-[11px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-4 px-6">Product Details</th>
                <th className="py-4 px-4">Category</th>
                <th className="py-4 px-4">Current Status</th>
                <th className="py-4 px-4">Live Stock</th>
                <th className="py-4 px-4">Threshold</th>
                <th className="py-4 px-6 text-right">Quick Update Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500 text-sm">
                    No products match the selected stock filter.
                  </td>
                </tr>
              ) : (
                filtered.map((prod) => {
                  const id = prod._id || prod.id;
                  const currentStock = prod.stock;
                  const inputValue = stockInputs[id] !== undefined ? stockInputs[id] : currentStock;
                  const isModified = String(inputValue) !== String(currentStock);
                  const isZero = Number(inputValue) === 0;

                  return (
                    <tr key={id} className="hover:bg-slate-800/40 transition-colors">
                      
                      {/* Product Info */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.images?.[0] || 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=800&auto=format&fit=crop&q=80'}
                            alt={prod.name}
                            className="w-12 h-12 rounded-xl object-contain bg-slate-950 p-1 border border-slate-800 flex-shrink-0"
                          />
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400">
                              {prod.brand}
                            </span>
                            <p className="font-bold text-white text-xs sm:text-sm line-clamp-1">
                              {prod.name}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4">
                        <span className="text-xs text-slate-400">{prod.category}</span>
                      </td>

                      {/* Visual Status Indicator */}
                      <td className="py-4 px-4">
                        {currentStock <= 0 ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40">
                            <XCircle className="w-3.5 h-3.5" /> Out of Stock
                          </span>
                        ) : currentStock <= (prod.lowStockThreshold || 10) ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                            <AlertTriangle className="w-3.5 h-3.5" /> Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                            <CheckCircle2 className="w-3.5 h-3.5" /> In Stock
                          </span>
                        )}
                      </td>

                      {/* Current Stock */}
                      <td className="py-4 px-4">
                        <span className={`text-base font-black ${
                          currentStock <= 0 ? 'text-rose-400' : currentStock <= 10 ? 'text-amber-400' : 'text-emerald-400'
                        }`}>
                          {currentStock}
                        </span>
                      </td>

                      {/* Threshold */}
                      <td className="py-4 px-4 text-xs text-slate-400">
                        ≤ {prod.lowStockThreshold || 10}
                      </td>

                      {/* Inline Input & Save Button */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <input
                            type="number"
                            min="0"
                            value={inputValue}
                            onChange={(e) => handleInputChange(id, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleUpdateStock(prod);
                            }}
                            className={`w-20 bg-slate-950 border rounded-xl px-3 py-1.5 text-center font-bold text-sm focus:outline-none ${
                              isModified
                                ? 'border-cyan-400 text-cyan-300 ring-2 ring-cyan-500/30'
                                : 'border-slate-700 text-white'
                            }`}
                          />

                          <button
                            onClick={() => handleUpdateStock(prod)}
                            disabled={savingId === id || !isModified}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                              isModified
                                ? 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-md shadow-cyan-950/60 active:scale-95'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            }`}
                          >
                            {savingId === id ? (
                              <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <>
                                <Save className="w-3.5 h-3.5" />
                                <span>Save</span>
                              </>
                            )}
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
