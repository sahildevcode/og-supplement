import React, { useState, useEffect } from 'react';
import { Boxes, Save, RefreshCw, AlertTriangle, CheckCircle2, ArrowUpDown } from 'lucide-react';
import { api } from '../services/api';
import { socket } from '../services/socket';
import { useAdminToast } from '../context/AdminToastContext';
import StockBadge from '../components/StockBadge';

export default function AdminStock() {
  const [products, setProducts] = useState([]);
  const [stockEdits, setStockEdits] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const { addToast } = useAdminToast();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await api.getProducts();
      if (data && data.products) {
        setProducts(data.products);
        const edits = {};
        data.products.forEach((p) => {
          edits[p._id || p.id] = p.stock;
        });
        setStockEdits(edits);
      }
    } catch (error) {
      console.error('[Fetch Stock Error]', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();

    const handleStockUpdated = ({ productId, stock, status }) => {
      setProducts((prev) =>
        prev.map((p) => ((p._id || p.id) === productId ? { ...p, stock, status } : p))
      );
      setStockEdits((prev) => ({ ...prev, [productId]: stock }));
    };

    socket.on('product:stockUpdated', handleStockUpdated);

    return () => {
      socket.off('product:stockUpdated', handleStockUpdated);
    };
  }, []);

  const handleStockInputChange = (id, val) => {
    setStockEdits((prev) => ({ ...prev, [id]: val }));
  };

  const handleSaveStock = async (id, name) => {
    const newStock = Number(stockEdits[id]);
    if (isNaN(newStock) || newStock < 0) {
      addToast('Please enter a valid stock count (0 or higher)', 'warning');
      return;
    }

    setSavingId(id);
    try {
      await api.updateStock(id, { stock: newStock });
      addToast(`Updated stock for "${name}" to ${newStock}! Broadcasted to live customers.`, 'success');
    } catch (err) {
      addToast(err.message || 'Failed to update stock', 'error');
    } finally {
      setSavingId(null);
    }
  };

  const handleQuickAdd = (id, amount) => {
    const current = Number(stockEdits[id] || 0);
    const updated = Math.max(0, current + amount);
    setStockEdits((prev) => ({ ...prev, [id]: updated }));
  };

  return (
    <div className="space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-cyan-400">
            Real-Time Inventory Synchronizer
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Live Stock Control
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Modify warehouse inventory levels in real-time. Changes immediately disable out-of-stock purchases on customer screens.
          </p>
        </div>

        <button
          onClick={fetchProducts}
          className="px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-white flex items-center gap-2 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Stock</span>
        </button>
      </div>

      {/* Stock Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px] font-bold">
              <tr>
                <th className="p-4 sm:p-5">Supplement Item</th>
                <th className="p-4 sm:p-5">Status</th>
                <th className="p-4 sm:p-5">Current Stock</th>
                <th className="p-4 sm:p-5">Quick Adjust</th>
                <th className="p-4 sm:p-5 text-right">Commit Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-slate-400">
                    Loading inventory data...
                  </td>
                </tr>
              ) : (
                products.map((prod) => {
                  const id = prod._id || prod.id;
                  const currentVal = stockEdits[id] !== undefined ? stockEdits[id] : prod.stock;
                  const isModified = Number(currentVal) !== Number(prod.stock);

                  return (
                    <tr key={id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 sm:p-5">
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.images?.[0] || 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=800&auto=format&fit=crop&q=80'}
                            alt={prod.name}
                            className="w-10 h-10 rounded-xl object-contain p-1 bg-slate-950 border border-slate-800 flex-shrink-0"
                          />
                          <div>
                            <p className="font-bold text-white max-w-xs sm:max-w-md truncate">{prod.name}</p>
                            <span className="text-[11px] text-cyan-400 font-semibold">{prod.brand} • {prod.category}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 sm:p-5">
                        <StockBadge stock={prod.stock} lowStockThreshold={prod.lowStockThreshold} />
                      </td>

                      <td className="p-4 sm:p-5">
                        <input
                          type="number"
                          min="0"
                          value={currentVal}
                          onChange={(e) => handleStockInputChange(id, e.target.value)}
                          className={`w-24 bg-slate-950 border rounded-xl px-3 py-2 text-sm font-mono font-bold text-center focus:outline-none ${
                            isModified
                              ? 'border-amber-500 text-amber-300 ring-2 ring-amber-500/20'
                              : 'border-slate-800 text-white focus:border-cyan-500'
                          }`}
                        />
                      </td>

                      <td className="p-4 sm:p-5">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleQuickAdd(id, -5)}
                            className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white font-mono text-xs"
                          >
                            -5
                          </button>
                          <button
                            onClick={() => handleQuickAdd(id, 10)}
                            className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-cyan-400 hover:text-cyan-300 font-mono text-xs"
                          >
                            +10
                          </button>
                          <button
                            onClick={() => handleQuickAdd(id, 25)}
                            className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-emerald-400 hover:text-emerald-300 font-mono text-xs"
                          >
                            +25
                          </button>
                          <button
                            onClick={() => handleStockInputChange(id, 0)}
                            className="px-2 py-1 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-400 hover:bg-rose-900/60 font-mono text-[10px]"
                          >
                            Zero
                          </button>
                        </div>
                      </td>

                      <td className="p-4 sm:p-5 text-right">
                        <button
                          onClick={() => handleSaveStock(id, prod.name)}
                          disabled={savingId === id || !isModified}
                          className={`px-4 py-2 rounded-xl font-bold text-xs inline-flex items-center gap-1.5 transition-all ${
                            isModified
                              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-950/50 hover:scale-105 active:scale-95'
                              : 'bg-slate-800/40 text-slate-600 cursor-not-allowed'
                          }`}
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>{savingId === id ? 'Syncing...' : 'Save & Sync'}</span>
                        </button>
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
