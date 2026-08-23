import React from 'react';
import { ShieldCheck, Lock } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function PrivacyPolicy() {
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen py-12 sm:py-16 transition-colors duration-300 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className={`border-b pb-6 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <span className="text-xs font-black uppercase tracking-widest text-emerald-500">Legal Policies</span>
          <h1 className={`text-3xl sm:text-4xl font-black tracking-tight mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Privacy Policy
          </h1>
          <p className="text-xs text-slate-400 mt-1">Effective Date: January 1, 2026</p>
        </div>

        {/* Content */}
        <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 text-sm leading-relaxed ${
          isDark ? 'bg-slate-900/80 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700 shadow-sm'
        }`}>
          <section className="space-y-2">
            <h2 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>1. Information We Collect</h2>
            <p>
              When you purchase sports nutrition products or register on OG-Supplement, we collect personal information such as your name, shipping address, contact telephone number, and email address. This information is used strictly to process orders and provide delivery updates.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>2. How We Protect Your Data</h2>
            <p>
              All customer sessions and payment transactions are secured through 256-Bit SSL encryption. We do not store raw credit card numbers or UPI MPIN credentials on our servers.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>3. Third-Party Disclosures</h2>
            <p>
              We only share shipping addresses with authorized courier logistics partners (e.g. BlueDart, Delhivery) to fulfill physical dispatch of your supplement orders. We will never sell or rent your personal information to third-party advertisers.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>4. Contacting the Privacy Officer</h2>
            <p>
              If you have any questions regarding your data or wish to delete your account profile, please contact our compliance desk at{' '}
              <a href="mailto:privacy@ogsupplement.com" className="text-emerald-500 font-semibold hover:underline">
                privacy@ogsupplement.com
              </a>.
            </p>
          </section>
        </div>

      </div>
    </div>
  );
}
