import React, { useState, useEffect } from 'react';
import { Users, Mail, Phone, ShoppingBag, ShieldCheck, Search } from 'lucide-react';
import { api } from '../../services/api';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([
    {
      _id: 'c1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+91 91234 56789',
      role: 'customer',
      totalOrders: 3,
      totalSpent: 8497,
      city: 'Mumbai',
      state: 'Maharashtra',
      joinedAt: '2026-01-15'
    },
    {
      _id: 'c2',
      name: 'Priya Sharma',
      email: 'priya.fitness@gmail.com',
      phone: '+91 98765 12340',
      role: 'customer',
      totalOrders: 2,
      totalSpent: 5198,
      city: 'Bangalore',
      state: 'Karnataka',
      joinedAt: '2026-02-01'
    },
    {
      _id: 'c3',
      name: 'Amit Patel',
      email: 'amit.patel@outlook.com',
      phone: '+91 99887 66554',
      role: 'customer',
      totalOrders: 4,
      totalSpent: 11290,
      city: 'Ahmedabad',
      state: 'Gujarat',
      joinedAt: '2026-01-28'
    }
  ]);
  const [search, setSearch] = useState('');

  const filtered = customers.filter((c) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Registered Customers & Athletes
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Customer lifetime orders, contact numbers, and delivery locations
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search by customer name, email or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((cust) => (
          <div
            key={cust._id}
            className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 font-black text-base flex items-center justify-center border border-cyan-500/20">
                {cust.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-white text-sm sm:text-base">{cust.name}</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">
                  Verified Buyer
                </span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-800">
              <p className="flex items-center gap-2 text-slate-400">
                <Mail className="w-3.5 h-3.5 text-slate-500" /> {cust.email}
              </p>
              <p className="flex items-center gap-2 text-slate-400">
                <Phone className="w-3.5 h-3.5 text-slate-500" /> {cust.phone}
              </p>
              <p className="text-slate-400">
                📍 {cust.city}, {cust.state}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500">Total Orders:</span>
                <p className="font-bold text-white">{cust.totalOrders} Orders</p>
              </div>
              <div className="text-right">
                <span className="text-slate-500">Lifetime Value:</span>
                <p className="font-black text-cyan-400">₹{cust.totalSpent.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
