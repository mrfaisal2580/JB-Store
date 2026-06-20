/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Star, Shield, Truck, RotateCcw, Share2, Plus, Minus, Check, MessageSquare } from 'lucide-react';
import { Product, Review } from '../types';

interface ProductDetailProps {
  product: Product;
  onAddToCart: (product: Product, quantity: number, selectedSize?: string, selectedColor?: string, selectedScent?: string) => void;
  onBuyNow: (product: Product, quantity: number, selectedSize?: string, selectedColor?: string, selectedScent?: string) => void;
  allProducts: Product[];
  onSelectProduct: (product: Product) => void;
}

export default function ProductDetail({
  product,
  onAddToCart,
  onBuyNow,
  allProducts,
  onSelectProduct
}: ProductDetailProps) {
  const [activeImage, setActiveImage] = useState(product.images[0]);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || '');
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || '');
  const [selectedScent, setSelectedScent] = useState(product.scents?.[0] || '');
  
  // Interactive Zoom Coordinates state
  const [zoomStyle, setZoomStyle] = useState<{ display: string; backgroundPosition: string }>({
    display: 'none',
    backgroundPosition: '0% 0%'
  });

  // Client local/express server reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '', userName: '', userEmail: '' });
  const [isSubmitReviewSuccess, setIsSubmitReviewSuccess] = useState(false);

  // Fetch reviews for specific product from express
  useEffect(() => {
    fetch(`/api/reviews/${product.id}`)
      .then(res => res.json())
      .then(data => setReviews(data))
      .catch(err => console.error('Error listing reviews:', err));
    
    // Default image initializer
    setActiveImage(product.images[0]);
    setQuantity(1);
    setSelectedSize(product.sizes?.[0] || '');
    setSelectedColor(product.colors?.[0] || '');
    setSelectedScent(product.scents?.[0] || '');
  }, [product]);

  // Image Zoom math
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;
    setZoomStyle({
      display: 'block',
      backgroundPosition: `${x}% ${y}%`
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: 'none', backgroundPosition: '0% 0%' });
  };

  // Submit custom review in real-time
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.userName.trim() || !newReview.comment.trim()) return;

    fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: product.id,
        userName: newReview.userName,
        userEmail: newReview.userEmail,
        rating: newReview.rating,
        comment: newReview.comment
      })
    })
      .then(res => res.json())
      .then(savedReview => {
        setReviews(prev => [savedReview, ...prev]);
        setIsSubmitReviewSuccess(true);
        setNewReview({ rating: 5, comment: '', userName: '', userEmail: '' });
        setTimeout(() => setIsSubmitReviewSuccess(false), 5000);
      })
      .catch(err => console.error('Error submitting review:', err));
  };

  // Curate Related Items
  const relatedProducts = allProducts
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  return (
    <article className="bg-[#050505] py-16 sm:py-20 font-sans" id={`product-pane-${product.sku}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Presentation Layout Column */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-16">
          
          {/* LEFT: Multi Image Showcase & Coordinate Interactive Zoom */}
          <div className="space-y-4">
            
            {/* Primary presentation zoom layer */}
            <div 
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="relative aspect-square bg-[#0A0A0A] border border-white/10 rounded-lg overflow-hidden cursor-crosshair group shadow"
              style={{ backgroundImage: `url(${activeImage})`, backgroundSize: '0%' }}
            >
              <img 
                src={activeImage} 
                alt={product.name} 
                className="w-full h-full object-cover select-none group-hover:opacity-0 transition-opacity duration-200"
                referrerPolicy="no-referrer"
              />
              
              {/* Floating Magnified zoom overlay */}
              <div 
                className="absolute inset-0 bg-no-repeat pointer-events-none"
                style={{
                  backgroundImage: `url(${activeImage})`,
                  backgroundSize: '220%',
                  ...zoomStyle
                }}
              />
              <span className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-sm text-[9px] text-gold-400 px-2 py-1 tracking-widest uppercase rounded">
                Hover style inspect zoom
              </span>
            </div>

            {/* Selector Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex space-x-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`h-16 w-16 rounded border bg-[#050505] overflow-hidden transition-all ${
                      activeImage === img ? 'border-gold-500 ring-1 ring-gold-500' : 'border-white/10 hover:border-gold-500/40'
                    }`}
                  >
                    <img src={img} alt="Spec thumbnail" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}

            {/* Courier & Maison Guarantees block */}
            <div className="grid grid-cols-3 gap-2 pt-6 border-t border-white/10 text-center text-[10px] text-zinc-400 font-serif">
              <div className="flex flex-col items-center p-2.5 bg-[#0D0D0D] border border-white/5 rounded">
                <Truck className="h-4 w-4 text-gold-500 mb-1" />
                <span className="font-semibold text-white block mb-0.5 uppercase tracking-wider">Free Delivery</span>
                <span>Worldwide fully insured courier</span>
              </div>
              <div className="flex flex-col items-center p-2.5 bg-[#0D0D0D] border border-white/5 rounded">
                <RotateCcw className="h-4 w-4 text-gold-500 mb-1" />
                <span className="font-semibold text-white block mb-0.5 uppercase tracking-wider">Maison Returns</span>
                <span>14 Day luxury trial returns</span>
              </div>
              <div className="flex flex-col items-center p-2.5 bg-[#0D0D0D] border border-white/5 rounded">
                <Shield className="h-4 w-4 text-gold-500 mb-1" />
                <span className="font-semibold text-white block mb-0.5 uppercase tracking-wider">Primacy Certs</span>
                <span>Includes certified atelier seal</span>
              </div>
            </div>

          </div>

          {/* RIGHT: Product specifications copy & Interactive selections */}
          <div className="space-y-6 sm:space-y-8">
            
            <div className="space-y-2">
              <span className="text-[11px] uppercase tracking-[0.25em] font-serif text-gold-600 block font-bold">
                Maison Catalogue • {product.sku}
              </span>
              <h1 className="text-2xl sm:text-4xl font-serif tracking-wider font-light text-white">
                {product.name}
              </h1>

              {/* Combined Star counts */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star 
                      key={s} 
                      className={`h-4 w-4 ${s <= Math.round(product.rating) ? 'fill-gold-500 text-gold-500' : 'text-zinc-200'}`} 
                    />
                  ))}
                </div>
                <span className="text-xs text-zinc-300 font-bold font-mono">{product.rating}</span>
                <span className="text-zinc-700 font-bold font-mono">|</span>
                <span className="text-xs text-zinc-400 font-serif">{reviews.length} clients wrote reviews</span>
              </div>
            </div>

            {/* Pricing Tag */}
            <div className="p-4 bg-zinc-950 border border-gold-800/20 text-white rounded-lg flex items-center justify-between">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-gold-400 block mb-1">Maison Suggested Price</span>
                <div className="flex items-baseline space-x-3">
                  <span className="text-2xl font-bold text-gold-100 font-mono">
                    ${product.price.toLocaleString()}
                  </span>
                  {product.originalPrice && (
                    <span className="text-xs font-mono text-zinc-500 line-through">
                      ${product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[9px] uppercase tracking-widest text-zinc-400 block mb-1">Estate Stock Status</span>
                {product.stock > 0 ? (
                  <span className="text-xs font-serif text-green-400 font-semibold uppercase tracking-wider flex items-center justify-end">
                    <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse mr-1.5" />
                    {product.stock} pieces active
                  </span>
                ) : (
                  <span className="text-xs font-serif text-zinc-500 uppercase tracking-wider font-semibold">
                    Acquired/Out of stock
                  </span>
                )}
              </div>
            </div>

            {/* Narrative description */}
            <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed font-serif">
              {product.description}
            </p>

            {/* --- VARIANTS SELECTORS --- */}
            <div className="space-y-4">
              
              {/* Size selectors (f.e shoe models or jacket fits) */}
              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-zinc-300 font-semibold block mb-2 font-serif">Select fitting caliber</span>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={`px-4 py-2 text-xs font-serif border rounded transition-all ${
                          selectedSize === s 
                            ? 'bg-gold-500 text-black border-gold-500 font-bold' 
                            : 'bg-[#0A0A0A] text-zinc-300 border-white/10 hover:border-gold-500'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Colors selectors (f.e watches or jackets) */}
              {product.colors && product.colors.length > 0 && (
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-zinc-300 font-semibold block mb-2 font-serif">Select Dial/leather color</span>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((c) => (
                      <button
                        key={c}
                        onClick={() => setSelectedColor(c)}
                        className={`px-3 py-1.5 text-xs font-serif border rounded transition-all ${
                          selectedColor === c 
                            ? 'bg-gold-500 text-black border-gold-500 font-bold' 
                            : 'bg-[#0A0A0A] text-zinc-300 border-white/10 hover:border-gold-500'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Scents selectors (perfumes) */}
              {product.scents && product.scents.length > 0 && (
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-zinc-300 font-semibold block mb-2 font-serif">Select Fragrance Essence</span>
                  <div className="flex flex-wrap gap-2">
                    {product.scents.map((sc) => (
                      <button
                        key={sc}
                        onClick={() => setSelectedScent(sc)}
                        className={`px-3 py-1.5 text-xs font-serif border rounded transition-all ${
                          selectedScent === sc 
                            ? 'bg-gold-500 text-black border-gold-500 font-bold' 
                            : 'bg-[#0A0A0A] text-zinc-300 border-white/10 hover:border-gold-500'
                        }`}
                      >
                        {sc}
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* --- COUNT SELECTOR & ACTIONS --- */}
            {product.stock > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-4">
                  {/* Plus and minus widget */}
                  <div className="flex items-center border border-white/10 rounded overflow-hidden bg-[#0A0A0A]">
                    <button 
                      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                      className="p-2.5 text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="px-4 text-xs font-mono font-bold text-white select-none">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(prev => Math.min(product.stock, prev + 1))}
                      className="p-2.5 text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <span className="text-[10px] text-zinc-400 font-serif">
                    Limit {product.stock} items per VIP client
                  </span>
                </div>

                {/* Main Action triggers */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => onAddToCart(product, quantity, selectedSize, selectedColor, selectedScent)}
                    className="py-3.5 bg-transparent hover:bg-white/5 border border-white/20 text-white text-xs font-serif tracking-[0.15em] uppercase rounded transition-all text-center"
                    id="add-to-cart-detail"
                  >
                    Add to collection suitcase
                  </button>
                  <button
                    onClick={() => onBuyNow(product, quantity, selectedSize, selectedColor, selectedScent)}
                    className="py-3.5 bg-gold-500 hover:bg-gold-600 text-black text-xs font-serif font-black uppercase tracking-[0.15em] rounded border border-gold-400 transition-all text-center"
                    id="buy-now-detail"
                  >
                    Acquire Instantly
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 border border-dashed border-white/10 rounded bg-[#0A0A0A] text-center font-serif text-xs text-zinc-450">
                This item is currently fully reserved for other private clients. You may connect with Jean-Baptiste concierge for preorder possibilities.
              </div>
            )}

            {/* --- SPECIFICATIONS ACCORDION / LIST --- */}
            <div className="border-t border-white/10 pt-6">
              <h3 className="text-xs uppercase tracking-wider text-white font-semibold font-serif mb-3">Atelier Specifications</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(product.specs).map(([key, val]) => (
                  <div key={key} className="border-b border-white/5 pb-2 text-[11px]">
                    <span className="text-zinc-400 block font-serif">{key}</span>
                    <span className="text-white font-medium font-serif">{val}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* --- REVIEW & TESTIMONIAL PANEL --- */}
        <div className="border-t border-white/10 mt-16 pt-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Reviews list representation */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center space-x-2 pb-4 border-b border-white/10">
                <MessageSquare className="h-5 w-5 text-gold-500" />
                <h3 className="text-lg font-serif tracking-wider uppercase text-white font-semibold">Client Testimonials</h3>
              </div>
              
              {reviews.length > 0 ? (
                <div className="space-y-6 divide-y divide-white/5 pr-2">
                  {reviews.map((r) => (
                    <div key={r.id} className="pt-6 first:pt-0 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-serif text-xs text-zinc-200 font-bold">{r.userName}</span>
                        <span className="font-mono text-[10px] text-zinc-500">{r.date}</span>
                      </div>
                      <div className="flex space-x-0.5">
                        {[1, 2, 3, 4, 5].map(st => (
                          <Star key={st} className={`h-3 w-3 ${st <= r.rating ? 'fill-gold-500 text-gold-500' : 'text-zinc-800'}`} />
                        ))}
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed font-serif p-2 bg-[#0D0D0D] border border-white/5 rounded italic">
                        "{r.comment}"
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-400 font-serif italic py-6">
                  No clients have commented on this SKU yet. Be the first to publish a private testimonial.
                </p>
              )}
            </div>

            {/* Inscribe custom Review Form */}
            <div className="p-6 bg-[#0A0A0A] border border-white/5 rounded-lg shadow-sm">
              <h4 className="text-xs text-white font-serif uppercase tracking-widest font-semibold mb-4">Inscribe Testimonial</h4>
              
              {isSubmitReviewSuccess && (
                <div className="mb-4 text-xs bg-green-950/20 text-green-400 border border-green-800 p-3 rounded flex items-center">
                  <Check className="h-4 w-4 mr-1 shrink-0" />
                  Your testimonial has been verified and registered.
                </div>
              )}

              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-serif uppercase text-zinc-400 mb-1">Your Full Name</label>
                  <input 
                    type="text" 
                    value={newReview.userName}
                    onChange={(e) => setNewReview(prev => ({ ...prev, userName: e.target.value }))}
                    placeholder="Reginald Carter"
                    className="w-full bg-[#050505] text-white text-xs border border-white/10 rounded px-3 py-2 outline-none focus:border-gold-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-serif uppercase text-zinc-400 mb-1">Your Contact Email</label>
                  <input 
                    type="email" 
                    value={newReview.userEmail}
                    onChange={(e) => setNewReview(prev => ({ ...prev, userEmail: e.target.value }))}
                    placeholder="reginald@carter.com"
                    className="w-full bg-[#050505] text-white text-xs border border-white/10 rounded px-3 py-2 outline-none focus:border-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-serif uppercase text-zinc-400 mb-2">Exclusive Rating</label>
                  <div className="flex space-x-1.5">
                    {[1, 2, 3, 4, 5].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setNewReview(prev => ({ ...prev, rating: st }))}
                        className="focus:outline-none"
                      >
                        <Star className={`h-5 w-5 ${st <= newReview.rating ? 'fill-gold-500 text-gold-500' : 'text-zinc-800'}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-serif uppercase text-zinc-400 mb-1">Your Experience / Review</label>
                  <textarea 
                    value={newReview.comment}
                    onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                    rows={3}
                    placeholder="Provide your experience regarding materials and fit here..."
                    className="w-full bg-[#050505] text-white text-xs border border-white/10 rounded px-3 py-2 outline-none focus:border-gold-500"
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-zinc-900 border border-white/10 hover:bg-gold-500 hover:text-black py-2.5 text-[10px] text-zinc-300 font-serif uppercase tracking-widest font-bold rounded transition-colors"
                  id="submit-review-btn"
                >
                  Publish Certified Review
                </button>
              </form>
            </div>

          </div>
        </div>

        {/* --- RELATED PRODUCTS SUB-BOX --- */}
        {relatedProducts.length > 0 && (
          <div className="border-t border-white/10 mt-16 pt-12">
            <h3 className="text-lg font-serif tracking-widest uppercase text-white font-semibold text-center mb-10">Related Curations</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedProducts.map(p => (
                <div 
                  key={p.id}
                  onClick={() => onSelectProduct(p)}
                  className="group cursor-pointer bg-[#0A0A0A] border border-white/5 rounded overflow-hidden p-3 hover:border-gold-500/30 transition-all"
                >
                  <div className="aspect-square bg-zinc-950 rounded overflow-hidden mb-3">
                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" referrerPolicy="no-referrer" />
                  </div>
                  <h4 className="text-xs font-serif font-bold text-white group-hover:text-gold-500 line-clamp-1">{p.name}</h4>
                  <div className="flex items-center justify-between text-xs font-serif text-zinc-400 mt-1">
                    <span className="font-mono text-gold-400 font-bold">${p.price.toLocaleString()}</span>
                    <span>View items</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </article>
  );
}
