/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldCheck, Truck, CreditCard, ChevronRight, Check, ShoppingBag, Sparkles, AlertCircle, ArrowLeft } from 'lucide-react';
import { CartItem, CouponCode, Order } from '../types';

interface CheckoutFlowProps {
  cart: CartItem[];
  appliedCoupon: CouponCode | null;
  tax: number;
  shipping: number;
  onOrderCompleted: (order: Order) => void;
  onBackToMaison: () => void;
}

export default function CheckoutFlow({
  cart,
  appliedCoupon,
  tax,
  shipping,
  onOrderCompleted,
  onBackToMaison
}: CheckoutFlowProps) {
  const [step, setStep] = useState(1);
  const [errorMsg, setErrorMsg] = useState('');
  const [isAuthorizingPayment, setIsAuthorizingPayment] = useState(false);

  // Form Fields State
  const [customerInfo, setCustomerInfo] = useState({
    fullName: '',
    email: 'muhammadfaisalabbaskhan@gmail.com', // Pre-fill with user email
    phone: ''
  });

  const [shippingAddress, setShippingAddress] = useState({
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States'
  });

  const [paymentMethod, setPaymentMethod] = useState('Stripe Sandbox');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: ''
  });

  // Completed order receipt
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Math totals
  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      discount = (subtotal * appliedCoupon.discountValue) / 100;
    } else {
      discount = appliedCoupon.discountValue;
    }
  }

  const grandTotal = subtotal - discount + tax + shipping;

  // STEP NAVIGATION & SUBMIT ACTIONS
  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerInfo.fullName || !customerInfo.email) {
      setErrorMsg('Full name and email are mandatory for premium insurance processing.');
      return;
    }
    setErrorMsg('');
    setStep(2);
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingAddress.addressLine1 || !shippingAddress.city || !shippingAddress.postalCode) {
      setErrorMsg('Please complete all primary physical location values.');
      return;
    }
    setErrorMsg('');
    setStep(3);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod === 'Stripe Sandbox') {
      if (cardDetails.cardNumber.length < 16 || cardDetails.cvv.length < 3) {
        setErrorMsg('Provide correct Credit Card numbers (usually 16 digits).');
        return;
      }
    }
    setErrorMsg('');
    setStep(4);
  };

  // Final Order placement
  const handlePlaceOrder = () => {
    setIsAuthorizingPayment(true);
    
    // Simulate secure sandbox authorization call to Express endpoint first
    fetch('/api/payment/intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gateway: paymentMethod, amount: grandTotal })
    })
      .then(res => res.json())
      .then(paymentRes => {
        // Now post the entire finished order packet to DB
        return fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: customerInfo.fullName,
            email: customerInfo.email,
            phone: customerInfo.phone,
            addressLine1: shippingAddress.addressLine1,
            addressLine2: shippingAddress.addressLine2,
            city: shippingAddress.city,
            state: shippingAddress.state,
            postalCode: shippingAddress.postalCode,
            country: shippingAddress.country,
            paymentMethod: paymentMethod,
            paymentDetails: {
              cardBrand: paymentMethod === 'Stripe Sandbox' ? 'Visa Platinum' : 'Secured Gateway',
              last4: cardDetails.cardNumber ? cardDetails.cardNumber.slice(-4) : 'SIMU',
              transactionId: paymentRes.transactionId
            },
            cartItems: cart.map(item => {
              const variantParts = [
                item.selectedSize ? `Size: ${item.selectedSize}` : '',
                item.selectedColor ? `${item.selectedColor}` : '',
                item.selectedScent ? `Scent: ${item.selectedScent}` : ''
              ].filter(Boolean);
              
              return {
                productId: item.product.id,
                productName: item.product.name,
                price: item.product.price,
                quantity: item.quantity,
                selectedVariant: variantParts.join(', ')
              };
            }),
            subtotal,
            tax,
            shipping,
            discount,
            total: grandTotal
          })
        });
      })
      .then(async (res) => {
        const orderData = await res.json();
        if (!res.ok) {
          throw new Error(orderData.error);
        }
        setCompletedOrder(orderData);
        onOrderCompleted(orderData);
        setStep(5);
        setErrorMsg('');
      })
      .catch(err => {
        console.error('Checkout error:', err);
        setErrorMsg(err.message || 'Payment system delay. Try Stripe Sandbox with details.');
      })
      .finally(() => {
        setIsAuthorizingPayment(false);
      });
  };

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 font-sans">
      
      {/* Dynamic 5-Step header progress timeline */}
      <nav className="mb-10 text-center relative" aria-label="Checkout Progress">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/10 -translate-y-1/2 z-0 hidden sm:block" />
        <div className="flex justify-between relative z-10 text-xs font-serif uppercase tracking-widest font-semibold flex-wrap gap-2">
          {[
            { id: 1, label: 'Owner Profile' },
            { id: 2, label: 'Delivery Depot' },
            { id: 3, label: 'Payment Gateway' },
            { id: 4, label: 'Final Review' },
            { id: 5, label: 'Acquired Confirmation' }
          ].map(s => (
            <div 
              key={s.id}
              className={`px-3 py-1.5 rounded-full flex items-center space-x-1.5 transition-all ${
                step === s.id 
                  ? 'bg-[#111111] text-white border border-gold-500/30 px-5' 
                  : step > s.id 
                    ? 'bg-gold-500 text-black' 
                    : 'bg-[#0A0A0A] text-zinc-500 border border-white/5 hover:bg-zinc-800'
              }`}
            >
              <span className="font-mono text-[10px] bg-white/20 h-4 w-4 flex items-center justify-center rounded-full text-center">
                {s.id}
              </span>
              <span className="hidden md:inline">{s.label}</span>
            </div>
          ))}
        </div>
      </nav>

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-950/20 border border-red-800 rounded text-xs text-red-450 flex items-center">
          <AlertCircle className="h-4.5 w-4.5 mr-2 shrink-0 animate-bounce" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* --- STEP 1: CUSTOMER PROFILE DETAILS --- */}
      {step === 1 && (
        <fieldset className="bg-[#0A0A0A] p-6 sm:p-8 rounded-lg border border-white/5 shadow-sm space-y-6">
          <div className="border-b border-white/5 pb-3">
            <h2 className="text-lg font-serif tracking-wider text-white font-semibold uppercase">Step 1: Customer Profile Details</h2>
            <p className="text-xs text-zinc-400 font-serif">Configure customer details for order verification and priority packaging.</p>
          </div>

          <form onSubmit={handleInfoSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-serif uppercase tracking-wider text-zinc-400 mb-1">Your Full Noble Name *</label>
              <input 
                type="text" 
                value={customerInfo.fullName} 
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, fullName: e.target.value }))}
                placeholder="Marcus Aurelius Sterling"
                className="w-full bg-[#050505] text-white font-serif border border-white/10 rounded px-3 py-2.5 outline-none focus:border-gold-500 text-xs"
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-serif uppercase tracking-wider text-zinc-400 mb-1">Electronic Mail Address *</label>
                <input 
                  type="email" 
                  value={customerInfo.email} 
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="marcus@sterling.com"
                  className="w-full bg-[#050505] text-white border border-white/10 rounded px-3 py-2.5 outline-none focus:border-gold-500 text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-serif uppercase tracking-wider text-zinc-400 mb-1">Contact Phone Number</label>
                <input 
                  type="tel" 
                  value={customerInfo.phone} 
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+44 20 7123 4567"
                  className="w-full bg-[#050505] text-white border border-white/10 rounded px-3 py-2.5 outline-none focus:border-gold-500 text-xs"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-between items-center border-t border-white/5">
              <button 
                type="button" 
                onClick={onBackToMaison}
                className="text-xs font-serif text-zinc-450 hover:text-white flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-1" /> Back to boutique
              </button>
              <button 
                type="submit" 
                className="bg-[#111111] hover:bg-gold-500 text-gold-400 hover:text-black border border-white/10 px-6 py-2.5 text-xs font-serif uppercase font-bold tracking-widest rounded flex items-center"
                id="step1-submit"
              >
                Continue to Address <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </form>
        </fieldset>
      )}

      {/* --- STEP 2: SHIPPING AND PHYSICAL COURIER --- */}
      {step === 2 && (
        <fieldset className="bg-[#0A0A0A] p-6 sm:p-8 rounded-lg border border-white/5 shadow-sm space-y-6">
          <div className="border-b border-white/5 pb-3">
            <h2 className="text-lg font-serif tracking-wider text-white font-semibold uppercase">Step 2: Shipping Depot Address</h2>
            <p className="text-xs text-zinc-400 font-serif">Identify delivery coordinates for the hand-delivered luxury courier service.</p>
          </div>

          <form onSubmit={handleAddressSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-serif uppercase tracking-wider text-zinc-400 mb-1">Street Address Lines *</label>
              <input 
                type="text" 
                value={shippingAddress.addressLine1} 
                onChange={(e) => setShippingAddress(prev => ({ ...prev, addressLine1: e.target.value }))}
                placeholder="42 Belgrave Square"
                className="w-full bg-[#050505] text-white border border-white/10 rounded px-3 py-2.5 outline-none focus:border-gold-500 text-xs mb-2"
                required
              />
              <input 
                type="text" 
                value={shippingAddress.addressLine2} 
                onChange={(e) => setShippingAddress(prev => ({ ...prev, addressLine2: e.target.value }))}
                placeholder="Penthouse A, North Wing (Optional)"
                className="w-full bg-[#050505] text-white border border-white/10 rounded px-3 py-2.5 outline-none focus:border-gold-500 text-xs"
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-serif uppercase tracking-wider text-zinc-400 mb-1">City *</label>
                <input 
                  type="text" 
                  value={shippingAddress.city} 
                  onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="London"
                  className="w-full bg-[#050505] text-white border border-white/10 rounded px-3 py-2.5 outline-none focus:border-gold-500 text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-serif uppercase tracking-wider text-zinc-400 mb-1">State/County</label>
                <input 
                  type="text" 
                  value={shippingAddress.state} 
                  onChange={(e) => setShippingAddress(prev => ({ ...prev, state: e.target.value }))}
                  placeholder="England"
                  className="w-full bg-[#050505] text-white border border-white/10 rounded px-3 py-2.5 outline-none focus:border-gold-500 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-serif uppercase tracking-wider text-zinc-400 mb-1">Postal Zip *</label>
                <input 
                  type="text" 
                  value={shippingAddress.postalCode} 
                  onChange={(e) => setShippingAddress(prev => ({ ...prev, postalCode: e.target.value }))}
                  placeholder="SW1X 8PG"
                  className="w-full bg-[#050505] text-white border border-white/10 rounded px-3 py-2.5 outline-none focus:border-gold-500 text-xs"
                  required
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-serif uppercase tracking-wider text-zinc-400 mb-1">Country *</label>
                <select 
                  value={shippingAddress.country} 
                  onChange={(e) => setShippingAddress(prev => ({ ...prev, country: e.target.value }))}
                  className="w-full bg-[#050505] text-white border border-[#222] rounded px-2.5 py-2.5 outline-none focus:border-gold-500 text-xs"
                >
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Switzerland">Switzerland</option>
                  <option value="Dubai">United Arab Emirates (Dubai)</option>
                  <option value="Pakistan">Pakistan (Lahore/Karachi)</option>
                </select>
              </div>
            </div>

            <div className="pt-4 flex justify-between items-center border-t border-white/5">
              <button 
                type="button" 
                onClick={() => setStep(1)}
                className="text-xs font-serif text-zinc-450 hover:text-white flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-1" /> Owner profile
              </button>
              <button 
                type="submit" 
                className="bg-[#111111] hover:bg-gold-500 text-gold-400 hover:text-black border border-white/10 px-6 py-2.5 text-xs font-serif uppercase font-bold tracking-widest rounded flex items-center"
                id="step2-submit"
              >
                Continue to Payment <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </form>
        </fieldset>
      )}

      {/* --- STEP 3: PAYMENT GATEWAY SELECTIONS --- */}
      {step === 3 && (
        <fieldset className="bg-[#0A0A0A] p-6 sm:p-8 rounded-lg border border-white/5 shadow-sm space-y-6">
          <div className="border-b border-white/5 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-serif tracking-wider text-white font-semibold uppercase">Step 3: Secured Payment Gateway</h2>
              <p className="text-xs text-zinc-400 font-serif">Supports complete Sandbox mode with live mock clearing authorization networks.</p>
            </div>
            <ShieldCheck className="h-8 w-8 text-gold-500 hidden sm:block" />
          </div>

          {/* Secure gateway options (Stripe, Paypal, PayFast, Easypaisa/Jazzcash) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: 'Stripe Sandbox', label: 'Stripe Gateway' },
              { id: 'PayPal Sandbox', label: 'PayPal Checkout' },
              { id: 'Easypaisa Simu', label: 'Easypaisa Pay' },
              { id: 'JazzCash Simu', label: 'JazzCash Pay' }
            ].map(gw => (
              <button
                key={gw.id}
                type="button"
                onClick={() => { setPaymentMethod(gw.id); setErrorMsg(''); }}
                className={`p-3 text-center border rounded transition-all flex flex-col items-center justify-center space-y-1 ${
                  paymentMethod === gw.id 
                    ? 'border-gold-500 bg-gold-505/10 font-bold text-white' 
                    : 'border-white/10 bg-[#050505] text-zinc-450 hover:border-gold-500/50'
                }`}
                id={`pay-method-${gw.id.replace(/\s+/g, '-')}`}
              >
                <CreditCard className="h-4 w-4 text-gold-600 mb-0.5" />
                <span className="text-[10px] uppercase font-serif tracking-widest">{gw.label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handlePaymentSubmit} className="space-y-4 pt-4 border-t border-white/5">
            {paymentMethod === 'Stripe Sandbox' ? (
              <div className="space-y-4">
                <p className="p-3 bg-[#050505] font-mono text-[10px] text-gold-400 rounded border border-white/5">
                  ⚡ Stripe sandbox fully operational. Enter any dummy cards details below (e.g., 4242 4242... last 4 digits will register).
                </p>
                <div>
                  <label className="block text-xs font-serif uppercase tracking-wider text-zinc-400 mb-1">Credit Card Number *</label>
                  <input 
                    type="text" 
                    value={cardDetails.cardNumber} 
                    onChange={(e) => setCardDetails(prev => ({ ...prev, cardNumber: e.target.value }))}
                    placeholder="4242 4242 4242 4242"
                    maxLength={16}
                    className="w-full bg-[#050505] border border-white/10 text-white rounded px-3 py-2.5 outline-none focus:border-gold-500 text-xs font-mono"
                    required
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-serif uppercase tracking-wider text-zinc-400 mb-1">Card Holder Name *</label>
                    <input 
                      type="text" 
                      value={cardDetails.cardHolder} 
                      onChange={(e) => setCardDetails(prev => ({ ...prev, cardHolder: e.target.value }))}
                      placeholder="Marcus A. Sterling"
                      className="w-full bg-[#050505] border border-white/10 text-white rounded px-3 py-2.5 outline-none focus:border-gold-500 text-xs font-serif uppercase"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-serif uppercase tracking-wider text-zinc-400 mb-1">CVV / CVC *</label>
                    <input 
                      type="password" 
                      value={cardDetails.cvv} 
                      onChange={(e) => setCardDetails(prev => ({ ...prev, cvv: e.target.value }))}
                      placeholder="•••"
                      maxLength={4}
                      className="w-full bg-[#050505] border border-white/10 text-white rounded px-3 py-2.5 outline-none focus:border-gold-500 text-xs font-mono"
                      required
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 border border-dashed border-white/10 rounded bg-[#050505] text-center font-serif text-xs text-zinc-450">
                You selected {paymentMethod}. Secure sandbox direct popup protocols will launch instantly during order review placement. No card is needed.
              </div>
            )}

            <div className="pt-4 flex justify-between items-center border-t border-white/5">
              <button 
                type="button" 
                onClick={() => setStep(2)}
                className="text-xs font-serif text-zinc-450 hover:text-white flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-1" /> Delivery location
              </button>
              <button 
                type="submit" 
                className="bg-[#111111] hover:bg-gold-500 text-gold-400 hover:text-black border border-white/10 px-6 py-2.5 text-xs font-serif uppercase font-bold tracking-widest rounded flex items-center"
                id="step3-submit"
              >
                Review Order <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </form>
        </fieldset>
      )}

      {/* --- STEP 4: ORDER REVIEW & VERIFICATION --- */}
      {step === 4 && (
        <fieldset className="bg-[#0A0A0A] p-6 sm:p-8 rounded-lg border border-white/5 shadow-sm space-y-6">
          <div className="border-b border-white/5 pb-3">
            <h2 className="text-lg font-serif tracking-wider text-white font-semibold uppercase">Step 4: Finalize Curation Review</h2>
            <p className="text-xs text-zinc-400 font-serif">Verify all luxury settings before signing transmission with secure digital seal.</p>
          </div>

          <div className="space-y-4">
            {/* Split layout: products vs. shipping details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-white/5 text-xs text-zinc-350">
              <div className="space-y-2">
                <h4 className="font-serif uppercase tracking-wider text-white font-bold">Client & Courier Contacts</h4>
                <p className="font-serif"><span className="text-zinc-500 font-bold block">Consignee:</span> {customerInfo.fullName}</p>
                <p><span className="text-zinc-500 font-bold block">Delivery location:</span> {shippingAddress.addressLine1}, {shippingAddress.city}, {shippingAddress.postalCode}, {shippingAddress.country}</p>
                <p><span className="text-zinc-500 font-bold block">Channel Alert:</span> {customerInfo.email} | {customerInfo.phone}</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-serif uppercase tracking-wider text-white font-bold">Secure Settlement Parameters</h4>
                <p className="font-serif"><span className="text-zinc-500 font-bold block">Settle Gateway:</span> {paymentMethod}</p>
                {paymentMethod === 'Stripe Sandbox' && (
                  <p className="font-mono"><span className="text-zinc-500 block font-serif">Card last 4 digits:</span> Visa •••• •••• •••• {cardDetails.cardNumber.slice(-4)}</p>
                )}
                <p><span className="text-zinc-500 font-bold block">Taxes Setup:</span> 12% Sovereign Luxury Custom Duty Included</p>
              </div>
            </div>

            {/* Suitcase item lists recap */}
            <div className="space-y-3">
              <h4 className="text-xs font-serif uppercase tracking-wider text-white font-bold">Items to procure</h4>
              {cart.map((item, id) => (
                <div key={id} className="flex justify-between items-center bg-[#050505] border border-white/5 px-3 py-2 rounded text-xs">
                  <div>
                    <span className="font-serif text-white font-bold">{item.product.name}</span>
                    <span className="text-[10px] text-zinc-500 block font-mono">Qty: {item.quantity} × ${item.product.price.toLocaleString()}</span>
                  </div>
                  <span className="font-mono text-gold-400 font-bold">${(item.product.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* Subtotal table block */}
            <div className="border-t border-white/5 pt-4 space-y-1.5 text-xs text-zinc-400 font-serif max-w-xs ml-auto">
              <div className="flex justify-between">
                <span>Trunk Subtotal</span>
                <span className="font-mono text-white">${subtotal.toLocaleString()}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-gold-500">
                  <span>Coupon Deduction ({appliedCoupon.code})</span>
                  <span className="font-mono">-${discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Duty Taxes (12% VAT)</span>
                <span className="font-mono text-white">${tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Insured White-Glove courier</span>
                <span className="font-mono text-white">
                  {shipping === 0 ? <span className="text-gold-500">Complimentary</span> : `$${shipping}`}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white uppercase pt-1.5 border-t border-white/5">
                <span>Total Procurement</span>
                <span className="font-mono text-gold-500 font-bold animate-pulse">${grandTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Trigger Checkout Placement */}
            <div className="pt-6 flex justify-between items-center border-t border-white/5">
              <button 
                type="button" 
                onClick={() => setStep(3)}
                className="text-xs font-serif text-zinc-400 hover:text-white flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-1" /> Adjust payment
              </button>
              <button 
                type="button" 
                onClick={handlePlaceOrder}
                disabled={isAuthorizingPayment}
                className="bg-gold-500 hover:bg-gold-600 font-bold active:scale-95 text-black px-8 py-3.5 text-xs font-serif uppercase tracking-[0.15em] rounded flex items-center shadow-lg transition-transform"
                id="place-order-final"
              >
                {isAuthorizingPayment ? (
                  <span className="flex items-center">
                    <span className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />
                    Authorizing Sandbox Clearing...
                  </span>
                ) : (
                  <span className="flex items-center">
                     Place Luxury Order <Check className="h-4.5 w-4.5 ml-1.5" />
                  </span>
                )}
              </button>
            </div>
          </div>
        </fieldset>
      )}

      {/* --- STEP 5: ACQUIRED CONFIRMATION / INVOICE RECEIPT --- */}
      {step === 5 && completedOrder && (
        <fieldset className="bg-[#0A0A0A] p-8 sm:p-10 rounded-lg border-2 border-gold-500 shadow-2xl space-y-6 text-center animate-in zoom-in-95 duration-500">
          <div className="h-16 w-16 bg-gold-950/20 border border-gold-400 rounded-full flex items-center justify-center mx-auto text-gold-500 animate-bounce">
            <Check className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <span className="font-serif text-[10px] uppercase tracking-[0.3em] text-gold-400 block font-bold animate-pulse">Transaction Confirmed</span>
            <h2 className="text-xl sm:text-2xl font-serif tracking-widest text-white uppercase font-black">Suitcase Acquired Successfully!</h2>
            <p className="text-xs text-zinc-400 font-serif max-w-md mx-auto">
              Your prestigious order <span className="font-mono text-white font-bold">{completedOrder.id}</span> has been signed, authorized, and is being hand-prepared by our Swiss atelier.
            </p>
          </div>

          {/* Inline Receipt Voucher Details */}
          <div className="p-4 bg-[#050505] rounded-lg border border-white/5 text-left max-w-md mx-auto text-xs space-y-2.5">
            <div className="flex justify-between border-b border-white/5 pb-2 font-serif font-semibold text-white uppercase tracking-wide">
              <span>Receipt Invoice</span>
              <span className="font-mono text-gold-500 font-bold">{completedOrder.id}</span>
            </div>
            <div className="space-y-1 text-zinc-300">
              <p className="font-serif"><span className="text-zinc-500">Owner Signature:</span> {completedOrder.customerName}</p>
              <p className="font-serif"><span className="text-zinc-500">Logistics Track:</span> Secured FedEx Air Courier Express</p>
              <p className="font-serif"><span className="text-zinc-500">Settlement Method:</span> {completedOrder.paymentMethod}</p>
              <p className="font-mono text-[11px]"><span className="text-zinc-500 font-serif">Authorization TX:</span> {completedOrder.paymentDetails?.transactionId}</p>
            </div>
            <div className="border-t border-white/5 pt-2 flex justify-between font-bold text-white font-mono">
              <span className="font-serif">Settled Investment:</span>
              <span className="text-gold-500">${completedOrder.total.toLocaleString()}</span>
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={onBackToMaison}
              className="px-8 py-3 bg-[#111111] hover:bg-gold-500 text-gold-400 hover:text-black border border-white/10 text-xs font-serif uppercase tracking-widest font-black rounded transition-all w-full sm:w-auto"
              id="back-to-maison-final"
            >
              Return to boutique
            </button>
            <button 
              onClick={() => window.print()}
              className="px-8 py-3 bg-[#050505] text-zinc-400 hover:text-white border border-white/10 text-xs font-serif uppercase tracking-widest font-bold rounded transition-all w-full sm:w-auto"
              id="print-invoice"
            >
              Print Invoice PDF
            </button>
          </div>
        </fieldset>
      )}

    </main>
  );
}
