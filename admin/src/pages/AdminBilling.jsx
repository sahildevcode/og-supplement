import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Download,
  Plus,
  Trash2,
  User,
  Phone,
  Scale,
  Ruler,
  Package,
  IndianRupee,
  CreditCard,
  CheckCircle2,
  Receipt,
  History,
  AlertTriangle,
  Search
} from 'lucide-react';
import { api } from '../services/api';
import { useAdminToast } from '../context/AdminToastContext';
import { generateOfflineInvoicePdf } from '../utils/invoicePdf';

const STORAGE_KEY = 'og_admin_offline_bills';
const CUSTOM_PRODUCTS_KEY = 'og_admin_custom_pos_products';

export default function AdminBilling() {
  const { addToast } = useAdminToast();
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [customProducts, setCustomProducts] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(CUSTOM_PRODUCTS_KEY) || '[]');
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });

  // Customer & Athlete Measurements Form
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [weight, setWeight] = useState('');
  const [chestSize, setChestSize] = useState('');
  const [bicepsSize, setBicepsSize] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [paidNowInput, setPaidNowInput] = useState('');
  const [discount, setDiscount] = useState('');
  const [notes, setNotes] = useState('');
  const [syncLiveWebsite, setSyncLiveWebsite] = useState(true);

  // Line items for supplements sold
  const [items, setItems] = useState([
    { productId: '', name: '', quantity: 1, price: '', searchQuery: '' }
  ]);
  const nameInputRefs = useRef([]);

  // Saved Offline Bills History
  const [billsHistory, setBillsHistory] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    api.getProducts()
      .then((res) => {
        if (res && Array.isArray(res.products)) {
          setCatalogProducts(res.products);
        }
      })
      .catch(() => {});
  }, []);

  const handleAddItem = () => {
    setItems((prev) => [...prev, { productId: '', name: '', quantity: 1, price: '' }]);
  };

  const handleRemoveItem = (idx) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSelectCatalogProduct = (idx, prodId) => {
    if (prodId === '__NEW_CUSTOM__') {
      setItems((prev) =>
        prev.map((item, i) =>
          i === idx ? { ...item, productId: '__NEW_CUSTOM__', name: '', price: '' } : item
        )
      );
      setTimeout(() => {
        if (nameInputRefs.current[idx]) {
          nameInputRefs.current[idx].focus();
        }
      }, 50);
      return;
    }

    const allPickable = [...customProducts, ...catalogProducts];
    const prod = allPickable.find((p) => (p._id || p.id) === prodId);
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== idx) return item;
        if (!prod) return { ...item, productId: '' };
        return {
          ...item,
          productId: prod._id || prod.id,
          name: prod.name,
          price: String(prod.discountPrice || prod.price || '')
        };
      })
    );
  };

  const handleSaveCustomProduct = (idx) => {
    const item = items[idx];
    if (!item || !item.name.trim()) {
      addToast('Pehle Product Name likhein', 'error');
      return;
    }
    const newCustom = {
      _id: `custom_${Date.now()}`,
      name: item.name.trim(),
      price: Number(item.price || 0)
    };
    const updated = [newCustom, ...customProducts.filter((c) => c.name.toLowerCase() !== newCustom.name.toLowerCase())].slice(0, 30);
    setCustomProducts(updated);
    localStorage.setItem(CUSTOM_PRODUCTS_KEY, JSON.stringify(updated));
    handleItemChange(idx, 'productId', newCustom._id);
    addToast(`"${newCustom.name}" quick list me save ho gaya!`, 'success');
  };

  const handleItemChange = (idx, field, val) => {
    setItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: val } : item))
    );
  };

  const subtotal = items.reduce((sum, item) => {
    return sum + (Number(item.price || 0) * Number(item.quantity || 1));
  }, 0);
  const discountNum = Number(discount || 0);
  const grandTotal = Math.max(0, subtotal - discountNum);

  const isDueMode = paymentMethod === 'Due (Pay Later)';
  const paidAmount = isDueMode
    ? Math.min(grandTotal, Math.max(0, Number(paidNowInput || 0)))
    : grandTotal;
  const dueAmount = Math.max(0, grandTotal - paidAmount);

  const handleGenerateBill = async (e) => {
    e.preventDefault();

    if (!customerName.trim()) {
      addToast('Please enter Customer Name', 'error');
      return;
    }
    if (!phone.trim()) {
      addToast('Please enter Mobile Number', 'error');
      return;
    }

    const validItems = items.filter((it) => it.name.trim() && Number(it.price) >= 0);
    if (validItems.length === 0) {
      addToast('Please add at least one product with name and price', 'error');
      return;
    }

    const billObj = {
      billNo: `OG-POS-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
      customerName: customerName.trim(),
      phone: phone.trim(),
      weight: weight.trim(),
      chestSize: chestSize.trim(),
      bicepsSize: bicepsSize.trim(),
      paymentMethod,
      paidAmount,
      dueAmount,
      discount: discountNum,
      notes: notes.trim(),
      items: validItems.map((it) => ({
        productId: it.productId || '',
        name: it.name.trim(),
        quantity: Number(it.quantity || 1),
        price: Number(it.price || 0)
      })),
      subtotal,
      grandTotal
    };

    try {
      generateOfflineInvoicePdf(billObj);
      const updatedHistory = [billObj, ...billsHistory].slice(0, 50);
      setBillsHistory(updatedHistory);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
      window.dispatchEvent(new Event('og_offline_bills_updated'));

      // Real-time sync: deduct stock & increment salesCount on live website + dashboard
      const dbItemsToSync = validItems
        .filter((it) => it.productId && !String(it.productId).startsWith('custom_') && it.productId !== '__NEW_CUSTOM__')
        .map((it) => ({ productId: it.productId, quantity: Number(it.quantity || 1) }));

      if (syncLiveWebsite && dbItemsToSync.length > 0) {
        try {
          const syncRes = await api.recordOfflineSale(dbItemsToSync);
          if (syncRes && Array.isArray(syncRes.products) && syncRes.products.length > 0) {
            setCatalogProducts((prev) =>
              prev.map((p) => {
                const updated = syncRes.products.find((up) => (up._id || up.id) === (p._id || p.id));
                return updated ? { ...p, ...updated } : p;
              })
            );
            addToast(`Bill downloaded & live website stock/sales updated (${syncRes.products.length} item)!`, 'success');
            return;
          }
        } catch (syncErr) {
          console.warn('[Offline Sale Sync Warning]', syncErr);
        }
      }

      addToast(`Billing PDF downloaded (${billObj.billNo})!`, 'success');
    } catch (err) {
      console.error('[PDF Generate Error]', err);
      addToast('Failed to generate PDF receipt', 'error');
    }
  };

  const handleClearForm = () => {
    setCustomerName('');
    setPhone('');
    setWeight('');
    setChestSize('');
    setBicepsSize('');
    setPaymentMethod('Cash');
    setPaidNowInput('');
    setDiscount('');
    setNotes('');
    setItems([{ productId: '', name: '', quantity: 1, price: '' }]);
  };

  const handleMarkBillPaid = (billNo) => {
    const updated = billsHistory.map((b) =>
      b.billNo === billNo
        ? { ...b, paidAmount: b.grandTotal, dueAmount: 0, paymentMethod: 'Cash (Due Cleared)' }
        : b
    );
    setBillsHistory(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('og_offline_bills_updated'));
    addToast(`Bill ${billNo} marked as 100% Paid!`, 'success');
  };

  const handleDeleteBill = (billNo) => {
    const updated = billsHistory.filter((b) => b.billNo !== billNo);
    setBillsHistory(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('og_offline_bills_updated'));
    addToast(`Removed bill ${billNo} from history`, 'info');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-emerald-400">
            Offline Store POS & Athlete Billing
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1 flex items-center gap-2.5">
            <Receipt className="w-7 h-7 text-emerald-400" />
            <span>Direct Store Billing & PDF Receipt</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Store par aane wale walk-in customers ke liye Name, Mobile, Weight, Chest, Biceps & Product details fill karke turant Billing PDF download karein.
          </p>
        </div>
      </div>

      {/* Main Grid: Form (Left) + Live Summary & History (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Form Card */}
        <form
          onSubmit={handleGenerateBill}
          className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl space-y-6"
        >
          {/* Section 1: Customer Details */}
          <div className="space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2 border-b border-slate-800 pb-2">
              <User className="w-4 h-4" />
              <span>1. Customer Details</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Customer Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Mobile Number *
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Athlete Body Measurements */}
          <div className="space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-purple-400 flex items-center gap-2 border-b border-slate-800 pb-2">
              <Scale className="w-4 h-4" />
              <span>2. Body Measurements (Optional for Receipt)</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Weight (kg)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. 72 kg"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                  <Scale className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Chest Size (in)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. 42 in"
                    value={chestSize}
                    onChange={(e) => setChestSize(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                  <Ruler className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Biceps Size (in)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. 16 in"
                    value={bicepsSize}
                    onChange={(e) => setBicepsSize(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                  <Ruler className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Supplements / Products & Pricing */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h2 className="text-sm font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <Package className="w-4 h-4" />
                <span>3. Supplement Product & Price *</span>
              </h2>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Another Product</span>
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase">Item #{idx + 1}</span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    )}
                  </div>

                  {/* Product Search Input */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="🔍 Search product by name or brand..."
                      value={item.searchQuery || ''}
                      onChange={(e) => handleItemChange(idx, 'searchQuery', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    {item.searchQuery && item.searchQuery.trim() && (
                      <div className="mt-1.5 max-h-44 overflow-y-auto rounded-xl bg-slate-900 border border-slate-700 divide-y divide-slate-800 shadow-xl">
                        {[...customProducts, ...catalogProducts]
                          .filter((p) => {
                            const q = item.searchQuery.trim().toLowerCase();
                            return (
                              p.name?.toLowerCase().includes(q) ||
                              p.brand?.toLowerCase().includes(q)
                            );
                          })
                          .slice(0, 8)
                          .map((p) => {
                            const pid = p._id || p.id;
                            const isDbProd = !String(pid).startsWith('custom_');
                            return (
                              <button
                                key={pid}
                                type="button"
                                onClick={() => {
                                  handleSelectCatalogProduct(idx, pid);
                                  handleItemChange(idx, 'searchQuery', '');
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center justify-between gap-2 text-xs cursor-pointer"
                              >
                                <div className="min-w-0">
                                  <p className="font-bold text-white truncate">{p.name}</p>
                                  <p className="text-[10px] text-slate-400">
                                    {p.brand || 'Custom'} {isDbProd ? `• Stock: ${p.stock ?? 0} • Sold: ${p.salesCount ?? 0}` : ''}
                                  </p>
                                </div>
                                <span className="font-mono font-bold text-emerald-400 shrink-0">
                                  ₹{p.discountPrice || p.price}
                                </span>
                              </button>
                            );
                          })}
                      </div>
                    )}
                  </div>

                  {/* Quick Select from Catalog + Add New Custom Product */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <select
                      value={item.productId}
                      onChange={(e) => handleSelectCatalogProduct(idx, e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="">-- Quick Pick from Store Catalog (Optional) --</option>
                      <option value="__NEW_CUSTOM__">➕ + Add New Custom Product (Naya Product Likhein)</option>
                      {customProducts.length > 0 && (
                        <optgroup label="Saved Custom Store Products">
                          {customProducts.map((cp) => (
                            <option key={cp._id} value={cp._id}>
                              ★ {cp.name} (₹{cp.price})
                            </option>
                          ))}
                        </optgroup>
                      )}
                      <optgroup label="Online Store Catalog">
                        {catalogProducts.map((p) => (
                          <option key={p._id || p.id} value={p._id || p.id}>
                            {p.name} (₹{p.discountPrice || p.price})
                          </option>
                        ))}
                      </optgroup>
                    </select>

                    {item.name.trim() && !catalogProducts.some((p) => (p._id || p.id) === item.productId) && (
                      <button
                        type="button"
                        onClick={() => handleSaveCustomProduct(idx)}
                        className="px-3 py-2 rounded-xl text-[11px] font-bold bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-400 border border-cyan-500/30 whitespace-nowrap cursor-pointer"
                        title="Save this custom product to quick-pick dropdown"
                      >
                        + Save to Quick List
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-6">
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">Product Name *</label>
                      <input
                        ref={(el) => { nameInputRefs.current[idx] = el; }}
                        type="text"
                        required
                        placeholder="e.g. ON Gold Standard Whey 2kg"
                        value={item.name}
                        onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">Qty *</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="sm:col-span-4">
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">Price per Unit (₹) *</label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          required
                          placeholder="4499"
                          value={item.price}
                          onChange={(e) => handleItemChange(idx, 'price', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-7 pr-3 py-2 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                        />
                        <IndianRupee className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Payment & Discount */}
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Payment Mode</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => {
                    setPaymentMethod(e.target.value);
                    if (e.target.value !== 'Due (Pay Later)') {
                      setPaidNowInput('');
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI / QR">UPI / QR</option>
                  <option value="Card">Debit / Credit Card</option>
                  <option value="Due (Pay Later)">Due (Pay Later / Udhaar)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Store Discount (₹)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Free Shaker"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {isDueMode && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    <span>Abhi Kitna Cash/UPI Mila? (₹)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={grandTotal}
                    placeholder="0 (Agar pura Due hai to 0 rakhein)"
                    value={paidNowInput}
                    onChange={(e) => setPaidNowInput(e.target.value)}
                    className="w-full bg-slate-950 border border-rose-500/40 rounded-xl px-3 py-2 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-rose-400"
                  />
                </div>
                <div className="p-3 rounded-xl bg-slate-950/80 border border-rose-500/30 text-right">
                  <span className="text-[11px] font-bold text-rose-300 uppercase block">Remaining Due Balance</span>
                  <span className="text-xl font-black text-rose-400 font-mono">
                    ₹{dueAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Live Website Stock & Sold Count Sync Toggle */}
          <label className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 cursor-pointer">
            <div>
              <p className="text-xs font-bold text-emerald-300">
                Sync Sale to Live Website & Dashboard (Real-Time)
              </p>
              <p className="text-[11px] text-slate-400">
                Catalog product select karne par website par "Sold" count badh jayega aur Dashboard stock se minus ho jayega.
              </p>
            </div>
            <input
              type="checkbox"
              checked={syncLiveWebsite}
              onChange={(e) => setSyncLiveWebsite(e.target.checked)}
              className="w-5 h-5 accent-emerald-500 rounded cursor-pointer shrink-0"
            />
          </label>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={handleClearForm}
              className="w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer transition-colors"
            >
              Reset Form
            </button>

            <button
              type="submit"
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl font-black text-sm text-black bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 shadow-xl shadow-emerald-950/50 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Generate & Download Billing PDF (₹{grandTotal.toLocaleString('en-IN')})</span>
            </button>
          </div>
        </form>

        {/* Right Column: Live Receipt Preview + History */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Live Preview Card */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Live Receipt Preview</span>
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                {paymentMethod}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Customer:</span>
                <span className="font-bold text-white">{customerName || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Mobile:</span>
                <span className="font-mono text-cyan-400">{phone || '—'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-center">
                <div className="p-2 rounded-xl bg-slate-900">
                  <span className="text-[10px] text-slate-400 block">Weight</span>
                  <span className="font-bold text-purple-300">{weight ? `${weight} kg` : '—'}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900">
                  <span className="text-[10px] text-slate-400 block">Chest</span>
                  <span className="font-bold text-purple-300">{chestSize ? `${chestSize} in` : '—'}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900">
                  <span className="text-[10px] text-slate-400 block">Biceps</span>
                  <span className="font-bold text-purple-300">{bicepsSize ? `${bicepsSize} in` : '—'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal ({items.length} items):</span>
                <span className="font-mono font-bold text-slate-200">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {discountNum > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Store Discount:</span>
                  <span className="font-mono font-bold">- ₹{discountNum.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between items-baseline pt-2 border-t border-slate-800">
                <span className="font-bold text-white text-sm">Grand Total:</span>
                <span className="text-2xl font-black text-emerald-400 font-mono">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
              {isDueMode && (
                <div className="pt-2 space-y-1 border-t border-slate-800/80">
                  <div className="flex justify-between text-emerald-400">
                    <span>Paid Now:</span>
                    <span className="font-mono font-bold">₹{paidAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-rose-400 font-bold">
                    <span>Due Balance:</span>
                    <span className="font-mono">₹{dueAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Past Offline Bills History */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <History className="w-4 h-4 text-cyan-400" />
                <span>Recent Offline Receipts ({billsHistory.length})</span>
              </h3>
            </div>

            {billsHistory.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">
                Abhi tak koi offline receipt generate nahi hui hai. Form fill karke pehla bill download karein.
              </p>
            ) : (
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {billsHistory.map((b) => (
                  <div
                    key={b.billNo}
                    className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-cyan-400">{b.billNo}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                          Number(b.dueAmount || 0) > 0
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold'
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          {b.paymentMethod}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-white truncate mt-0.5">
                        {b.customerName} • <span className="text-slate-400 font-normal">{b.phone}</span>
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] font-mono font-bold">
                        <span className="text-emerald-400">₹{Number(b.grandTotal || 0).toLocaleString('en-IN')}</span>
                        {Number(b.dueAmount || 0) > 0 && (
                          <span className="text-rose-400">
                            (Due: ₹{Number(b.dueAmount).toLocaleString('en-IN')})
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {Number(b.dueAmount || 0) > 0 && (
                        <button
                          type="button"
                          onClick={() => handleMarkBillPaid(b.billNo)}
                          className="px-2 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                          title="Mark Due as 100% Paid"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Paid</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => generateOfflineInvoicePdf(b)}
                        className="px-2.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1 cursor-pointer"
                        title="Re-download PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>PDF</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteBill(b.billNo)}
                        className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 cursor-pointer"
                        title="Delete from history"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
