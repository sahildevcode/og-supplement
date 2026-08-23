import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Truck, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';

export default function Checkout() {
  const { cartItems, totalItems, subtotal, discountOnMRP, bulkDiscount, deliveryCharge, totalAmount, clearCart } = useCart();
  const { user } = useAuth();
  const { addToast } = useToast();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    customerName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    paymentMethod: 'Cash on Delivery'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMessage('');
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.customerName || !formData.email || !formData.phone || !formData.address || !formData.city || !formData.state || !formData.pincode) {
      setErrorMessage('Please fill in all mandatory shipping address fields.');
      return;
    }

    if (formData.phone.replace(/\D/g, '').length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile phone number.');
      return;
    }

    try {
      setIsSubmitting(true);

      const orderPayload = {
        userId: user ? (user._id || user.id) : 'guest',
        customerName: formData.customerName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        landmark: formData.landmark,
        paymentMethod: formData.paymentMethod,
        products: cartItems.map((item) => ({
          productId: item.productId || item._id,
          name: item.name,
          brand: item.brand,
          price: item.discountPrice,
          quantity: item.quantity,
          variant: item.variant,
          flavour: item.flavour
        }))
      };

      const res = await api.createOrder(orderPayload);

      if (res.success && res.order) {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 }
        });

        addToast('Order placed successfully!', 'success');
        clearCart();
        navigate(`/order-success/${res.order.orderId || res.order._id}`, { state: { order: res.order } });
      }
    } catch (error) {
      console.error('[Order Placement Error]', error);
      setErrorMessage(error.message || 'Failed to place order. Please check item stock.');
      addToast(error.message || 'Failed to place order', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen py-10 sm:py-14 transition-colors duration-300 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Page Header */}
        <div className={`border-b pb-6 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <h1 className={`text-2xl sm:text-4xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Checkout & Shipping
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Complete your order with authentic, direct-from-warehouse dispatch
          </p>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Form: Delivery Address & Payment */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Shipping Address Section */}
            <form id="checkout-form" onSubmit={handlePlaceOrder} className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${
              isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className={`flex items-center gap-2 pb-3 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                <Truck className="w-5 h-5 text-emerald-500" />
                <h3 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>1. Shipping & Contact Details</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Full Name *</label>
                  <input
                    type="text"
                    name="customerName"
                    required
                    value={formData.customerName}
                    onChange={handleChange}
                    placeholder="e.g. Rahul Sharma"
                    className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none ${
                      isDark ? 'bg-slate-950 border-slate-700 text-slate-100 focus:border-emerald-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-600'
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Mobile Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. +91 98765 43210"
                    className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none ${
                      isDark ? 'bg-slate-950 border-slate-700 text-slate-100 focus:border-emerald-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-600'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Email Address (For Tracking) *</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. rahul@example.com"
                  className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none ${
                    isDark ? 'bg-slate-950 border-slate-700 text-slate-100 focus:border-emerald-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-600'
                  }`}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Street Address *</label>
                <textarea
                  name="address"
                  required
                  rows={2}
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Flat 402, Green Valley Apartments, MG Road"
                  className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none ${
                    isDark ? 'bg-slate-950 border-slate-700 text-slate-100 focus:border-emerald-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-600'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">City *</label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Mumbai"
                    className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none ${
                      isDark ? 'bg-slate-950 border-slate-700 text-slate-100 focus:border-emerald-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-600'
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">State *</label>
                  <input
                    type="text"
                    name="state"
                    required
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="Maharashtra"
                    className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none ${
                      isDark ? 'bg-slate-950 border-slate-700 text-slate-100 focus:border-emerald-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-600'
                    }`}
                  />
                </div>

                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Pincode *</label>
                  <input
                    type="text"
                    name="pincode"
                    required
                    maxLength={6}
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="400001"
                    className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none ${
                      isDark ? 'bg-slate-950 border-slate-700 text-slate-100 focus:border-emerald-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-600'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Landmark (Optional)</label>
                <input
                  type="text"
                  name="landmark"
                  value={formData.landmark}
                  onChange={handleChange}
                  placeholder="Near Central Mall / Metro Station"
                  className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none ${
                    isDark ? 'bg-slate-950 border-slate-700 text-slate-100 focus:border-emerald-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-600'
                  }`}
                />
              </div>

            </form>

            {/* Payment Method Section */}
            <div className={`p-6 sm:p-8 rounded-3xl border space-y-4 ${
              isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className={`flex items-center gap-2 pb-3 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                <Lock className="w-5 h-5 text-emerald-500" />
                <h3 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>2. Select Payment Option</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                  formData.paymentMethod === 'Cash on Delivery'
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50'
                }`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Cash on Delivery"
                    checked={formData.paymentMethod === 'Cash on Delivery'}
                    onChange={handleChange}
                    className="mt-1 accent-emerald-500"
                  />
                  <div>
                    <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Cash on Delivery (COD)</p>
                    <p className="text-xs text-slate-400 mt-0.5">Pay safely upon delivery at your doorstep.</p>
                  </div>
                </label>

                <label className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                  formData.paymentMethod === 'Online / UPI'
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50'
                }`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Online / UPI"
                    checked={formData.paymentMethod === 'Online / UPI'}
                    onChange={handleChange}
                    className="mt-1 accent-emerald-500"
                  />
                  <div>
                    <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Instant UPI / Cards</p>
                    <p className="text-xs text-slate-400 mt-0.5">Google Pay, PhonePe, Paytm, Cards & Net Banking.</p>
                  </div>
                </label>
              </div>
            </div>

          </div>

          {/* Right Order Summary & Confirm */}
          <div className="lg:col-span-4 space-y-6">
            <div className={`p-6 rounded-3xl border space-y-5 sticky top-28 shadow-lg ${
              isDark ? 'bg-slate-900/95 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <h3 className={`text-lg font-black border-b pb-3 ${isDark ? 'text-white border-slate-800' : 'text-slate-900 border-slate-100'}`}>
                Order Review ({totalItems} Items)
              </h3>

              {/* Items Breakdown */}
              <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
                {cartItems.map((item) => (
                  <div key={`${item.productId}-${item.variant}-${item.flavour}`} className="flex items-center gap-3 text-xs">
                    <img
                      src={item.image}
                      alt={item.name}
                      className={`w-12 h-12 rounded-xl object-contain p-1 border flex-shrink-0 ${
                        isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold truncate ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>{item.name}</p>
                      <p className="text-slate-400">{item.variant} • Qty: {item.quantity}</p>
                    </div>
                    <span className={`font-bold whitespace-nowrap ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      ₹{(item.discountPrice * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className={`space-y-2 text-xs sm:text-sm text-slate-400 border-t pt-3 ${
                isDark ? 'border-slate-800' : 'border-slate-100'
              }`}>
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>

                {discountOnMRP > 0 && (
                  <div className="flex justify-between text-emerald-500">
                    <span>Discount:</span>
                    <span className="font-bold">- ₹{discountOnMRP.toLocaleString('en-IN')}</span>
                  </div>
                )}

                {bulkDiscount > 0 && (
                  <div className="flex justify-between text-emerald-500">
                    <span>5% Bulk Savings:</span>
                    <span className="font-bold">- ₹{bulkDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Delivery:</span>
                  <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    {deliveryCharge === 0 ? <span className="text-emerald-500 font-bold">FREE</span> : `₹${deliveryCharge}`}
                  </span>
                </div>

                <div className={`pt-3 border-t flex justify-between items-baseline ${
                  isDark ? 'border-slate-800' : 'border-slate-100'
                }`}>
                  <span className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Final Amount:</span>
                  <span className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                form="checkout-form"
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl font-black text-sm text-black bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 shadow-xl shadow-emerald-950/40 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Validating & Placing Order...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>Place Order (₹{totalAmount.toLocaleString('en-IN')})</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
                <Lock className="w-3.5 h-3.5 text-emerald-500" />
                <span>Encrypted 256-Bit SSL Checkout</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
