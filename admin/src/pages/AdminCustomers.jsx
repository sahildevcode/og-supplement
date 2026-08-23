import React, { useState, useEffect } from 'react';
import { Users, Mail, Phone, ShoppingBag, Search, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

export default function AdminCustomers() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await api.getAllOrders();
      if (data && data.orders) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error('[Fetch Customers Error]', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Aggregate customer metrics from orders
  const customerMap = {};
  orders.forEach((ord) => {
    const key = ord.email || ord.customerName;
    if (!customerMap[key]) {
      customerMap[key] = {
        name: ord.customerName,
        email: ord.email,
        phone: ord.phone,
        city: ord.city,
        state: ord.state,
        totalOrders: 0,
        totalSpent: 0,
        lastOrderDate: ord.createdAt
      };
    }
    customerMap[key].totalOrders += 1;
    customerMap[key].totalSpent += Number(ord.totalAmount || 0);
  });

  const customerList = Object.values(customerMap).filter((c) => {
    return (
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.city && c.city.toLowerCase().includes(search.toLowerCase()))
    );
  });

  return (
    <div className="space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-cyan-400">
            Customer Directory & LTV
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Registered Customers & Buyers
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            View customer purchase history, total lifetime spending, and contact details
          </p>
        </div>

        <button
          onClick={fetchCustomers}
          className="px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-white flex items-center gap-2 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Directory</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Search customers by name, email, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Customer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full p-12 text-center text-slate-400">
            Loading customer accounts...
          </div>
        ) : customerList.length === 0 ? (
          <div className="col-span-full p-12 text-center text-slate-400 bg-slate-900/40 border border-slate-800 rounded-3xl">
            No customers found in directory yet.
          </div>
        ) : (
          customerList.map((cust, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4 hover:border-cyan-500/30 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 text-cyan-400 flex items-center justify-center font-bold text-sm border border-cyan-500/30">
                    {cust.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{cust.name}</h3>
                    <span className="text-[11px] text-slate-400">{cust.city || 'India'}</span>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  {cust.totalOrders} Orders
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-slate-800">
                <p className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-slate-200 truncate">{cust.email}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-slate-200">{cust.phone || 'N/A'}</span>
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">Total Lifetime Value:</span>
                <span className="font-mono font-black text-emerald-400 text-sm">
                  ₹{cust.totalSpent.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
