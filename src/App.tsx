/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Hero from './components/Hero';
import FeaturedProducts from './components/FeaturedProducts';
import ProductDetail from './components/ProductDetail';
import CartDrawer from './components/CartDrawer';
import CheckoutFlow from './components/CheckoutFlow';
import UserDashboard from './components/UserDashboard';
import AdminPanel from './components/AdminPanel';
import LuxuryConcierge from './components/LuxuryConcierge';

import { Product, CartItem, UserProfile, Order, UserAddress, CouponCode } from './types';
import { MOCK_PRODUCTS } from './data/products';
import { supabase, getProducts, getOrders } from './lib/supabase';

export default function App() {
  // Theme state switcher: true for dark, false for light. Default to false so that text is visible in black.
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('jb_dark_mode');
    return saved === 'true'; // Defaults to light mode (false) as requested
  });

  const handleToggleTheme = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('jb_dark_mode', String(next));
      return next;
    });
  };

  useEffect(() => {
    if (isDarkMode) {
      document.body.style.backgroundColor = '#050505';
      document.body.style.color = '#F5F5F5';
    } else {
      document.body.style.backgroundColor = '#FAF9F5';
      document.body.style.color = '#111111';
    }
  }, [isDarkMode]);

  // Views navigation controls
  const [currentView, setView] = useState<string>('home'); // home, shop, product, checkout, account, admin
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Core database collections synchronized with backend Express REST API
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Cart & Wishlists synchronized locally with standard LocalStorage structures
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  
  // Member authentication state pre-filled with user parameters to allow immediate Admin privileges
  const [userProfile, setUserProfile] = useState<UserProfile>({
    fullName: 'Abbas Khan',
    email: 'muhammadfaisalabbaskhan@gmail.com', // Pre-fill with User Email from requirements
    isLoggedIn: true,
    savedAddresses: [
      {
        id: 'addr-default',
        label: 'Maison Residence',
        fullName: 'Abbas Khan',
        addressLine1: '42 Belgrave Square',
        city: 'London',
        state: 'England',
        postalCode: 'SW1X 8PG',
        country: 'United Kingdom',
        phone: '+44 20 7123 4567',
        isDefault: true
      }
    ],
    wishlist: []
  });

  // Load collections and listen to Supabase auth sessions on boot
  useEffect(() => {
    setIsLoading(true);
    
    async function loadSupabaseData() {
      try {
        const dbProducts = await getProducts();
        if (dbProducts && dbProducts.length > 0) {
          setProducts(dbProducts);
          setIsLoading(false);
        } else {
          fetchProductsFallback();
        }
      } catch (err) {
        console.warn('Supabase products not fully matched. Utilizing fallback stream:', err);
        fetchProductsFallback();
      }
    }

    function fetchProductsFallback() {
      fetch('/api/products')
        .then(res => {
          if (!res.ok) throw new Error('Express endpoint down');
          return res.json();
        })
        .then((data: Product[]) => setProducts(data))
        .catch(err => {
          console.warn('Backend API server not booted, using robust seeded fallback:', err);
          setProducts(MOCK_PRODUCTS);
        })
        .finally(() => setIsLoading(false));
    }

    loadSupabaseData();

    // Fetch orders history
    async function loadOrders() {
      try {
        const dbOrders = await getOrders();
        setOrders(dbOrders);
      } catch (err) {
        fetchOrdersFallback();
      }
    }

    function fetchOrdersFallback() {
      fetch('/api/orders')
        .then(res => res.json())
        .then((data: Order[]) => setOrders(data))
        .catch(err => console.warn('Orders API not accessible immediately:', err));
    }

    loadOrders();

    // Restore Cart states
    const restoredCart = localStorage.getItem('jb_trunk_cart');
    if (restoredCart) {
      try {
        setCart(JSON.parse(restoredCart));
      } catch (e) {
        console.error('Cart state corruption:', e);
      }
    }

    // Restore Wishlist state
    const restoredWish = localStorage.getItem('jb_trunk_wishlist');
    if (restoredWish) {
      try {
        setWishlist(JSON.parse(restoredWish));
      } catch (e) {
        console.error('Wishlist recovery error:', e);
      }
    }

    // Listen for authentication session switches
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const user = session.user;
        const meta = user.user_metadata || {};
        const isAdminUser = user.email?.trim().toLowerCase() === 'muhammadfaisalabbaskhan@gmail.com';
        
        setUserProfile({
          fullName: meta.fullName || meta.full_name || (isAdminUser ? 'Abbas Khan' : user.email?.split('@')[0]) || 'Maison Guest',
          email: user.email || '',
          isLoggedIn: true,
          savedAddresses: [
            {
              id: 'addr-default',
              label: 'Maison Residence',
              fullName: meta.fullName || meta.full_name || (isAdminUser ? 'Abbas Khan' : 'Maison Guest'),
              addressLine1: '42 Belgrave Square',
              city: 'London',
              state: 'England',
              postalCode: 'SW1X 8PG',
              country: 'United Kingdom',
              phone: '+44 20 7123 4567',
              isDefault: true
            }
          ],
          wishlist: []
        });

        // Load correct orders based on admin status
        try {
          const dbOrders = isAdminUser ? await getOrders() : await getOrders(user.id);
          setOrders(dbOrders);
        } catch (e) {
          console.warn('Orders refresh failed for subscriber:', e);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Update localStorage upon cartilage modifications
  const saveCartToStorage = (updatedCart: CartItem[]) => {
    setCart(updatedCart);
    localStorage.setItem('jb_trunk_cart', JSON.stringify(updatedCart));
  };

  const saveWishlistToStorage = (updatedWish: string[]) => {
    setWishlist(updatedWish);
    localStorage.setItem('jb_trunk_wishlist', JSON.stringify(updatedWish));
    setUserProfile(prev => ({ ...prev, wishlist: updatedWish }));
  };

  // --- CART INTERACTIONS ---
  const handleAddToCart = (
    product: Product, 
    quantity: number, 
    selectedSize?: string, 
    selectedColor?: string, 
    selectedScent?: string
  ) => {
    const specTag = [
      selectedSize ? `Size: ${selectedSize}` : '',
      selectedColor ? `${selectedColor}` : '',
      selectedScent ? `Scent: ${selectedScent}` : ''
    ].filter(Boolean).join(', ');

    const existingIndex = cart.findIndex(item => {
      const parts = [
        item.selectedSize ? `Size: ${item.selectedSize}` : '',
        item.selectedColor ? `${item.selectedColor}` : '',
        item.selectedScent ? `Scent: ${item.selectedScent}` : ''
      ].filter(Boolean).join(', ');
      
      return item.product.id === product.id && parts === specTag;
    });

    let updatedCart = [...cart];
    if (existingIndex > -1) {
      updatedCart[existingIndex].quantity += quantity;
    } else {
      updatedCart.push({
        product,
        quantity,
        selectedSize,
        selectedColor,
        selectedScent
      });
    }

    saveCartToStorage(updatedCart);
    setIsCartOpen(true); // Glow cart side bar drawer open
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number, variantSpec?: string) => {
    const updatedCart = cart.map(item => {
      const parts = [
        item.selectedSize ? `Size: ${item.selectedSize}` : '',
        item.selectedColor ? `${item.selectedColor}` : '',
        item.selectedScent ? `Scent: ${item.selectedScent}` : ''
      ].filter(Boolean).join(', ');

      if (item.product.id === productId && (!variantSpec || parts === variantSpec)) {
        return { ...item, quantity };
      }
      return item;
    });
    saveCartToStorage(updatedCart);
  };

  const handleRemoveCartItem = (productId: string, variantSpec?: string) => {
    const updatedCart = cart.filter(item => {
      const parts = [
        item.selectedSize ? `Size: ${item.selectedSize}` : '',
        item.selectedColor ? `${item.selectedColor}` : '',
        item.selectedScent ? `Scent: ${item.selectedScent}` : ''
      ].filter(Boolean).join(', ');

      return !(item.product.id === productId && (!variantSpec || parts === variantSpec));
    });
    saveCartToStorage(updatedCart);
  };

  // Checkout routing shortcut Buy Now
  const handleBuyNow = (
    product: Product, 
    quantity: number, 
    selectedSize?: string, 
    selectedColor?: string, 
    selectedScent?: string
  ) => {
    handleAddToCart(product, quantity, selectedSize, selectedColor, selectedScent);
    setView('checkout');
    setIsCartOpen(false);
  };

  // --- WISHLIST TOGGLE ---
  const handleToggleWishlist = (productId: string) => {
    let updatedWish = [...wishlist];
    if (updatedWish.includes(productId)) {
      updatedWish = updatedWish.filter(id => id !== productId);
    } else {
      updatedWish.push(productId);
    }
    saveWishlistToStorage(updatedWish);
  };

  // --- CHECKOUT SUBMISSION FLOW OVERRIDES ---
  const [appliedCoupon, setAppliedCoupon] = useState<CouponCode | null>(null);
  const [checkoutTaxes, setCheckoutTaxes] = useState(0);
  const [checkoutShipping, setCheckoutShipping] = useState(0);

  const handleInitiateCheckout = (coupon: CouponCode | null, tax: number, ship: number) => {
    setAppliedCoupon(coupon);
    setCheckoutTaxes(tax);
    setCheckoutShipping(ship);
    setView('checkout');
  };

  const handleOrderCompleted = (newOrder: Order) => {
    // Empty suitcase cart levels upon checkout completion
    saveCartToStorage([]);
    setAppliedCoupon(null);
    setOrders(prev => [newOrder, ...prev]);

    // Live update catalog states
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data));
  };

  // --- ACCOUNT AUTH HANDLERS ---
  const handleLoginSuccess = (email: string, fullName: string) => {
    // Strictly restrict registration to the specified user email
    if (email.trim().toLowerCase() !== 'muhammadfaisalabbaskhan@gmail.com') {
      return;
    }
    setUserProfile(prev => ({
      ...prev,
      fullName,
      email,
      isLoggedIn: true
    }));
  };

  const handleLogout = () => {
    setUserProfile({
      fullName: '',
      email: '',
      isLoggedIn: false,
      savedAddresses: [],
      wishlist: []
    });
    setView('home');
  };

  const handleUpdateAddresses = (updatedAddresses: UserAddress[]) => {
    setUserProfile(prev => ({
      ...prev,
      savedAddresses: updatedAddresses
    }));
  };

  // --- ADMINISTRATIVE ACTIONS FOR STATIONS ---
  const handleAddProductAdmin = (newProdData: Omit<Product, 'id' | 'rating' | 'reviewsCount'>) => {
    if (userProfile.email.trim().toLowerCase() !== 'muhammadfaisalabbaskhan@gmail.com') {
      console.error('Unauthorized administrative attempt.');
      return;
    }
    fetch('/api/products', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-admin-email': userProfile.email
      },
      body: JSON.stringify(newProdData)
    })
      .then(res => res.json())
      .then(addedProd => {
        setProducts(prev => [addedProd, ...prev]);
      })
      .catch(err => {
        console.error('Error launching product:', err);
        // Fallback live state tracking
        const fallback: Product = {
          ...newProdData,
          id: `prod-fallback-${Date.now()}`,
          rating: 5.0,
          reviewsCount: 0
        };
        setProducts(prev => [fallback, ...prev]);
      });
  };

  const handleEditProductAdmin = (id: string, updatedFields: Partial<Product>) => {
    if (userProfile.email.trim().toLowerCase() !== 'muhammadfaisalabbaskhan@gmail.com') {
      console.error('Unauthorized administrative attempt.');
      return;
    }
    fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'x-admin-email': userProfile.email
      },
      body: JSON.stringify(updatedFields)
    })
      .then(res => res.json())
      .then(updatedProd => {
        setProducts(prev => prev.map(p => p.id === id ? updatedProd : p));
      })
      .catch(err => {
        console.error('Error editing product:', err);
        setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updatedFields } : p));
      });
  };

  const handleDeleteProductAdmin = (id: string) => {
    if (userProfile.email.trim().toLowerCase() !== 'muhammadfaisalabbaskhan@gmail.com') {
      console.error('Unauthorized administrative attempt.');
      return;
    }
    fetch(`/api/products/${id}`, { 
      method: 'DELETE',
      headers: {
        'x-admin-email': userProfile.email
      }
    })
      .then(() => {
        setProducts(prev => prev.filter(p => p.id !== id));
      })
      .catch(err => {
        console.error('Error deleting product:', err);
        setProducts(prev => prev.filter(p => p.id !== id));
      });
  };

  const handleUpdateOrderStatusAdmin = (id: string, nextStatus: string) => {
    if (userProfile.email.trim().toLowerCase() !== 'muhammadfaisalabbaskhan@gmail.com') {
      console.error('Unauthorized administrative attempt.');
      return;
    }
    fetch(`/api/orders/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'x-admin-email': userProfile.email
      },
      body: JSON.stringify({ status: nextStatus })
    })
      .then(res => res.json())
      .then(updatedOrd => {
        setOrders(prev => prev.map(o => o.id === id ? updatedOrd : o));
      })
      .catch(err => {
        console.error('Error updating order:', err);
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status: nextStatus as any } : o));
      });
  };

  // Core Selector views navigator
  const handleExploreCategory = (category: string) => {
    setSelectedCategory(category);
    setView('shop');
  };

  const handleSelectProductAndOpen = (prod: Product) => {
    setSelectedProduct(prod);
    setView('product');
  };

  return (
    <div className={`flex flex-col min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-[#050505] text-[#F5F5F5]' : 'bg-[#FAF9F5] text-[#111111]'
    }`}>
      
      {/* Header element */}
      <Header 
        currentView={currentView}
        setView={setView}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        cart={cart}
        setIsCartOpen={setIsCartOpen}
        wishlist={wishlist}
        userProfile={userProfile}
        products={products}
        setSelectedProduct={setSelectedProduct}
        onLogout={handleLogout}
        isDarkMode={isDarkMode}
        onToggleTheme={handleToggleTheme}
      />

      {/* Primary body orchestrator layout */}
      <div className="flex-grow">
        
        {currentView === 'home' && (
          <div className="animate-in fade-in duration-700">
            {/* Sliding Parallax Hero banner */}
            <Hero onExplore={handleExploreCategory} />

            {/* Featured Bento Products Display */}
            <FeaturedProducts 
              products={products}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              onSelectProduct={handleSelectProductAndOpen}
              wishlist={wishlist}
              onToggleWishlist={handleToggleWishlist}
              onAddToCart={handleAddToCart}
              isLoading={isLoading}
            />

            {/* Exquisite Brand Story Section */}
            <section className={`py-20 sm:py-28 font-serif text-center relative border-y ${
              isDarkMode ? 'bg-black text-white border-gold-800/15' : 'bg-white text-[#111111] border-zinc-200'
            }`} id="brand-heritage">
              <div className="max-w-4xl mx-auto px-6 space-y-6 sm:space-y-8">
                <span className="text-[10px] uppercase tracking-[0.4em] text-gold-500 font-bold block mb-2">Heritage & Ethos</span>
                <h2 className={`text-3xl sm:text-5xl font-light tracking-[0.2em] uppercase leading-tight font-serif ${isDarkMode ? 'text-gold-100' : 'text-zinc-900'}`}>
                  Tailored To Absolute Perfection
                </h2>
                <div className="h-[1px] w-24 bg-gold-500 mx-auto" />
                <p className={`text-sm sm:text-lg leading-relaxed max-w-2xl mx-auto italic ${isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>
                  "At JB Store, we believe luxury is not just an acquisition, but a private testament to meticulous craft. Every complication caliber, artisanal cut of leather, and distilled extract exists to tell your story under absolute gold parameters."
                </p>
                <div className={`pt-2 text-[10px] tracking-widest uppercase ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
                  Geneva • Milan • Paris • New York
                </div>
              </div>
            </section>
          </div>
        )}

        {currentView === 'shop' && (
          <div className="animate-in fade-in duration-500">
            <FeaturedProducts 
              products={products}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              onSelectProduct={handleSelectProductAndOpen}
              wishlist={wishlist}
              onToggleWishlist={handleToggleWishlist}
              onAddToCart={handleAddToCart}
              isLoading={isLoading}
            />
          </div>
        )}

        {currentView === 'product' && selectedProduct && (
          <div className="animate-in fade-in duration-500">
            <ProductDetail 
              product={selectedProduct}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
              allProducts={products}
              onSelectProduct={handleSelectProductAndOpen}
            />
          </div>
        )}

        {currentView === 'checkout' && (
          <div className="animate-in fade-in duration-500">
            <CheckoutFlow 
              cart={cart}
              appliedCoupon={appliedCoupon}
              tax={checkoutTaxes}
              shipping={checkoutShipping}
              onOrderCompleted={handleOrderCompleted}
              onBackToMaison={() => setView('home')}
            />
          </div>
        )}

        {currentView === 'account' && (
          <div className="animate-in fade-in duration-500">
            <UserDashboard 
              userProfile={userProfile}
              orders={orders}
              products={products}
              onLoginSuccess={handleLoginSuccess}
              onLogout={handleLogout}
              onUpdateAddresses={handleUpdateAddresses}
              onSelectProduct={handleSelectProductAndOpen}
              onRemoveWishlistItem={handleToggleWishlist}
              isDarkMode={isDarkMode}
            />
          </div>
        )}

        {currentView === 'admin' && userProfile.email === 'muhammadfaisalabbaskhan@gmail.com' && (
          <div className="animate-in fade-in duration-500">
            <AdminPanel 
              products={products}
              orders={orders}
              onAddProduct={handleAddProductAdmin}
              onEditProduct={handleEditProductAdmin}
              onDeleteProduct={handleDeleteProductAdmin}
              onUpdateOrderStatus={handleUpdateOrderStatusAdmin}
            />
          </div>
        )}

      </div>

      {/* Slide-over cart drawer overlay */}
      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onCheckout={handleInitiateCheckout}
      />

      {/* Glowing Floating Circular Butler Stylist Concierge */}
      <LuxuryConcierge 
        products={products}
        onSelectProduct={handleSelectProductAndOpen}
        setView={setView}
      />

      {/* Elegant Footer element */}
      <Footer />

    </div>
  );
}
