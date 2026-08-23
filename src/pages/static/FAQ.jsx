import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Mail, MessageSquare } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function FAQ() {
  const { isDark } = useTheme();
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: "How can I verify the authenticity of my supplement?",
      a: "Every product shipped by OG-Supplement carries a tamper-proof holographic brand seal and a scratch-off authentication code. You can verify the code on the manufacturer's official portal (e.g., Optimum Nutrition Authenticate app, MuscleBlaze SMS verification)."
    },
    {
      q: "How fast is shipping and order dispatch?",
      a: "All orders placed before 3:00 PM IST are packed and dispatched on the same business day. Delivery takes 24-48 hours for metro cities and 2-4 business days for other regional pincodes across India."
    },
    {
      q: "What is your return and refund policy?",
      a: "We offer a 7-Day Hassle-Free Return Policy. If your package arrives damaged, unsealed, or mismatched, contact us immediately and we will arrange a free reverse pickup and 100% replacement or refund."
    },
    {
      q: "Do you offer Cash on Delivery (COD)?",
      a: "Yes, Cash on Delivery is available across 18,000+ pincodes in India with zero extra handling charges for orders above ₹999."
    },
    {
      q: "How does real-time stock and price synchronization work?",
      a: "OG-Supplement features a live WebSocket state engine. When our warehouse updates available inventory batches or price drops, your browser automatically updates without requiring a manual page refresh."
    }
  ];

  return (
    <div className={`min-h-screen py-12 sm:py-16 transition-colors duration-300 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto border border-amber-500/20">
            <HelpCircle className="w-6 h-6" />
          </div>
          <h1 className={`text-3xl sm:text-4xl font-black tracking-tight ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            Frequently Asked Questions
          </h1>
          <p className="text-sm text-slate-400">
            Answers to common questions about authenticity, shipping, returns and nutrition stacks
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`border rounded-2xl overflow-hidden transition-all ${
                  isOpen
                    ? 'border-emerald-500/50 bg-emerald-500/5'
                    : isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-white shadow-sm'
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base transition-colors"
                >
                  <span className={isDark ? 'text-slate-100' : 'text-slate-900'}>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-emerald-500 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                  <div className={`px-5 pb-5 text-xs sm:text-sm leading-relaxed border-t pt-3 ${
                    isDark ? 'text-slate-300 border-slate-800/80' : 'text-slate-600 border-slate-100'
                  }`}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still Have Questions Box */}
        <div className={`p-6 rounded-3xl border text-center space-y-3 ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Still need assistance?</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Our certified nutritionists and customer support agents are ready to help you 7 days a week.
          </p>
          <div className="pt-2 flex justify-center">
            <a
              href="mailto:support@ogsupplement.com"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 text-black shadow-lg shadow-emerald-950/40"
            >
              <Mail className="w-3.5 h-3.5" />
              support@ogsupplement.com
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
