import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ShoppingCart,
  Eye,
  RefreshCw,
  Filter,
  Search,
  Clock,
  XCircle,
  CheckCircle,
  Truck,
  PackageCheck,
  RotateCcw,
  TrendingUp,
  DollarSign,
  AlertCircle,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Wallet,
  Sparkles,
  Layers,
  ChevronRight,
  Trash2,
  Tag,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { api } from '../services/api';
import { socket } from '../services/socket';
import { useAdminToast } from '../context/AdminToastContext';
import OrderDetailsModal from '../components/OrderDetailsModal';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 4 Core Filters: Category, Brand, Days/Monthly Timeframe, Status
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [brandFilter, setBrandFilter] = useState('All');
  const [timeframeFilter, setTimeframeFilter] = useState('all'); // 'all' | 'today' | 'yesterday' | '7days' | '30days' | 'thisMonth' | 'lastMonth' | 'YYYY-MM'
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All'); // 'All' | 'Paid' | 'Processing' | 'RefundPending' | 'RefundCompleted' | 'COD'
  
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  
  // Month Filter: 'current' | 'YYYY-MM' | 'all'
  const currentDate = new Date();
  const currentMonthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonthKey, setSelectedMonthKey] = useState(currentMonthKey);

  const { addToast } = useAdminToast();
  const isFirstLoad = useRef(true);

  const fetchOrders = async () => {
    try {
      if (isFirstLoad.current) setLoading(true);
      const res = await api.getAllOrders();
      const list = res.orders || (Array.isArray(res) ? res : []);
      setOrders(list);
    } catch (error) {
      console.error('[Fetch Orders Error]', error);
    } finally {
      if (isFirstLoad.current) {
        setLoading(false);
        isFirstLoad.current = false;
      }
    }
  };

  const fetchCatalog = async () => {
    try {
      const res = await api.getProducts();
      if (res && res.products) {
        setCatalogProducts(res.products);
      }
    } catch (e) {}
  };

  const handleQuickUpdateStatus = async (ord, newStatus) => {
    const id = ord.orderId || ord._id;
    setUpdatingId(id);
    try {
      await api.updateOrderStatus(id, newStatus);
      addToast(`Order #${id} updated to "${newStatus}"!`, 'success');
      fetchOrders();
    } catch (err) {
      addToast(err.message || 'Failed to update status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteOrder = async (ord) => {
    const id = ord.orderId || ord._id;
    const confirmMsg = `⚠️ Delete Order #${id} permanently?\n\nCustomer: ${ord.customerName}\nAmount: ₹${ord.totalAmount?.toLocaleString('en-IN')}\n\nAre you sure you want to permanently delete this order? This cannot be undone.`;
    if (!window.confirm(confirmMsg)) return;

    setDeletingId(id);
    try {
      await api.deleteOrder(id);
      addToast(`Order #${id} permanently deleted!`, 'success');
      setOrders((prev) => prev.filter((o) => o.orderId !== id && o._id !== id));
      if (selectedOrder && (selectedOrder.orderId === id || selectedOrder._id === id)) {
        setIsModalOpen(false);
      }
    } catch (err) {
      addToast(err.message || 'Failed to delete order', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchCatalog();

    const handleOrderCreated = (newOrder) => {
      setOrders((prev) => [newOrder, ...prev.filter(o => o.orderId !== newOrder.orderId)]);
      addToast(`🎉 New order placed! #${newOrder.orderId} (₹${newOrder.totalAmount?.toLocaleString('en-IN')})`, 'success');
      fetchOrders();
    };

    const handleStatusUpdated = ({ orderId, orderStatus }) => {
      setOrders((prev) =>
        prev.map((o) => (o.orderId === orderId ? { ...o, orderStatus } : o))
      );
      addToast(`Order #${orderId} status changed to "${orderStatus}"!`, 'info');
      fetchOrders();
    };

    const handleOrderDeleted = ({ orderId, _id }) => {
      setOrders((prev) => prev.filter((o) => o.orderId !== orderId && o._id !== _id));
    };

    socket.on('order:created', handleOrderCreated);
    socket.on('order:statusUpdated', handleStatusUpdated);
    socket.on('order:deleted', handleOrderDeleted);

    const interval = setInterval(() => {
      fetchOrders();
    }, 4000);

    return () => {
      socket.off('order:created', handleOrderCreated);
      socket.off('order:statusUpdated', handleStatusUpdated);
      socket.off('order:deleted', handleOrderDeleted);
      clearInterval(interval);
    };
  }, [addToast]);

  const handleUpdateRefundStatus = async (ord, refundStatus) => {
    const id = ord.orderId || ord._id;
    setUpdatingId(id);
    try {
      await api.updateRefundStatus(id, refundStatus);
      addToast(`🎉 Order #${id} refund marked as 100% Credited to Bank!`, 'success');
      setOrders((prev) =>
        prev.map((o) => (o.orderId === ord.orderId || o._id === id ? { ...o, refundStatus } : o))
      );
    } catch (err) {
      addToast(err.message || 'Failed to update refund status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  // Extract available months from order history
  const availableMonths = useMemo(() => {
    const set = new Set();
    orders.forEach((o) => {
      if (o.createdAt) {
        const d = new Date(o.createdAt);
        if (!isNaN(d.getTime())) {
          set.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
        }
      }
    });
    set.add(currentMonthKey);
    return Array.from(set).sort().reverse();
  }, [orders, currentMonthKey]);

  // Format month key into nice name (e.g. "2026-10" -> "October 2026")
  const formatMonthName = (key) => {
    if (key === 'all') return 'All Time (Overall)';
    const [year, month] = key.split('-');
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Filter orders by selected month
  const targetOrders = useMemo(() => {
    if (selectedMonthKey === 'all') return orders;
    return orders.filter((o) => {
      if (!o.createdAt) return false;
      const d = new Date(o.createdAt);
      if (isNaN(d.getTime())) return false;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      return key === selectedMonthKey;
    });
  }, [orders, selectedMonthKey]);

  // Comprehensive Financial Metrics Calculation
  const financialMetrics = useMemo(() => {
    // 1. Money Received via Razorpay / Prepaid (Paid & Settled)
    const paidOrders = targetOrders.filter(
      (o) => o.paymentStatus === 'Paid' || (o.paymentMethod?.includes('Razorpay') && o.orderStatus !== 'Cancelled' && o.orderStatus !== 'Refunded')
    );
    const totalReceived = paidOrders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

    // 2. Money in Processing / Verification Pending / Aane Baaki
    const processingPaymentOrders = targetOrders.filter(
      (o) =>
        (o.paymentStatus === 'Verification Pending' || o.paymentStatus === 'Pending') &&
        o.orderStatus !== 'Cancelled' &&
        o.orderStatus !== 'Refunded'
    );
    const totalPaymentProcessing = processingPaymentOrders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

    // 3. Refunds in Processing / Pending Bank Settlement
    const refundProcessingOrders = targetOrders.filter((o) => {
      const isCancelledPaid = (o.orderStatus === 'Cancelled' || o.orderStatus === 'Refunded') && (o.paymentStatus === 'Paid' || o.paymentMethod?.includes('Razorpay'));
      const st = (o.refundStatus || '').toLowerCase();
      const isDone = st === 'completed' || st === 'processed';
      return (st === 'processing' || st === 'pending' || (isCancelledPaid && !isDone)) && !isDone;
    });
    const totalRefundProcessing = refundProcessingOrders.reduce(
      (sum, o) => sum + Number(o.refundAmount || o.totalAmount || 0),
      0
    );

    // 4. Completed Refunds (Processed by Razorpay / Bank)
    const refundCompletedOrders = targetOrders.filter((o) => {
      const st = (o.refundStatus || '').toLowerCase();
      return st === 'completed' || st === 'processed';
    });
    const totalRefundCompleted = refundCompletedOrders.reduce(
      (sum, o) => sum + Number(o.refundAmount || o.totalAmount || 0),
      0
    );

    // 5. Total Refund Footprint (Completed + Processing)
    const totalRefundedSum = totalRefundCompleted + totalRefundProcessing;

    // 6. Net Revenue (Received - Refunded)
    const netRevenue = Math.max(0, totalReceived - totalRefundCompleted);

    // All Time Totals for quick reference
    const allTimeReceived = orders
      .filter((o) => o.paymentStatus === 'Paid' || (o.paymentMethod?.includes('Razorpay') && o.orderStatus !== 'Cancelled'))
      .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

    return {
      totalReceived,
      paidCount: paidOrders.length,
      totalPaymentProcessing,
      processingPaymentCount: processingPaymentOrders.length,
      totalRefundProcessing,
      refundProcessingCount: refundProcessingOrders.length,
      totalRefundCompleted,
      refundCompletedCount: refundCompletedOrders.length,
      totalRefundedSum,
      netRevenue,
      allTimeReceived,
      totalOrdersCount: targetOrders.length
    };
  }, [targetOrders, orders]);

  const getStatusBadge = (status, ord = {}) => {
    switch (status) {
      case 'Order Placed':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">Order Placed</span>;
      case 'Packed':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1"><PackageCheck className="w-3.5 h-3.5" /> Packed</span>;
      case 'Processing':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">Processing</span>;
      case 'Shipped':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30">Shipped</span>;
      case 'Out for Delivery':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> Out for Delivery</span>;
      case 'Delivered':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Delivered</span>;
      case 'Cancelled':
      case 'Refunded':
        if (ord.refundAmount > 0 || ord.paymentStatus === 'Refunded' || ord.cancellationFee > 0 || ord.refundStatus) {
          if (ord.refundStatus === 'completed' || ord.refundStatus === 'Processed') {
            return (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Refund Credited (₹{ord.refundAmount || ord.totalAmount})
              </span>
            );
          }
          return (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
              <RotateCcw className="w-3.5 h-3.5 animate-spin" /> Refund Processing (₹{ord.refundAmount || ord.totalAmount})
            </span>
          );
        }
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> Cancelled</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-400">{status}</span>;
    }
  };

  // Available categories list for filter
  const availableCategories = useMemo(() => {
    const set = new Set();
    catalogProducts.forEach((p) => p.category && set.add(p.category.trim()));
    orders.forEach((o) => {
      (o.products || []).forEach((p) => {
        if (p.category) set.add(p.category.trim());
        const match = catalogProducts.find((cp) => (cp._id || cp.id) === p.productId || cp.name === p.name);
        if (match?.category) set.add(match.category.trim());
      });
    });
    ['Protein', 'Creatine', 'Mass Gainer', 'Pre-Workout', 'Vitamins', 'Health Food'].forEach((c) => set.add(c));
    return ['All', ...Array.from(set).sort()];
  }, [orders, catalogProducts]);

  // Available brands list for filter
  const availableBrands = useMemo(() => {
    const set = new Set();
    catalogProducts.forEach((p) => p.brand && set.add(p.brand.trim()));
    orders.forEach((o) => {
      (o.products || []).forEach((p) => {
        if (p.brand) set.add(p.brand.trim());
        const match = catalogProducts.find((cp) => (cp._id || cp.id) === p.productId || cp.name === p.name);
        if (match?.brand) set.add(match.brand.trim());
        else if (p.name) {
          const firstWord = p.name.trim().split(' ')[0];
          if (firstWord && firstWord.length > 2) set.add(firstWord);
        }
      });
    });
    ['DYMATIZE', 'Optimum Nutrition', 'MuscleBlaze', 'MuscleTech', 'Cellucor'].forEach((b) => set.add(b));
    return ['All', ...Array.from(set).sort()];
  }, [orders, catalogProducts]);

  // Filter for the list table
  const filtered = useMemo(() => {
    return orders.filter((ord) => {
      // 1. Order Status Filter
      if (statusFilter !== 'All' && ord.orderStatus !== statusFilter) {
        return false;
      }

      // 2. Payment Filter
      if (paymentFilter === 'Paid') {
        const isPaid = ord.paymentStatus === 'Paid' || (ord.paymentMethod?.includes('Razorpay') && ord.orderStatus !== 'Cancelled' && ord.orderStatus !== 'Refunded');
        if (!isPaid) return false;
      } else if (paymentFilter === 'Processing') {
        const isProcessing = (ord.paymentStatus === 'Pending' || ord.paymentStatus === 'Verification Pending') && ord.orderStatus !== 'Cancelled' && ord.orderStatus !== 'Refunded';
        if (!isProcessing) return false;
      } else if (paymentFilter === 'RefundPending') {
        const isRefPending = (ord.refundStatus === 'processing' || ord.refundStatus === 'pending' || ((ord.orderStatus === 'Cancelled' || ord.orderStatus === 'Refunded') && (ord.paymentStatus === 'Paid' || ord.paymentMethod?.includes('Razorpay')))) && ord.refundStatus !== 'completed' && ord.refundStatus !== 'Processed';
        if (!isRefPending) return false;
      } else if (paymentFilter === 'RefundCompleted') {
        const isRefDone = ord.refundStatus === 'completed' || ord.refundStatus === 'Processed' || (ord.orderStatus === 'Refunded' && ord.refundStatus === 'completed');
        if (!isRefDone) return false;
      } else if (paymentFilter === 'COD') {
        if (ord.paymentMethod !== 'Cash on Delivery') return false;
      }

      // 3. Timeframe Filter (Days & Monthly)
      if (timeframeFilter !== 'all') {
        if (!ord.createdAt) return false;
        const ordDate = new Date(ord.createdAt);
        if (isNaN(ordDate.getTime())) return false;

        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        const endOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, -1);

        if (timeframeFilter === 'today') {
          if (ordDate < startOfToday) return false;
        } else if (timeframeFilter === 'yesterday') {
          if (ordDate < startOfYesterday || ordDate > endOfYesterday) return false;
        } else if (timeframeFilter === '7days') {
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (ordDate < sevenDaysAgo) return false;
        } else if (timeframeFilter === '30days') {
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (ordDate < thirtyDaysAgo) return false;
        } else if (timeframeFilter === 'thisMonth') {
          const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
          const ordMonth = `${ordDate.getFullYear()}-${String(ordDate.getMonth() + 1).padStart(2, '0')}`;
          if (ordMonth !== currentMonth) return false;
        } else if (timeframeFilter === 'lastMonth') {
          const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const prevMonthKey = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;
          const ordMonth = `${ordDate.getFullYear()}-${String(ordDate.getMonth() + 1).padStart(2, '0')}`;
          if (ordMonth !== prevMonthKey) return false;
        } else if (timeframeFilter.includes('-')) {
          const ordMonth = `${ordDate.getFullYear()}-${String(ordDate.getMonth() + 1).padStart(2, '0')}`;
          if (ordMonth !== timeframeFilter) return false;
        }
      }

      // 4. Category Filter
      if (categoryFilter !== 'All') {
        const catLower = categoryFilter.toLowerCase();
        const hasCategory = (ord.products || []).some((p) => {
          if (p.category && p.category.toLowerCase().includes(catLower)) return true;
          const matched = catalogProducts.find((cp) => (cp._id || cp.id) === p.productId || cp.name === p.name);
          if (matched?.category && matched.category.toLowerCase().includes(catLower)) return true;
          if (p.name && p.name.toLowerCase().includes(catLower)) return true;
          return false;
        });
        if (!hasCategory) return false;
      }

      // 5. Brand Filter
      if (brandFilter !== 'All') {
        const brandLower = brandFilter.toLowerCase();
        const hasBrand = (ord.products || []).some((p) => {
          if (p.brand && p.brand.toLowerCase().includes(brandLower)) return true;
          const matched = catalogProducts.find((cp) => (cp._id || cp.id) === p.productId || cp.name === p.name);
          if (matched?.brand && matched.brand.toLowerCase().includes(brandLower)) return true;
          if (p.name && p.name.toLowerCase().includes(brandLower)) return true;
          return false;
        });
        if (!hasBrand) return false;
      }

      // 6. Search Filter
      if (search) {
        const q = search.toLowerCase();
        const matchSearch =
          ord.orderId.toLowerCase().includes(q) ||
          ord.customerName.toLowerCase().includes(q) ||
          ord.email.toLowerCase().includes(q) ||
          (ord.transactionId && ord.transactionId.toLowerCase().includes(q)) ||
          (ord.razorpayPaymentId && ord.razorpayPaymentId.toLowerCase().includes(q)) ||
          (ord.products || []).some((p) => p.name?.toLowerCase().includes(q));
        if (!matchSearch) return false;
      }

      return true;
    });
  }, [orders, statusFilter, paymentFilter, timeframeFilter, categoryFilter, brandFilter, search, catalogProducts]);

  // Live Selling & Revenue Summary for Active Filtered Criteria
  const filteredSalesSummary = useMemo(() => {
    let totalSelling = 0;
    let totalUnits = 0;

    filtered.forEach((ord) => {
      // If Category or Brand filter is active, only count revenue for products matching those filters
      if (categoryFilter !== 'All' || brandFilter !== 'All') {
        (ord.products || []).forEach((p) => {
          let matchCat = true;
          if (categoryFilter !== 'All') {
            const catLower = categoryFilter.toLowerCase();
            const matched = catalogProducts.find((cp) => (cp._id || cp.id) === p.productId || cp.name === p.name);
            matchCat = (p.category && p.category.toLowerCase().includes(catLower)) ||
              (matched?.category && matched.category.toLowerCase().includes(catLower)) ||
              (p.name && p.name.toLowerCase().includes(catLower));
          }

          let matchBrand = true;
          if (brandFilter !== 'All') {
            const brandLower = brandFilter.toLowerCase();
            const matched = catalogProducts.find((cp) => (cp._id || cp.id) === p.productId || cp.name === p.name);
            matchBrand = (p.brand && p.brand.toLowerCase().includes(brandLower)) ||
              (matched?.brand && matched.brand.toLowerCase().includes(brandLower)) ||
              (p.name && p.name.toLowerCase().includes(brandLower));
          }

          if (matchCat && matchBrand) {
            totalSelling += (Number(p.price) || 0) * (Number(p.quantity) || 1);
            totalUnits += Number(p.quantity) || 1;
          }
        });
      } else {
        totalSelling += Number(ord.totalAmount) || 0;
        (ord.products || []).forEach((p) => {
          totalUnits += Number(p.quantity) || 1;
        });
      }
    });

    const aov = filtered.length > 0 ? Math.round(totalSelling / filtered.length) : 0;

    return {
      totalSelling,
      totalOrders: filtered.length,
      totalUnits,
      aov
    };
  }, [filtered, categoryFilter, brandFilter, catalogProducts]);

  return (
    <div className="space-y-8">
      
      {/* Top Header with Month Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-widest text-cyan-400">
              Live Fulfillment & Financial Ledger
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Razorpay Sync
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Orders Fulfillment & Revenue Monitor
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Real-time tracking of Razorpay payouts, incoming processing payments, and refund credits.
          </p>
        </div>

        {/* Action Controls & Month Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Month Dropdown Selector */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-2xl px-3 py-1.5">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <select
              value={selectedMonthKey}
              onChange={(e) => setSelectedMonthKey(e.target.value)}
              className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-white">All Time (Overall Ledger)</option>
              {availableMonths.map((m) => (
                <option key={m} value={m} className="bg-slate-900 text-white">
                  {formatMonthName(m)}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={fetchOrders}
            className="px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 💳 FINANCIAL & REVENUE CARDS DASHBOARD */}
      {/* ========================================================= */}
      <div className="space-y-4">
        
        {/* Banner Label */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Showing Financial Calculations for:{' '}
            <strong className="text-cyan-400">{formatMonthName(selectedMonthKey)}</strong>
          </span>
          <span className="text-[11px] text-slate-400">
            Total Orders In Period: <strong className="text-white font-mono">{financialMetrics.totalOrdersCount}</strong>
          </span>
        </div>

        {/* 5-Card Analytics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          
          {/* 1. Razorpay / Online Received (Aa Chuke) */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-500/15 via-slate-900 to-slate-950 border border-emerald-500/30 shadow-xl shadow-emerald-950/20 relative overflow-hidden group hover:border-emerald-500/60 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400">
                Total Received (Paid)
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <ArrowDownRight className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-3">
              <h2 className="text-2xl font-black text-white font-mono tracking-tight">
                ₹{financialMetrics.totalReceived.toLocaleString('en-IN')}
              </h2>
              <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400">
                <span className="text-emerald-400 font-bold">✓ {financialMetrics.paidCount} Orders</span>
                <span>• Razorpay / Online</span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
              <span>Status: <strong className="text-emerald-400">Settled In Bank</strong></span>
            </div>
          </div>

          {/* 2. Payment In-Processing (Aane Baaki) */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-500/15 via-slate-900 to-slate-950 border border-amber-500/30 shadow-xl shadow-amber-950/20 relative overflow-hidden group hover:border-amber-500/60 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-400">
                Payments In-Processing
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Clock className="w-4 h-4 animate-spin" />
              </div>
            </div>

            <div className="mt-3">
              <h2 className="text-2xl font-black text-white font-mono tracking-tight">
                ₹{financialMetrics.totalPaymentProcessing.toLocaleString('en-IN')}
              </h2>
              <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400">
                <span className="text-amber-400 font-bold">⏳ {financialMetrics.processingPaymentCount} Orders</span>
                <span>• Verification/In-Flight</span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
              <span>Status: <strong className="text-amber-400">Aane Baaki Hai</strong></span>
            </div>
          </div>

          {/* 3. Refunds In-Processing (Jaane Baaki) */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-purple-500/15 via-slate-900 to-slate-950 border border-purple-500/30 shadow-xl shadow-purple-950/20 relative overflow-hidden group hover:border-purple-500/60 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-purple-400">
                Refunds In-Processing
              </span>
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <RotateCcw className="w-4 h-4 animate-spin" />
              </div>
            </div>

            <div className="mt-3">
              <h2 className="text-2xl font-black text-white font-mono tracking-tight">
                ₹{financialMetrics.totalRefundProcessing.toLocaleString('en-IN')}
              </h2>
              <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400">
                <span className="text-purple-400 font-bold">🔄 {financialMetrics.refundProcessingCount} Requests</span>
                <span>• Queue / Pending</span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
              <span>Status: <strong className="text-purple-400">Bank Credit Pending</strong></span>
            </div>
          </div>

          {/* 4. Total Completed Refunds (Ja Chuke) */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-rose-500/15 via-slate-900 to-slate-950 border border-rose-500/30 shadow-xl shadow-rose-950/20 relative overflow-hidden group hover:border-rose-500/60 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-rose-400">
                Refunds Completed
              </span>
              <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-3">
              <h2 className="text-2xl font-black text-white font-mono tracking-tight">
                ₹{financialMetrics.totalRefundCompleted.toLocaleString('en-IN')}
              </h2>
              <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400">
                <span className="text-rose-400 font-bold">✓ {financialMetrics.refundCompletedCount} Orders</span>
                <span>• Credited to Bank</span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
              <span>Status: <strong className="text-rose-400">Ja Chuke (Settled)</strong></span>
            </div>
          </div>

          {/* 5. Net Earnings / Suddh Revenue */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-cyan-500/20 via-blue-900/40 to-slate-950 border border-cyan-500/40 shadow-xl shadow-cyan-950/30 relative overflow-hidden group hover:border-cyan-400 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-cyan-300">
                Net Revenue (Kamai)
              </span>
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-3">
              <h2 className="text-2xl font-black text-white font-mono tracking-tight">
                ₹{financialMetrics.netRevenue.toLocaleString('en-IN')}
              </h2>
              <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-300">
                <span>Received minus Refunds</span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
              <span>Formula: <strong className="text-cyan-300">₹{financialMetrics.totalReceived} - ₹{financialMetrics.totalRefundCompleted}</strong></span>
            </div>
          </div>

        </div>

      </div>

      {/* ========================================================= */}
      {/* QUICK PAYMENT STATUS FILTER TABS */}
      {/* ========================================================= */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setPaymentFilter('All')}
          className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
            paymentFilter === 'All'
              ? 'bg-slate-100 text-slate-900 shadow-md scale-105'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          All Orders ({orders.length})
        </button>

        <button
          onClick={() => setPaymentFilter('Paid')}
          className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
            paymentFilter === 'Paid'
              ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-950/50 scale-105'
              : 'bg-emerald-950/30 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-950/60'
          }`}
        >
          <CheckCircle className="w-3.5 h-3.5" />
          <span>⚡ Paid / Received (₹{financialMetrics.totalReceived.toLocaleString('en-IN')})</span>
        </button>

        <button
          onClick={() => setPaymentFilter('Processing')}
          className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
            paymentFilter === 'Processing'
              ? 'bg-amber-500 text-black shadow-lg shadow-amber-950/50 scale-105'
              : 'bg-amber-950/30 text-amber-400 border border-amber-500/30 hover:bg-amber-950/60'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>⏳ Payment In-Processing (₹{financialMetrics.totalPaymentProcessing.toLocaleString('en-IN')})</span>
        </button>

        <button
          onClick={() => setPaymentFilter('RefundPending')}
          className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
            paymentFilter === 'RefundPending'
              ? 'bg-purple-500 text-white shadow-lg shadow-purple-950/50 scale-105'
              : 'bg-purple-950/30 text-purple-400 border border-purple-500/30 hover:bg-purple-950/60'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>🔄 Refund In-Processing (₹{financialMetrics.totalRefundProcessing.toLocaleString('en-IN')})</span>
        </button>

        <button
          onClick={() => setPaymentFilter('RefundCompleted')}
          className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
            paymentFilter === 'RefundCompleted'
              ? 'bg-rose-500 text-white shadow-lg shadow-rose-950/50 scale-105'
              : 'bg-rose-950/30 text-rose-400 border border-rose-500/30 hover:bg-rose-950/60'
          }`}
        >
          <CheckCircle className="w-3.5 h-3.5" />
          <span>✓ Refund Completed (₹{financialMetrics.totalRefundCompleted.toLocaleString('en-IN')})</span>
        </button>

        <button
          onClick={() => setPaymentFilter('COD')}
          className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
            paymentFilter === 'COD'
              ? 'bg-slate-200 text-black shadow-md scale-105'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          💵 Cash on Delivery
        </button>
      </div>

      {/* ========================================================= */}
      {/* 4-FILTER CONTROL BAR & SALES ANALYTICS */}
      {/* ========================================================= */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
              <span>Category, Brand & Date Selling Filters</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                4 Smart Filters
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Category aur Brand ke basis par filtered selling aur orders track karein
            </p>
          </div>

          {(categoryFilter !== 'All' || brandFilter !== 'All' || timeframeFilter !== 'all' || statusFilter !== 'All' || paymentFilter !== 'All' || search) && (
            <button
              onClick={() => {
                setCategoryFilter('All');
                setBrandFilter('All');
                setTimeframeFilter('all');
                setStatusFilter('All');
                setPaymentFilter('All');
                setSearch('');
              }}
              className="text-xs font-bold text-rose-400 hover:text-rose-300 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 flex items-center gap-1.5 transition-all self-start lg:self-auto cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          )}
        </div>

        {/* 4 Filter Dropdowns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1. Category Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-cyan-400" />
              <span>1. Filter by Category:</span>
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="All">All Categories (Sabhi)</option>
              {availableCategories.filter((c) => c !== 'All').map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* 2. Brand Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              <span>2. Filter by Brand:</span>
            </label>
            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="All">All Brands (Sabhi)</option>
              {availableBrands.filter((b) => b !== 'All').map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* 3. Monthly & Days Timeframe Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>3. Days & Monthly Timeframe:</span>
            </label>
            <select
              value={timeframeFilter}
              onChange={(e) => setTimeframeFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="all">All Time (Sabhi Din)</option>
              <option value="today">Today (Aaj)</option>
              <option value="yesterday">Yesterday (Kal)</option>
              <option value="7days">Last 7 Days (Pichle 7 Din)</option>
              <option value="30days">Last 30 Days (Pichle 30 Din)</option>
              <option value="thisMonth">This Month ({formatMonthName(currentMonthKey)})</option>
              <option value="lastMonth">Last Month</option>
              {availableMonths.map((mKey) => (
                <option key={mKey} value={mKey}>{formatMonthName(mKey)}</option>
              ))}
            </select>
          </div>

          {/* 4. Order Status Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-amber-400" />
              <span>4. Order Status:</span>
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="All">All Statuses (Sabhi)</option>
              <option value="Order Placed">Order Placed</option>
              <option value="Packed">Packed</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Processing">Processing</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Refunded">Refunded</option>
            </select>
          </div>
        </div>

        {/* Live Selling Cards for Filtered Results */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500/15 to-slate-950 border border-emerald-500/30">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block">
              Filtered Total Selling
            </span>
            <span className="text-xl sm:text-2xl font-black text-white font-mono mt-0.5 block">
              ₹{filteredSalesSummary.totalSelling.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Selected criteria par total revenue
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-cyan-500/15 to-slate-950 border border-cyan-500/30">
            <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 block">
              Total Filtered Orders
            </span>
            <span className="text-xl sm:text-2xl font-black text-white font-mono mt-0.5 block">
              {filteredSalesSummary.totalOrders}
            </span>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Total customer orders matched
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-500/15 to-slate-950 border border-purple-500/30">
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-400 block">
              Units / Quantity Sold
            </span>
            <span className="text-xl sm:text-2xl font-black text-white font-mono mt-0.5 block">
              {filteredSalesSummary.totalUnits} Units
            </span>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Items purchased by customers
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/15 to-slate-950 border border-amber-500/30">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
              Average Order Value
            </span>
            <span className="text-xl sm:text-2xl font-black text-white font-mono mt-0.5 block">
              ₹{filteredSalesSummary.aov.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Average per order ticket size
            </span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by Order ID, customer, email, UTR, product name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px] font-bold">
              <tr>
                <th className="p-4 sm:p-5">Order ID</th>
                <th className="p-4 sm:p-5">Customer</th>
                <th className="p-4 sm:p-5">Date & Time</th>
                <th className="p-4 sm:p-5">Payment & Settlement Status</th>
                <th className="p-4 sm:p-5">Order Status</th>
                <th className="p-4 sm:p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-slate-400">
                    Loading customer orders...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-slate-400">
                    No orders found matching the selected criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((ord) => {
                  const isRazorpay = ord.paymentMethod?.includes('Razorpay') || !!ord.razorpayPaymentId;
                  const isPrepaid = isRazorpay || ord.paymentMethod === 'Online / UPI' || !!ord.transactionId;
                  const isUpdating = updatingId === (ord.orderId || ord._id);
                  const isPaid = ord.paymentStatus === 'Paid';
                  const isPaymentPending = ord.paymentStatus === 'Pending' || ord.paymentStatus === 'Verification Pending';
                  const isRefundDone = ord.refundStatus === 'completed' || ord.refundStatus === 'Processed';
                  const isRefundInProcess = (ord.refundStatus === 'processing' || ord.refundStatus === 'pending' || (ord.orderStatus === 'Cancelled' && isPrepaid)) && !isRefundDone;

                  return (
                    <tr key={ord.orderId || ord._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 sm:p-5 font-mono font-bold text-cyan-400">
                        {ord.orderId}
                      </td>

                      <td className="p-4 sm:p-5">
                        <div>
                          <p className="font-bold text-white">{ord.customerName}</p>
                          <p className="text-[11px] text-slate-400">{ord.email}</p>
                        </div>
                      </td>

                      <td className="p-4 sm:p-5 text-slate-300 text-xs">
                        {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                        <span className="block text-[10px] text-slate-500 font-mono">
                          {new Date(ord.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      {/* Payment & Settlement Status Column */}
                      <td className="p-4 sm:p-5">
                        <div className="flex items-center gap-2">
                          <p className="font-mono font-black text-white text-base">₹{ord.totalAmount?.toLocaleString('en-IN')}</p>
                          
                          {/* Payment State Indicator Tag */}
                          {isPaid && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                              <CheckCircle className="w-2.5 h-2.5" /> Received
                            </span>
                          )}

                          {isPaymentPending && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" /> In-Processing
                            </span>
                          )}
                        </div>

                        {/* Payment Method & UTR / Razorpay ID Details */}
                        {isPrepaid ? (
                          <div className="mt-1 flex flex-col gap-1 items-start">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                              {isRazorpay ? '⚡ PREPAID (RAZORPAY)' : '⚡ ONLINE UPI'}
                            </span>
                            {ord.razorpayPaymentId ? (
                              <span className="text-[10px] text-emerald-300 font-mono font-bold bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/30 inline-block">
                                ID: {ord.razorpayPaymentId}
                              </span>
                            ) : ord.transactionId ? (
                              <span className="text-[10px] text-emerald-300 font-mono font-bold bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/30 inline-block">
                                UTR: {ord.transactionId}
                              </span>
                            ) : null}
                          </div>
                        ) : (
                          <div className="mt-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                              💵 CASH ON DELIVERY (COD)
                            </span>
                          </div>
                        )}

                        {/* Refund Tracking Badge in Payment Column */}
                        {isRefundDone && (
                          <div className="mt-1.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                              ✓ Refund Credited: ₹{ord.refundAmount || ord.totalAmount}
                            </span>
                          </div>
                        )}

                        {isRefundInProcess && (
                          <div className="mt-1.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 animate-pulse">
                              🔄 Refund Processing: ₹{ord.refundAmount || ord.totalAmount}
                            </span>
                          </div>
                        )}
                      </td>

                      <td className="p-4 sm:p-5">
                        {getStatusBadge(ord.orderStatus, ord)}
                      </td>

                      <td className="p-4 sm:p-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {ord.refundAmount > 0 && ord.refundStatus !== 'completed' && (
                            <button
                              onClick={() => handleUpdateRefundStatus(ord, 'completed')}
                              disabled={isUpdating}
                              title="Mark refund 100% credited to customer bank"
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1 shadow transition-all cursor-pointer"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Mark Credited</span>
                            </button>
                          )}
                          {ord.orderStatus === 'Order Placed' && (
                            <button
                              onClick={() => handleQuickUpdateStatus(ord, 'Packed')}
                              disabled={isUpdating}
                              title="Accept order and mark packed"
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black flex items-center gap-1 shadow transition-all cursor-pointer"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Accept & Pack</span>
                            </button>
                          )}
                          {ord.orderStatus === 'Packed' && (
                            <button
                              onClick={() => handleQuickUpdateStatus(ord, 'Out for Delivery')}
                              disabled={isUpdating}
                              title="Dispatch with courier"
                              className="px-2.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-black flex items-center gap-1 shadow transition-all cursor-pointer"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>Out for Delivery</span>
                            </button>
                          )}
                          {ord.orderStatus === 'Out for Delivery' && (
                            <button
                              onClick={() => handleQuickUpdateStatus(ord, 'Delivered')}
                              disabled={isUpdating}
                              title="Confirm delivery to customer"
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1 shadow transition-all cursor-pointer"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Mark Delivered</span>
                            </button>
                          )}
                          {(ord.paymentStatus === 'Paid' || ord.paymentMethod?.includes('Razorpay') || ord.transactionId?.startsWith('pay_')) && ord.orderStatus !== 'Refunded' && ord.orderStatus !== 'Cancelled' && (
                            <button
                              onClick={() => {
                                setSelectedOrder(ord);
                                setIsModalOpen(true);
                              }}
                              title="Refund customer via Razorpay"
                              className="px-2.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Refund</span>
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedOrder(ord);
                              setIsModalOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Details</span>
                          </button>
                          <button
                            onClick={() => handleDeleteOrder(ord)}
                            disabled={deletingId === (ord.orderId || ord._id)}
                            title="Permanently Delete Order"
                            className="px-2.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/30 border border-rose-500/30 text-rose-300 hover:text-rose-100 text-xs font-bold inline-flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                            <span>{deletingId === (ord.orderId || ord._id) ? 'Deleting...' : 'Delete'}</span>
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

      <OrderDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        order={selectedOrder}
        onStatusChange={() => fetchOrders()}
      />

    </div>
  );
}
