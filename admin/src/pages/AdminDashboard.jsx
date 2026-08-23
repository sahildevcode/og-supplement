import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  ShoppingCart,
  Boxes,
  Users,
  AlertTriangle,
  ArrowRight,
  Package,
  Plus,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { socket } from '../services/socket';
import { useAdminToast } from '../context/AdminToastContext';
import StockBadge from '../components/StockBadge';
import ProductFormModal from '../components/ProductFormModal';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const { addToast } = useAdminToast();
  const isFirstLoad = useRef(true);

  const fetchStats = async () => {
    try {
      if (isFirstLoad.current) setLoading(true);
      const res = await api.getAdminStats();
      const actualStats = res.stats || res;
      setStats(actualStats);
    } catch (error) {
      console.error('[Fetch Stats Error]', error);
    } finally {
      if (isFirstLoad.current) {
        setLoading(false);
        isFirstLoad.current = false;
      }
    }
  };

  useEffect(() => {
    fetchStats();

    // 1. Live Socket Listeners
    const handleOrderCreated = (order) => {
      addToast(`🎉 Live Customer Order! #${order.orderId} (₹${order.totalAmount?.toLocaleString('en-IN')}) from ${order.customerName}`, 'success');
      fetchStats();
    };

    const handleOrderStatusUpdated = ({ orderId, orderStatus }) => {
      addToast(`Order #${orderId} status changed to "${orderStatus}"!`, 'info');
      fetchStats();
    };

    const handleStockUpdated = () => {
      fetchStats();
    };

    socket.on('order:created', handleOrderCreated);
    socket.on('order:statusUpdated', handleOrderStatusUpdated);
    socket.on('product:stockUpdated', handleStockUpdated);
    socket.on('product:updated', handleStockUpdated);

    // 2. High-Frequency Real-Time Heartbeat Polling (Every 3 seconds)
    const interval = setInterval(() => {
      fetchStats();
    }, 3000);

    return () => {
      socket.off('order:created', handleOrderCreated);
      socket.off('order:statusUpdated', handleOrderStatusUpdated);
      socket.off('product:stockUpdated', handleStockUpdated);
      socket.off('product:updated', handleStockUpdated);
      clearInterval(interval);
    };
  }, [addToast]);

  const handleQuickRestock = async (productId, currentStock) => {
    try {
      const newStock = Number(currentStock || 0) + 20;
      await api.updateStock(productId, { stock: newStock });
      addToast(`Restocked +20 units successfully!`, 'success');
      fetchStats();
    } catch (err) {
      addToast(err.message || 'Restock failed', 'error');
    }
  };

  const lowStockList = stats?.lowStockAlerts || stats?.lowStockProducts || [];
  const recentOrdersList = stats?.recentOrders || [];

  return (
    <div className="space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-cyan-400">
            Real-Time Telemetry & Cloud Synchronization
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Executive Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Live real-time monitoring of all incoming customer orders, cancellations, and inventory
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchStats}
            className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Refresh Dashboard"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsProductModalOpen(true)}
            className="px-5 py-3 rounded-2xl font-black text-xs text-black bg-gradient-to-r from-cyan-400 to-blue-400 hover:from-cyan-300 hover:to-blue-300 shadow-xl shadow-cyan-950/50 flex items-center gap-2 transition-transform active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Supplement Product</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Revenue */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Revenue</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              ₹{stats?.totalRevenue ? stats.totalRevenue.toLocaleString('en-IN') : '0'}
            </h3>
            <p className="text-[11px] text-emerald-400 mt-1">From paid & active orders</p>
          </div>
        </div>

        {/* Total Orders */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Orders</span>
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              {stats?.totalOrders || 0}
            </h3>
            <p className="text-[11px] text-cyan-400 mt-1">Live customer orders</p>
          </div>
        </div>

        {/* Active Products */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Catalog</span>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              {stats?.totalProducts || 0}
            </h3>
            <p className="text-[11px] text-purple-400 mt-1">Live supplements</p>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Low Stock Alerts</span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              {stats?.lowStockCount || 0}
            </h3>
            <p className="text-[11px] text-amber-400 mt-1">Require immediate restock</p>
          </div>
        </div>

      </div>

      {/* Two Column Section: Urgent Stock & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Urgent Low Stock Table (Left 6) */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Low Stock & Out of Stock Products
            </h3>
            <Link to="/stock" className="text-xs font-bold text-cyan-400 hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {lowStockList.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                🎉 All supplements are sufficiently stocked in the warehouse!
              </p>
            ) : (
              lowStockList.map((item) => (
                <div
                  key={item._id || item.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs"
                >
                  <div className="space-y-0.5 max-w-[60%]">
                    <p className="font-bold text-slate-200 truncate">{item.name}</p>
                    <div className="flex items-center gap-2">
                      <StockBadge stock={item.stock} lowStockThreshold={item.lowStockThreshold} />
                      <span className="text-[10px] text-slate-400 font-mono">₹{item.discountPrice}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleQuickRestock(item._id || item.id, item.stock)}
                    className="px-3 py-1.5 rounded-xl font-bold text-[11px] bg-cyan-500/15 hover:bg-cyan-500 text-cyan-400 hover:text-black border border-cyan-500/30 transition-all whitespace-nowrap cursor-pointer"
                  >
                    +20 Restock
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Orders Stream (Right 6) */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-cyan-400" />
              Incoming Live Customer Orders
            </h3>
            <Link to="/orders" className="text-xs font-bold text-cyan-400 hover:underline">
              Manage All Orders
            </Link>
          </div>

          <div className="space-y-3">
            {recentOrdersList.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No orders placed yet. Live orders will appear here automatically.
              </p>
            ) : (
              recentOrdersList.map((ord) => (
                <div
                  key={ord.orderId || ord._id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs hover:border-cyan-500/30 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-cyan-400">{ord.orderId}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        ord.orderStatus === 'Cancelled'
                          ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          : ord.orderStatus === 'Delivered'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                      }`}>
                        {ord.orderStatus}
                      </span>
                    </div>
                    <p className="text-slate-200 font-bold mt-0.5">{ord.customerName}</p>
                    <span className="text-[10px] text-slate-400">
                      {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {ord.products?.length || 1} item(s)
                    </span>
                  </div>

                  <div className="text-right">
                    <p className="font-black text-white">₹{ord.totalAmount?.toLocaleString('en-IN')}</p>
                    <p className="text-[10px] text-slate-400">{ord.paymentMethod}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      <ProductFormModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSave={() => fetchStats()}
      />

    </div>
  );
}
