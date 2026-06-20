/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldCheck, Heart, ArrowRight, Check } from 'lucide-react';

export default function Footer() {
  const [emailSubbed, setEmailSubbed] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setEmailSubbed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-black border-t border-gold-800/15 text-zinc-400 mt-auto font-sans">
      
      {/* Instagram-Style Atelier Showcase Slider */}
      <div className="border-b border-gold-800/10 py-8 bg-zinc-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-6">
            <span className="font-serif text-[10px] uppercase tracking-[0.3em] text-gold-500">Maison Chronicles</span>
            <h4 className="text-white text-lg font-serif tracking-wider font-light mt-1">Inside the JB Atelier</h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
            <div className="relative group overflow-hidden bg-black aspect-video rounded border border-gold-800/10">
              <img 
                src="https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&q=80&w=400" 
                alt="Horological Assembly" 
                className="w-full h-full object-cover grayscale opacity-60 group-hover:opacity-90 group-hover:scale-105 transition-all duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 p-3 flex flex-col justify-end">
                <p className="text-gold-400 font-serif text-[10px] tracking-widest uppercase">The Horologist Assembly</p>
              </div>
            </div>
            <div className="relative group overflow-hidden bg-black aspect-video rounded border border-gold-800/10">
              <img 
                src="https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&q=80&w=400" 
                alt="Leather Handcrafted" 
                className="w-full h-full object-cover grayscale opacity-60 group-hover:opacity-90 group-hover:scale-105 transition-all duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 p-3 flex flex-col justify-end">
                <p className="text-gold-400 font-serif text-[10px] tracking-widest uppercase">Cordwaining handcrafts</p>
              </div>
            </div>
            <div className="relative group overflow-hidden bg-black aspect-video rounded border border-gold-800/10">
              <img 
                src="https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=400" 
                alt="Fragrance Formulation" 
                className="w-full h-full object-cover grayscale opacity-60 group-hover:opacity-90 group-hover:scale-105 transition-all duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 p-3 flex flex-col justify-end">
                <p className="text-gold-400 font-serif text-[10px] tracking-widest uppercase">Perfumery distillation</p>
              </div>
            </div>
            <div className="relative group overflow-hidden bg-black aspect-video rounded border border-gold-800/10">
              <img 
                src="https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=400" 
                alt="Fine tailoring" 
                className="w-full h-full object-cover grayscale opacity-60 group-hover:opacity-90 group-hover:scale-105 transition-all duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 p-3 flex flex-col justify-end">
                <p className="text-gold-400 font-serif text-[10px] tracking-widest uppercase">Tailors Outerwear drapes</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Brand Story Column */}
          <div className="space-y-4">
            <h3 className="text-lg font-serif tracking-[0.2em] text-white flex items-center">
              JB<span className="text-gold-500 font-sans ml-0.5">.</span>STORE
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-serif tracking-wide">
              Established in Geneva with an unyielding ethos for excellence, JB Store designs and tailors rare complications, leather goods, private reserve scents, and couture outers for the grandest lifestyles.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#instagram" className="text-zinc-500 hover:text-gold-400 transition-colors text-xs tracking-wider uppercase font-serif">Instagram</a>
              <a href="#atelier" className="text-zinc-500 hover:text-gold-400 transition-colors text-xs tracking-wider uppercase font-serif">Atelier</a>
              <a href="#chronicles" className="text-zinc-500 hover:text-gold-400 transition-colors text-xs tracking-wider uppercase font-serif font-semibold">Maison</a>
            </div>
          </div>

          {/* Quick Links Categories */}
          <div>
            <h4 className="text-xs text-white uppercase tracking-[0.2em] font-serif mb-4">Our Houses</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#watches" className="hover:text-gold-400 transition-colors">Haute Horology Watches</a></li>
              <li><a href="#shoes" className="hover:text-gold-400 transition-colors">Artisanal Shoes & Boots</a></li>
              <li><a href="#jackets" className="hover:text-gold-400 transition-colors">Tailored Leather Jackets</a></li>
              <li><a href="#perfumes" className="hover:text-gold-400 transition-colors">Private Reserve Oud Parfums</a></li>
            </ul>
          </div>

          {/* Client Privilege Services */}
          <div>
            <h4 className="text-xs text-white uppercase tracking-[0.2em] font-serif mb-4">Privilege Suite</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#concierge" className="hover:text-gold-400 transition-colors">24/7 Digital Butler assistance</a></li>
              <li><a href="#delivery" className="hover:text-gold-400 transition-colors">Insured White-Glove Courier</a></li>
              <li><a href="#fittings" className="hover:text-gold-400 transition-colors">Bespoke Size Consultative Fitting</a></li>
              <li><a href="#repairs" className="hover:text-gold-400 transition-colors">Lifetime Recrafting & Polish</a></li>
            </ul>
          </div>

          {/* Privilege Newsletter Subscription */}
          <div className="space-y-4">
            <h4 className="text-xs text-white uppercase tracking-[0.2em] font-serif">The Royal Bulletin</h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Ascertain invitations to seasonal collections releases, exclusive limited editions and private sales.
            </p>
            {emailSubbed ? (
              <div className="flex items-center space-x-2 text-xs text-gold-400 bg-gold-900/10 border border-gold-800/35 p-3 rounded-lg animate-in fade-in">
                <Check className="h-4 w-4 shrink-0" />
                <span>Privilege bulletin joined successfully.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col space-y-2">
                <div className="flex items-center border border-gold-800/35 rounded overflow-hidden bg-zinc-900 border-r-0">
                  <input 
                    type="email" 
                    placeholder="Provide your email here" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent border-0 text-xs text-white px-3 py-2.5 outline-none placeholder-zinc-600 font-serif"
                    required
                  />
                  <button 
                    type="submit" 
                    className="bg-gold-500 text-black font-serif px-3 py-2.5 font-bold hover:bg-gold-600 transition-colors flex items-center text-xs self-stretch"
                  >
                    Join <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>

        {/* Global Luxury Trust Badges */}
        <div className="border-t border-gold-800/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-500 tracking-wider">
          <div className="flex flex-wrap justify-center sm:justify-start gap-4 mb-4 sm:mb-0">
            <div className="flex items-center space-x-1 border border-zinc-800/60 px-2.5 py-1 rounded bg-zinc-950/20">
              <ShieldCheck className="h-3.5 w-3.5 text-gold-500" />
              <span>SSL SECURE PAYMENT AUTHORIZED</span>
            </div>
            <div className="flex items-center space-x-1 border border-zinc-800/60 px-2.5 py-1 rounded bg-zinc-950/20">
              <span>STRIPE SANDBOX MODE VERIFIED</span>
            </div>
            <div className="flex items-center space-x-1 border border-zinc-800/60 px-2.5 py-1 rounded bg-zinc-950/20">
              <span>FEDEX INSURED COURIER</span>
            </div>
          </div>
          <p>© 2026 JB Store Maison. Hand-tailored under absolute luxury parameters.</p>
        </div>
      </div>
    </footer>
  );
}
