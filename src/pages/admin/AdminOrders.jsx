import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Truck,
  RotateCcw,
  RefreshCw,
  XCircle,
  Clock
} from 'lucide-react';
import { api } from '../../services/api';
import { socket } from '../../services/socket';
import { useToast } from '../../context/ToastContext';
import OrderDetailsModal from '../../components/admin/OrderDetailsModal';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToast } = useToast();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.getAllOrders();
      if (res.success && res.orders) {
        setOrders(res.orders);
      }
    } catch (err) {
      console.error('[Fetch Orders Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    const handleNewOrder = (order) => {
      setOrders((prev) => [order, ...prev]);
      addToast(`🔔 New Order Alert: #${order.orderId} (₹${order.totalAmount})`, 'success');
    };

    socket.on('order:created', handleNewOrder);

    return () => {
      socket.off('order:created', handleNewOrder);
    };
  }, [addToast]);

  const handleQuickStatusChange = async (order, newStatus) => {
    try {
      const id = order._id || order.id || order.orderId;
      await api.updateOrderStatus(id, newStatus);
      setOrders((prev) =>
        prev.map((o) => ((o._id || o.id || o.orderId) === id ? { ...o, orderStatus: newStatus } : o))
      );
      addToast(`Order #${order.orderId} updated to "${newStatus}"! Broadcasted live.`, 'success');
    } catch (err) {
      addToast(err.message || 'Failed to update order status', 'error');
    }
  };

  const filtered = orders.filter((o) => {
    if (statusFilter !== 'All' && o.orderStatus !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchId = o.orderId?.toLowerCase().includes(q);
      const matchName = o.customerName?.toLowerCase().includes(q);
      const matchEmail = o.email?.toLowerCase().includes(q);
      const matchPhone = o.phone?.toLowerCase().includes(q);
      if (!matchId && !matchName && !matchEmail && !matchPhone) return false;
    }
    return true;
  });

  const statuses = ['All', 'Order Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Order Fulfillment & Tracking
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Process incoming orders, update dispatch timelines, and inspect customer delivery addresses
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white self-start sm:self-auto"
          title="Refresh Orders"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Search by Order ID, Customer Name, Email, or Phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === s
                  ? 'bg-cyan-500 text-black shadow-md shadow-cyan-950/60'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-950/80 text-[11px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-4 px-6">Order ID & Date</th>
                <th className="py-4 px-4">Customer</th>
                <th className="py-4 px-4">Items & Qty</th>
                <th className="py-4 px-4">Total Amount</th>
                <th className="py-4 px-4">Live Status</th>
                <th className="py-4 px-6 text-right">Details & Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500 text-sm">
                    No customer orders found matching your search.
                  </td>
                </tr>
              ) : (
                filtered.map((order) => {
                  return (
                    <tr key={order.orderId || order._id} className="hover:bg-slate-800/40 transition-colors">
                      
                      {/* Order ID & Date */}
                      <td className="py-4 px-6">
                        <span className="font-mono font-bold text-cyan-400 text-sm block">
                          {order.orderId}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </td>

                      {/* Customer Info */}
                      <td className="py-4 px-4">
                        <p className="font-bold text-white text-xs sm:text-sm">{order.customerName}</p>
                        <p className="text-[11px] text-slate-400">{order.phone}</p>
                        <p className="text-[11px] text-slate-500 truncate max-w-[150px]">{order.city}, {order.state}</p>
                      </td>

                      {/* Items */}
                      <td className="py-4 px-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-200">
                            {order.products?.length} {order.products?.length === 1 ? 'Product' : 'Products'}
                          </span>
                          <p className="text-[11px] text-slate-400 truncate max-w-[180px]">
                            {order.products?.[0]?.name} {order.products?.length > 1 && `+${order.products.length - 1} more`}
                          </p>
                        </div>
                      </td>

                      {/* Total Amount & Payment */}
                      <td className="py-4 px-4">
                        <p className="font-black text-white text-sm">
                          ₹{order.totalAmount?.toLocaleString('en-IN')}
                        </p>
                        <span className="text-[10px] uppercase font-bold text-emerald-400">
                          {order.paymentMethod}
                        </span>
                      </td>

                      {/* Live Status Changer Dropdown */}
                      <td className="py-4 px-4">
                        <select
                          value={order.orderStatus}
                          onChange={(e) => handleQuickStatusChange(order, e.target.value)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold focus:outline-none cursor-pointer border ${
                            order.orderStatus === 'Delivered'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : order.orderStatus === 'Shipped'
                              ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                              : order.orderStatus === 'Cancelled'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                              : order.orderStatus === 'Processing'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                          }`}
                        >
                          <option value="Order Placed" className="bg-slate-900 text-white">Order Placed</option>
                          <option value="Processing" className="bg-slate-900 text-white">Processing</option>
                          <option value="Shipped" className="bg-slate-900 text-white">Shipped</option>
                          <option value="Delivered" className="bg-slate-900 text-white">Delivered</option>
                          <option value="Cancelled" className="bg-slate-900 text-white">Cancelled</option>
                        </select>
                      </td>

                      {/* Action */}
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsModalOpen(true);
                          }}
                          className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 transition-colors flex items-center gap-1.5 ml-auto"
                        >
                          <Eye className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Inspect</span>
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

      {/* Order Details Modal */}
      <OrderDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        order={selectedOrder}
        onStatusChanged={fetchOrders}
      />

    </div>
  );
}
