/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Heart, Star, SlidersHorizontal, ArrowDownAZ, LayoutGrid, Info, Eye } from 'lucide-react';
import { Product } from '../types';
import { CATEGORIES } from '../data/products';

interface FeaturedProductsProps {
  products: Product[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  onSelectProduct: (product: Product) => void;
  wishlist: string[];
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: Product, quantity: number) => void;
  isLoading?: boolean;
}

export default function FeaturedProducts({
  products,
  selectedCategory,
  setSelectedCategory,
  onSelectProduct,
  wishlist,
  onToggleWishlist,
  onAddToCart,
  isLoading = false
}: FeaturedProductsProps) {
  const [sortBy, setSortBy] = useState<string>('featured');
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(50000);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);

  // Filter & Sort Logic
  const filteredAndSortedProducts = useMemo(() => {
    let result = products.filter(p => {
      const matchCategory = selectedCategory === 'all' || p.category === selectedCategory;
      const matchPrice = p.price >= minPrice && p.price <= maxPrice;
      const matchStock = !onlyInStock || p.stock > 0;
      return matchCategory && matchPrice && matchStock;
    });

    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'alpha') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // Default / Featured
      result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return result;
  }, [products, selectedCategory, sortBy, minPrice, maxPrice, onlyInStock]);

  return (
    <section className="bg-transparent py-16 sm:py-24" id="house-collections">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Maison Slogan & Label Header */}
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="font-serif text-[10px] uppercase tracking-[0.3em] text-gold-600 block mb-2 font-bold">
            The Golden Standard
          </span>
          <h2 className="text-2xl sm:text-4xl font-serif tracking-widest text-[#F5F5F5] uppercase font-medium">
            Curate Your Style
          </h2>
          <div className="h-0.5 w-16 bg-gold-500 mx-auto mt-4 mb-4" />
          <p className="text-xs sm:text-sm text-zinc-400 font-serif leading-relaxed">
            Examine our high-fashion creations meticulously engineered by master artisans, from grand automatic watches to private reserve scents.
          </p>
        </div>

        {/* Global Collection Filtering Menus */}
        <div className="flex flex-wrap justify-center gap-2 mb-10 pb-4 border-b border-white/10">
          {[
            { id: 'all', label: 'The Whole Maison' },
            { id: 'watches', label: 'Complications Watches' },
            { id: 'shoes', label: 'Couture Shoes' },
            { id: 'jackets', label: 'Outerwear Jackets' },
            { id: 'perfumes', label: 'Elixir Parfums' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-5 py-2.5 text-xs font-serif tracking-wider uppercase rounded transition-all duration-300 ${
                selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-zinc-900 to-black text-white shadow-md border-b-2 border-gold-500'
                  : 'bg-zinc-900/40 text-zinc-400 hover:bg-zinc-800 hover:text-white border border-white/5'
              }`}
              id={`cat-filter-btn-${cat.id}`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Sorting + Advanced Search Slide Drawers Panel Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-1.5 px-4 py-2 border border-white/10 text-zinc-300 hover:text-gold-500 hover:border-gold-500 rounded transition-all bg-zinc-900/40"
              id="toggle-filters-btn"
            >
              <SlidersHorizontal className="h-4 w-4 text-gold-500" />
              <span>Tailored filters</span>
            </button>
            <span className="text-xs text-zinc-500 font-serif">
              Presenting {filteredAndSortedProducts.length} items
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <ArrowDownAZ className="h-4 w-4 text-zinc-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-zinc-900 text-xs text-zinc-300 border border-white/10 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-gold-500 font-serif"
              id="sort-select"
            >
              <option value="featured">Maison Selections</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Client Ratings</option>
              <option value="alpha">Alphabetical Order</option>
            </select>
          </div>
        </div>

        {/* Advanced Filters Expandable Drawer block */}
        {showFilters && (
          <div className="mb-8 p-5 bg-[#0D0D0D] border border-white/10 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top duration-300">
            <div>
              <label className="block text-xs font-serif uppercase tracking-wider text-white font-semibold mb-2">Pricing Cap</label>
              <div className="flex items-center space-x-2">
                <input 
                  type="number" 
                  placeholder="Min" 
                  value={minPrice || ''} 
                  onChange={(e) => setMinPrice(Number(e.target.value))}
                  className="w-1/2 bg-zinc-950 text-white text-xs border border-white/10 rounded px-2.5 py-1.5 focus:outline-none focus:border-gold-500"
                />
                <span className="text-zinc-400">-</span>
                <input 
                  type="number" 
                  placeholder="Max" 
                  value={maxPrice || ''} 
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-1/2 bg-zinc-950 text-white text-xs border border-white/10 rounded px-2.5 py-1.5 focus:outline-none focus:border-gold-500"
                />
              </div>
            </div>

            <div className="flex items-center">
              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={onlyInStock} 
                  onChange={(e) => setOnlyInStock(e.target.checked)}
                  className="rounded border-white/10 text-gold-500 focus:ring-gold-500 h-4 w-4 bg-zinc-950"
                />
                <span className="text-xs font-serif uppercase tracking-wider text-zinc-300 font-semibold">Exclusively Active Stocks Only</span>
              </label>
            </div>

            <div className="flex items-end justify-end">
              <button 
                onClick={() => { setMinPrice(0); setMaxPrice(50000); setOnlyInStock(false); }}
                className="text-[10px] font-serif uppercase tracking-widest text-[#C5A059] hover:text-white border-b border-white/20 hover:border-white transition-colors pb-0.5"
              >
                Reset Fine Filters
              </button>
            </div>
          </div>
        )}

        {/* Loading Skeletons */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(idx => (
              <div key={idx} className="animate-pulse space-y-4">
                <div className="bg-zinc-200 aspect-square rounded-lg w-full" />
                <div className="bg-zinc-200 h-4 rounded w-3/4" />
                <div className="bg-zinc-200 h-4 rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : (
          /* Products Grid Layout */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredAndSortedProducts.map(product => {
              const isWishlisted = wishlist.includes(product.id);
              return (
                <div 
                  key={product.id}
                  className="group relative flex flex-col justify-between overflow-hidden bg-[#0A0A0A] rounded border border-white/5 hover:border-gold-500/40 hover:shadow-[0_0_20px_rgba(197,160,89,0.07)] transition-all duration-300"
                  id={`product-card-${product.id}`}
                >
                  
                  {/* Status Badges */}
                  <div className="absolute top-3 left-3 z-20 flex flex-col space-y-1">
                    {product.newArrival && (
                      <span className="bg-[#050505] text-[10px] text-gold-400 px-2.5 py-0.5 font-serif uppercase tracking-wider rounded border border-gold-800/40">
                        Nouveau
                      </span>
                    )}
                    {product.bestSeller && (
                      <span className="bg-gold-500 text-[10px] text-black font-semibold px-2.5 py-0.5 font-serif uppercase tracking-wider rounded">
                        Élite
                      </span>
                    )}
                    {product.stock <= 2 && product.stock > 0 && (
                      <span className="bg-red-500 text-[9px] text-white font-serif tracking-widest uppercase px-2 py-0.5 rounded font-black max-w-fit">
                        Rare Limited
                      </span>
                    )}
                    {product.stock === 0 && (
                      <span className="bg-zinc-800 text-[10px] text-zinc-400 font-serif tracking-widest uppercase px-2.5 py-0.5 rounded border border-white/5">
                        Acquired
                      </span>
                    )}
                  </div>

                  {/* Wishlist Heart Toggle */}
                  <button
                    onClick={(e) => { e.stopPropagation(); onToggleWishlist(product.id); }}
                    className="absolute top-3 right-3 z-20 p-1.5 rounded-full bg-black/80 hover:bg-zinc-900 text-zinc-400 hover:text-red-500 shadow-md transition-all active:scale-90 border border-white/5"
                    title={isWishlisted ? 'Discard Wishlist' : 'Acquire Wishlist'}
                    id={`wishlist-toggle-${product.id}`}
                  >
                    <Heart className={`h-4.5 w-4.5 transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-zinc-450'}`} />
                  </button>

                  {/* Image Presentation */}
                  <div 
                    onClick={() => onSelectProduct(product)}
                    className="relative aspect-square w-full bg-zinc-50 overflow-hidden cursor-pointer"
                  >
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Dark overlay with dynamic buttons on hover */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
                      <button 
                        onClick={(e) => { e.stopPropagation(); onSelectProduct(product); }}
                        className="p-3 bg-zinc-900 hover:bg-gold-500 text-gold-400 hover:text-black rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 border border-gold-500/20"
                        title="Acquire Details"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Product Specification Copy block */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-serif tracking-widest text-gold-600 block font-bold">
                        {CATEGORIES.find(c => c.id === product.category)?.name || product.category}
                      </span>
                      <h3 
                        onClick={() => onSelectProduct(product)}
                        className="text-sm font-serif font-semibold tracking-wider text-white group-hover:text-gold-500 transition-colors cursor-pointer line-clamp-1"
                      >
                        {product.name}
                      </h3>
                      
                      {/* Ratings stars */}
                      <div className="flex items-center space-x-1">
                        <Star className="h-3.5 w-3.5 fill-gold-500 text-gold-500" />
                        <span className="text-xs text-zinc-300 font-medium">{product.rating}</span>
                        <span className="text-[10px] text-zinc-500">({product.reviewsCount} reviews)</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <div className="flex items-baseline space-x-2">
                        <span className="text-sm font-bold text-gold-400 font-mono">
                          ${product.price.toLocaleString()}
                        </span>
                        {product.originalPrice && (
                          <span className="text-[11px] font-mono text-zinc-500 line-through">
                            ${product.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>

                      {product.stock > 0 ? (
                        <button
                          onClick={() => onAddToCart(product, 1)}
                          className="px-3 py-1.5 bg-zinc-900 border border-white/10 hover:bg-gold-500 text-zinc-300 hover:text-black text-[10px] font-serif font-bold uppercase tracking-wider rounded transition-colors"
                          id={`add-to-cart-quick-${product.id}`}
                        >
                          Acquire
                        </button>
                      ) : (
                        <span className="text-[9px] font-serif text-zinc-500 tracking-wider uppercase border border-white/10 px-2 py-1 rounded">
                          Acquired
                        </span>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {filteredAndSortedProducts.length === 0 && !isLoading && (
          <div className="text-center py-16 border border-dashed border-white/10 rounded-lg bg-zinc-950/20">
            <Info className="h-8 w-8 text-gold-500 mx-auto mb-2 animate-bounce" />
            <h4 className="text-sm font-serif text-white uppercase tracking-widest font-bold">No Exquisite Creations Matched</h4>
            <p className="text-xs text-zinc-400 font-serif mt-1">Adjust your pricing filters or category boundaries to explore the Maison collections.</p>
          </div>
        )}

      </div>
    </section>
  );
}
