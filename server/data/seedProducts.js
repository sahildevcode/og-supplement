export const initialProducts = [
  {
    name: "Gold Standard 100% Whey Protein",
    brand: "Optimum Nutrition",
    category: "Protein",
    description: "The world's best-selling whey protein powder delivers 24 grams of high-quality whey protein per serving with whey protein isolate as the primary ingredient. Promotes muscle building and post-workout recovery with 5.5g naturally occurring BCAAs.",
    price: 3899,
    discountPrice: 3199,
    discountPercentage: 18,
    images: [
      "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=800&auto=format&fit=crop&q=80"
    ],
    rating: 4.9,
    reviews: 1420,
    stock: 25,
    lowStockThreshold: 10,
    status: "in_stock",
    variants: ["1 kg (2.2 lbs)", "2 kg (4.4 lbs)", "4 kg (8.8 lbs)"],
    flavours: ["Double Rich Chocolate", "Vanilla Ice Cream", "Mocha Cappuccino", "Cookies & Cream"],
    ingredients: "Whey Protein Isolates, Whey Protein Concentrate, Whey Peptides, Cocoa, Natural & Artificial Flavors, Lecithin, Acesulfame Potassium, Aminogen, Lactase.",
    nutritionalInfo: {
      protein: "24g",
      bcaa: "5.5g",
      glutamine: "4g",
      calories: "120 kcal"
    }
  },
  {
    name: "Biozyme Performance Whey",
    brand: "MuscleBlaze",
    category: "Protein",
    description: "India's first clinically tested whey protein formulated with Enhanced Absorption Formula (EAF) ensuring 50% higher protein absorption and 60% higher BCAA absorption. Certified by Informed-Choice UK.",
    price: 3299,
    discountPrice: 2499,
    discountPercentage: 24,
    images: [
      "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=800&auto=format&fit=crop&q=80"
    ],
    rating: 4.8,
    reviews: 890,
    stock: 18,
    lowStockThreshold: 8,
    status: "in_stock",
    variants: ["1 kg", "2 kg", "4 kg"],
    flavours: ["Rich Chocolate", "Cafe Mocha", "Magical Mango", "Kesar Kulfi"],
    ingredients: "Whey Protein Concentrate, Whey Protein Isolate, Cocoa Solids, Enhanced Absorption Formula (Patent Pending), Emulsifier (INS 322).",
    nutritionalInfo: {
      protein: "25g",
      bcaa: "5.51g",
      glutamine: "4.38g",
      calories: "130 kcal"
    }
  },
  {
    name: "Creatine Monohydrate (Creapure)",
    brand: "Optimum Nutrition",
    category: "Creatine",
    description: "100% pure micronized creatine monohydrate supporting muscle size, strength, and explosive power during high-intensity training. Zero fillers, odorless, and effortlessly mixes with any beverage.",
    price: 1299,
    discountPrice: 999,
    discountPercentage: 23,
    images: [
      "https://images.unsplash.com/photo-1546483875-ad9014c88eba?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80"
    ],
    rating: 4.9,
    reviews: 2150,
    stock: 35,
    lowStockThreshold: 10,
    status: "in_stock",
    variants: ["250g (83 Servings)", "400g (133 Servings)", "500g (166 Servings)"],
    flavours: ["Unflavored", "Tangy Orange", "Fruit Punch"],
    ingredients: "100% Micronized Creatine Monohydrate (99.9% pure).",
    nutritionalInfo: {
      creatine: "3g / 5g",
      calories: "0 kcal",
      sugar: "0g"
    }
  },
  {
    name: "Creatine Monohydrate Micronized",
    brand: "MuscleBlaze",
    category: "Creatine",
    description: "Fast-absorbing micronized creatine formulation designed to replenish ATP levels during intensive gym sessions, boost muscular endurance, and enhance muscle cell volumization.",
    price: 899,
    discountPrice: 699,
    discountPercentage: 22,
    images: [
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80"
    ],
    rating: 4.7,
    reviews: 640,
    stock: 12,
    lowStockThreshold: 10,
    status: "in_stock",
    variants: ["100g", "250g", "400g"],
    flavours: ["Unflavored", "Blueberry Rush"],
    ingredients: "Pure Micronized Creatine Monohydrate.",
    nutritionalInfo: {
      creatine: "3g",
      calories: "0 kcal",
      carbs: "0g"
    }
  },
  {
    name: "NitroTech 100% Whey Gold",
    brand: "MuscleTech",
    category: "Protein",
    description: "Ultra-pure whey protein isolate and peptides engineered for accelerated lean muscle growth, superior strength gains, and instant mixability. Micro-filtered to remove fats and lactose.",
    price: 4599,
    discountPrice: 3699,
    discountPercentage: 20,
    images: [
      "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=800&auto=format&fit=crop&q=80"
    ],
    rating: 4.8,
    reviews: 512,
    stock: 9,
    lowStockThreshold: 10,
    status: "low_stock",
    variants: ["2.2 lbs", "5 lbs"],
    flavours: ["Double Rich Chocolate", "French Vanilla", "Strawberry"],
    ingredients: "Whey Peptides, Whey Protein Isolate, Whey Protein Isolate 97%, Natural and Artificial Flavors, Soy Lecithin.",
    nutritionalInfo: {
      protein: "24g",
      bcaa: "5.5g",
      glutamine: "4g",
      calories: "120 kcal"
    }
  },
  {
    name: "Super Mass Gainer High Calorie Complex",
    brand: "Dymatize",
    category: "Mass Gainer",
    description: "Premium high-calorie muscle builder packed with 52g protein and 1280 calories per serving. Loaded with 17 vitamins and minerals, BCAAs, and digestive enzymes for rapid bulking and strength.",
    price: 4899,
    discountPrice: 3999,
    discountPercentage: 18,
    images: [
      "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=800&auto=format&fit=crop&q=80"
    ],
    rating: 4.7,
    reviews: 730,
    stock: 15,
    lowStockThreshold: 5,
    status: "in_stock",
    variants: ["6 lbs (2.7 kg)", "12 lbs (5.4 kg)"],
    flavours: ["Gourmet Vanilla", "Rich Chocolate", "Cookies & Cream"],
    ingredients: "Maltodextrin, Dymatize Complex Protein Blend (Whey Protein Isolate, Whey Protein Concentrate, Calcium Caseinate, Egg Albumin), Cocoa, Vitamin & Mineral Blend.",
    nutritionalInfo: {
      protein: "52g",
      calories: "1280 kcal",
      carbs: "252g",
      bcaa: "10.7g"
    }
  },
  {
    name: "C4 Original Pre-Workout",
    brand: "Cellucor",
    category: "Pre-Workout",
    description: "Legendary pre-workout energy formula with 150mg caffeine, CarnoSyn Beta-Alanine, and Creatine Nitrate for explosive energy, laser-sharp focus, and muscular pumps that drive maximum reps.",
    price: 2499,
    discountPrice: 1999,
    discountPercentage: 20,
    images: [
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80"
    ],
    rating: 4.8,
    reviews: 1890,
    stock: 22,
    lowStockThreshold: 10,
    status: "in_stock",
    variants: ["30 Servings", "60 Servings"],
    flavours: ["Icy Blue Razz", "Fruit Punch", "Watermelon", "Cherry Limeade"],
    ingredients: "CarnoSyn Beta-Alanine, Micronized Creatine Monohydrate, Arginine Alpha-Ketoglutarate, Caffeine Anhydrous, N-Acetyl-L-Tyrosine, Velvet Bean Seed Extract.",
    nutritionalInfo: {
      caffeine: "150mg",
      betaAlanine: "1.6g",
      arginineAKG: "1g"
    }
  },
  {
    name: "Opti-Men Daily Multivitamin & Immunity",
    brand: "Optimum Nutrition",
    category: "Vitamins",
    description: "High-potency multivitamin complex with 75+ active ingredients in 4 specialized performance blends. Supports cellular energy, immunity, muscle synthesis, and overall peak vitality.",
    price: 1899,
    discountPrice: 1499,
    discountPercentage: 21,
    images: [
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80"
    ],
    rating: 4.9,
    reviews: 1120,
    stock: 4,
    lowStockThreshold: 10,
    status: "low_stock",
    variants: ["90 Tablets (30-day)", "150 Tablets (50-day)"],
    flavours: ["Unflavored Tablets"],
    ingredients: "Vitamin A, Vitamin C, Vitamin D, Zinc, Magnesium, Amino Blend (L-Arginine, L-Glutamine, L-Leucine), Phyto Blend, Enzy Blend.",
    nutritionalInfo: {
      vitamins: "25 Key Vitamins & Minerals",
      aminoAcids: "1g Free-Form Blend",
      antioxidants: "Phyto Men Complex"
    }
  },
  {
    name: "High-Protein Energy Bar (Pack of 6)",
    brand: "MuscleBlaze",
    category: "Protein Bars",
    description: "Delicious chocolate fudge 20g protein snack with zero added sugar and 7g dietary fiber. Perfect on-the-go fuel for busy athletes, gym enthusiasts, and clean-eating lifestyles.",
    price: 750,
    discountPrice: 599,
    discountPercentage: 20,
    images: [
      "https://images.unsplash.com/photo-1622484216258-6927bf791331?w=800&auto=format&fit=crop&q=80"
    ],
    rating: 4.6,
    reviews: 410,
    stock: 0,
    lowStockThreshold: 10,
    status: "out_of_stock",
    variants: ["Pack of 6", "Pack of 12"],
    flavours: ["Choco Delight", "Cookies & Cream", "Almond Crunch"],
    ingredients: "Protein Blend (Whey Protein Concentrate, Soy Protein Isolate), Dark Chocolate, Almonds, Dietary Fiber, Glycerin.",
    nutritionalInfo: {
      protein: "20g",
      fiber: "7g",
      sugar: "0g Added Sugar",
      calories: "220 kcal"
    }
  },
  {
    name: "BCAA Pro Essential Amino Energy",
    brand: "MuscleBlaze",
    category: "Supplements",
    description: "Ideal 2:1:1 ratio of Leucine, Isoleucine, and Valine with added Electrolytes (Sodium & Potassium) for intra-workout muscle fatigue prevention, hydration, and speed recovery.",
    price: 1599,
    discountPrice: 1199,
    discountPercentage: 25,
    images: [
      "https://images.unsplash.com/photo-1546483875-ad9014c88eba?w=800&auto=format&fit=crop&q=80"
    ],
    rating: 4.8,
    reviews: 790,
    stock: 30,
    lowStockThreshold: 10,
    status: "in_stock",
    variants: ["250g (33 Servings)", "450g (60 Servings)"],
    flavours: ["Watermelon Splash", "Green Apple", "Pineapple Breeze"],
    ingredients: "L-Leucine, L-Isoleucine, L-Valine, Citric Acid, Electrolyte Blend (Potassium Chloride, Sodium Chloride), Sucralose.",
    nutritionalInfo: {
      bcaa: "7g (2:1:1)",
      glutamine: "2.5g",
      electrolytes: "1100mg"
    }
  }
];
