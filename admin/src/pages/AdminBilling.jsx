import React, { useState, useEffect } from 'react';
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
  History
} from 'lucide-react';
import { api } from '../services/api';
import { useAdminToast } from '../context/AdminToastContext';
import { generateOfflineInvoicePdf } from '../utils/invoicePdf';

const STORAGE_KEY = 'og_admin_offline_bills';

export default function AdminBilling() {
  const { addToast } = useAdminToast();
  const [catalogProducts, setCatalogProducts] = useState([]);

  // Customer & Athlete Measurements Form
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [weight, setWeight] = useState('');
  const [chestSize, setChestSize] = useState('');
  const [bicepsSize, setBicepsSize] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [discount, setDiscount] = useState('');
  const [notes, setNotes] = useState('');

  // Line items for supplements sold
  const [items, setItems] = useState([
    { productId: '', name: '', quantity: 1, price: '' }
  ]);

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
    const prod = catalogProducts.find((p) => (p._id || p.id) === prodId);
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

  const handleGenerateBill = (e) => {
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
      discount: discountNum,
      notes: notes.trim(),
      items: validItems.map((it) => ({
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
    setDiscount('');
    setNotes('');
    setItems([{ productId: '', name: '', quantity: 1, price: '' }]);
  };

  const handleDeleteBill = (billNo) => {
    const updated = billsHistory.filter((b) => b.billNo !== billNo);
    setBillsHistory(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
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

                  {/* Quick Select from Catalog */}
                  <div>
                    <select
                      value={item.productId}
                      onChange={(e) => handleSelectCatalogProduct(idx, e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="">-- Quick Pick from Store Catalog (Optional) --</option>
                      {catalogProducts.map((p) => (
                        <option key={p._id || p.id} value={p._id || p.id}>
                          {p.name} (₹{p.discountPrice || p.price})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-6">
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">Product Name *</label>
                      <input
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Payment Mode</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="Cash">Cash</option>
                <option value="UPI / QR">UPI / QR</option>
                <option value="Card">Debit / Credit Card</option>
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
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-cyan-400">{b.billNo}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                          {b.paymentMethod}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-white truncate mt-0.5">
                        {b.customerName} • <span className="text-slate-400 font-normal">{b.phone}</span>
                      </p>
                      <p className="text-[11px] text-emerald-400 font-mono font-bold mt-0.5">
                        ₹{Number(b.grandTotal || 0).toLocaleString('en-IN')}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
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
