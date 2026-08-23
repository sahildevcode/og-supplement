import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Mail, PhoneCall } from 'lucide-react';

const faqs = [
  {
    q: "How do I verify the authenticity of my supplement?",
    a: "Every product shipped by ApexNutra carries a tamper-proof holographic brand seal and a scratch-off authentication code. You can verify the code on the manufacturer's official portal (e.g., Optimum Nutrition Authenticate app, MuscleBlaze SMS verification)."
  },
  {
    q: "How fast is delivery and dispatch?",
    a: "All confirmed orders are packed and dispatched from our fulfillment center within 24 hours. Metro cities typically receive delivery within 24-48 hours, while other regional locations take 2-4 business days."
  },
  {
    q: "What is your return and replacement policy?",
    a: "We offer a 7-day hassle-free replacement or full refund if you receive a damaged package, broken seal, expired batch, or incorrect flavor. Simply contact us with your order ID and unboxing photo."
  },
  {
    q: "Are all products tested for banned substances?",
    a: "Yes. Our proteins, pre-workouts, and amino formulations are compliant with FSSAI regulations and Informed-Choice certifications, free from anabolic steroids or unlisted stims."
  },
  {
    q: "What are the shipping charges?",
    a: "We offer FREE Express Shipping on all orders above ₹999 across India. For orders below ₹999, a nominal shipping fee of ₹99 is applied at checkout."
  },
  {
    q: "Can I cancel my order after placing it?",
    a: "Yes, orders can be cancelled directly before they are dispatched for shipping. Once cancelled, your refund will be processed immediately."
  }
];

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState(0);

  return (
    <div className="min-h-screen bg-slate-950 py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        <div className="text-center space-y-3">
          <span className="text-xs font-black uppercase tracking-widest text-emerald-400">Help & Support</span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">Frequently Asked Questions</h1>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Find answers to common questions regarding supplement authenticity, shipping times, returns, and dosage.
          </p>
        </div>

        {/* Accordions */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden transition-colors"
            >
              <button
                onClick={() => setOpenIdx(openIdx === idx ? -1 : idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-slate-100 hover:text-emerald-400 transition-colors"
              >
                <span className="text-sm sm:text-base flex items-center gap-3">
                  <HelpCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  {faq.q}
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${openIdx === idx ? 'rotate-180 text-emerald-400' : ''}`} />
              </button>
              {openIdx === idx && (
                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 animate-in fade-in duration-200">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Strip */}
        <div className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <h3 className="text-lg font-bold text-white">Still have questions?</h3>
            <p className="text-xs text-slate-400 mt-1">Our certified sports nutrition specialists are ready to assist you.</p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="mailto:support@apexnutra.com"
              className="px-5 py-3 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-white flex items-center gap-2 border border-slate-700 transition-colors"
            >
              <Mail className="w-4 h-4 text-emerald-400" />
              support@apexnutra.com
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
