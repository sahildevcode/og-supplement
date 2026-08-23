import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ShieldCheck } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function Footer() {
  const { isDark } = useTheme();

  return (
    <footer className={`border-t pt-16 pb-12 transition-colors duration-300 ${
      isDark ? 'bg-slate-950 border-slate-800/80 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b ${
          isDark ? 'border-slate-800/80' : 'border-slate-200'
        }`}>
          
          {/* Brand Col - OG-SUPPLEMENT */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5 group inline-flex">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-950/40">
                <Sparkles className="w-5 h-5 text-black" />
              </div>
              <span className={`text-xl font-extrabold tracking-tight ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                OG-<span className="gradient-text font-black">SUPPLEMENT</span>
              </span>
            </Link>
            <p className="text-sm max-w-sm leading-relaxed">
              India's premier high-potency sports nutrition destination. Providing 100% authentic, laboratory-tested whey proteins, mass gainers, creatine, and performance supplements directly to fitness enthusiasts.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-500">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Authentic Products • FSSAI & GMP Certified</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-emerald-500 transition-colors">Home</Link></li>
              <li><Link to="/products" className="hover:text-emerald-500 transition-colors">All Supplements</Link></li>
              <li><Link to="/about" className="hover:text-emerald-500 transition-colors">About OG-Supplement</Link></li>
              <li><Link to="/license" className="hover:text-emerald-500 transition-colors">Licenses & Lab Reports</Link></li>
              <li><Link to="/orders" className="hover:text-emerald-500 transition-colors">Track Order</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="space-y-3">
            <h4 className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Customer Care</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/faq" className="hover:text-emerald-500 transition-colors">Help Center & FAQ</Link></li>
              <li><Link to="/shipping-policy" className="hover:text-emerald-500 transition-colors">Shipping & Delivery</Link></li>
              <li><Link to="/return-policy" className="hover:text-emerald-500 transition-colors">Returns & Refunds</Link></li>
              <li><Link to="/cancellation-policy" className="hover:text-emerald-500 transition-colors">Cancellation Policy</Link></li>
              <li><a href="mailto:support@ogsupplement.com" className="hover:text-emerald-500 transition-colors">support@ogsupplement.com</a></li>
            </ul>
          </div>

          {/* Policies & Compliance */}
          <div className="space-y-3">
            <h4 className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Legal Policies</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/privacy-policy" className="hover:text-emerald-500 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-emerald-500 transition-colors">Terms of Service</Link></li>
              <li><Link to="/return-policy" className="hover:text-emerald-500 transition-colors">Minimum Order Info</Link></li>
              <li><Link to="/license" className="hover:text-emerald-500 transition-colors">FSSAI Compliance</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} OG-Supplement Sports Nutrition Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Crafted for Peak Human Performance</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
