export const initialProducts = [
  {
    _id: "prod_01_whey_gold",
    id: "prod_01_whey_gold",
    name: "Optimum Nutrition (ON) Gold Standard 100% Whey Protein Powder",
    brand: "Optimum Nutrition",
    category: "Protein",
    price: 3899,
    discountPrice: 3199,
    discountPercentage: 18,
    stock: 25,
    lowStockThreshold: 5,
    status: "in_stock",
    rating: 4.9,
    reviews: 1420,
    images: [
      "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1546483875-ad9014c88eba?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80"
    ],
    variants: ["2 lbs (907g)", "5 lbs (2.27kg)", "10 lbs (4.54kg)"],
    flavours: ["Double Rich Chocolate", "Delicious Strawberry", "Vanilla Ice Cream", "Mocha Cappuccino"],
    description: "The World's #1 selling whey protein. Delivering 24g of high-grade whey protein isolate and concentrate matrix, with 5.5g naturally occurring BCAAs and 4g Glutamine per serving.",
    ingredients: "Protein Blend (Whey Protein Isolate, Whey Protein Concentrate, Whey Peptides), Cocoa, Natural and Artificial Flavors, Lecithin, Acesulfame Potassium, Aminogen, Sucralose.",
    nutritionalInfo: {
      "Protein": "24g",
      "BCAAs": "5.5g",
      "Glutamine": "4g",
      "Calories": "120 kcal",
      "Carbohydrates": "3g",
      "Fat": "1.5g"
    }
  },
  {
    _id: "prod_02_mb_biozyme",
    id: "prod_02_mb_biozyme",
    name: "MuscleBlaze Biozyme Performance Whey Protein (Clinically Tested)",
    brand: "MuscleBlaze",
    category: "Protein",
    price: 3499,
    discountPrice: 2899,
    discountPercentage: 17,
    stock: 14,
    lowStockThreshold: 5,
    status: "in_stock",
    rating: 4.8,
    reviews: 950,
    images: [
      "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1546483875-ad9014c88eba?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80"
    ],
    variants: ["1 kg (2.2 lbs)", "2 kg (4.4 lbs)", "4 kg (8.8 lbs)"],
    flavours: ["Rich Chocolate", "Magical Mango", "Cafe Mocha", "Kesar Pista"],
    description: "India's first clinically tested whey protein with Enhanced Absorption Formula (EAF®), delivering 50% higher protein absorption and 60% higher BCAA absorption.",
    ingredients: "Whey Protein Concentrate, Whey Protein Isolate, Cocoa Powder, MB Enzyme Matrix, Nature Identical Flavoring Substances.",
    nutritionalInfo: {
      "Protein": "25g",
      "EAA": "11.75g",
      "BCAAs": "5.51g",
      "Calories": "130 kcal",
      "Carbohydrates": "2.8g",
      "Fat": "1.8g"
    }
  },
  {
    _id: "prod_03_creatine_mono",
    id: "prod_03_creatine_mono",
    name: "MuscleTech Platinum 100% Micronized Creatine Monohydrate",
    brand: "MuscleTech",
    category: "Creatine",
    price: 1299,
    discountPrice: 949,
    discountPercentage: 27,
    stock: 4,
    lowStockThreshold: 5,
    status: "low_stock",
    rating: 4.9,
    reviews: 620,
    images: [
      "https://images.unsplash.com/photo-1546483875-ad9014c88eba?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80"
    ],
    variants: ["250g (83 Servings)", "400g (133 Servings)"],
    flavours: ["Unflavoured"],
    description: "Ultra-pure micronized creatine powder that fuels your muscles with the world's most researched form of micronized creatine for explosive power and strength gains.",
    ingredients: "100% Pure HPLC-Tested Micronized Creatine Monohydrate.",
    nutritionalInfo: {
      "Creatine Monohydrate": "3g",
      "Calories": "0 kcal",
      "Sugar": "0g"
    }
  },
  {
    _id: "prod_04_c4_preworkout",
    id: "prod_04_c4_preworkout",
    name: "Cellucor C4 Original Explosive Pre-Workout Energy Powder",
    brand: "Cellucor",
    category: "Pre-Workout",
    price: 2499,
    discountPrice: 1999,
    discountPercentage: 20,
    stock: 18,
    lowStockThreshold: 5,
    status: "in_stock",
    rating: 4.7,
    reviews: 480,
    images: [
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1546483875-ad9014c88eba?w=800&auto=format&fit=crop&q=80"
    ],
    variants: ["30 Servings (180g)", "60 Servings (390g)"],
    flavours: ["Icy Blue Razz", "Fruit Punch", "Watermelon", "Cherry Limenade"],
    description: "America's #1 Selling Pre-Workout. Formulated with 150mg Caffeine, 1.6g CarnoSyn Beta-Alanine, and 1g Creatine Nitrate for explosive energy, pumps, and focus.",
    ingredients: "CarnoSyn Beta-Alanine, Micronized Creatine, Arginine AKG, Caffeine Anhydrous, N-Acetyl L-Tyrosine, Velvet Bean Seed Extract.",
    nutritionalInfo: {
      "Caffeine": "150mg",
      "Beta-Alanine": "1.6g",
      "Arginine AKG": "1g",
      "Calories": "5 kcal"
    }
  },
  {
    _id: "prod_05_mass_gainer",
    id: "prod_05_mass_gainer",
    name: "Optimum Nutrition (ON) Serious Mass High Protein Weight Gainer",
    brand: "Optimum Nutrition",
    category: "Mass Gainer",
    price: 4299,
    discountPrice: 3599,
    discountPercentage: 16,
    stock: 12,
    lowStockThreshold: 4,
    status: "in_stock",
    rating: 4.8,
    reviews: 1100,
    images: [
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1546483875-ad9014c88eba?w=800&auto=format&fit=crop&q=80"
    ],
    variants: ["3 lbs (1.36kg)", "6 lbs (2.72kg)", "12 lbs (5.44kg)"],
    flavours: ["Chocolate", "Banana", "Vanilla", "Chocolate Peanut Butter"],
    description: "The ultimate weight gain formula. Providing 1,250 calories per serving with 50g of blended protein to support serious muscle-building goals.",
    ingredients: "Maltodextrin, Protein Blend (Whey Protein Concentrate, Calcium Caseinate, Egg Albumin), Cocoa, Natural and Artificial Flavors, Vitamin and Mineral Blend.",
    nutritionalInfo: {
      "Calories": "1250 kcal",
      "Protein": "50g",
      "Carbohydrates": "252g",
      "Vitamins & Minerals": "25 Types"
    }
  },
  {
    _id: "prod_06_iso100",
    id: "prod_06_iso100",
    name: "Dymatize ISO 100 Hydrolyzed 100% Whey Isolate Protein",
    brand: "Dymatize",
    category: "Protein",
    price: 7999,
    discountPrice: 6899,
    discountPercentage: 14,
    stock: 8,
    lowStockThreshold: 3,
    status: "in_stock",
    rating: 4.95,
    reviews: 820,
    images: [
      "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1546483875-ad9014c88eba?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80"
    ],
    variants: ["5 lbs (2.3kg)"],
    flavours: ["Gourmet Chocolate", "Fudge Brownie", "Cookies & Cream", "Peanut Butter"],
    description: "Ultra-fast absorbing hydrolyzed 100% whey isolate. Scientifically formulated with 25g Hydrolyzed Whey and 5.5g BCAAs per serving with zero fat and under 1g sugar.",
    ingredients: "Hydrolyzed Whey Protein Isolate, Whey Protein Isolate, Natural and Artificial Flavors, Cocoa, Salt, Soy Lecithin, Sucralose.",
    nutritionalInfo: {
      "Protein": "25g",
      "BCAAs": "5.5g",
      "Leucine": "2.6g",
      "Calories": "120 kcal",
      "Carbohydrates": "2g",
      "Fat": "0.5g"
    }
  }
];
