import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Truck,
  Lock,
  ArrowRight,
  AlertCircle,
  QrCode,
  Copy,
  Check,
  Smartphone,
  Info,
  Sparkles,
  HelpCircle,
  X,
  CreditCard
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import { socket } from '../services/socket';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function Checkout() {
  const { cartItems, totalItems, subtotal, discountOnMRP, bulkDiscount, deliveryCharge, totalAmount, clearCart } = useCart();
  const { user } = useAuth();
  const { addToast } = useToast();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const [paymentSettings, setPaymentSettings] = useState(() => {
    try {
      const cached = JSON.parse(localStorage.getItem('og_payment_settings') || 'null');
      if (cached) return cached;
    } catch (e) {}
    return {
      qrCodeImage: '/uploads/merchant_qr.jpg',
      upiId: 'ogsupplement@okaxis',
      merchantName: 'OG Supplement Store',
      isUpiEnabled: true,
      isCodEnabled: true,
      isRazorpayEnabled: true,
      razorpayKeyId: 'rzp_test_5173DemoKey',
      razorpayMode: 'test',
      instructions: 'Scan this QR code using PhonePe, Google Pay, Paytm, or any UPI app. Complete the payment and enter your 12-digit UPI UTR / Transaction Reference Number below.'
    };
  });

  const [copiedUpi, setCopiedUpi] = useState(false);
  const [showSandboxModal, setShowSandboxModal] = useState(false);
  const [sandboxOrderInfo, setSandboxOrderInfo] = useState(null);

  const [formData, setFormData] = useState({
    customerName: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: user?.address || '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    paymentMethod: 'Razorpay (Online)',
    transactionId: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  // Load payment settings and listen for real-time changes from Admin Panel
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.getPaymentSettings();
        if (res && res.settings) {
          setPaymentSettings(res.settings);
          if (!res.settings.isCodEnabled && res.settings.isUpiEnabled) {
            setFormData((prev) => ({ ...prev, paymentMethod: 'Online / UPI' }));
          } else if (!res.settings.isUpiEnabled && res.settings.isCodEnabled) {
            setFormData((prev) => ({ ...prev, paymentMethod: 'Cash on Delivery' }));
          }
        }
      } catch (err) {
        console.warn('[Payment Settings Fetch Error]', err);
      }
    };

    fetchSettings();

    const handleSettingsUpdated = (updated) => {
      setPaymentSettings(updated);
      try {
        localStorage.setItem('og_payment_settings', JSON.stringify(updated));
      } catch (e) {}
    };

    socket.on('payment-settings:updated', handleSettingsUpdated);
    return () => {
      socket.off('payment-settings:updated', handleSettingsUpdated);
    };
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMessage('');
  };

  const handleCopyUpi = () => {
    if (paymentSettings.upiId) {
      navigator.clipboard.writeText(paymentSettings.upiId);
      setCopiedUpi(true);
      addToast('UPI ID copied to clipboard!', 'success');
      setTimeout(() => setCopiedUpi(false), 2000);
    }
  };

  const getDynamicQrUrl = () => {
    const upi = paymentSettings.upiId || 'ogsupplement@okaxis';
    const name = paymentSettings.merchantName || 'OG Supplement';

    if (!paymentSettings.qrCodeImage) {
      return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`upi://pay?pa=${upi}&pn=${name}&am=${totalAmount}&cu=INR`)}`;
    }

    if (paymentSettings.qrCodeImage.includes('api.qrserver.com')) {
      const upiUri = `upi://pay?pa=${upi}&pn=${encodeURIComponent(name)}&am=${totalAmount}&cu=INR`;
      return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiUri)}`;
    }

    return paymentSettings.qrCodeImage;
  };

  const mobileUpiUri = `upi://pay?pa=${encodeURIComponent(paymentSettings.upiId || 'ogsupplement@okaxis')}&pn=${encodeURIComponent(paymentSettings.merchantName || 'OG Supplement')}&am=${totalAmount}&cu=INR&tn=${encodeURIComponent('OG Supplement Order')}`;

  const handleCompleteRazorpayOrder = async (rzpResponse) => {
    try {
      setIsSubmitting(true);
      setShowSandboxModal(false);

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
        paymentMethod: 'Razorpay (Online)',
        paymentStatus: 'Paid',
        orderStatus: 'Order Placed',
        razorpayPaymentId: rzpResponse.razorpay_payment_id || `pay_test_${Date.now().toString(36).toUpperCase()}`,
        razorpayOrderId: rzpResponse.razorpay_order_id || '',
        razorpaySignature: rzpResponse.razorpay_signature || '',
        transactionId: rzpResponse.razorpay_payment_id || `pay_test_${Date.now().toString(36).toUpperCase()}`,
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

        addToast('🎉 Payment Verified! Order confirmed automatically.', 'success');
        clearCart();
        navigate(`/order-success/${res.order.orderId || res.order._id}`, { state: { order: res.order } });
      }
    } catch (error) {
      console.error('[Razorpay Order Completion Error]', error);
      setErrorMessage(error.message || 'Failed to place order after payment.');
      addToast(error.message || 'Failed to place order', 'error');
    } finally {
      setIsSubmitting(false);
    }
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

    // 1. Razorpay Automatic Online Payment
    if (formData.paymentMethod === 'Razorpay (Online)') {
      try {
        setIsSubmitting(true);
        const orderRes = await api.createRazorpayOrder({
          amount: totalAmount,
          receipt: `rcpt_${Date.now()}`
        });

        // If Demo sandbox mode or demo key, open Sandbox Modal simulator immediately
        if (orderRes.isDemo || orderRes.keyId?.includes('DemoKey')) {
          setSandboxOrderInfo(orderRes);
          setShowSandboxModal(true);
          setIsSubmitting(false);
          return;
        }

        // Live or registered test key: load official Razorpay SDK
        const isLoaded = await loadRazorpayScript();
        if (!isLoaded || !window.Razorpay) {
          setSandboxOrderInfo(orderRes);
          setShowSandboxModal(true);
          setIsSubmitting(false);
          return;
        }

        const options = {
          key: orderRes.keyId,
          amount: orderRes.amount,
          currency: orderRes.currency || 'INR',
          name: paymentSettings.merchantName || 'OG Supplement Store',
          description: 'Authentic Supplement Stack Order',
          image: '/uploads/merchant_qr.jpg',
          order_id: orderRes.orderId && !orderRes.isDemo ? orderRes.orderId : undefined,
          prefill: {
            name: formData.customerName,
            email: formData.email,
            contact: formData.phone
          },
          theme: {
            color: '#10b981'
          },
          handler: async function (response) {
            await handleCompleteRazorpayOrder(response);
          },
          modal: {
            ondismiss: function () {
              setIsSubmitting(false);
              addToast('Payment cancelled by user', 'info');
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (resp) {
          setIsSubmitting(false);
          addToast(resp.error?.description || 'Payment Failed', 'error');
        });
        rzp.open();
      } catch (err) {
        setIsSubmitting(false);
        setErrorMessage(err.message || 'Razorpay Gateway initialization failed');
      }
      return;
    }

    // 2. Validation for Online / UPI payment
    if (formData.paymentMethod === 'Online / UPI') {
      const utr = (formData.transactionId || '').trim();
      if (!utr) {
        setErrorMessage('Please enter your 12-digit UPI Transaction / UTR Number to confirm payment.');
        addToast('Please enter your 12-digit UPI Transaction / UTR Number', 'error');
        return;
      }
      if (utr.length < 8) {
        setErrorMessage('Please enter a valid UPI Transaction / UTR Number (minimum 8-12 digits).');
        addToast('Invalid UTR Number. Please check your UPI app receipt.', 'error');
        return;
      }
    }

    // 3. COD & Manual UPI Order Creation
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
        transactionId: formData.paymentMethod === 'Online / UPI' ? formData.transactionId.trim() : '',
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

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs sm:text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Shipping & Payment Details */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Step 1: Address Form */}
            <form id="checkout-form" onSubmit={handlePlaceOrder} className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${
              isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className={`flex items-center gap-2 pb-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                <Truck className="w-5 h-5 text-emerald-500" />
                <h3 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>1. Shipping Details</h3>
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
                    placeholder="e.g. Sahil Sharma"
                    className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none ${
                      isDark ? 'bg-slate-950 border-slate-700 text-slate-100 focus:border-emerald-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-600'
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    maxLength={10}
                    value={formData.phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setFormData({ ...formData, phone: val });
                      setErrorMessage('');
                    }}
                    placeholder="10-digit mobile number"
                    className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none ${
                      isDark ? 'bg-slate-950 border-slate-700 text-slate-100 focus:border-emerald-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-600'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Email Address (For Order Tracking) *</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none ${
                    isDark ? 'bg-slate-950 border-slate-700 text-slate-100 focus:border-emerald-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-600'
                  }`}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Delivery Address *</label>
                <textarea
                  name="address"
                  required
                  rows={2}
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Flat / House No., Building Name, Street / Sector"
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

            {/* Step 2: Payment Method Section */}
            <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${
              isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className={`flex items-center gap-2 pb-3 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                <Lock className="w-5 h-5 text-emerald-500" />
                <h3 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>2. Select Payment Option</h3>
              </div>

              {/* Payment Channel Selection */}
              <div className="grid grid-cols-1 gap-3.5">
                
                {/* Option 1: Razorpay Automatic Online Gateway */}
                {paymentSettings.isRazorpayEnabled !== false && (
                  <label className={`p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                    formData.paymentMethod === 'Razorpay (Online)'
                      ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-950/20 ring-1 ring-emerald-500/30'
                      : isDark ? 'border-slate-800 bg-slate-950 hover:border-slate-700' : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Razorpay (Online)"
                      checked={formData.paymentMethod === 'Razorpay (Online)'}
                      onChange={handleChange}
                      className="mt-1 accent-emerald-500 w-4 h-4"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <p className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          Instant Online Payment (UPI / Cards / GPay / NetBanking)
                        </p>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            ⚡ 100% Automatic • Recommended
                          </span>
                          {paymentSettings.razorpayMode === 'test' && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                              🧪 Sandbox Test Mode
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Pay securely with Google Pay, PhonePe, Paytm, Debit/Credit Card or NetBanking. Order confirms automatically with zero manual UTR input.
                      </p>
                    </div>
                  </label>
                )}

                {/* Option 2: Manual UPI / QR Code */}
                {paymentSettings.isUpiEnabled !== false && (
                  <label className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                    formData.paymentMethod === 'Online / UPI'
                      ? 'border-emerald-500 bg-emerald-500/10 shadow-md shadow-emerald-950/20'
                      : isDark ? 'border-slate-800 bg-slate-950 hover:border-slate-700' : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Online / UPI"
                      checked={formData.paymentMethod === 'Online / UPI'}
                      onChange={handleChange}
                      className="mt-1 accent-emerald-500 w-4 h-4"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Manual UPI QR Scanner</p>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                          Manual UTR
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">Scan static QR code on phone and enter 12-digit UTR reference manually.</p>
                    </div>
                  </label>
                )}

                {/* Option 3: Cash on Delivery */}
                {paymentSettings.isCodEnabled !== false && (
                  <label className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                    formData.paymentMethod === 'Cash on Delivery'
                      ? 'border-emerald-500 bg-emerald-500/10 shadow-md shadow-emerald-950/20'
                      : isDark ? 'border-slate-800 bg-slate-950 hover:border-slate-700' : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Cash on Delivery"
                      checked={formData.paymentMethod === 'Cash on Delivery'}
                      onChange={handleChange}
                      className="mt-1 accent-emerald-500 w-4 h-4"
                    />
                    <div>
                      <p className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Cash on Delivery (COD)</p>
                      <p className="text-xs text-slate-400 mt-0.5">Pay with cash upon delivery at your doorstep.</p>
                    </div>
                  </label>
                )}

              </div>

              {/* Razorpay Information Box (When Razorpay is selected) */}
              {formData.paymentMethod === 'Razorpay (Online)' && (
                <div className={`p-5 rounded-2xl border space-y-3 animate-in fade-in zoom-in-95 duration-200 ${
                  isDark ? 'bg-slate-950/80 border-emerald-500/30' : 'bg-emerald-50/50 border-emerald-200'
                }`}>
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-400">
                    <Sparkles className="w-4 h-4" />
                    <span>Instant Payment Gateway Powered by Razorpay</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>1-Click UPI & Card PIN Verification</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Zero UTR typing required</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Automated Order Confirmation</span>
                    </div>
                  </div>
                  {paymentSettings.razorpayMode === 'test' && (
                    <p className="text-[11px] text-cyan-400 bg-cyan-950/40 p-2.5 rounded-xl border border-cyan-500/20 font-medium">
                      🧪 <strong>Test Mode Active:</strong> You can simulate payment safely. No real money will be charged from your account!
                    </p>
                  )}
                </div>
              )}

              {/* Interactive UPI QR Scanner Box (Appears when Online / UPI is selected) */}
              {formData.paymentMethod === 'Online / UPI' && (
                <div className={`p-6 sm:p-7 rounded-3xl border space-y-6 animate-in fade-in zoom-in-95 duration-300 ${
                  isDark ? 'bg-slate-950/90 border-emerald-500/30 shadow-2xl' : 'bg-emerald-50/40 border-emerald-200 shadow-md'
                }`}>
                  
                  {/* UPI Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-500/20 pb-4">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-400">
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                        <span>Instant 0% Fee UPI Payment</span>
                      </div>
                      <h4 className={`text-base font-black mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {paymentSettings.merchantName || 'OG Supplement Store'}
                      </h4>
                    </div>
                    <div className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-bold text-sm">
                      Pay Exact: ₹{totalAmount.toLocaleString('en-IN')}
                    </div>
                  </div>

                  {/* QR Scanner & Mobile Button Area */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    
                    {/* QR Code Container */}
                    <div className="md:col-span-5 flex flex-col items-center justify-center space-y-2">
                      <div className="w-52 h-52 bg-white p-3 rounded-2xl shadow-xl border-2 border-emerald-500/30 flex items-center justify-center overflow-hidden">
                        <img
                          src={getDynamicQrUrl()}
                          alt="UPI Payment QR Code"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.target.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi%3A%2F%2Fpay%3Fpa%3Dogsupplement%40okaxis%26pn%3DOG%2BSupplement%26am%3D${totalAmount}%26cu%3DINR`;
                          }}
                        />
                      </div>
                      <p className="text-[11px] font-bold text-slate-400 text-center flex items-center gap-1.5">
                        <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Scan with PhonePe, GPay or Paytm</span>
                      </p>
                    </div>

                    {/* Instructions & Mobile 1-Tap Trigger */}
                    <div className="md:col-span-7 space-y-4">
                      
                      {/* Mobile One-Tap Link (for phone users) */}
                      <div className="space-y-1.5">
                        <a
                          href={mobileUpiUri}
                          className="w-full py-3 px-4 rounded-xl font-black text-xs bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 transition-all active:scale-95 text-center"
                        >
                          <Smartphone className="w-4 h-4" />
                          <span>Tap to Pay on Mobile UPI App</span>
                        </a>
                        <p className="text-[10px] text-slate-500 text-center">
                          (Click above on your phone to open GPay, PhonePe, or Paytm automatically)
                        </p>
                      </div>

                      {/* Official UPI ID with 1-Click Copy */}
                      <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                      }`}>
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            Direct UPI ID / VPA
                          </span>
                          <span className="text-xs sm:text-sm font-black text-emerald-400 font-mono truncate block">
                            {paymentSettings.upiId || 'ogsupplement@okaxis'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleCopyUpi}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all active:scale-95 shrink-0 cursor-pointer"
                        >
                          {copiedUpi ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy UPI</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Supported Badges */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Accepted Payment Apps:
                        </span>
                        <div className="flex flex-wrap gap-1.5 text-[10px] font-bold text-slate-300">
                          {['Google Pay', 'PhonePe', 'Paytm', 'BHIM', 'Cred UPI', 'Amazon Pay'].map((app) => (
                            <span
                              key={app}
                              className={`px-2 py-0.5 rounded-md border ${
                                isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
                              }`}
                            >
                              {app}
                            </span>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* 12-Digit UTR / Transaction Input Section */}
                  <div className={`p-4 sm:p-5 rounded-2xl border space-y-3 ${
                    isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-emerald-200 shadow-sm'
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <label className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}>
                        <span>Enter 12-Digit UPI UTR / Transaction ID *</span>
                      </label>
                      <span className="text-[10px] text-emerald-500 font-bold">
                        Found in your UPI app receipt
                      </span>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        name="transactionId"
                        value={formData.transactionId}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
                          setFormData({ ...formData, transactionId: val });
                          setErrorMessage('');
                        }}
                        maxLength={24}
                        placeholder="e.g. 423985710294"
                        className={`w-full font-mono text-sm font-bold tracking-wider px-4 py-3 rounded-xl border focus:outline-none transition-colors ${
                          isDark
                            ? 'bg-slate-950 border-slate-700 text-emerald-400 placeholder:text-slate-600 focus:border-emerald-500'
                            : 'bg-slate-50 border-slate-300 text-emerald-600 placeholder:text-slate-400 focus:border-emerald-600'
                        }`}
                      />
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      💡 {paymentSettings.instructions || 'Scan the QR code, pay the exact order amount, and paste the 12-digit UTR/Ref number from your payment receipt here.'}
                    </p>
                  </div>

                </div>
              )}

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
                className="w-full py-4 rounded-2xl font-black text-sm text-black bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 shadow-xl shadow-emerald-950/40 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Validating & Placing Order...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>
                      {formData.paymentMethod === 'Razorpay (Online)'
                        ? `Pay ₹${totalAmount.toLocaleString('en-IN')} with Razorpay`
                        : formData.paymentMethod === 'Online / UPI'
                        ? `Confirm UPI Order (₹${totalAmount.toLocaleString('en-IN')})`
                        : `Place COD Order (₹${totalAmount.toLocaleString('en-IN')})`}
                    </span>
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

      {/* Razorpay Test Mode / Sandbox Simulation Modal */}
      {showSandboxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-lg border border-emerald-500/30">
                  ₹
                </div>
                <div>
                  <h4 className="text-base font-black text-white">Razorpay Test Gateway</h4>
                  <p className="text-xs text-emerald-400 font-bold">🧪 Sandbox Payment Simulation</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSandboxModal(false)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1 text-center">
              <span className="text-[11px] text-slate-400 uppercase tracking-widest font-black">Order Amount</span>
              <p className="text-3xl font-black text-white font-mono">₹{totalAmount.toLocaleString('en-IN')}</p>
              <span className="inline-block mt-1 text-[11px] text-cyan-400 font-bold bg-cyan-950/60 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
                Safe Test Mode • No Real Charges
              </span>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => handleCompleteRazorpayOrder({
                  razorpay_payment_id: 'pay_test_' + Math.random().toString(36).substring(2, 10).toUpperCase(),
                  razorpay_order_id: sandboxOrderInfo?.orderId || 'order_test_' + Date.now().toString(36),
                  razorpay_signature: 'test_sig_' + Date.now()
                })}
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl font-black text-xs sm:text-sm text-black bg-emerald-500 hover:bg-emerald-400 shadow-xl shadow-emerald-950/60 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Simulate Successful UPI / Card Payment</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowSandboxModal(false);
                  addToast('Payment simulation cancelled', 'info');
                }}
                className="w-full py-3 rounded-2xl font-bold text-xs text-slate-300 bg-slate-800 hover:bg-slate-750 transition-colors cursor-pointer"
              >
                Cancel Simulation
              </button>
            </div>

            <p className="text-[11px] text-slate-500 text-center leading-relaxed">
              Once approved by Razorpay, your live Key ID will automatically open the official payment interface with real UPI PIN, GPay, PhonePe, and Card payments.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
