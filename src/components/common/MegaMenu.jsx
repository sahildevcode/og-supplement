import React from 'react';
import { Link } from 'react-router-dom';
import {
  Info,
  ShieldCheck,
  FileText,
  RotateCcw,
  Truck,
  XCircle,
  HelpCircle,
  Award,
  PhoneCall,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function MegaMenu({ isOpen, onClose }) {
  const { isDark } = useTheme();
  if (!isOpen) return null;

  const infoLinks = [
    { name: 'About ApexNutra', href: '/about', icon: Info, desc: 'Our mission, purity standards & laboratory testing' },
    { name: 'Licenses & Certifications', href: '/license', icon: Award, desc: 'FSSAI, GMP & Informed-Choice verified licenses' },
    { name: 'Contact & Support', href: '/faq', icon: PhoneCall, desc: 'Get in touch with nutrition advisors' },
  ];

  const policyLinks = [
    { name: 'Privacy Policy', href: '/privacy-policy', icon: ShieldCheck },
    { name: 'Terms & Conditions', href: '/terms', icon: FileText },
    { name: 'Return & Refund Policy', href: '/return-policy', icon: RotateCcw },
    { name: 'Shipping & Delivery', href: '/shipping-policy', icon: Truck },
    { name: 'Cancellation Policy', href: '/cancellation-policy', icon: XCircle },
  ];

  const supportLinks = [
    { name: 'Frequently Asked Questions (FAQ)', href: '/faq', icon: HelpCircle },
    { name: 'Authenticity Verification', href: '/license', icon: Sparkles },
    { name: 'Track Existing Order', href: '/orders', icon: Truck },
  ];

  return (
    <div
      onMouseEnter={() => {}}
      onMouseLeave={onClose}
      className="absolute top-full left-0 w-full z-50 transition-all duration-300 transform origin-top animate-in fade-in slide-in-from-top-2"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3">
        <div className={`backdrop-blur-2xl border rounded-3xl shadow-2xl p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-8 ${
          isDark
            ? 'bg-slate-900/95 border-slate-700/60 ring-1 ring-emerald-500/10'
            : 'bg-white/95 border-slate-200 shadow-slate-300/60 ring-1 ring-emerald-500/20'
        }`}>
          
          {/* Column 1: Brand & Information */}
          <div className="space-y-4">
            <div className={`flex items-center gap-2 pb-2 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
              <Info className="w-5 h-5 text-emerald-500" />
              <h3 className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Information</h3>
            </div>
            <div className="space-y-2">
              {infoLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={onClose}
                    className={`group flex items-start gap-3 p-3 rounded-2xl transition-colors border ${
                      isDark
                        ? 'hover:bg-slate-800/60 border-transparent hover:border-slate-700'
                        : 'hover:bg-slate-50 border-transparent hover:border-slate-200'
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-black transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className={`text-sm font-semibold flex items-center gap-1 transition-colors ${
                        isDark ? 'text-slate-100 group-hover:text-emerald-400' : 'text-slate-900 group-hover:text-emerald-600'
                      }`}>
                        {item.name}
                        <ChevronRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Column 2: Legal & Store Policies */}
          <div className="space-y-4">
            <div className={`flex items-center gap-2 pb-2 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
              <ShieldCheck className="w-5 h-5 text-cyan-500" />
              <h3 className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Store Policies</h3>
            </div>
            <div className="space-y-1.5">
              {policyLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={onClose}
                    className={`group flex items-center justify-between p-2.5 rounded-xl transition-colors text-sm ${
                      isDark
                        ? 'hover:bg-slate-800/60 text-slate-300 hover:text-cyan-400'
                        : 'hover:bg-slate-50 text-slate-700 hover:text-cyan-600'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-slate-400 group-hover:text-cyan-500" />
                      <span>{item.name}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-500 group-hover:translate-x-0.5 transition-all" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Column 3: Help & Support */}
          <div className="space-y-4">
            <div className={`flex items-center gap-2 pb-2 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
              <HelpCircle className="w-5 h-5 text-amber-500" />
              <h3 className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Help & Support</h3>
            </div>
            <div className="space-y-2">
              {supportLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={onClose}
                    className={`group flex items-center justify-between p-3 rounded-2xl border text-sm font-medium transition-all ${
                      isDark
                        ? 'bg-slate-800/40 hover:bg-slate-800 border-slate-800 text-slate-200 hover:border-amber-500/30'
                        : 'bg-slate-50 hover:bg-white border-slate-200 text-slate-800 hover:border-amber-500/40 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-amber-500" />
                      <span>{item.name}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                  </Link>
                );
              })}

              <div className={`p-4 mt-2 rounded-2xl border ${
                isDark
                  ? 'bg-gradient-to-br from-emerald-950/40 to-slate-900 border-emerald-500/20'
                  : 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200'
              }`}>
                <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Free Shipping</p>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Get free express 24-48h dispatch on all orders above ₹999 across India.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
