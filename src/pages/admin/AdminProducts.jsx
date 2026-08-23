import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Boxes,
  Eye,
  Check,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import StockBadge from '../../components/product/StockBadge';
import ProductFormModal from '../../components/admin/ProductFormModal';

export default function AdminProducts() {
  const { products, refreshProducts, categories } = useProducts();
  const { addToast } = useToast();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Filter products locally for instantaneous UI response
  const filtered = products.filter((p) => {
    if (category !== 'All' && p.category !== category) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = p.name?.toLowerCase().includes(q);
      const matchBrand = p.brand?.toLowerCase().includes(q);
      const matchCategory = p.category?.toLowerCase().includes(q);
      if (!matchName && !matchBrand && !matchCategory) return false;
    }
    return true;
  });

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (productId, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? It will be immediately removed from all customer browsers.`)) {
      return;
    }

    try {
      setDeletingId(productId);
      await api.deleteProduct(productId);
      addToast(`Deleted "${name}" successfully`, 'success');
      refreshProducts();
    } catch (err) {
      addToast(err.message || 'Failed to delete product', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Supplement Catalog Manager
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Manage prices, stock levels, variants and specifications with real-time customer sync
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-3 rounded-2xl font-black text-xs bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white shadow-lg shadow-cyan-950/60 flex items-center gap-2 transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add New Product
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Search by product name, brand or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer w-full sm:w-auto"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
            ))}
          </select>

          <button
            onClick={refreshProducts}
            className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
            title="Refresh Product List"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-950/80 text-[11px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-4 px-6">Product</th>
                <th className="py-4 px-4">Category</th>
                <th className="py-4 px-4">Price (MRP / Sale)</th>
                <th className="py-4 px-4">Stock Status</th>
                <th className="py-4 px-4">Variants / Flavours</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500 text-sm">
                    No products found matching your search.
                  </td>
                </tr>
              ) : (
                filtered.map((prod) => {
                  const id = prod._id || prod.id;
                  return (
                    <tr key={id} className="hover:bg-slate-800/40 transition-colors">
                      
                      {/* Product Name & Image */}
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
                        <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 text-xs font-semibold">
                          {prod.category}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-4 px-4">
                        <div className="space-y-0.5">
                          <span className="font-black text-white text-sm">
                            ₹{prod.discountPrice?.toLocaleString('en-IN') || prod.price}
                          </span>
                          {prod.price > (prod.discountPrice || prod.price) && (
                            <span className="text-[11px] text-slate-500 line-through block">
                              ₹{prod.price?.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Stock Badge */}
                      <td className="py-4 px-4">
                        <StockBadge stock={prod.stock} lowStockThreshold={prod.lowStockThreshold} />
                      </td>

                      {/* Variants & Flavours count */}
                      <td className="py-4 px-4 text-xs text-slate-400">
                        <p>{prod.variants?.length || 1} Sizes</p>
                        <p>{prod.flavours?.length || 1} Flavours</p>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(prod)}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-400 border border-slate-700/80 transition-colors"
                            title="Edit Product Details & Price"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDelete(id, prod.name)}
                            disabled={deletingId === id}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 border border-slate-700/80 transition-colors"
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

      {/* Product Add/Edit Modal */}
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productToEdit={editingProduct}
        onSaved={refreshProducts}
      />

    </div>
  );
}
