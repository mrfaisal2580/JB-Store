/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, Review } from '../types';

export const CATEGORIES = [
  { id: 'watches', name: 'Watches Collection', description: 'Masterpieces of horological art, marrying ancestral complications with avant-garde design.' },
  { id: 'shoes', name: 'Shoes Collection', description: 'Finest Italian leather couture and modern silhouette sneakers crafted by hand.' },
  { id: 'jackets', name: 'Jackets Collection', description: 'Timeless outerwear silhouettes tailored from ultra-premium leather, cashmere and technical fabrics.' },
  { id: 'perfumes', name: 'Perfumes Collection', description: 'Rare private reserve fragrances blended with precious raw extractions.' }
];

export const MOCK_PRODUCTS: Product[] = [
  // --- WATCHES ---
  {
    id: 'w1',
    name: 'Royale Chronograph Skeleton',
    sku: 'JB-W-ROY-SKEL',
    category: 'watches',
    description: 'A structural masterpiece showcasing a fully skeletonized automatic movement. Encased in hand-polished 18k rose gold with an open-worked slate dial that reveals the mechanical heartbeat underneath.',
    details: [
      'Self-winding mechanical chronograph movement',
      '72-hour power reserve with twin barrels',
      'Bezel set with 40 baguette-cut white diamonds',
      'Hand-stitched black Mississippiensis alligator strap with deployment clasp',
      'Water resistant to 50 meters (165 feet)'
    ],
    specs: {
      'Movement': 'In-house Caliber JB-900 Skeleton',
      'Case Diameter': '41mm',
      'Thickness': '11.8mm',
      'Material': '18K Rose Gold',
      'Glass': 'Double Glareproofed Sapphire Crystal',
      'Jewels': '38 Rubies'
    },
    price: 38500,
    originalPrice: 42000,
    rating: 4.9,
    reviewsCount: 14,
    stock: 3,
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1200', // Gold luxury watch
      'https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&q=80&w=800', // Side details watch
      'https://images.unsplash.com/photo-1622434641406-a158123450f9?auto=format&fit=crop&q=80&w=800'  // Luxury desk watch
    ],
    colors: ['Rose Gold Noir', 'Titanium Silver'],
    featured: true,
    newArrival: true
  },
  {
    id: 'w2',
    name: 'Monolith Stealth Carbon',
    sku: 'JB-W-MON-STH',
    category: 'watches',
    description: 'Forged from high-performance carbon composite, the Monolith Stealth is designed for absolute durability and understated luxury. Featuring deep charcoal styling with brushed gold indices and luminous hands.',
    details: [
      'Ultra-lightweight forged carbon case',
      'Chronometer-certified high-frequency movement',
      'Matte black dial with 24k gold hand-finished indices',
      'Integrated tactile carbon fiber-infused rubber strap',
      'Scratch-resistant ceramic bezel insert'
    ],
    specs: {
      'Movement': 'Certified COSC Automatic Caliber 400',
      'Case Diameter': '43mm',
      'Thickness': '13.1mm',
      'Material': 'Forged Carbon Composite',
      'Glass': 'Scratch-Proof Matte Sapphire',
      'Water Resistance': '100m'
    },
    price: 18900,
    rating: 4.8,
    reviewsCount: 8,
    stock: 5,
    images: [
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=1200', // Smart/dark style
      'https://images.unsplash.com/photo-1622434641406-a158123450f9?auto=format&fit=crop&q=80&w=800'
    ],
    colors: ['Stealth Carbon', 'Brushed Steel'],
    bestSeller: true
  },
  {
    id: 'w3',
    name: 'Nautical Horizon GMT',
    sku: 'JB-W-NAU-GMT',
    category: 'watches',
    description: 'An tribute to high-seas exploration. Dual time zone capability housed in a maritime blue and gold custom dial. Ideal for the discerning global traveler.',
    details: [
      'GMT dual timezone tracking hand',
      'Bicolor deep marine blue and sand ceramic rotating bezel',
      'Indexes filled with high-intensity blue Super-LumiNova',
      'Brushed 904L stainless steel oyster bracelet',
      'Screw-down crown with triple waterproofing'
    ],
    specs: {
      'Movement': 'Dual-Time Zone Automatic GMT Caliber 3285',
      'Case Diameter': '40mm',
      'Thickness': '12.4mm',
      'Material': '904L Stainless Steel & 18K Yellow Gold',
      'Glass': 'Cyclops-lens Sapphire Crystal',
      'Power Reserve': '70 Hours'
    },
    price: 15400,
    originalPrice: 17500,
    rating: 4.7,
    reviewsCount: 22,
    stock: 1,
    images: [
      'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=1200', // Luxury sporty watch
      'https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&q=80&w=800'
    ],
    colors: ['Maritime Blue', 'Horizon Black']
  },

  // --- SHOES ---
  {
    id: 's1',
    name: 'Sartorial Oxford Chelsea Boot',
    sku: 'JB-S-OXF-CHEL',
    category: 'shoes',
    description: 'Designed in Milan, these boots represent the pinnacle of artisanal Italian cordwaining. Crafted from hand-burnished whole-grain calfskin leather, they present a sleek, flawless form with comfort stretch panels.',
    details: [
      '100% Selected whole-grain Italian calfskin',
      'Leather lining and memory cush-layered footbed',
      'Hand-painted patina with custom mahogany burnish',
      'Blake-stitched construction for lifetime recraftability',
      'Vibram rubber protective sole elements'
    ],
    specs: {
      'Origin': 'Handcrafted in Italy',
      'Sole Material': 'Leather & Vibram rubber inserts',
      'Inner Lining': 'Vegetable-tanned Calf leather',
      'Construction': 'Blake Welted'
    },
    price: 1250,
    originalPrice: 1500,
    rating: 4.9,
    reviewsCount: 31,
    stock: 9,
    images: [
      'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&q=80&w=1200', // Elegant dress boots
      'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&q=80&w=800'  // Detail shot leather
    ],
    sizes: ['41', '42', '43', '44', '45'],
    colors: ['Mahogany', 'Midnight Black', 'Rich Cognac'],
    featured: true,
    bestSeller: true
  },
  {
    id: 's2',
    name: 'AeroCouture Gold-Flaked Sneaker',
    sku: 'JB-S-AER-GLD',
    category: 'shoes',
    description: 'The ultimate hybrid of athletic agility and high couture. Featuring premium full-grain white nappa leather, a custom molded high-traction sole, and real hand-gilded 24k gold leaf foil accents across the branding and heel guard.',
    details: [
      'Italian nappa leather upper',
      'Hand-applied 24k gold leaf detailing',
      'Custom luxury logo metal laces crown',
      'Ergonomic memory latex insole with silver-ion antimicrobial thread',
      'Ships with tailored dustbags and premium cedar shoe trees'
    ],
    specs: {
      'Leather type': 'Nappa Calfskin',
      'Accent': 'Gilded 24K Gold Leaf',
      'Heel Rise': '3.2 cm',
      'Sizing': 'Fits true to size'
    },
    price: 950,
    rating: 4.6,
    reviewsCount: 16,
    stock: 12,
    images: [
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=1200', // Luxury sneaker
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=800'
    ],
    sizes: ['40', '41', '42', '43', '44'],
    colors: ['Platinum White & Gold', 'Carbon Black & Gold'],
    newArrival: true
  },

  // --- JACKETS ---
  {
    id: 'j1',
    name: 'Bespoke Obsidian Biker Shearling',
    sku: 'JB-J-OBS-SHR',
    category: 'jackets',
    description: 'A heavy leather masterpiece designed for cold latitudes. Constructed of thick premium full-grain lamb leather and backed by deep, naturally warm, shaved shearling wool in onyx black.',
    details: [
      'Outer: 100% Selected full-grain lamb skin leather',
      'Inner: Pure dense shaved sheep shearling wool lining',
      'Heavy-duty gunmetal double zipper pullers with custom monogram emboss',
      'Asymmetric closure styling with premium notched lapels',
      'Water and element resistant waxed protective outer coat'
    ],
    specs: {
      'Weight': '2.1 kg (Heavyweight)',
      'Hardware': 'Japanese YKK Excella zippers',
      'Pockets': '3 zippered outer, 2 buttoned inner safety',
      'Fit': 'Tailored Silhouette'
    },
    price: 2450,
    originalPrice: 2800,
    rating: 5.0,
    reviewsCount: 19,
    stock: 4,
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=1200', // Leather jacket on hanger
      'https://images.unsplash.com/photo-1521223890158-f9f7c3d5ded1?auto=format&fit=crop&q=80&w=800'  // Guy wearing leather jacket
    ],
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: ['Onyx Obsidian', 'Vintage Espresso'],
    featured: true
  },
  {
    id: 'j2',
    name: 'Metropolitan Travel Trench Coat',
    sku: 'JB-J-MET-TRN',
    category: 'jackets',
    description: 'A luxury water-repellent travel companion made of structured memory fiber and silk-lined backing. Perfect drape and structural shoulders offer a high-fashion, sharp contour in any climate.',
    details: [
      'Exclusive water-repellent structural cotton-silk blend memory fabric',
      'Full luxurious jacquard monogram interior lining',
      'Double-breasted button panel with natural horn buttons',
      'Removable belt with premium gold plated buckle accents',
      'Windproof collar tab with hidden throat latch'
    ],
    specs: {
      'Material': '65% Cotton, 35% Silk Memory-Tech Fiber',
      'Lining': '100% Cupro silk monogram',
      'Length': '105 cm (Mid-Calf)',
      'Care': 'Specialists dry clean only'
    },
    price: 1650,
    rating: 4.8,
    reviewsCount: 11,
    stock: 6,
    images: [
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=1200', // Premium coat on dummy
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=800'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Desert Sand', 'Midnight Navy'],
    bestSeller: true
  },

  // --- PERFUMES ---
  {
    id: 'p1',
    name: 'Privé Oud Royal Seduction',
    sku: 'JB-P-OUD-ROY',
    category: 'perfumes',
    description: 'A dark, deeply captivating fragrance crafted with wild Cambodian Oud, smoky incense, and sweet Madagascar vanilla extract. Truly an addictive sensory journey that commands presence and prestige.',
    details: [
      'Type: Extrait de Parfum (30% pure oil concentration)',
      'Top Notes: White Pear, Saffron, Bergamot Blossom',
      'Heart Notes: Cambodian Oud, Damask Red Rose, Amber Accord',
      'Base Notes: Madagascar Vanilla, Smoked Leather, Sandalwood Mysore',
      'Housed in a custom hand-molded crystal decanter with absolute gold heavy magnetic cap'
    ],
    specs: {
      'Volume': '100 ml (3.4 fl. oz.)',
      'Concentration': 'Extrait de Parfum',
      'Longevity': '14+ Hours (Beast Projection)',
      'Perfumer': 'Antoine Olivier'
    },
    price: 420,
    originalPrice: 495,
    rating: 4.9,
    reviewsCount: 45,
    stock: 8,
    images: [
      'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=1200', // Elegant perfume bottle
      'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=800'  // Luxury cologne setup
    ],
    scents: ['Private Reserve Oud'],
    featured: true,
    bestSeller: true
  },
  {
    id: 'p2',
    name: 'L’Ambre Blanc Elixir',
    sku: 'JB-P-AMB-BLN',
    category: 'perfumes',
    description: 'An airy, pristine fragrance reminiscent of a golden sun setting over fresh Alpine snow. Radiant amber crystalline weaves together with elegant white musk, powdery iris, and fresh cypress leaves.',
    details: [
      'Type: Eau de Parfum (18% oil concentration)',
      'Top Notes: Juniper Berry, Mint Crystalline, Calabrian Lemon',
      'Heart Notes: Florentine Iris, Ambergris, Soft Patchouli Oil',
      'Base Notes: White Musk, Virginia Cedarwood, Cashmeran Wool Accord',
      'Packaged inside beautiful lined velvet-trimmed jewelry style gift box'
    ],
    specs: {
      'Volume': '75 ml (2.5 fl. oz.)',
      'Concentration': 'Eau de Parfum',
      'Longevity': '8-10 Hours',
      'Gender Profile': 'Perfectly Unisex'
    },
    price: 360,
    rating: 4.5,
    reviewsCount: 23,
    stock: 14,
    images: [
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=1200', // High-end perfume
      'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=800'
    ],
    scents: ['Crystalline Ambergris', 'Nivalis Bloom'],
    newArrival: true
  }
];

export const MOCK_REVIEWS: Review[] = [
  {
    id: 'rev1',
    productId: 'w1',
    userName: 'Sir Reginald Hunt',
    userEmail: 'reginald.hunt@luxury-gild.uk',
    rating: 5,
    comment: 'An absolute masterpiece. The double sapphire is virtually invisible and the gold finishing shines beautifully under spotlights. A worthy addition to my collection.',
    date: '2026-05-18'
  },
  {
    id: 'rev2',
    productId: 'w1',
    userName: 'Elena Rostova',
    userEmail: 'elena.rost@designstudio.ch',
    rating: 5,
    comment: 'The skeleton bridge layout is incredibly harmonious. You can watch the escapement spin smoothly. Fast shipping and exceptional service.',
    date: '2026-06-03'
  },
  {
    id: 'rev3',
    productId: 's1',
    userName: 'Marcus Sterling',
    userEmail: 'marcus@sterling-holdings.co',
    rating: 5,
    comment: 'The Blake welted sole gives immediate flexibility. The mahogany color has unique light gradients that represent real masterful hand painting.',
    date: '2026-06-10'
  },
  {
    id: 'rev4',
    productId: 'p1',
    userName: 'Gisèle Laurent',
    userEmail: 'gisele.laurent@paris-style.com',
    rating: 5,
    comment: 'Oud of the finest quality. It starts deep and dark, but the vanilla base emerges within two hours to create an incredibly elegant cloud. It stays on skin until the next day.',
    date: '2026-06-14'
  }
];
