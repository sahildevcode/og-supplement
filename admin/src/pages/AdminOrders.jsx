import React, { useState, useEffect } from 'react';
import { ShoppingCart, Eye, RefreshCw, Filter, Search, Clock } from 'lucide-react';
import { api } from '../services/api';
import { socket } from '../services/socket';
import { useAdminToast } from '../context/AdminToastContext';
import OrderDetailsModal from '../components/OrderDetailsModal';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToast } = useAdminToast();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await api.getAllOrders();
      if (data && data.orders) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error('[Fetch Orders Error]', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    const handleOrderCreated = (newOrder) => {
      setOrders((prev) => [newOrder, ...prev]);
      addToast(`New order placed! #${newOrder.orderId} (₹${newOrder.totalAmount})`, 'success');
    };

    const handleStatusUpdated = ({ orderId, orderStatus }) => {
      setOrders((prev) =>
        prev.map((o) => (o.orderId === orderId ? { ...o, orderStatus } : o))
      );
    };

    socket.on('order:created', handleOrderCreated);
    socket.on('order:statusUpdated', handleStatusUpdated);

    return () => {
      socket.off('order:created', handleOrderCreated);
      socket.off('order:statusUpdated', handleStatusUpdated);
    };
  }, [addToast]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Order Placed':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">Order Placed</span>;
      case 'Processing':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">Processing</span>;
      case 'Shipped':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30">Shipped</span>;
      case 'Delivered':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">Delivered</span>;
      case 'Cancelled':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">Cancelled</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-400">{status}</span>;
    }
  };

  const filtered = orders.filter((ord) => {
    const matchStatus = statusFilter === 'All' || ord.orderStatus === statusFilter;
    const matchSearch =
      !search ||
      ord.orderId.toLowerCase().includes(search.toLowerCase()) ||
      ord.customerName.toLowerCase().includes(search.toLowerCase()) ||
      ord.email.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-cyan-400">
            Fulfillment Center & Real-Time Sync
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Orders Fulfillment
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Track customer shipments, view delivery addresses, and update tracking timelines
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-white flex items-center gap-2 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="relative flex-1 min-w-[260px]">
          <input
            type="text"
            placeholder="Search by Order ID, customer name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-200 focus:outline-none cursor-pointer"
        >
          <option value="All">All Statuses</option>
          <option value="Order Placed">Order Placed</option>
          <option value="Processing">Processing</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
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
                <th className="p-4 sm:p-5">Amount / Payment</th>
                <th className="p-4 sm:p-5">Status</th>
                <th className="p-4 sm:p-5 text-right">View Details</th>
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
                    No orders found matching criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((ord) => (
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
                    </td>

                    <td className="p-4 sm:p-5">
                      <p className="font-mono font-bold text-white">₹{ord.totalAmount?.toLocaleString('en-IN')}</p>
                      <span className="text-[10px] text-slate-400">{ord.paymentMethod}</span>
                    </td>

                    <td className="p-4 sm:p-5">
                      {getStatusBadge(ord.orderStatus)}
                    </td>

                    <td className="p-4 sm:p-5 text-right">
                      <button
                        onClick={() => {
                          setSelectedOrder(ord);
                          setIsModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-cyan-400 hover:text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Manage</span>
                      </button>
                    </td>
                  </tr>
                ))
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
