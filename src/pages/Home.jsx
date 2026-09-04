import React from 'react';
import HeroCarousel from '../components/home/HeroCarousel';
import CategorySection from '../components/home/CategorySection';
import BrandTrust from '../components/home/BrandTrust';
import FeaturedSection from '../components/home/FeaturedSection';
import SeoPopularSearches from '../components/home/SeoPopularSearches';
import ProductQuickView from '../components/product/ProductQuickView';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950">
      <HeroCarousel />
      <BrandTrust />
      <CategorySection />
      <FeaturedSection />
      <SeoPopularSearches />
      <ProductQuickView />
    </div>
  );
}
