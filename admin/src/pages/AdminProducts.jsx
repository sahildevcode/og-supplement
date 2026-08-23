import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Search,
  SlidersHorizontal,
  RefreshCw,
  ExternalLink
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

  const filtered = products.filter((p) => {
    const matchCat = categoryFilter === 'All' || p.category === categoryFilter;
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

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
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="relative flex-1 min-w-[260px]">
          <input
            type="text"
            placeholder="Search by product name, brand..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="All">All Categories</option>
            <option value="Protein">Protein</option>
            <option value="Mass Gainer">Mass Gainer</option>
            <option value="Creatine">Creatine</option>
            <option value="Pre-Workout">Pre-Workout</option>
            <option value="Supplements">Supplements</option>
            <option value="Vitamins">Vitamins</option>
          </select>

          <button
            onClick={fetchProducts}
            className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-cyan-400 transition-colors"
            title="Refresh list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px] font-bold">
              <tr>
                <th className="p-4 sm:p-5">Supplement Product</th>
                <th className="p-4 sm:p-5">Category</th>
                <th className="p-4 sm:p-5">MRP / Sell Price</th>
                <th className="p-4 sm:p-5">Live Stock</th>
                <th className="p-4 sm:p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-slate-400">
                    Loading supplement database...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-slate-400">
                    No products found matching filters.
                  </td>
                </tr>
              ) : (
                filtered.map((prod) => (
                  <tr key={prod._id || prod.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 sm:p-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.images?.[0] || 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=800&auto=format&fit=crop&q=80'}
                          alt={prod.name}
                          className="w-12 h-12 rounded-xl object-contain p-1 bg-slate-950 border border-slate-800 flex-shrink-0"
                        />
                        <div className="min-w-0 max-w-sm">
                          <p className="font-bold text-white truncate">{prod.name}</p>
                          <span className="text-[11px] text-cyan-400 font-semibold">{prod.brand}</span>
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

                    <td className="p-4 sm:p-5">
                      <StockBadge stock={prod.stock} lowStockThreshold={prod.lowStockThreshold} />
                    </td>

                    <td className="p-4 sm:p-5 text-right">
                      <div className="flex items-center justify-end gap-2">
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={selectedProduct}
        onSave={() => fetchProducts()}
      />

    </div>
  );
}
