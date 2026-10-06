import React, { useState, useEffect } from 'react';
import {
  Flame,
  Search,
  CheckCircle2,
  XCircle,
  ExternalLink,
  RefreshCw,
  Sparkles,
  ArrowUpDown,
  Tag,
  Save,
  Trash2,
  TrendingUp,
  Boxes,
  HelpCircle
} from 'lucide-react';
import { api } from '../services/api';
import { socket } from '../services/socket';
import { useAdminToast } from '../context/AdminToastContext';

const BADGE_PRESETS = [
  '🔥 #1 Best Seller',
  '⚡ Top Trending',
  '⭐ Customer Choice',
  '🏆 Most Popular',
  '💪 Gym Essential',
  '🚀 High Demand',
  '💎 Premium Grade'
];

export default function AdminBestSellers() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('bestsellers'); // 'bestsellers' | 'all'
  const [savingId, setSavingId] = useState(null);
  const { addToast } = useAdminToast();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await api.getProducts();
      if (data && data.products) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error('[Fetch Products Error]', err);
      addToast(err.message || 'Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();

    const handleUpdated = (updatedProd) => {
      const pid = updatedProd._id || updatedProd.id;
      setProducts((prev) => prev.map((p) => ((p._id || p.id) === pid ? { ...p, ...updatedProd } : p)));
    };

    socket.on('product:updated', handleUpdated);
    socket.on('product:bestSellerUpdated', handleUpdated);

    return () => {
      socket.off('product:updated', handleUpdated);
      socket.off('product:bestSellerUpdated', handleUpdated);
    };
  }, []);

  const handleToggle = async (product) => {
    const pid = product._id || product.id;
    const newStatus = !product.isBestSeller;
    setSavingId(pid);

    try {
      const res = await api.toggleBestSeller(pid, {
        isBestSeller: newStatus,
        bestSellerRank: newStatus ? (product.bestSellerRank || 1) : 0,
        bestSellerBadge: newStatus ? (product.bestSellerBadge || '🔥 #1 Best Seller') : ''
      });

      if (res && res.success) {
        setProducts((prev) =>
          prev.map((p) =>
            (p._id || p.id) === pid
              ? {
                  ...p,
                  isBestSeller: newStatus,
                  bestSellerRank: newStatus ? (product.bestSellerRank || 1) : 0,
                  bestSellerBadge: newStatus ? (product.bestSellerBadge || '🔥 #1 Best Seller') : ''
                }
              : p
          )
        );
        addToast(
          newStatus
            ? `Added "${product.name.slice(0, 30)}..." to Best Sellers!`
            : `Removed "${product.name.slice(0, 30)}..." from Best Sellers.`,
          'success'
        );
      }
    } catch (err) {
      addToast(err.message || 'Update failed', 'error');
    } finally {
      setSavingId(null);
    }
  };

  const handleUpdateDetails = async (product, rank, badge) => {
    const pid = product._id || product.id;
    setSavingId(pid);

    try {
      const res = await api.toggleBestSeller(pid, {
        isBestSeller: true,
        bestSellerRank: Number(rank) || 1,
        bestSellerBadge: badge
      });

      if (res && res.success) {
        setProducts((prev) =>
          prev.map((p) =>
            (p._id || p.id) === pid
              ? { ...p, isBestSeller: true, bestSellerRank: Number(rank) || 1, bestSellerBadge: badge }
              : p
          )
        );
        addToast(`Updated Best Seller details for "${product.name.slice(0, 25)}..."`, 'success');
      }
    } catch (err) {
      addToast(err.message || 'Update failed', 'error');
    } finally {
      setSavingId(null);
    }
  };

  const bestSellersList = products
    .filter((p) => p.isBestSeller)
    .sort((a, b) => (a.bestSellerRank || 999) - (b.bestSellerRank || 999) || (b.salesCount || 0) - (a.salesCount || 0));

  const filteredCatalog = products.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
              <Flame className="w-3 h-3 fill-amber-400" />
              Storefront Merchandising
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Best Selling Products Manager
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5 max-w-2xl">
            Control which supplements appear on the customer-facing <strong>/best-sellers</strong> page. Customize badges, ranking order, and track real-time sales accumulation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="http://localhost:5173/best-sellers"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 flex items-center gap-2 transition-colors"
          >
            <span>Live Store Preview</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={fetchProducts}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 transition-colors"
            title="Refresh list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Info Tip Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/20 flex items-start gap-3.5">
        <Sparkles className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <strong className="text-amber-300 font-bold">Automatic + Manual Dual-Mode:</strong> As customers place orders, products naturally increase their <em>Sales Count</em>. You can override or curate the list anytime by toggling <strong>"Best Seller"</strong> on any product, giving it a custom rank (#1, #2...) and a flashy badge like <code>🔥 #1 Best Seller</code>.
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('bestsellers')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'bestsellers'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-lg shadow-amber-950/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>Active Best Sellers ({bestSellersList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'all'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-lg shadow-cyan-950/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>All Catalog Products ({products.length})</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative min-w-[220px]">
          <input
            type="text"
            placeholder="Search supplements..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* TAB 1: ACTIVE BEST SELLERS */}
      {activeTab === 'bestsellers' && (
        <div className="space-y-4">
          {loading ? (
            <div className="p-12 text-center text-slate-400">Loading best seller products...</div>
          ) : bestSellersList.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
              <Flame className="w-10 h-10 text-amber-400/40 mx-auto" />
              <h3 className="text-base font-bold text-slate-200">No products marked as Best Seller yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Switch to the "All Catalog Products" tab above and toggle "Add to Best Sellers" on any supplement.
              </p>
              <button
                onClick={() => setActiveTab('all')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black transition-colors"
              >
                Browse All Products
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {bestSellersList.map((prod, idx) => (
                <BestSellerItemCard
                  key={prod._id || prod.id}
                  product={prod}
                  index={idx + 1}
                  onToggle={handleToggle}
                  onUpdateDetails={handleUpdateDetails}
                  isSaving={savingId === (prod._id || prod.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ALL PRODUCTS CATALOG */}
      {activeTab === 'all' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px] font-bold">
                <tr>
                  <th className="p-4 sm:p-5">Supplement</th>
                  <th className="p-4 sm:p-5">Category</th>
                  <th className="p-4 sm:p-5">Price</th>
                  <th className="p-4 sm:p-5">Sales Count</th>
                  <th className="p-4 sm:p-5">Best Seller Status</th>
                  <th className="p-4 sm:p-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredCatalog.map((prod) => {
                  const pid = prod._id || prod.id;
                  const isBS = prod.isBestSeller;
                  return (
                    <tr key={pid} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 sm:p-5">
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.images?.[0] || 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=800&auto=format&fit=crop&q=80'}
                            alt={prod.name}
                            className="w-10 h-10 rounded-xl object-contain p-1 bg-slate-950 border border-slate-800 flex-shrink-0"
                          />
                          <div className="min-w-0 max-w-xs sm:max-w-md">
                            <p className="font-bold text-white truncate">{prod.name}</p>
                            <span className="text-[11px] text-slate-400 font-semibold">{prod.brand}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 sm:p-5">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-950 border border-slate-800 text-slate-300">
                          {prod.category}
                        </span>
                      </td>

                      <td className="p-4 sm:p-5 font-mono font-bold text-white">
                        ₹{prod.discountPrice?.toLocaleString('en-IN') || prod.price}
                      </td>

                      <td className="p-4 sm:p-5">
                        <div className="flex items-center gap-1.5 text-xs text-slate-300">
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="font-mono font-bold">{prod.salesCount || 0} units</span>
                        </div>
                      </td>

                      <td className="p-4 sm:p-5">
                        {isBS ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            <Flame className="w-3 h-3 fill-amber-400" />
                            {prod.bestSellerBadge || 'Active Best Seller'}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-500">Regular Catalog</span>
                        )}
                      </td>

                      <td className="p-4 sm:p-5 text-right">
                        <button
                          onClick={() => handleToggle(prod)}
                          disabled={savingId === pid}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            isBS
                              ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30'
                              : 'bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500 hover:text-black'
                          }`}
                        >
                          {savingId === pid ? 'Updating...' : isBS ? 'Remove from Best Sellers' : '+ Add as Best Seller'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}

// Sub-component for individual Best Seller Card with direct badge & rank editor
function BestSellerItemCard({ product, index, onToggle, onUpdateDetails, isSaving }) {
  const [rank, setRank] = useState(product.bestSellerRank || index);
  const [badge, setBadge] = useState(product.bestSellerBadge || '🔥 #1 Best Seller');
  const [dirty, setDirty] = useState(false);

  const handleSave = () => {
    onUpdateDetails(product, rank, badge);
    setDirty(false);
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      
      {/* Product Info */}
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center font-mono font-black text-sm flex-shrink-0">
          #{rank}
        </div>

        <img
          src={product.images?.[0] || 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=800&auto=format&fit=crop&q=80'}
          alt={product.name}
          className="w-14 h-14 rounded-xl object-contain p-1.5 bg-slate-950 border border-slate-800 flex-shrink-0"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              {product.category}
            </span>
            <span className="text-xs text-amber-400 font-bold">{product.brand}</span>
            <span className="text-xs text-slate-400 font-mono">| {product.salesCount || 0} Sold</span>
          </div>
          <h3 className="font-bold text-white text-sm truncate mt-0.5">{product.name}</h3>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            ₹{product.discountPrice?.toLocaleString('en-IN') || product.price}{' '}
            <span className="text-emerald-400">({product.stock} in stock)</span>
          </p>
        </div>
      </div>

      {/* Editor Controls */}
      <div className="flex flex-wrap items-center gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800">
        
        {/* Rank input */}
        <div className="flex items-center gap-1.5">
          <label className="text-[11px] font-semibold text-slate-400">Rank:</label>
          <input
            type="number"
            min="1"
            max="99"
            value={rank}
            onChange={(e) => {
              setRank(e.target.value);
              setDirty(true);
            }}
            className="w-14 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-center text-white focus:outline-none focus:border-amber-500 font-mono font-bold"
          />
        </div>

        {/* Badge input / presets */}
        <div className="flex items-center gap-1.5">
          <label className="text-[11px] font-semibold text-slate-400">Badge:</label>
          <input
            type="text"
            value={badge}
            onChange={(e) => {
              setBadge(e.target.value);
              setDirty(true);
            }}
            placeholder="e.g. 🔥 #1 Best Seller"
            className="w-36 sm:w-44 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-amber-500"
          />
          <select
            onChange={(e) => {
              if (e.target.value) {
                setBadge(e.target.value);
                setDirty(true);
              }
            }}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-slate-300 focus:outline-none"
            defaultValue=""
          >
            <option value="" disabled>Presets</option>
            {BADGE_PRESETS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Save Button */}
        {dirty && (
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black flex items-center gap-1 transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save</span>
          </button>
        )}

        {/* Remove Button */}
        <button
          onClick={() => onToggle(product)}
          disabled={isSaving}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors"
          title="Remove from Best Sellers"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
