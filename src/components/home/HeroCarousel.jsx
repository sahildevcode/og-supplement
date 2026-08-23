import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Zap, ShieldCheck, Flame, Sparkles } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { useTheme } from '../../context/ThemeContext';

const slides = [
  {
    id: 1,
    category: "Protein",
    tagline: "CLINICALLY PROVEN 100% PURE ISOLATE",
    title: "Unleash Maximum Muscle Growth",
    subtitle: "Engineered with 25g ultra-filtered pure whey protein and 5.5g BCAAs per scoop. Instant absorption for rapid post-workout hypertrophy.",
    cta: "Shop Whey Protein",
    image: "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=900&auto=format&fit=crop&q=80",
    badge: "Best Seller 2026",
    badgeColor: "from-emerald-500 to-teal-400",
    discount: "Flat 20% OFF",
    gradientDark: "from-emerald-950/70 via-slate-900/90 to-slate-950",
    gradientLight: "from-emerald-100/80 via-slate-50 to-white"
  },
  {
    id: 2,
    category: "Creatine",
    tagline: "CREAPURE® GERMAN MICRONIZED FORMULA",
    title: "Explosive Strength & ATP Power",
    subtitle: "Zero fillers, zero bloat. Scientifically shown to boost 1-rep max strength by 15% and volumize muscle cellular hydration.",
    cta: "Explore Micronized Creatine",
    image: "https://images.unsplash.com/photo-1546483875-ad9014c88eba?w=900&auto=format&fit=crop&q=80",
    badge: "Lab Verified Pure",
    badgeColor: "from-cyan-500 to-blue-500",
    discount: "Starting @ ₹699",
    gradientDark: "from-blue-950/70 via-slate-900/90 to-slate-950",
    gradientLight: "from-cyan-100/80 via-slate-50 to-white"
  },
  {
    id: 3,
    category: "Pre-Workout",
    tagline: "HIGH-STIMULANT FOCUS & VEIN PUMPS",
    title: "Crush Your Heaviest Sets",
    subtitle: "Loaded with 300mg Caffeine, 3.2g Beta-Alanine, and 6g L-Citrulline for extreme vasodilation and unstoppable workout endurance.",
    cta: "Ignite Pre-Workouts",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=900&auto=format&fit=crop&q=80",
    badge: "Intense Energy",
    badgeColor: "from-amber-500 to-orange-500",
    discount: "Free Shaker Bottle",
    gradientDark: "from-amber-950/60 via-slate-900/90 to-slate-950",
    gradientLight: "from-amber-100/80 via-slate-50 to-white"
  },
  {
    id: 4,
    category: "Mass Gainer",
    tagline: "HIGH-CALORIE CLEAN BULKING COMPLEX",
    title: "1280 Calories & 52g Protein",
    subtitle: "Formulated for hardgainers wanting solid, quality lean mass without empty sugar spikes. Packed with 17 essential micronutrients.",
    cta: "Shop Mass Gainers",
    image: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=900&auto=format&fit=crop&q=80",
    badge: "Bulking Essential",
    badgeColor: "from-purple-500 to-indigo-500",
    discount: "Extra 5% Bulk Discount",
    gradientDark: "from-purple-950/60 via-slate-900/90 to-slate-950",
    gradientLight: "from-purple-100/80 via-slate-50 to-white"
  }
];

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const { setSelectedCategory } = useProducts();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isPaused]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleCtaClick = (category) => {
    setSelectedCategory(category);
    navigate('/products');
  };

  const active = slides[currentSlide];

  return (
    <section
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`relative w-full overflow-hidden border-b transition-colors duration-500 ${
        isDark ? 'bg-slate-950 border-slate-800/80' : 'bg-white border-slate-200'
      }`}
    >
      <div className={`relative min-h-[520px] lg:min-h-[600px] bg-gradient-to-r ${
        isDark ? active.gradientDark : active.gradientLight
      } transition-all duration-1000 flex items-center`}>
        
        {/* Subtle Ambient Background Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left scroll-reveal reveal-active">
              
              {/* Badge & Discount Tag */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r ${active.badgeColor} text-black shadow-md`}>
                  <Sparkles className="w-3.5 h-3.5 inline mr-1" />
                  {active.badge}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  isDark ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30' : 'text-emerald-700 bg-emerald-100 border border-emerald-300'
                }`}>
                  {active.discount}
                </span>
              </div>

              {/* Tagline */}
              <p className={`text-xs sm:text-sm font-extrabold tracking-widest uppercase ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}>
                {active.tagline}
              </p>

              {/* Headline */}
              <h1 className={`text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                {active.title}
              </h1>

              {/* Subtitle */}
              <p className={`text-sm sm:text-base max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal ${
                isDark ? 'text-slate-300' : 'text-slate-600'
              }`}>
                {active.subtitle}
              </p>

              {/* CTA & Trust Bullet */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => handleCtaClick(active.category)}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-sm text-black bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 shadow-xl shadow-emerald-950/60 transform hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4 fill-black" />
                  {active.cta}
                </button>

                <Link
                  to="/products"
                  className={`w-full sm:w-auto px-6 py-4 rounded-2xl font-bold text-sm border transition-colors text-center ${
                    isDark
                      ? 'text-slate-200 hover:text-white bg-slate-900/80 hover:bg-slate-800 border-slate-700/80'
                      : 'text-slate-800 hover:text-slate-900 bg-white hover:bg-slate-100 border-slate-300 shadow-sm'
                  }`}
                >
                  View All Products
                </Link>
              </div>

              {/* Mini Guarantees */}
              <div className={`pt-4 flex items-center justify-center lg:justify-start gap-6 text-xs font-medium ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>100% Authentic Brand Guarantee</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span>Lab Tested Purity</span>
                </div>
              </div>

            </div>

            {/* Right Hero Image Column with GSAP/CSS animations */}
            <div className="lg:col-span-5 flex items-center justify-center relative scroll-reveal-scale reveal-active">
              <div className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 flex items-center justify-center">
                
                {/* Glow ring */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-500/20 to-cyan-500/10 blur-3xl" />
                
                <img
                  key={active.id}
                  src={active.image}
                  alt={active.title}
                  className="relative z-10 max-h-full max-w-full object-contain filter drop-shadow-[0_20px_50px_rgba(16,185,129,0.25)] transition-all duration-700 animate-in zoom-in-95 hover:scale-105"
                />
              </div>
            </div>

          </div>
        </div>

        {/* Carousel Arrow Controls */}
        <button
          onClick={prevSlide}
          className={`absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full border backdrop-blur-md transition-all shadow-xl ${
            isDark
              ? 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-700/60'
              : 'bg-white/80 hover:bg-white text-slate-700 hover:text-slate-900 border-slate-200 shadow-md'
          }`}
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={nextSlide}
          className={`absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full border backdrop-blur-md transition-all shadow-xl ${
            isDark
              ? 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-700/60'
              : 'bg-white/80 hover:bg-white text-slate-700 hover:text-slate-900 border-slate-200 shadow-md'
          }`}
          aria-label="Next Slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Dot Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentSlide === idx
                  ? 'w-8 bg-emerald-500 shadow-md shadow-emerald-500/50'
                  : isDark ? 'w-2 bg-slate-700 hover:bg-slate-500' : 'w-2 bg-slate-300 hover:bg-slate-400'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
