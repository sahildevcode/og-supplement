import React from 'react';
import { RotateCcw, CheckCircle2, AlertTriangle, Video, Clock, ShieldX, PackageCheck } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function ReturnPolicy() {
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen py-12 sm:py-16 transition-colors duration-300 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className={`border-b pb-6 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <span className="text-xs font-black uppercase tracking-widest text-emerald-500">Customer Protection & Quality</span>
          <h1 className={`text-3xl sm:text-4xl font-black tracking-tight mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Return & Replacement Policy
          </h1>
          <p className="text-xs text-slate-400 mt-1">3-Day Return & Free Replacement Guarantee (Strictly No Cash Refunds)</p>
        </div>

        {/* Important Banner: No Refund, Replacement Only */}
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3.5">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs sm:text-sm">
            <p className="font-black text-amber-400 uppercase tracking-wider">Strict Replacement Only Policy — No Money Refunds</p>
            <p className="text-slate-300 leading-relaxed">
              We provide <strong>100% Free Product Replacement</strong> for verified damaged or spoiled supplements. <strong>Cash/bank refunds are NOT available</strong> under any circumstances. If your return request is approved, a fresh, brand-new replacement product will be shipped to you immediately.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 text-sm leading-relaxed ${
          isDark ? 'bg-slate-900/80 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700 shadow-sm'
        }`}>
          
          {/* Rule 1: 3-Day Window */}
          <section className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-500" />
              <h2 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                1. 3-Day Return Window (Mandatory Timeline)
              </h2>
            </div>
            <p>
              Return and replacement requests must be registered within strictly <strong>3 days (72 hours)</strong> from the date of package delivery. Any request received after 3 days cannot be accepted due to perishable sports nutrition guidelines.
            </p>
          </section>

          {/* Rule 2: Mandatory Unboxing Video */}
          <section className="space-y-2">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-cyan-400" />
              <h2 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                2. Mandatory Unboxing Video Requirement
              </h2>
            </div>
            <p>
              To claim a return or replacement, you <strong>MUST record an uncut, continuous unboxing video</strong> starting from when you first receive and open the parcel:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400 text-xs sm:text-sm">
              <li>The video must clearly show the unopened outer courier packaging and the printed shipping label with your address & tracking number.</li>
              <li>The unboxing video must be continuous without cuts, pauses, or video edits.</li>
              <li>The defect (spoiled powder, damaged tub, broken seal, or leaked packaging) must be clearly shown on camera in the video.</li>
              <li>Requests without a valid unboxing video recorded at opening cannot be processed.</li>
            </ul>
          </section>

          {/* Rule 3: Valid Defect / Spoiled Supplement */}
          <section className="space-y-2">
            <div className="flex items-center gap-2">
              <PackageCheck className="w-4 h-4 text-emerald-400" />
              <h2 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                3. What Qualifies for a Return & Replacement?
              </h2>
            </div>
            <p>
              Return and replacement is accepted strictly under the following conditions:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400 text-xs sm:text-sm">
              <li><strong>Spoiled or Defective Protein:</strong> The supplement powder is clumpy, foul-smelling, spoiled, or contaminated.</li>
              <li><strong>Transit Damage:</strong> The tub, pouch, or seal was completely punctured, broken, or leaking during shipping.</li>
              <li><strong>Wrong Item Received:</strong> The product received differs in brand, flavor, or weight from what was ordered.</li>
              <li><strong>Expired Item:</strong> The product received is past its printed expiry date.</li>
            </ul>
          </section>

          {/* Rule 4: Non-Returnable Scenarios */}
          <section className="space-y-2">
            <div className="flex items-center gap-2">
              <ShieldX className="w-4 h-4 text-rose-400" />
              <h2 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                4. What Does NOT Qualify?
              </h2>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-slate-400 text-xs sm:text-sm">
              <li>Personal taste, flavor preference, or mixability dislikes.</li>
              <li>Tubs opened or consumed without a defect unboxing video.</li>
              <li>Requests submitted after 3 days of delivery.</li>
            </ul>
          </section>

          {/* How to Initiate */}
          <section className="space-y-2 pt-2 border-t border-slate-800">
            <h2 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              5. How to Initiate a Return / Replacement
            </h2>
            <p>
              To initiate a claim within 3 days of delivery, please contact our support team at{' '}
              <a href="mailto:support@ogsupplement.com" className="text-emerald-400 font-bold hover:underline">
                support@ogsupplement.com
              </a>{' '}
              or via WhatsApp support. Attach your <strong>Order ID</strong>, a short explanation of the defect, and the <strong>original unboxing video</strong>. Once verified, our team will dispatch your free replacement within 24–48 hours!
            </p>
          </section>

        </div>

      </div>
    </div>
  );
}
