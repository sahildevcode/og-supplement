import React from 'react';
import HeroCarousel from '../components/home/HeroCarousel';
import CategorySection from '../components/home/CategorySection';
import BrandTrust from '../components/home/BrandTrust';
import HomeBestSellers from '../components/home/HomeBestSellers';
import FeaturedSection from '../components/home/FeaturedSection';
import HomeTransformations from '../components/home/HomeTransformations';
import SeoPopularSearches from '../components/home/SeoPopularSearches';
import ProductQuickView from '../components/product/ProductQuickView';
import { useTheme } from '../context/ThemeContext';

export default function Home() {
  const { isDark } = useTheme();
  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <HeroCarousel />
      <BrandTrust />
      <CategorySection />
      <HomeBestSellers />
      <FeaturedSection />
      <HomeTransformations />
      <SeoPopularSearches />
      <ProductQuickView />
    </div>
  );
}
