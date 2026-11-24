import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Search,
  SlidersHorizontal,
  RefreshCw,
  ExternalLink,
  Flame,
  CreditCard,
  RotateCcw,
  CheckSquare,
  Square,
  Layers,
  Percent,
  IndianRupee,
  AlertCircle,
  X
} from 'lucide-react';
import { api } from '../services/api';
import { socket } from '../services/socket';
import { useAdminToast } from '../context/AdminToastContext';
import StockBadge from '../components/StockBadge';
import ProductFormModal from '../components/ProductFormModal';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priceRangeFilter, setPriceRangeFilter] = useState('all');
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkActionType, setBulkActionType] = useState('emi'); // 'emi' | 'refund'
  const [bulkEmiValue, setBulkEmiValue] = useState(true);
  const [bulkRefundEnabled, setBulkRefundEnabled] = useState(true);
  const [bulkRefundType, setBulkRefundType] = useState('percentage'); // 'percentage' | 'flat'
  const [bulkRefundValue, setBulkRefundValue] = useState(5);
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToast } = useAdminToast();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await api.getProducts();
      if (data && data.products) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error('[Fetch Products Error]', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();

    const handleCreated = (newProd) => {
      setProducts((prev) => [newProd, ...prev.filter((p) => (p._id || p.id) !== (newProd._id || newProd.id))]);
    };

    const handleUpdated = (updatedProd) => {
      const targetId = updatedProd._id || updatedProd.id;
      setProducts((prev) => prev.map((p) => ((p._id || p.id) === targetId ? { ...p, ...updatedProd } : p)));
    };

    const handleStockUpdated = ({ productId, stock, status }) => {
      setProducts((prev) => prev.map((p) => ((p._id || p.id) === productId ? { ...p, stock, status } : p)));
    };

    const handleDeleted = ({ productId }) => {
      setProducts((prev) => prev.filter((p) => (p._id || p.id) !== productId));
    };

    socket.on('product:created', handleCreated);
    socket.on('product:updated', handleUpdated);
    socket.on('product:stockUpdated', handleStockUpdated);
    socket.on('product:deleted', handleDeleted);

    return () => {
      socket.off('product:created', handleCreated);
      socket.off('product:updated', handleUpdated);
      socket.off('product:stockUpdated', handleStockUpdated);
      socket.off('product:deleted', handleDeleted);
    };
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? It will be removed from all live customer screens in real time.`)) {
      return;
    }

    try {
      await api.deleteProduct(id);
      addToast(`Deleted product: ${name}`, 'success');
      setProducts((prev) => prev.filter((p) => (p._id || p.id) !== id));
    } catch (err) {
      addToast(err.message || 'Delete failed', 'error');
    }
  };

  const handleQuickToggleBestSeller = async (prod) => {
    const pid = prod._id || prod.id;
    const nextVal = !prod.isBestSeller;
    try {
      await api.updateProductBestSeller(pid, {
        isBestSeller: nextVal,
        bestSellerBadge: prod.bestSellerBadge || '🔥 #1 Best Seller',
        bestSellerRank: prod.bestSellerRank || 1
      });
      setProducts((prev) =>
        prev.map((p) => ((p._id || p.id) === pid ? { ...p, isBestSeller: nextVal } : p))
      );
      addToast(
        nextVal ? `🔥 Added "${prod.name}" to Best Sellers!` : `Removed "${prod.name}" from Best Sellers`,
        'success'
      );
    } catch (err) {
      addToast(err.message || 'Failed to update Best Seller status', 'error');
    }
  };

  // Quick 1-Click Toggle EMI for a single product directly from list
  const handleQuickToggleEmi = async (prod) => {
    const pid = prod._id || prod.id;
    const nextVal = !prod.isEmiAvailable;
    try {
      await api.updateProduct(pid, { isEmiAvailable: nextVal });
      setProducts((prev) =>
        prev.map((p) => ((p._id || p.id) === pid ? { ...p, isEmiAvailable: nextVal } : p))
      );
      addToast(
        nextVal ? `Credit Card EMI enabled for "${prod.name}"` : `EMI disabled for "${prod.name}"`,
        'success'
      );
    } catch (err) {
      addToast(err.message || 'Failed to update EMI status', 'error');
    }
  };

  const filtered = products.filter((p) => {
    const matchCat = categoryFilter === 'All' || p.category === categoryFilter;
    const matchSearch =
      !search ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.brand?.toLowerCase().includes(search.toLowerCase());

    const effectivePrice = Number(p.discountPrice || p.price || 0);
    let matchPrice = true;
    if (priceRangeFilter === '0-1000') {
      matchPrice = effectivePrice >= 0 && effectivePrice <= 1000;
    } else if (priceRangeFilter === '1000-2000') {
      matchPrice = effectivePrice > 1000 && effectivePrice <= 2000;
    } else if (priceRangeFilter === '2000-5000') {
      matchPrice = effectivePrice > 2000 && effectivePrice <= 5000;
    } else if (priceRangeFilter === '5000-plus') {
      matchPrice = effectivePrice > 5000;
    }

    return matchCat && matchSearch && matchPrice;
  });

  // Bulk Selection Handlers
  const handleSelectAll = () => {
    const allFilteredIds = filtered.map((p) => p._id || p.id);
    if (selectedProductIds.length === allFilteredIds.length && allFilteredIds.length > 0) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(allFilteredIds);
    }
  };

  const handleToggleSelectProduct = (id) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Perform Bulk Update API call
  const handleExecuteBulkUpdate = async (type, customUpdates = null) => {
    const targetIds = selectedProductIds.length > 0 
      ? selectedProductIds 
      : filtered.map(p => p._id || p.id);

    if (targetIds.length === 0) {
      addToast('No products selected for bulk update', 'error');
      return;
    }

    let updates = customUpdates;
    if (!updates) {
      if (type === 'emi') {
        updates = { isEmiAvailable: bulkEmiValue };
      } else if (type === 'refund') {
        updates = {
          isCancellationFeeApplicable: bulkRefundEnabled,
          cancellationFeeType: bulkRefundType,
          cancellationFeeValue: Number(bulkRefundValue) || 0
        };
      }
    }

    try {
      setBulkSubmitting(true);
      const res = await api.bulkUpdateProducts(targetIds, updates);
      
      // Update local state immediately
      setProducts((prev) =>
        prev.map((p) => {
          const pid = p._id || p.id;
          if (targetIds.includes(pid)) {
            return { ...p, ...updates };
          }
          return p;
        })
      );

      addToast(res.message || `Successfully updated ${targetIds.length} products!`, 'success');
      setIsBulkModalOpen(false);
      setSelectedProductIds([]);
    } catch (err) {
      addToast(err.message || 'Bulk update failed', 'error');
    } finally {
      setBulkSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-cyan-400">
            Catalog Management & Real-Time Sync
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Products Catalog
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Create, edit, adjust prices, and manage active supplement inventory
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedProduct(null);
            setIsModalOpen(true);
          }}
          className="px-5 py-3 rounded-2xl font-black text-xs text-black bg-gradient-to-r from-cyan-400 to-blue-400 hover:from-cyan-300 hover:to-blue-300 shadow-xl shadow-cyan-950/50 flex items-center gap-2 self-start sm:self-auto transition-transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Supplement</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="space-y-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 min-w-[260px]">
            <input
              type="text"
              placeholder="Search by product name, brand..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Category Dropdown */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="All">All Categories</option>
              <option value="Protein">Protein</option>
              <option value="Mass Gainer">Mass Gainer</option>
              <option value="Creatine">Creatine</option>
              <option value="Pre-Workout">Pre-Workout</option>
              <option value="Supplements">Supplements</option>
              <option value="Vitamins">Vitamins</option>
            </select>

            {/* Price Range Filter Pills */}
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 p-1 rounded-xl">
              <span className="text-[11px] font-bold text-slate-500 px-2 flex items-center gap-1">
                <SlidersHorizontal className="w-3 h-3" /> Price:
              </span>
              {[
                { label: 'All', value: 'all' },
                { label: '₹0 - ₹1,000', value: '0-1000' },
                { label: '₹1,000 - ₹2,000', value: '1000-2000' },
                { label: '₹2,000 - ₹5,000', value: '2000-5000' },
                { label: '₹5,000+', value: '5000-plus' }
              ].map((range) => (
                <button
                  key={range.value}
                  onClick={() => setPriceRangeFilter(range.value)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    priceRangeFilter === range.value
                      ? 'bg-cyan-500 text-black shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>

            <button
              onClick={fetchProducts}
              className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-cyan-400 transition-colors"
              title="Refresh list"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bulk Action & Multi-Select Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
          <div className="flex items-center gap-3">
            <button
              onClick={handleSelectAll}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-300 transition-colors"
            >
              {selectedProductIds.length > 0 && selectedProductIds.length === filtered.length ? (
                <CheckSquare className="w-4 h-4 text-cyan-400" />
              ) : (
                <Square className="w-4 h-4 text-slate-500" />
              )}
              <span>
                {selectedProductIds.length > 0
                  ? `Selected (${selectedProductIds.length} / ${filtered.length})`
                  : `Select All Filtered (${filtered.length})`}
              </span>
            </button>

            {selectedProductIds.length > 0 && (
              <button
                onClick={() => setSelectedProductIds([])}
                className="text-xs text-slate-500 hover:text-slate-300 underline"
              >
                Clear Selection
              </button>
            )}
          </div>

          {/* Bulk Action Buttons */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold hidden sm:inline">Bulk Controls:</span>

            {/* Quick Enable All EMI */}
            <button
              onClick={() => handleExecuteBulkUpdate('emi', { isEmiAvailable: true })}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all"
              title="Turn ON EMI option for selected/filtered products"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Turn ON All EMI</span>
            </button>

            {/* Quick Disable All EMI */}
            <button
              onClick={() => handleExecuteBulkUpdate('emi', { isEmiAvailable: false })}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
              title="Turn OFF EMI option for selected/filtered products"
            >
              <CreditCard className="w-3.5 h-3.5 text-slate-500" />
              <span>Turn OFF All EMI</span>
            </button>

            {/* Bulk Refund & Cancellation Fee Config Modal Trigger */}
            <button
              onClick={() => {
                setBulkActionType('refund');
                setIsBulkModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-all"
              title="Configure cancellation deduction fee for selected/filtered products"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Set Bulk Cancellation Fee</span>
            </button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px] font-bold">
              <tr>
                <th className="p-4 sm:p-5 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={filtered.length > 0 && selectedProductIds.length === filtered.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded text-cyan-500 bg-slate-950 border-slate-800 focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="p-4 sm:p-5">Supplement Product</th>
                <th className="p-4 sm:p-5">Category</th>
                <th className="p-4 sm:p-5">MRP / Sell Price</th>
                <th className="p-4 sm:p-5">EMI & Cancellation</th>
                <th className="p-4 sm:p-5">Live Stock</th>
                <th className="p-4 sm:p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-slate-400">
                    Loading supplement database...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-slate-400">
                    No products found matching filters.
                  </td>
                </tr>
              ) : (
                filtered.map((prod) => {
                  const pid = prod._id || prod.id;
                  const isSelected = selectedProductIds.includes(pid);
                  return (
                    <tr
                      key={pid}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isSelected ? 'bg-cyan-950/20' : ''
                      }`}
                    >
                      <td className="p-4 sm:p-5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectProduct(pid)}
                          className="w-4 h-4 rounded text-cyan-500 bg-slate-950 border-slate-800 focus:ring-0 cursor-pointer"
                        />
                      </td>

                      <td className="p-4 sm:p-5">
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.images?.[0] || 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=800&auto=format&fit=crop&q=80'}
                            alt={prod.name}
                            className="w-12 h-12 rounded-xl object-contain p-1 bg-slate-950 border border-slate-800 flex-shrink-0"
                          />
                          <div className="min-w-0 max-w-sm">
                            <p className="font-bold text-white truncate">{prod.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[11px] text-cyan-400 font-semibold">{prod.brand}</span>
                              {prod.isBestSeller && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                  <Flame className="w-2.5 h-2.5 fill-amber-400" />
                                  {prod.bestSellerBadge || 'Best Seller'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 sm:p-5">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-950 border border-slate-800 text-slate-300">
                          {prod.category}
                        </span>
                      </td>

                      <td className="p-4 sm:p-5">
                        <div>
                          <span className="font-mono font-black text-white text-sm">
                            ₹{prod.discountPrice?.toLocaleString('en-IN') || prod.price}
                          </span>
                          {prod.price > (prod.discountPrice || prod.price) && (
                            <span className="block text-[11px] text-slate-400 line-through">
                              ₹{prod.price?.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* EMI & Cancellation Status Badges + 1-Click Toggle */}
                      <td className="p-4 sm:p-5">
                        <div className="space-y-1.5">
                          {/* 1-Click Quick Toggle EMI */}
                          <button
                            onClick={() => handleQuickToggleEmi(prod)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                              prod.isEmiAvailable
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                                : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300'
                            }`}
                            title="Click to toggle EMI for this product"
                          >
                            <CreditCard className="w-3 h-3" />
                            <span>{prod.isEmiAvailable ? 'EMI Enabled' : 'EMI Off'}</span>
                          </button>

                          {/* Cancellation Fee Badge */}
                          <div className="text-[11px] text-slate-400 flex items-center gap-1">
                            <span className="text-slate-500">Cancel Fee:</span>
                            {prod.isCancellationFeeApplicable === false ? (
                              <span className="text-slate-500">None (Full Refund)</span>
                            ) : (
                              <span className="text-amber-400 font-bold">
                                {prod.cancellationFeeType === 'flat'
                                  ? `₹${prod.cancellationFeeValue || 100} Flat`
                                  : `${prod.cancellationFeeValue || 5}%`}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="p-4 sm:p-5">
                        <StockBadge stock={prod.stock} lowStockThreshold={prod.lowStockThreshold} />
                      </td>

                      <td className="p-4 sm:p-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* 1-Click Best Seller Quick Toggle */}
                          <button
                            onClick={() => handleQuickToggleBestSeller(prod)}
                            className={`p-2 rounded-xl transition-all border ${
                              prod.isBestSeller
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-amber-400 hover:border-amber-500/30'
                            }`}
                            title={prod.isBestSeller ? 'Click to remove from Best Sellers' : 'Click to feature as Best Seller'}
                          >
                            <Flame className={`w-4 h-4 ${prod.isBestSeller ? 'fill-amber-400' : ''}`} />
                          </button>

                          <button
                            onClick={() => {
                              setSelectedProduct(prod);
                              setIsModalOpen(true);
                            }}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-cyan-400 hover:text-white transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDelete(prod._id || prod.id, prod.name)}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-rose-400 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* Bulk Settings Modal for Cancellation Fee & EMI */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setIsBulkModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Bulk Cancellation Fee</h3>
                <p className="text-xs text-slate-400">
                  Applying to {selectedProductIds.length > 0 ? selectedProductIds.length : filtered.length} products
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <div>
                  <p className="text-xs font-bold text-white">Enable Cancellation Fee</p>
                  <p className="text-[11px] text-slate-400">Cut handling fee on cancellation</p>
                </div>
                <input
                  type="checkbox"
                  checked={bulkRefundEnabled}
                  onChange={(e) => setBulkRefundEnabled(e.target.checked)}
                  className="w-5 h-5 rounded text-cyan-500 bg-slate-900 border-slate-800 cursor-pointer"
                />
              </div>

              {bulkRefundEnabled && (
                <div className="space-y-3 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Fee Deduction Type
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setBulkRefundType('percentage')}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                          bulkRefundType === 'percentage'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-slate-900 text-slate-400 border-slate-800'
                        }`}
                      >
                        % Percentage
                      </button>
                      <button
                        type="button"
                        onClick={() => setBulkRefundType('flat')}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                          bulkRefundType === 'flat'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-slate-900 text-slate-400 border-slate-800'
                        }`}
                      >
                        ₹ Flat Amount
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Deduction Value ({bulkRefundType === 'percentage' ? '%' : '₹'})
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={bulkRefundValue}
                      onChange={(e) => setBulkRefundValue(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                    <p className="text-[11px] text-slate-400 mt-1.5">
                      {bulkRefundType === 'percentage'
                        ? `Customer order cancel karega to ${bulkRefundValue}% cut hokar baaki refund hoga.`
                        : `Customer order cancel karega to flat ₹${bulkRefundValue} cut hokar baaki refund hoga.`}
                    </p>
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsBulkModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={bulkSubmitting}
                  onClick={() => handleExecuteBulkUpdate('refund')}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-black bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 transition-all flex items-center gap-2"
                >
                  {bulkSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Apply to {selectedProductIds.length > 0 ? selectedProductIds.length : filtered.length} Products</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={selectedProduct}
        onSave={() => fetchProducts()}
      />

    </div>
  );
}
