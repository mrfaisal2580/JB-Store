/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Clock } from 'lucide-react';

interface HeroProps {
  onExplore: (category: string) => void;
}

const SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&q=80&w=1800',
    subtitle: 'The Pinnacle of Horology',
    title: 'THE ROYALE CHRONOGRAPH',
    description: 'A masterpiece crafted from hand-polished 18k rose gold, featuring a sophisticated skeletonized double-barrel caliber automatic movement.',
    cta: 'Explore Watches',
    category: 'watches'
  },
  {
    image: 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&q=80&w=1800', // Luxury shoes
    subtitle: 'Milanese Craftsmanship',
    title: 'SARTORIAL FLAVIO BOOTS',
    description: 'Whole-cut Italian calfskin, colored and patinated completely by hand to achieve an exquisite rich mahogany shine.',
    cta: 'Acquire Footwear',
    category: 'shoes'
  },
  {
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=1800', // Leather jackets
    subtitle: 'The Outerwear Atelier',
    title: 'OBSIDIAN BIKER CASHMERE',
    description: 'Selected premium double leather backed by dense sheared lamb cashmere wool, providing a heavy structured silhouette.',
    cta: 'Examine Leather',
    category: 'jackets'
  },
  {
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=1800', // Luxury cologne
    subtitle: 'Private Gold Selection',
    title: 'PRIVÉ OUD SEDUCTION',
    description: 'Distilled wild Cambodian oud oils paired with warm red rose petals and thick Madagascar vanilla extract. Extrait concentration.',
    cta: 'Inhale Seduction',
    category: 'perfumes'
  }
];

export default function Hero({ onExplore }: HeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 32, seconds: 45 });

  // Slide rotation interval
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  // Premium countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 12, minutes: 0, seconds: 0 }; // Loop countdown
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  };

  return (
    <section className="relative w-full h-[500px] sm:h-[650px] lg:h-[750px] bg-zinc-950 overflow-hidden border-b border-gold-800/20" id="maison-hero">
      
      {/* Background Slides */}
      {SLIDES.map((slide, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out transform ${
            idx === currentSlide ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-105 z-0'
          }`}
        >
          {/* Subtle gold-dark mask overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/35 z-20" />
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover select-none"
            referrerPolicy="no-referrer"
          />
          
          {/* Animated Slide Content Box */}
          <div className="absolute inset-0 flex items-center z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`max-w-2xl text-left space-y-4 sm:space-y-6 transition-all duration-1000 transform ${
              idx === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}>
              
              <div className="flex items-center space-x-2 text-gold-400">
                <Sparkles className="h-4 w-4 animate-spin duration-3000" />
                <span className="font-serif text-xs font-semibold tracking-[0.3em] uppercase block">
                  {slide.subtitle}
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-extrabold text-white tracking-wider leading-tight drop-shadow-md">
                {slide.title}
              </h1>

              <p className="text-sm sm:text-lg text-zinc-300 leading-relaxed font-serif max-w-xl">
                {slide.description}
              </p>

              {/* Animated Button Action */}
              <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <button
                  onClick={() => onExplore(slide.category)}
                  className="px-8 py-3.5 bg-gold-500 hover:bg-gold-600 active:scale-98 text-black text-xs font-serif font-black uppercase tracking-[0.2em] rounded border border-gold-400 hover:shadow-lg hover:shadow-gold-500/10 transition-all duration-300 text-center"
                  id={`cta-explore-${slide.category}`}
                >
                  {slide.cta}
                </button>
                <button
                  onClick={() => onExplore('all')}
                  className="px-8 py-3.5 bg-transparent hover:bg-white/5 active:scale-98 text-white text-xs font-serif tracking-[0.2em] uppercase rounded border border-zinc-700 hover:border-gold-500 transition-all duration-300 text-center"
                  id="cta-explore-catalog"
                >
                  Examine All Collections
                </button>
              </div>

            </div>
          </div>

        </div>
      ))}

      {/* Floating Limited Event Countdown Clock Widget */}
      <div className="absolute bottom-6 right-6 sm:bottom-12 sm:right-12 z-30 hidden lg:flex items-center space-x-4 bg-black/85 border border-gold-800/35 px-5 py-3 rounded backdrop-blur-md text-white shadow-2xl">
        <Clock className="h-5 w-5 text-gold-500 animate-pulse shrink-0" />
        <div className="text-left font-serif text-xs">
          <span className="text-[10px] uppercase text-gold-400 tracking-widest block font-bold mb-1">Maison Gold Event Sale</span>
          <div className="font-mono text-sm tracking-wider flex items-center space-x-1.5 font-bold">
            <span className="bg-zinc-900 border border-gold-800/20 px-1.5 py-0.5 rounded text-gold-400">{String(timeLeft.hours).padStart(2, '0')}H</span>
            <span>:</span>
            <span className="bg-zinc-900 border border-gold-800/20 px-1.5 py-0.5 rounded text-gold-400">{String(timeLeft.minutes).padStart(2, '0')}M</span>
            <span>:</span>
            <span className="bg-zinc-900 border border-gold-800/20 px-1.5 py-0.5 rounded text-gold-400 text-gold-500">{String(timeLeft.seconds).padStart(2, '0')}S</span>
          </div>
        </div>
      </div>

      {/* Chevron Slider Navigation arrows */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-3 rounded-full border border-gold-800/20 bg-black/60 hover:bg-gold-500 hover:text-black hover:border-gold-400 text-gold-400 transition-all shadow-lg active:scale-90"
        aria-label="Previous Slide"
        id="hero-slide-prev"
      >
        <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>
      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-3 rounded-full border border-gold-800/20 bg-black/60 hover:bg-gold-500 hover:text-black hover:border-gold-400 text-gold-400 transition-all shadow-lg active:scale-90"
        aria-label="Next Slide"
        id="hero-slide-next"
      >
        <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>

      {/* Slide Navigation Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex space-x-2.5">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === currentSlide ? 'w-8 bg-gold-500' : 'w-2.5 bg-zinc-600 hover:bg-zinc-400'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
            id={`hero-dot-${idx}`}
          />
        ))}
      </div>

    </section>
  );
}
