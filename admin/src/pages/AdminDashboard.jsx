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
  RefreshCw,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  RotateCcw,
  ShieldCheck,
  DollarSign,
  Receipt
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
  const [offlineBills, setOfflineBills] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('og_admin_offline_bills') || '[]');
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });
  const { addToast } = useAdminToast();
  const isFirstLoad = useRef(true);

  useEffect(() => {
    const syncOfflineBills = () => {
      try {
        const saved = JSON.parse(localStorage.getItem('og_admin_offline_bills') || '[]');
        setOfflineBills(Array.isArray(saved) ? saved : []);
      } catch {
        setOfflineBills([]);
      }
    };
    window.addEventListener('storage', syncOfflineBills);
    window.addEventListener('og_offline_bills_updated', syncOfflineBills);
    return () => {
      window.removeEventListener('storage', syncOfflineBills);
      window.removeEventListener('og_offline_bills_updated', syncOfflineBills);
    };
  }, []);

  const offlineMetrics = offlineBills.reduce(
    (acc, bill) => {
      const total = Number(bill.grandTotal || 0);
      const paid = bill.paidAmount !== undefined
        ? Number(bill.paidAmount)
        : (bill.paymentMethod?.includes('Due') ? 0 : total);
      const due = bill.dueAmount !== undefined
        ? Number(bill.dueAmount)
        : Math.max(0, total - paid);
      acc.totalSelling += total;
      acc.totalReceived += paid;
      acc.totalDue += due;
      acc.count += 1;
      return acc;
    },
    { totalSelling: 0, totalReceived: 0, totalDue: 0, count: 0 }
  );

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

      {/* Payment & Settlement Accounting Section (8 Master Metrics) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-cyan-400" />
              <span>Payment & Settlement Accounting</span>
            </h2>
            <p className="text-xs text-slate-400">
              Live automated accounting: Pending, Settled, Reserved, and Refund tracking
            </p>
          </div>
          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            Real-Time Bank Accounting
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* 1. Total Monthly Payments */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-semibold">1. Monthly Payments</span>
              <DollarSign className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-xl font-black text-white font-mono">
              ₹{(stats?.paymentAccounting?.totalMonthlyPayments || 0).toLocaleString('en-IN')}
            </div>
            <p className="text-[10px] text-cyan-400">This current calendar month</p>
          </div>

          {/* 2. Total Pending Payments */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/20 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-semibold text-amber-300">2. Pending Payments</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl font-black text-amber-400 font-mono">
              ₹{(stats?.paymentAccounting?.totalPendingPayments || 0).toLocaleString('en-IN')}
            </div>
            <p className="text-[10px] text-amber-300/80">Pending settlement / verification</p>
          </div>

          {/* 3. Total Due Amount */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-rose-500/20 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-semibold text-rose-300">3. Due Amount</span>
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-xl font-black text-rose-400 font-mono">
              ₹{(stats?.paymentAccounting?.totalDueAmount || 0).toLocaleString('en-IN')}
            </div>
            <p className="text-[10px] text-rose-300/80">COD & uncollected balance</p>
          </div>

          {/* 4. Total Reserved Payments */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-purple-500/20 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-semibold text-purple-300">4. Reserved Payments</span>
              <ShieldCheck className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-xl font-black text-purple-400 font-mono">
              ₹{(stats?.paymentAccounting?.totalReservedPayments || 0).toLocaleString('en-IN')}
            </div>
            <p className="text-[10px] text-purple-300/80">Paid orders in fulfillment pipeline</p>
          </div>

          {/* 5. Total Received Payments */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/20 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-semibold text-emerald-300">5. Received Payments</span>
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl font-black text-emerald-400 font-mono">
              ₹{(stats?.paymentAccounting?.totalReceivedPayments || 0).toLocaleString('en-IN')}
            </div>
            <p className="text-[10px] text-emerald-300/80">Confirmed gateway received</p>
          </div>

          {/* 6. Total Cancelled Amount */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-semibold">6. Cancelled Amount</span>
              <XCircle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-xl font-black text-slate-300 font-mono">
              ₹{(stats?.paymentAccounting?.totalCancelledAmount || 0).toLocaleString('en-IN')}
            </div>
            <p className="text-[10px] text-slate-400">Total gross cancelled orders</p>
          </div>

          {/* 7. Total Refund Amount */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-indigo-500/20 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-semibold text-indigo-300">7. Refund Amount</span>
              <RotateCcw className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-xl font-black text-indigo-400 font-mono">
              ₹{(stats?.paymentAccounting?.totalRefundAmount || 0).toLocaleString('en-IN')}
            </div>
            <p className="text-[10px] text-indigo-300/80">Total refunds calculated</p>
          </div>

          {/* 8. Total Successfully Refunded Amount */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-teal-500/20 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-semibold text-teal-300">8. Successfully Refunded</span>
              <CheckCircle className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-xl font-black text-teal-400 font-mono">
              ₹{(stats?.paymentAccounting?.totalSuccessfullyRefundedAmount || 0).toLocaleString('en-IN')}
            </div>
            <p className="text-[10px] text-teal-300/80">Credited back to bank/cards</p>
          </div>
        </div>
      </div>

      {/* Offline Store Selling & Billing Accounting Box */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Receipt className="w-5 h-5 text-emerald-400" />
              <span>Offline Store Selling & Direct Billing</span>
            </h2>
            <p className="text-xs text-slate-400">
              Store par direct billing karne par aapki offline selling aur due balance ka live calculation
            </p>
          </div>
          <Link
            to="/billing"
            className="text-xs font-bold px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 self-start sm:self-auto transition-all"
          >
            <span>Open Offline Billing</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/30 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-semibold text-emerald-300">Offline Total Selling</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl font-black text-white font-mono">
              ₹{offlineMetrics.totalSelling.toLocaleString('en-IN')}
            </div>
            <p className="text-[10px] text-emerald-400">Total walk-in store sales</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/20 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-semibold text-cyan-300">Offline Received (Cash/UPI)</span>
              <CheckCircle className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-xl font-black text-cyan-400 font-mono">
              ₹{offlineMetrics.totalReceived.toLocaleString('en-IN')}
            </div>
            <p className="text-[10px] text-cyan-300/80">Collected at store counter</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-rose-500/20 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-semibold text-rose-300">Offline Due (Udhaar)</span>
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-xl font-black text-rose-400 font-mono">
              ₹{offlineMetrics.totalDue.toLocaleString('en-IN')}
            </div>
            <p className="text-[10px] text-rose-300/80">Pay later balance due</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-purple-500/20 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-semibold text-purple-300">Offline Receipts</span>
              <Receipt className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-xl font-black text-purple-400 font-mono">
              {offlineMetrics.count}
            </div>
            <p className="text-[10px] text-purple-300/80">Total store bills generated</p>
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
