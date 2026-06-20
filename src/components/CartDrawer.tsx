/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Trash2, Tag, ArrowRight, ShieldAlert, Sparkles, Check } from 'lucide-react';
import { CartItem, CouponCode } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number, variantSpec?: string) => void;
  onRemoveItem: (productId: string, variantSpec?: string) => void;
  onCheckout: (coupon: CouponCode | null, calculatedTaxes: number, calculatedShipping: number) => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout
}: CartDrawerProps) {
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<CouponCode | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // Shipping details state
  const [shipCountry, setShipCountry] = useState('united-state');
  const [postalZip, setPostalZip] = useState('');

  if (!isOpen) return null;

  // Pricing mathematics
  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  // Dynamic Shipping calculation
  let shipping = 0;
  if (subtotal > 0 && subtotal < 2000) {
    shipping = shipCountry === 'united-kingdom' ? 50 : 95;
  } else {
    shipping = 0; // Free shipping for premium spends limit
  }

  // Active discount codes subtraction
  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      discount = (subtotal * appliedCoupon.discountValue) / 100;
    } else {
      discount = appliedCoupon.discountValue;
    }
  }

  // 12% Luxury custom excise duties / taxes
  const tax = Math.round((subtotal - discount) * 0.12 * 10) / 10;
  const grandTotal = subtotal - discount + tax + shipping;

  // API coupon verification
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;

    fetch('/api/coupon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: couponCodeInput, spend: subtotal })
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Invalid Coupon');
        }
        return data;
      })
      .then((coupon: CouponCode) => {
        setAppliedCoupon(coupon);
        setCouponSuccess(`PRIVILEGE CONFIRMED: ${coupon.code} applied!`);
        setCouponError('');
        setCouponCodeInput('');
      })
      .catch((err: any) => {
        setCouponError(err.message || 'Invitation code not found');
        setCouponSuccess('');
      });
  };

  const handleCheckoutClick = () => {
    onCheckout(appliedCoupon, tax, shipping);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans" id="cart-drawer-overlay">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#050505] border-l border-white/10 shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#0A0A0A] text-white">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-gold-500" />
              <h2 className="text-sm font-serif uppercase tracking-[0.2em] font-semibold">Suitcase Collection</h2>
            </div>
            <button onClick={onClose} className="p-1 rounded-full text-zinc-400 hover:text-white transition-colors" id="close-cart-btn">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Cart item Listings */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {cart.length > 0 ? (
              cart.map((item, idx) => {
                // Compile customized variant identifier (size, color, scent)
                const variantParts = [
                  item.selectedSize ? `Size: ${item.selectedSize}` : '',
                  item.selectedColor ? `${item.selectedColor}` : '',
                  item.selectedScent ? `Fragrance: ${item.selectedScent}` : ''
                ].filter(Boolean);
                const variantSpec = variantParts.join(', ');

                return (
                  <div key={`${item.product.id}-${idx}`} className="flex items-stretch pb-6 border-b border-white/5 last:border-b-0">
                    <img 
                      src={item.product.images[0]} 
                      alt={item.product.name} 
                      className="h-20 w-20 object-cover rounded border border-white/10 shrink-0 bg-zinc-950" 
                      referrerPolicy="no-referrer"
                    />
                    
                    <div className="ml-4 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between">
                          <h4 className="text-xs font-serif font-bold text-white uppercase tracking-wide line-clamp-1">
                            {item.product.name}
                          </h4>
                          <span className="text-xs font-semibold text-gold-450 font-mono pl-2">
                            ${(item.product.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                        {variantSpec && (
                          <p className="text-[10px] text-gold-700 font-serif italic mt-0.5">{variantSpec}</p>
                        )}
                        <p className="text-[10px] text-zinc-400 font-mono mt-0.5">${item.product.price.toLocaleString()} each</p>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        {/* Quantity Counter */}
                        <div className="flex items-center border border-white/10 rounded overflow-hidden bg-[#0A0A0A]">
                          <button 
                            onClick={() => onUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1), variantSpec)}
                            className="px-2 py-1 text-xs text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                          >
                            -
                          </button>
                          <span className="px-2.5 text-xs font-mono font-bold text-white">{item.quantity}</span>
                          <button 
                            onClick={() => onUpdateQuantity(item.product.id, Math.min(item.product.stock, item.quantity + 1), variantSpec)}
                            className="px-2 py-1 text-xs text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                          >
                            +
                          </button>
                        </div>

                        {/* Dismiss */}
                        <button 
                          onClick={() => onRemoveItem(item.product.id, variantSpec)}
                          className="text-zinc-400 hover:text-red-500 transition-colors"
                          title="Remove custom product SKU"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-24 space-y-4">
                <div className="h-12 w-12 rounded-full border border-white/10 flex items-center justify-center mx-auto text-gold-500 bg-[#0A0A0A]">
                  <X className="h-5 w-5" />
                </div>
                <h4 className="text-xs font-serif uppercase tracking-widest text-zinc-300 font-bold">Your trunk is pristine</h4>
                <p className="text-xs text-zinc-500 font-serif max-w-[200px] mx-auto">Acquire luxury clothing, watches, and scents to begin showcasing.</p>
              </div>
            )}
          </div>

          {/* Pricing Summary Footer */}
          {cart.length > 0 && (
            <div className="p-6 bg-[#030303] border-t border-white/10 space-y-4">
              
              {/* Dynamic Complimentary Courier Indicator */}
              {subtotal < 2000 ? (
                <div className="p-3 bg-[#0A0A0A] border border-white/10 rounded text-[10px] text-zinc-400 font-serif flex items-center justify-between">
                  <span>Spend <span className="font-bold text-white">${(2000 - subtotal).toLocaleString()}</span> more for free premium delivery</span>
                  <span className="font-bold text-gold-500">VIP</span>
                </div>
              ) : (
                <div className="p-3 bg-gold-900/10 border border-gold-800/35 rounded text-[10px] text-gold-600 font-serif flex items-center justify-between">
                  <span>Congratulations, you qualify for free white-glove courier</span>
                  <span className="font-bold">Active</span>
                </div>
              )}

              {/* Coupon Form input */}
              <form onSubmit={handleApplyCoupon} className="flex space-y-1.5 flex-col">
                <div className="flex rounded border border-white/10 overflow-hidden bg-[#0A0A0A]">
                  <input 
                    type="text" 
                    placeholder="Invitation coupon (e.g. 'JB20')" 
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value)}
                    className="w-full bg-transparent text-xs px-3 py-2 outline-none capitalize placeholder-zinc-500 font-serif text-white"
                  />
                  <button 
                    type="submit" 
                    className="bg-[#050505] hover:bg-gold-500 hover:text-black border-l border-white/10 py-2 px-4 text-[#C5A059] text-xs font-serif font-bold tracking-wider transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {couponError && <p className="text-[10px] text-red-500 font-serif">{couponError}</p>}
                {couponSuccess && <p className="text-[10px] text-gold-700 font-serif flex items-center"><Check className="h-3 w-3 mr-1" /> {couponSuccess}</p>}
              </form>

              {/* Courier inputs calculator */}
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div>
                  <label className="block text-zinc-500 mb-0.5">Dest. Country</label>
                  <select 
                    value={shipCountry} 
                    onChange={(e) => setShipCountry(e.target.value)}
                    className="w-full bg-[#0A0A0A] text-zinc-300 border border-white/10 rounded px-1.5 py-1 focus:outline-none"
                  >
                    <option value="united-state">United States</option>
                    <option value="united-kingdom">United Kingdom</option>
                    <option value="gulf-region">GCC (Dubai, Riyadh)</option>
                    <option value="europe">Europe (Switzerland)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-500 mb-0.5">Postal Code</label>
                  <input 
                    type="text" 
                    placeholder="90210" 
                    value={postalZip} 
                    onChange={(e) => setPostalZip(e.target.value)}
                    className="w-full bg-[#0A0A0A] text-zinc-300 border border-white/10 rounded px-2.5 py-1 focus:outline-none placeholder-zinc-600"
                  />
                </div>
              </div>

              {/* Mathematical calculation lines */}
              <div className="space-y-1.5 pt-2 border-t border-white/10 text-xs text-zinc-400 font-serif">
                <div className="flex justify-between">
                  <span>Maison Subtotal</span>
                  <span className="font-mono text-white">${subtotal.toLocaleString()}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-gold-700">
                    <span>Coupon Reward ({appliedCoupon.code})</span>
                    <span className="font-mono">-${discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Luxury Tax (12% VAT)</span>
                  <span className="font-mono text-white">${tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Courier Delivery Logistics</span>
                  <span className="font-mono text-white">
                    {shipping === 0 ? 'Complimentary' : `$${shipping}`}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-white/10 text-sm font-bold text-white uppercase">
                  <span>Total Investment</span>
                  <span className="font-mono text-gold-600">${grandTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Submit trigger */}
              <button
                onClick={handleCheckoutClick}
                className="w-full bg-gold-500 hover:bg-gold-600 text-black py-4 rounded text-xs font-serif font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center shadow-lg"
                id="checkout-trigger-btn"
              >
                Procure Privilege Order <ArrowRight className="h-4.5 w-4.5 ml-1.5" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
