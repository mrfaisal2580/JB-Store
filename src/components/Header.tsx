/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, Heart, ShoppingBag, User, Menu, X, ArrowLeft, Settings, Sun, Moon } from 'lucide-react';
import { Product, CartItem, UserProfile } from '../types';

interface HeaderProps {
  currentView: string;
  setView: (view: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  cart: CartItem[];
  setIsCartOpen: (open: boolean) => void;
  wishlist: string[];
  userProfile: UserProfile;
  products: Product[];
  setSelectedProduct: (product: Product | null) => void;
  onLogout: () => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
}

export default function Header({
  currentView,
  setView,
  selectedCategory,
  setSelectedCategory,
  cart,
  setIsCartOpen,
  wishlist,
  userProfile,
  products,
  setSelectedProduct,
  onLogout,
  isDarkMode = false,
  onToggleTheme = () => {}
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);

  // Calculate cart count
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Handle live search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (q.trim().length > 1) {
      const results = products.filter(p => 
        p.name.toLowerCase().includes(q.toLowerCase()) || 
        p.category.toLowerCase().includes(q.toLowerCase()) ||
        p.description.toLowerCase().includes(q.toLowerCase())
      );
      setSearchResults(results.slice(0, 5));
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectSearchResult = (product: Product) => {
    setSelectedProduct(product);
    setView('product');
    setIsSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleNavCategory = (category: string) => {
    setSelectedCategory(category);
    setView('shop');
    setIsMobileMenuOpen(false);
  };

  const iconClass = isDarkMode ? 'text-zinc-300 hover:text-gold-400' : 'text-zinc-700 hover:text-gold-600';
  const textClass = isDarkMode ? 'text-zinc-300 hover:text-gold-400' : 'text-zinc-800 hover:text-gold-600';

  return (
    <header className={`sticky top-0 z-40 w-full transition-all duration-300 backdrop-blur-md border-b ${
      isDarkMode ? 'bg-black/95 border-gold-800/15 text-[#F5F5F5]' : 'bg-white/95 border-zinc-200 text-[#111111] shadow-sm'
    }`}>
      {/* Absolute topmost premium ticker */}
      <div className={`py-2 text-[10px] sm:text-xs text-center border-b tracking-[0.25em] font-serif uppercase ${
        isDarkMode ? 'bg-black text-gold-400 border-gold-800/10' : 'bg-[#FAF9F5] text-gold-600 border-zinc-200'
      }`}>
        Complimentary First-Class Shipping across Europe, GCC, & US • Use code <span className="font-bold">JB20</span> for 20% privilege
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Mobile hamburger */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-1.5 rounded-md focus:outline-none ${isDarkMode ? 'text-gold-400 hover:text-white' : 'text-gold-600 hover:text-black'}`}
              id="mobile-menu-btn"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Navigation Links for Desktop */}
          <nav className="hidden md:flex space-x-6 lg:space-x-8 text-xs font-medium tracking-[0.15em] uppercase font-serif">
            <button 
              onClick={() => { setView('home'); setSelectedCategory('all'); }}
              className={`transition-colors duration-200 hover:text-gold-400 ${
                currentView === 'home' 
                  ? 'text-gold-500 font-semibold font-bold' 
                  : isDarkMode ? 'text-zinc-300' : 'text-zinc-650'
              }`}
              id="nav-home"
            >
              The Maison
            </button>
            <button 
              onClick={() => handleNavCategory('watches')}
              className={`transition-colors duration-200 hover:text-gold-400 ${
                selectedCategory === 'watches' && currentView === 'shop' 
                  ? 'text-gold-500 font-semibold font-bold' 
                  : isDarkMode ? 'text-zinc-300' : 'text-zinc-650'
              }`}
              id="nav-watches"
            >
              Horology
            </button>
            <button 
              onClick={() => handleNavCategory('shoes')}
              className={`transition-colors duration-200 hover:text-gold-400 ${
                selectedCategory === 'shoes' && currentView === 'shop' 
                  ? 'text-gold-500 font-semibold font-bold' 
                  : isDarkMode ? 'text-zinc-300' : 'text-zinc-650'
              }`}
              id="nav-shoes"
            >
              Footwear
            </button>
            <button 
              onClick={() => handleNavCategory('jackets')}
              className={`transition-colors duration-200 hover:text-gold-400 ${
                selectedCategory === 'jackets' && currentView === 'shop' 
                  ? 'text-gold-500 font-semibold font-bold' 
                  : isDarkMode ? 'text-zinc-300' : 'text-zinc-650'
              }`}
              id="nav-jackets"
            >
              Outerwear
            </button>
            <button 
              onClick={() => handleNavCategory('perfumes')}
              className={`transition-colors duration-200 hover:text-gold-400 ${
                selectedCategory === 'perfumes' && currentView === 'shop' 
                  ? 'text-gold-500 font-semibold font-bold' 
                  : isDarkMode ? 'text-zinc-300' : 'text-zinc-650'
              }`}
              id="nav-perfumes"
            >
              Parfums
            </button>
          </nav>

          {/* Center Brand Logo */}
          <div className="flex-1 flex justify-center md:flex-initial">
            <button 
              onClick={() => { setView('home'); setSelectedCategory('all'); }} 
              className={`text-2xl sm:text-3xl font-serif font-black tracking-[0.2em] flex items-center hover:opacity-95 ${
                isDarkMode ? 'text-white' : 'text-[#111111]'
              }`}
              id="brand-logo"
            >
              JB<span className="text-gold-500 mt-1 ml-0.5 font-bold font-sans">.</span>STORE
            </button>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            
            {/* Theme switcher */}
            <button 
              onClick={onToggleTheme}
              className={`p-1.5 rounded-full transition-colors ${iconClass}`}
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              id="theme-switcher-btn"
            >
              {isDarkMode ? <Sun className="h-5 w-5 text-gold-400" /> : <Moon className="h-5 w-5 text-zinc-700" />}
            </button>

            {/* Search Toggle */}
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`p-1.5 rounded-full transition-colors ${iconClass}`}
              title="Search Collections"
              id="header-search-toggle"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Wishlist Icon */}
            <button 
              onClick={() => setView('account')}
              className={`p-1.5 rounded-full transition-colors relative ${iconClass}`}
              title="View Wishlist"
              id="header-wishlist"
            >
              <Heart className="h-5 w-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-0 right-0 -mt-1 -mr-1 h-4 w-4 bg-gold-500 text-black font-sans font-bold text-[9px] flex items-center justify-center rounded-full">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Shopping Cart Bag */}
            <button 
              onClick={() => setIsCartOpen(true)}
              className={`p-1.5 rounded-full transition-colors relative ${iconClass}`}
              title="Shopping Cart"
              id="header-cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 -mt-1 -mr-1 h-4 w-4 bg-gold-500 text-black font-sans font-bold text-[9px] flex items-center justify-center rounded-full animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Account Portal Info */}
            <div className="flex items-center space-x-1 pl-1">
              {userProfile.isLoggedIn ? (
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => setView('account')}
                    className={`flex items-center space-x-1.5 text-xs transition-colors font-serif uppercase tracking-wider ${textClass}`}
                    id="header-account-btn"
                  >
                    <User className="h-4 w-4 text-gold-500" />
                    <span className="hidden lg:inline max-w-[80px] truncate">{userProfile.fullName.split(' ')[0]}</span>
                  </button>
                  {userProfile.email === 'muhammadfaisalabbaskhan@gmail.com' && (
                    <button 
                      onClick={() => setView('admin')}
                      className={`p-1 transition-colors relative group ${iconClass}`}
                      title="Admin Dashboard"
                      id="header-admin-btn"
                    >
                      <Settings className="h-4 w-4" />
                      <span className="absolute bottom-[-24px] right-0 scale-0 group-hover:scale-100 transition-all duration-150 text-[9px] bg-gold-500 text-black font-sans px-1 py-0.5 rounded font-black">
                        ADMIN
                      </span>
                    </button>
                  )}
                </div>
              ) : (
                <button 
                  onClick={() => setView('account')}
                  className={`p-1.5 transition-colors ${iconClass}`}
                  title="Sign In / Register"
                  id="header-login-btn"
                >
                  <User className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Real-time Luxury Floating Search overlay */}
      {isSearchOpen && (
        <div className="absolute top-full left-0 w-full bg-black/98 border-b border-gold-800/20 py-4 px-4 sm:px-8 shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-top-4">
          <div className="max-w-3xl mx-auto relative">
            <div className="flex items-center border border-gold-800/35 rounded-full bg-zinc-900/60 px-4 py-2">
              <Search className="h-5 w-5 text-gold-500 mr-2" />
              <input 
                type="text" 
                placeholder="Exquire our collections (e.g. 'Oud', 'Skeleton', 'Chelsea')..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full bg-transparent border-none text-white text-sm focus:outline-none focus:ring-0 placeholder-zinc-500"
                autoFocus
              />
              <button 
                onClick={() => { setIsSearchOpen(false); setSearchQuery(''); setSearchResults([]); }}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Auto suggestions */}
            {searchResults.length > 0 && (
              <div className="absolute left-0 right-0 mt-2 bg-zinc-950 border border-gold-800/35 rounded-xl shadow-2xl overflow-hidden z-50">
                <div className="p-2 border-b border-gold-800/10 text-[10px] tracking-widest text-zinc-400 uppercase font-serif">Suggested items</div>
                {searchResults.map(p => (
                  <button 
                    key={p.id}
                    onClick={() => handleSelectSearchResult(p)}
                    className="w-full flex items-center p-3 text-left hover:bg-zinc-900 border-b border-zinc-900 last:border-b-0 transition-all"
                  >
                    <img src={p.images[0]} alt={p.name} className="h-10 w-10 object-cover rounded-md border border-gold-800/20 mr-3" referrerPolicy="no-referrer" />
                    <div>
                      <div className="text-white text-xs font-serif font-semibold tracking-wider">{p.name}</div>
                      <div className="text-gold-400 text-[10px] font-sans font-bold">${p.price.toLocaleString()}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {searchQuery.trim().length > 1 && searchResults.length === 0 && (
              <div className="absolute left-0 right-0 mt-2 bg-zinc-950 border border-gold-800/35 rounded-xl p-6 text-center text-zinc-500 text-xs font-serif">
                Nothing matches this elite selection. Let Jean-Baptiste styling concierge help!
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile drawer Navigation menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-black border-b border-gold-800/15 py-4 px-6 animate-in slide-in-from-top duration-300">
          <div className="flex flex-col space-y-4 font-serif text-sm uppercase tracking-widest text-zinc-300">
            <button 
              onClick={() => { setView('home'); setSelectedCategory('all'); setIsMobileMenuOpen(false); }}
              className={`text-left py-2 hover:text-gold-400 ${currentView === 'home' ? 'text-gold-500 font-bold' : ''}`}
            >
              The Maison
            </button>
            <button 
              onClick={() => handleNavCategory('watches')}
              className={`text-left py-2 hover:text-gold-400 ${selectedCategory === 'watches' && currentView === 'shop' ? 'text-gold-500 font-bold' : ''}`}
            >
              Horology
            </button>
            <button 
              onClick={() => handleNavCategory('shoes')}
              className={`text-left py-2 hover:text-gold-400 ${selectedCategory === 'shoes' && currentView === 'shop' ? 'text-gold-500 font-bold' : ''}`}
            >
              Footwear
            </button>
            <button 
              onClick={() => handleNavCategory('jackets')}
              className={`text-left py-2 hover:text-gold-400 ${selectedCategory === 'jackets' && currentView === 'shop' ? 'text-gold-500 font-bold' : ''}`}
            >
              Outerwear
            </button>
            <button 
              onClick={() => handleNavCategory('perfumes')}
              className={`text-left py-2 hover:text-gold-400 ${selectedCategory === 'perfumes' && currentView === 'shop' ? 'text-gold-500 font-bold' : ''}`}
            >
              Parfums
            </button>

            {userProfile.isLoggedIn && userProfile.email === 'muhammadfaisalabbaskhan@gmail.com' && (
              <button 
                onClick={() => { setView('admin'); setIsMobileMenuOpen(false); }}
                className="text-left py-2 text-gold-400 font-semibold border-t border-gold-800/10 pt-4 flex items-center"
              >
                <Settings className="h-4 w-4 mr-2" /> Admin Dashboard
              </button>
            )}

            {userProfile.isLoggedIn && (
              <button 
                onClick={() => { onLogout(); setIsMobileMenuOpen(false); }}
                className="text-left text-xs text-red-400 hover:text-red-500 border-t border-zinc-800 pt-4"
              >
                Log Out of Account
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
