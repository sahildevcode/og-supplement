import React, { useState, useEffect } from 'react';
import {
  QrCode,
  Check,
  RefreshCw,
  Copy,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Smartphone,
  CreditCard,
  Building2,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { api } from '../services/api';
import { socket } from '../services/socket';
import { useAdminToast } from '../context/AdminToastContext';

const sampleQRPresets = [
  {
    name: 'Standard Auto-Generated QR',
    url: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi%3A%2F%2Fpay%3Fpa%3Dogsupplement%40okaxis%26pn%3DOG%2BSupplement%26cu%3DINR'
  },
  {
    name: 'Demo Merchant QR Code',
    url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&auto=format&fit=crop&q=80'
  }
];

export default function AdminPaymentSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copiedPreview, setCopiedPreview] = useState(false);

  const [formData, setFormData] = useState({
    qrCodeImage: '/uploads/merchant_qr.jpg',
    upiId: 'ogsupplement@okaxis',
    merchantName: 'OG Supplement Store',
    isUpiEnabled: true,
    isCodEnabled: true,
    isRazorpayEnabled: true,
    razorpayKeyId: 'rzp_test_5173DemoKey',
    razorpayKeySecret: '',
    razorpayMode: 'test',
    instructions: 'Scan this QR code using PhonePe, Google Pay, Paytm, or any UPI app. Complete the payment and enter your 12-digit UPI UTR / Transaction Reference Number below.'
  });

  const { addToast } = useAdminToast();

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.getPaymentSettings();
      if (res && res.settings) {
        setFormData({
          qrCodeImage: res.settings.qrCodeImage || '',
          upiId: res.settings.upiId || '',
          merchantName: res.settings.merchantName || 'OG Supplement Store',
          isUpiEnabled: res.settings.isUpiEnabled !== undefined ? res.settings.isUpiEnabled : true,
          isCodEnabled: res.settings.isCodEnabled !== undefined ? res.settings.isCodEnabled : true,
          isRazorpayEnabled: res.settings.isRazorpayEnabled !== undefined ? res.settings.isRazorpayEnabled : true,
          razorpayKeyId: res.settings.razorpayKeyId || 'rzp_test_5173DemoKey',
          razorpayKeySecret: res.settings.razorpayKeySecret || '',
          razorpayMode: res.settings.razorpayMode || 'test',
          instructions: res.settings.instructions || ''
        });
      }
    } catch (err) {
      console.error('[Fetch Payment Settings Error]', err);
      addToast('Could not load payment settings. Using local values.', 'warning');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();

    const handleUpdated = (updated) => {
      setFormData((prev) => ({ ...prev, ...updated }));
    };

    socket.on('payment-settings:updated', handleUpdated);
    return () => {
      socket.off('payment-settings:updated', handleUpdated);
    };
  }, []);

  const handleGenerateQR = () => {
    if (!formData.upiId) {
      addToast('Please enter your UPI ID first to generate QR', 'error');
      return;
    }
    const safeUpi = encodeURIComponent(formData.upiId.trim());
    const safeName = encodeURIComponent((formData.merchantName || 'OG Supplement').trim());
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi%3A%2F%2Fpay%3Fpa%3D${safeUpi}%26pn%3D${safeName}%26cu%3DINR`;
    setFormData({ ...formData, qrCodeImage: qrUrl });
    addToast('Dynamic QR code generated from your UPI ID!', 'success');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.qrCodeImage && !formData.upiId) {
      addToast('Please provide at least a QR Code Image URL or a UPI ID', 'error');
      return;
    }

    try {
      setSaving(true);
      const res = await api.updatePaymentSettings(formData);
      addToast('Payment & QR Code settings updated live!', 'success');
      if (res && res.settings) {
        setFormData(res.settings);
      }
    } catch (err) {
      console.error('[Save Payment Settings Error]', err);
      addToast(err.message || 'Failed to update payment settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCopyPreviewUpi = () => {
    if (formData.upiId) {
      navigator.clipboard.writeText(formData.upiId);
      setCopiedPreview(true);
      setTimeout(() => setCopiedPreview(false), 2000);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-widest">
            <QrCode className="w-4 h-4" />
            <span>Store Payment Infrastructure</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            UPI QR Code & Payment Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mt-1">
            Set your merchant UPI ID and QR code here. When customers place orders on your website, they will scan this exact QR code and enter their 12-digit UTR transaction number for instant verification.
          </p>
        </div>

        <button
          onClick={fetchSettings}
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700 active:scale-95 self-start sm:self-auto"
          title="Refresh Settings"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Form: Settings Inputs */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSave} className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
            
            {/* Merchant Info */}
            <div className="space-y-4">
              <h2 className="text-sm font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2 border-b border-slate-800 pb-3">
                <Building2 className="w-4 h-4" />
                <span>1. Merchant UPI Information</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Merchant / Store Name
                  </label>
                  <input
                    type="text"
                    value={formData.merchantName}
                    onChange={(e) => setFormData({ ...formData, merchantName: e.target.value })}
                    placeholder="e.g. OG Supplement Store"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Official UPI ID (VPA)
                  </label>
                  <input
                    type="text"
                    value={formData.upiId}
                    onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                    placeholder="e.g. 9876543210@ybl, name@paytm, etc."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* QR Code Image Configuration */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h2 className="text-sm font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                  <QrCode className="w-4 h-4" />
                  <span>2. UPI QR Code Image</span>
                </h2>
                <button
                  type="button"
                  onClick={handleGenerateQR}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[11px] font-bold transition-all active:scale-95"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Auto-Generate from UPI ID</span>
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  QR Code Image URL
                </label>
                <input
                  type="url"
                  value={formData.qrCodeImage}
                  onChange={(e) => setFormData({ ...formData, qrCodeImage: e.target.value })}
                  placeholder="https://... (Direct image link of your UPI QR code)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  required
                />
                <p className="text-[11px] text-slate-400">
                  You can upload your scanner image to any image host (Imgur/PostImage/Cloudinary) and paste the URL here, OR click "Auto-Generate from UPI ID" above.
                </p>
              </div>

              {/* Sample QR Presets */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  ⚡ Quick Sample QR Formats:
                </span>
                <div className="flex flex-wrap gap-2">
                  {sampleQRPresets.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => setFormData({ ...formData, qrCodeImage: preset.url })}
                      className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:border-slate-700 transition-colors"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Payment Method Toggles */}
            <div className="space-y-4">
              <h2 className="text-sm font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2 border-b border-slate-800 pb-3">
                <CreditCard className="w-4 h-4" />
                <span>3. Active Payment Channels</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                  formData.isUpiEnabled
                    ? 'border-cyan-500/50 bg-cyan-500/5'
                    : 'border-slate-800 bg-slate-950 opacity-60'
                }`}>
                  <input
                    type="checkbox"
                    checked={formData.isUpiEnabled}
                    onChange={(e) => setFormData({ ...formData, isUpiEnabled: e.target.checked })}
                    className="mt-1 accent-cyan-500 rounded"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">Online / UPI QR Code</span>
                    <span className="text-[11px] text-slate-400">Allow customers to pay via PhonePe, GPay, Paytm with UTR verification.</span>
                  </div>
                </label>

                <label className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                  formData.isCodEnabled
                    ? 'border-cyan-500/50 bg-cyan-500/5'
                    : 'border-slate-800 bg-slate-950 opacity-60'
                }`}>
                  <input
                    type="checkbox"
                    checked={formData.isCodEnabled}
                    onChange={(e) => setFormData({ ...formData, isCodEnabled: e.target.checked })}
                    className="mt-1 accent-cyan-500 rounded"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">Cash on Delivery (COD)</span>
                    <span className="text-[11px] text-slate-400">Allow doorstep cash collection on order delivery.</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Razorpay Payment Gateway Card */}
            <div className="space-y-4 p-5 rounded-2xl bg-slate-950 border border-emerald-500/30">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-black uppercase tracking-wider text-emerald-400">
                    4. Razorpay Automatic Gateway
                  </span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-xs font-bold text-slate-300">Enable Razorpay</span>
                  <input
                    type="checkbox"
                    checked={formData.isRazorpayEnabled}
                    onChange={(e) => setFormData({ ...formData, isRazorpayEnabled: e.target.checked })}
                    className="accent-emerald-500 w-4 h-4 rounded"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Gateway Mode
                  </label>
                  <select
                    value={formData.razorpayMode}
                    onChange={(e) => setFormData({ ...formData, razorpayMode: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="test">🧪 Test Mode (Sandbox Simulation)</option>
                    <option value="live">🚀 Live Mode (Real Payments & Settlements)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Razorpay Key ID
                  </label>
                  <input
                    type="text"
                    value={formData.razorpayKeyId}
                    onChange={(e) => setFormData({ ...formData, razorpayKeyId: e.target.value })}
                    placeholder="rzp_test_... or rzp_live_..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Razorpay Key Secret (Stored Securely)
                </label>
                <input
                  type="password"
                  value={formData.razorpayKeySecret}
                  onChange={(e) => setFormData({ ...formData, razorpayKeySecret: e.target.value })}
                  placeholder="Enter Razorpay Key Secret from dashboard"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  Automatic Bank Verification Enabled
                </p>
                <p className="text-[11px] text-slate-300 opacity-90">
                  Customers can pay using Google Pay, PhonePe, Cards, or NetBanking. Order confirms automatically with zero manual UTR verification. Test mode works immediately without real money!
                </p>
              </div>
            </div>

            {/* Customer Instructions */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Custom Checkout Instructions for Customer
              </label>
              <textarea
                rows={2}
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-cyan-950/40 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving Settings...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Save & Update Checkout Live</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

        {/* Right Column: Real-time Customer Checkout Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="sticky top-28 space-y-3">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400">
              <Smartphone className="w-4 h-4 text-cyan-400" />
              <span>Live Checkout Customer View</span>
            </div>

            <div className="p-6 rounded-3xl bg-slate-950 border border-cyan-500/30 shadow-2xl space-y-5">
              
              {/* Preview Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Instant UPI Payment</span>
                  <h3 className="text-sm font-black text-white">{formData.merchantName || 'OG Supplement Store'}</h3>
                </div>
                <span className="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Scan & Pay
                </span>
              </div>

              {/* QR Code Container */}
              <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="w-48 h-48 bg-white p-2.5 rounded-2xl shadow-xl flex items-center justify-center">
                  {formData.qrCodeImage ? (
                    <img
                      src={formData.qrCodeImage}
                      alt="UPI QR Code"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.src = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi%3A%2F%2Fpay%3Fpa%3Dogsupplement%40okaxis%26pn%3DOG%2BSupplement%26cu%3DINR';
                      }}
                    />
                  ) : (
                    <div className="text-slate-400 text-xs text-center font-bold">No QR Code Image Set</div>
                  )}
                </div>

                <div className="text-center space-y-1">
                  <p className="text-xs font-bold text-slate-200">
                    Scan with any UPI App
                  </p>
                  <div className="flex items-center justify-center gap-2 text-[10px] font-semibold text-slate-400">
                    <span>Google Pay</span> • <span>PhonePe</span> • <span>Paytm</span> • <span>BHIM</span>
                  </div>
                </div>
              </div>

              {/* UPI ID Box with Copy Button */}
              <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Merchant UPI ID</span>
                  <span className="text-xs font-black text-cyan-400 truncate block">
                    {formData.upiId || 'ogsupplement@okaxis'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyPreviewUpi}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-bold transition-all active:scale-95 shrink-0"
                >
                  {copiedPreview ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy ID</span>
                    </>
                  )}
                </button>
              </div>

              {/* UTR Number Simulated Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>12-Digit UPI Transaction / UTR No. *</span>
                  <span className="text-[10px] text-emerald-400">Mandatory</span>
                </label>
                <input
                  type="text"
                  disabled
                  placeholder="e.g. 423985710294"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-400 cursor-not-allowed"
                />
                <p className="text-[10px] text-slate-500 leading-tight">
                  {formData.instructions || 'Scan QR, make payment, and paste the 12-digit UTR number here.'}
                </p>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Customer payment verified by Admin prior to shipment</span>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
