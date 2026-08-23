import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  AlertTriangle,
  XCircle,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Boxes,
  Eye,
  RefreshCw
} from 'lucide-react';
import { api } from '../../services/api';
import { socket } from '../../services/socket';
import ProductFormModal from '../../components/admin/ProductFormModal';
import OrderDetailsModal from '../../components/admin/OrderDetailsModal';
import { useToast } from '../../context/ToastContext';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const { addToast } = useToast();

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminStats();
      if (res.success && res.stats) {
        setStats(res.stats);
      }
    } catch (err) {
      console.error('[Admin Stats Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Listen for live order and product events to refresh dashboard metrics automatically
    const handleOrderCreated = (order) => {
      fetchStats();
      addToast(`🔔 New Order Received: #${order.orderId} (₹${order.totalAmount})`, 'success');
    };

    const handleProductChange = () => {
      fetchStats();
    };

    socket.on('order:created', handleOrderCreated);
    socket.on('product:created', handleProductChange);
    socket.on('product:updated', handleProductChange);
    socket.on('product:stockUpdated', handleProductChange);
    socket.on('product:deleted', handleProductChange);

    return () => {
      socket.off('order:created', handleOrderCreated);
      socket.off('product:created', handleProductChange);
      socket.off('product:updated', handleProductChange);
      socket.off('product:stockUpdated', handleProductChange);
      socket.off('product:deleted', handleProductChange);
    };
  }, [addToast]);

  const quickRestock = async (productId, currentStock) => {
    try {
      await api.updateStock(productId, { stock: currentStock + 20 });
      addToast('Restocked +20 units! Broadcasted live to all store visitors.', 'success');
      fetchStats();
    } catch (err) {
      addToast(err.message || 'Restock failed', 'error');
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time analytics, inventory health, and fulfillment monitoring
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchStats}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Refresh Metrics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          <button
            onClick={() => setIsProductModalOpen(true)}
            className="px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white shadow-lg shadow-cyan-950/50 flex items-center gap-2 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Add New Product
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Revenue */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Revenue</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white">
              ₹{stats?.totalRevenue?.toLocaleString('en-IN') || 0}
            </span>
          </div>
          <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Direct Sales (Excl. Cancelled)
          </p>
        </div>

        {/* Total Orders */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Orders</span>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-white">
            {stats?.totalOrders || 0}
          </span>
          <p className="text-[11px] text-cyan-400 font-semibold">
            {stats?.pendingOrdersCount || 0} Awaiting Processing
          </p>
        </div>

        {/* Total Products */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Products</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-white">
            {stats?.totalProducts || 0}
          </span>
          <p className="text-[11px] text-blue-400 font-semibold">
            {stats?.inStockCount || 0} Healthy Stock
          </p>
        </div>

        {/* Low Stock Alerts */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-amber-500/30 space-y-3 relative overflow-hidden bg-gradient-to-br from-amber-950/20 to-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Stock Alerts</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-300">
              {(stats?.lowStockCount || 0) + (stats?.outOfStockCount || 0)}
            </span>
            <span className="text-xs text-amber-400/80">Items</span>
          </div>
          <p className="text-[11px] text-rose-400 font-semibold">
            {stats?.outOfStockCount || 0} completely Out of Stock
          </p>
        </div>

      </div>

      {/* Main Content: Low Stock Alerts & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Urgent Low Stock Restock Actions */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h3 className="text-base font-bold text-white">Urgent Stock Attention</h3>
            </div>
            <span className="text-xs text-slate-400 font-semibold">
              Threshold: ≤ 10 units
            </span>
          </div>

          <div className="space-y-3">
            {!stats?.lowStockAlerts?.length ? (
              <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 text-center text-xs text-emerald-400 font-semibold">
                ✓ All supplement inventory levels are healthy!
              </div>
            ) : (
              stats.lowStockAlerts.map((prod) => {
                const id = prod._id || prod.id;
                const isZero = Number(prod.stock) === 0;

                return (
                  <div
                    key={id}
                    className={`p-4 rounded-2xl bg-slate-900 border ${
                      isZero ? 'border-rose-500/40 bg-rose-950/10' : 'border-amber-500/40 bg-amber-950/10'
                    } flex items-center justify-between gap-3`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={prod.images?.[0] || 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=800&auto=format&fit=crop&q=80'}
                        alt={prod.name}
                        className="w-12 h-12 object-contain rounded-xl bg-slate-950 p-1 border border-slate-800 flex-shrink-0"
                      />
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-white line-clamp-1">{prod.name}</p>
                        <p className="text-[11px] text-slate-400">
                          {prod.brand} • <span className={isZero ? 'text-rose-400 font-black' : 'text-amber-400 font-black'}>
                            {isZero ? '0 units (OUT OF STOCK)' : `${prod.stock} units remaining`}
                          </span>
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => quickRestock(id, prod.stock)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-black border border-cyan-500/40 transition-colors whitespace-nowrap"
                    >
                      +20 Restock
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Recent Incoming Orders */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-cyan-400" />
              <h3 className="text-base font-bold text-white">Recent Customer Orders</h3>
            </div>
            <a href="/admin/orders" className="text-xs text-cyan-400 font-bold hover:underline flex items-center gap-1">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="space-y-3">
            {!stats?.recentOrders?.length ? (
              <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
                No customer orders placed yet.
              </div>
            ) : (
              stats.recentOrders.map((order) => (
                <div
                  key={order.orderId || order._id}
                  onClick={() => {
                    setSelectedOrder(order);
                    setIsOrderModalOpen(true);
                  }}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-cyan-400">{order.orderId}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300">
                        {order.orderStatus}
                      </span>
                    </div>
                    <p className="text-slate-300 font-medium mt-1">{order.customerName} ({order.city})</p>
                    <p className="text-[10px] text-slate-500">{order.products?.length} products ordered</p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-black text-white">₹{order.totalAmount?.toLocaleString('en-IN')}</p>
                    <p className="text-[10px] text-emerald-400">{order.paymentMethod}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Add Product Modal */}
      <ProductFormModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        productToEdit={null}
        onSaved={fetchStats}
      />

      {/* Order Details Modal */}
      <OrderDetailsModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        order={selectedOrder}
        onStatusChanged={fetchStats}
      />

    </div>
  );
}
