import mongoose from 'mongoose';
import { isConnectedToMongo, localStore } from '../config/db.js';

export const defaultHeroSlides = [
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

const bannerSchema = new mongoose.Schema(
  {
    slides: {
      type: Array,
      default: defaultHeroSlides
    }
  },
  { timestamps: true }
);

const MongooseHeroBanner = mongoose.models.HeroBanner || mongoose.model('HeroBanner', bannerSchema);

export const HeroBanner = {
  async get() {
    if (isConnectedToMongo) {
      let doc = await MongooseHeroBanner.findOne();
      if (!doc) {
        doc = await MongooseHeroBanner.create({ slides: defaultHeroSlides });
      }
      return doc.slides && doc.slides.length > 0 ? doc.slides : defaultHeroSlides;
    }

    if (!localStore.heroSlides || !localStore.heroSlides.length) {
      localStore.heroSlides = [...defaultHeroSlides];
      localStore.save();
    }
    return localStore.heroSlides;
  },

  async update(newSlides) {
    if (isConnectedToMongo) {
      let doc = await MongooseHeroBanner.findOne();
      if (!doc) {
        doc = await MongooseHeroBanner.create({ slides: newSlides });
      } else {
        doc.slides = newSlides;
        await doc.save();
      }
      return doc.slides;
    }

    localStore.heroSlides = newSlides;
    localStore.save();
    return localStore.heroSlides;
  }
};
