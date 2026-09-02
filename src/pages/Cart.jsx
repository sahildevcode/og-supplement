import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function Cart() {
  const {
    cartItems,
    totalItems,
    subtotal,
    totalMRP,
    discountOnMRP,
    bulkDiscount,
    deliveryCharge,
    totalAmount,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const { products } = useProducts();
  const { isDark } = useTheme();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <div className={`min-h-[75vh] flex items-center justify-center py-16 px-4 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <div className={`max-w-md w-full text-center space-y-6 border p-8 sm:p-12 rounded-3xl ${
          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xl'
        }`}>
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Your Cart is Empty</h2>
            <p className="text-sm text-slate-400">
              Looks like you haven't added any performance supplements to your stack yet.
            </p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-sm text-black bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 shadow-xl shadow-emerald-950/60 transition-transform active:scale-95"
          >
            Start Shopping Now <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // Free delivery threshold: ₹999
  const freeShippingNeeded = Math.max(0, 999 - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / 999) * 100));

  return (
    <div className={`min-h-screen py-10 sm:py-14 transition-colors duration-300 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className={`flex items-center justify-between border-b pb-6 ${
          isDark ? 'border-slate-800' : 'border-slate-200'
        }`}>
          <div>
            <h1 className={`text-2xl sm:text-4xl font-black tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Shopping Cart
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              You have <span className="text-emerald-500 font-bold">{totalItems} items</span> in your cart
            </p>
          </div>

          <button
            onClick={clearCart}
            className="text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors flex items-center gap-1.5 p-2 rounded-xl hover:bg-rose-500/10"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Cart
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className={`p-4 rounded-2xl border space-y-2 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between text-xs font-bold">
            <span className={`flex items-center gap-1.5 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
              <Truck className="w-4 h-4 text-emerald-500" />
              {freeShippingNeeded === 0 ? (
                <span className="text-emerald-500">🎉 Congratulations! You unlocked FREE Express Delivery</span>
              ) : (
                <span>Add <span className="text-emerald-500">₹{freeShippingNeeded}</span> more for FREE Express Delivery</span>
              )}
            </span>
            <span className="text-slate-400">{freeShippingProgress}%</span>
          </div>
          <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
        </div>

        {/* Cart Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Items List (Left) */}
          <div className="lg:col-span-8 space-y-4">
            {cartItems.map((item) => {
              const liveProd = products.find((p) => (p._id || p.id) === item.productId || (p._id || p.id) === item._id);
              const liveStock = liveProd ? liveProd.stock : item.stock;
              const isOverStock = item.quantity > liveStock;

              return (
                <div
                  key={`${item.productId}-${item.variant}-${item.flavour}`}
                  className={`p-4 sm:p-6 rounded-3xl border flex flex-col sm:flex-row items-center gap-6 justify-between transition-all ${
                    isOverStock
                      ? 'border-amber-500/50 bg-amber-950/20'
                      : isDark
                      ? 'bg-slate-900/70 border-slate-800'
                      : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  {/* Image & Main Info */}
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=800&auto=format&fit=crop&q=80'}
                      alt={item.name}
                      className={`w-20 h-20 object-contain p-2 rounded-2xl border flex-shrink-0 ${
                        isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}
                    />
                    <div className="space-y-1 flex-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">
                        {item.brand}
                      </span>
                      <Link
                        to={`/products/${item.productId}`}
                        className={`text-sm sm:text-base font-bold transition-colors line-clamp-1 ${
                          isDark ? 'text-slate-100 hover:text-emerald-400' : 'text-slate-900 hover:text-emerald-600'
                        }`}
                      >
                        {item.name}
                      </Link>
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className={`px-2 py-0.5 rounded-md font-medium ${
                          isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                        }`}>{item.variant}</span>
                        <span className={`px-2 py-0.5 rounded-md font-medium ${
                          isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                        }`}>{item.flavour}</span>
                      </div>
                      {isOverStock && (
                        <p className="text-[11px] font-bold text-amber-500">
                          ⚠️ Live stock changed: Only {liveStock} units available
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Quantity & Pricing Controls */}
                  <div className={`flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 ${
                    isDark ? 'border-slate-800' : 'border-slate-100'
                  }`}>
                    {/* Quantity Controller */}
                    <div className={`flex items-center border rounded-xl overflow-hidden ${
                      isDark ? 'bg-slate-950 border-slate-700' : 'bg-slate-100 border-slate-300'
                    }`}>
                      <button
                        onClick={() => updateQuantity(item.productId, item.variant, item.flavour, item.quantity - 1, liveStock)}
                        className="px-3 py-1.5 text-slate-400 hover:text-emerald-500 font-bold text-xs"
                      >
                        -
                      </button>
                      <span className={`px-3 py-1.5 text-xs font-bold min-w-8 text-center ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.variant, item.flavour, item.quantity + 1, liveStock)}
                        className="px-3 py-1.5 text-slate-400 hover:text-emerald-500 font-bold text-xs"
                      >
                        +
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        ₹{(item.discountPrice * item.quantity).toLocaleString('en-IN')}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        ₹{item.discountPrice} each
                      </p>
                    </div>

                    {/* Delete Item */}
                    <button
                      onClick={() => removeFromCart(item.productId, item.variant, item.flavour)}
                      className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors"
                      title="Remove product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary Card (Right) */}
          <div className="lg:col-span-4 space-y-6">
            <div className={`p-6 rounded-3xl border space-y-5 shadow-lg ${
              isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <h3 className={`text-lg font-black border-b pb-3 ${
                isDark ? 'text-white border-slate-800' : 'text-slate-900 border-slate-100'
              }`}>
                Order Summary
              </h3>

              <div className="space-y-2.5 text-xs sm:text-sm text-slate-400">
                <div className="flex justify-between">
                  <span>Total MRP:</span>
                  <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>₹{totalMRP.toLocaleString('en-IN')}</span>
                </div>

                {discountOnMRP > 0 && (
                  <div className="flex justify-between text-emerald-500">
                    <span>Discount on MRP:</span>
                    <span className="font-bold">- ₹{discountOnMRP.toLocaleString('en-IN')}</span>
                  </div>
                )}

                {bulkDiscount > 0 && (
                  <div className="flex justify-between text-emerald-500">
                    <span>Special 5% Bulk Discount:</span>
                    <span className="font-bold">- ₹{bulkDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Delivery Charges:</span>
                  <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    {deliveryCharge === 0 ? (
                      <span className="text-emerald-500 font-bold">FREE</span>
                    ) : (
                      `₹${deliveryCharge}`
                    )}
                  </span>
                </div>

                <div className={`pt-3 border-t flex justify-between items-baseline ${
                  isDark ? 'border-slate-800' : 'border-slate-100'
                }`}>
                  <span className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Final Total:</span>
                  <span className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate('/login?redirect=/checkout');
                  } else {
                    navigate('/checkout');
                  }
                }}
                className="w-full py-4 rounded-2xl font-black text-sm text-black bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 shadow-xl shadow-emerald-950/40 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[11px] text-center text-slate-400">
                🔒 Safe and Secure 256-Bit SSL Checkout
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
