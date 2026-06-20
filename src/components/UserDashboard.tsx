/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, LogOut, MapPin, Heart, ShoppingBag, Check, Plus, Trash2, Key, Info, Star } from 'lucide-react';
import { UserProfile, Order, Product, UserAddress } from '../types';
import { signUp, signIn, resetPasswordForEmail } from '../lib/supabase';

interface UserDashboardProps {
  userProfile: UserProfile;
  orders: Order[];
  products: Product[];
  onLoginSuccess: (email: string, fullName: string) => void;
  onLogout: () => void;
  onUpdateAddresses: (addresses: UserAddress[]) => void;
  onSelectProduct: (product: Product) => void;
  onRemoveWishlistItem: (productId: string) => void;
  isDarkMode?: boolean;
}

export default function UserDashboard({
  userProfile,
  orders,
  products,
  onLoginSuccess,
  onLogout,
  onUpdateAddresses,
  onSelectProduct,
  onRemoveWishlistItem,
  isDarkMode = false
}: UserDashboardProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'addresses' | 'wishlist'>('profile');
  
  // Registration / Logins state
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false);
  
  // Login fields
  const [loginForm, setLoginForm] = useState({ email: 'muhammadfaisalabbaskhan@gmail.com', password: '', fullName: '' });
  const [authSuccess, setAuthSuccess] = useState('');
  const [authError, setAuthError] = useState('');

  // Address add form fields State
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: 'Home',
    fullName: '',
    addressLine1: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
    phone: '',
    isDefault: false
  });

  // Filter current client orders from global order list in state
  const clientOrders = orders.filter(o => o.customerEmail.toLowerCase() === userProfile.email.toLowerCase());

  // Handle Logins via Supabase Auth services
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.email.trim()) {
      setAuthError('Email address is mandatory');
      return;
    }

    // Strictly restrict registration and login to the system administrator's email
    if (loginForm.email.trim().toLowerCase() !== 'muhammadfaisalabbaskhan@gmail.com') {
      setAuthError('Access Denied: Exclusive system registration lock. Only muhammadfaisalabbaskhan@gmail.com is authorized.');
      return;
    }

    try {
      setAuthError('');
      setAuthSuccess('');

      if (isForgotPasswordMode) {
        await resetPasswordForEmail(loginForm.email);
        setAuthSuccess('Instructions to reset your Maison pass-phrase were sent to your email.');
        setTimeout(() => { setIsForgotPasswordMode(false); setAuthSuccess(''); }, 4000);
        return;
      }

      if (isRegisterMode) {
        if (!loginForm.fullName.trim()) {
          setAuthError('Please provide your full noble name');
          return;
        }
        await signUp(loginForm.email, loginForm.password, loginForm.fullName);
        setAuthSuccess('Your Maison admin account was created. Please check your email for verification.');
        onLoginSuccess(loginForm.email, loginForm.fullName);
      } else {
        await signIn(loginForm.email, loginForm.password);
        const name = loginForm.fullName || 'Abbas Khan';
        onLoginSuccess(loginForm.email, name);
        setAuthSuccess(`Welcome back to the Maison lounge, ${name}`);
      }
    } catch (err: any) {
      console.error('Supabase Auth error:', err);
      setAuthError(err.message || 'An error occurred during authentication with Supabase.');
    }

    setTimeout(() => {
      setAuthSuccess('');
    }, 5000);
  };

  // Add customized Address
  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.fullName || !newAddress.addressLine1 || !newAddress.city) return;

    const added: UserAddress = {
      id: `addr-${Date.now()}`,
      ...newAddress
    };

    let updatedList = [...userProfile.savedAddresses];
    if (added.isDefault) {
      updatedList = updatedList.map(a => ({ ...a, isDefault: false }));
    }
    updatedList.push(added);
    onUpdateAddresses(updatedList);

    // Reset fields
    setNewAddress({
      label: 'Home',
      fullName: '',
      addressLine1: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'United States',
      phone: '',
      isDefault: false
    });
    setShowAddressForm(false);
  };

  const handleDeleteAddress = (id: string) => {
    const updatedList = userProfile.savedAddresses.filter(a => a.id !== id);
    onUpdateAddresses(updatedList);
  };

  // IF NOT LOGGED IN, RENDER REGISTRATION / LOGIN FORMS
  if (!userProfile.isLoggedIn) {
    return (
      <main className="max-w-md mx-auto px-4 py-16 sm:py-24 font-sans" id="auth-portal">
        <div className={`${
          isDarkMode ? 'bg-[#0A0A0A] border-white/5 text-white' : 'bg-white border-zinc-200 text-zinc-900'
        } p-6 sm:p-10 border rounded-lg shadow-xl space-y-6`}>
          <div className="text-center">
            <span className="font-serif text-[10px] uppercase tracking-[0.3em] text-gold-500 block mb-2 font-bold animate-pulse">Maison Lounge Privilege</span>
            <h2 className={`text-xl sm:text-2xl font-serif tracking-widest uppercase font-bold ${
              isDarkMode ? 'text-white' : 'text-zinc-900'
            }`}>
              {isForgotPasswordMode ? 'Passphrase Recovery' : isRegisterMode ? 'Inscribe Profile' : 'Maison Sign In'}
            </h2>
            <div className="h-[1px] w-12 bg-gold-500 mx-auto mt-3" />
          </div>

          {authSuccess && <p className="p-3 bg-green-950/20 border border-green-800 text-xs text-green-500 rounded text-center animate-pulse">{authSuccess}</p>}
          {authError && <p className="p-3 bg-red-950/20 border border-red-800 text-xs text-red-500 rounded text-center font-semibold">{authError}</p>}

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {isRegisterMode && !isForgotPasswordMode && (
              <div>
                <label className={`block text-[10px] font-serif uppercase mb-1 ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>Your Noble Name</label>
                <input 
                  type="text" 
                  value={loginForm.fullName}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="Marcus Sterling"
                  className={`w-full ${
                    isDarkMode ? 'bg-[#050505] text-white border-white/10' : 'bg-zinc-50 text-black border-zinc-350'
                  } rounded px-3 py-2 text-xs focus:border-gold-500 outline-none font-serif`}
                  required
                />
              </div>
            )}

            <div>
              <label className={`block text-[10px] font-serif uppercase mb-1 ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>Electronic Mail Address</label>
              <input 
                type="email" 
                value={loginForm.email}
                onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="muhammadfaisalabbaskhan@gmail.com"
                className={`w-full ${
                  isDarkMode ? 'bg-[#050505] text-white border-white/10' : 'bg-zinc-50 text-black border-zinc-350'
                } rounded px-3 py-2 text-xs focus:border-gold-500 outline-none font-mono`}
                required
              />
            </div>

            {!isForgotPasswordMode && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className={`block text-[10px] font-serif uppercase ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>Secure Passphrase</label>
                  <button 
                    type="button" 
                    onClick={() => setIsForgotPasswordMode(true)}
                    className="text-[9px] font-serif uppercase text-gold-600 hover:text-gold-700 tracking-wider transition-colors"
                  >
                    Forgotten?
                  </button>
                </div>
                <input 
                  type="password" 
                  value={loginForm.password}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="••••••••"
                  className={`w-full ${
                    isDarkMode ? 'bg-[#050505] text-white border-white/10' : 'bg-zinc-50 text-black border-zinc-350'
                  } rounded px-3 py-2 text-xs focus:border-gold-500 outline-none font-mono`}
                  required={!isForgotPasswordMode}
                />
              </div>
            )}

            <button
              type="submit"
              className={`w-full ${
                isDarkMode 
                  ? 'bg-[#111111] text-gold-450 hover:text-black hover:bg-gold-500 border-white/15 hover:border-gold-400' 
                  : 'bg-zinc-950 text-white hover:bg-gold-500 hover:text-black border-zinc-700 hover:border-zinc-500'
              } py-3 text-xs font-serif uppercase tracking-widest font-black rounded border transition-all shadow-lg`}
              id="auth-submit-btn"
            >
              {isForgotPasswordMode ? 'Recover Access Link' : isRegisterMode ? 'Create Privilege Profile' : 'Authenticate Entry'}
            </button>
          </form>

          {/* Toggle modes */}
          <div className={`text-center pt-4 border-t ${isDarkMode ? 'border-white/5' : 'border-zinc-200'}`}>
            {isForgotPasswordMode ? (
              <button 
                onClick={() => setIsForgotPasswordMode(false)}
                className={`text-[10px] font-serif uppercase tracking-wider ${isDarkMode ? 'text-zinc-400 hover:text-white' : 'text-zinc-650 hover:text-black'}`}
              >
                Back to Sign-in
              </button>
            ) : isRegisterMode ? (
              <p className={`text-[11px] font-serif ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                Already registered?{' '}
                <button 
                  onClick={() => setIsRegisterMode(false)}
                  className="font-bold text-gold-600 hover:text-gold-700 tracking-wider"
                  id="auth-toggle-signin"
                >
                  SIGN IN HERE
                </button>
              </p>
            ) : (
              <p className={`text-[11px] font-serif ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                First time at the Store?{' '}
                <button 
                  onClick={() => setIsRegisterMode(true)}
                  className="font-bold text-gold-600 hover:text-gold-700 tracking-wider"
                  id="auth-toggle-register"
                >
                  INSCRIBE NEW ACCOUNT
                </button>
              </p>
            )}
            <p className="text-[9px] text-zinc-500 font-mono mt-3">⚡ Tip: Accept all credentials for sandbox testing.</p>
          </div>
        </div>
      </main>
    );
  }

  // --- LOGGED-IN ACCOUNT PORTAL ---
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 font-sans" id="account-privilege-panel">
      
      {/* Profile head banner */}
      <section className="bg-zinc-950 p-6 sm:p-8 rounded-lg border border-gold-800/20 text-white flex flex-col md:flex-row justify-between items-center gap-6 mb-10 shadow-lg">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 rounded-full bg-gold-500/10 border border-gold-500 flex items-center justify-center text-gold-500 text-xl font-serif uppercase font-bold shrink-0">
            {userProfile.fullName.charAt(0)}
          </div>
          <div className="text-left">
            <span className="text-[10px] uppercase font-serif tracking-[0.25em] text-gold-400 block mb-1">Member privilege space</span>
            <h1 className="text-xl sm:text-2xl font-serif font-semibold tracking-wider text-gold-100">{userProfile.fullName}</h1>
            <p className="text-xs text-zinc-400 font-mono">{userProfile.email} | Sandboxed Registered</p>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="px-4 py-2 border border-zinc-700 hover:border-red-500 text-zinc-400 hover:text-red-400 text-xs font-serif uppercase tracking-wider rounded transition-all flex items-center"
          id="account-logout"
        >
          <LogOut className="h-4 w-4 mr-1.5" /> Sign Out
        </button>
      </section>

      {/* Selector tab controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Left tabs container */}
        <aside className="md:col-span-1 flex flex-col space-y-1.5 font-serif text-sm">
          {[
            { id: 'profile', label: 'My Profile', icon: User },
            { id: 'orders', label: 'Order History', icon: ShoppingBag },
            { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
            { id: 'wishlist', label: 'Wishlisted Curation', icon: Heart }
          ].map(tb => {
            const IconComp = tb.icon;
            return (
              <button
                key={tb.id}
                onClick={() => setActiveTab(tb.id as any)}
                className={`w-full flex items-center space-x-2.5 px-4 py-3 rounded text-left transition-colors uppercase text-[11px] tracking-widest font-semibold border ${
                  activeTab === tb.id 
                    ? isDarkMode 
                      ? 'bg-[#111111] text-white border-gold-500/20 font-bold border-l-4 border-l-gold-500' 
                      : 'bg-white text-[#111111] border-zinc-300 font-bold border-l-4 border-l-gold-500 shadow-sm'
                    : isDarkMode 
                      ? 'bg-[#0A0A0A] text-zinc-400 border-white/5 hover:bg-zinc-800 hover:text-white' 
                      : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-150 hover:text-black'
                }`}
                id={`tab-btn-${tb.id}`}
              >
                <IconComp className="h-4.5 w-4.5 text-gold-500" />
                <span>{tb.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Right content display panel */}
        <section className={`md:col-span-3 p-6 sm:p-8 rounded-lg shadow-sm min-h-[400px] border ${
          isDarkMode ? 'bg-[#0A0A0A] border-white/5 text-zinc-300' : 'bg-white border-zinc-200 text-zinc-800'
        }`}>
          
          {/* TAB 1: PROFILE MANAGEMENT */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="border-b border-white/5 pb-3">
                <h3 className="text-base font-serif uppercase tracking-wider text-white font-semibold animate-pulse">Account Identity Management</h3>
                <p className="text-xs text-zinc-400 font-serif">Modify and secure your basic identity settings.</p>
              </div>

              <div className="space-y-4 max-w-md text-xs">
                <div>
                  <span className="text-zinc-500 font-serif block mb-1">Your Full Noble Name</span>
                  <p className="font-serif text-white font-semibold text-sm p-3 bg-[#050505] border border-white/10 rounded">{userProfile.fullName}</p>
                </div>
                <div>
                  <span className="text-zinc-500 font-serif block mb-1">Privilege Registered Email Address</span>
                  <p className="font-mono text-white font-semibold text-sm p-3 bg-[#050505] border border-white/10 rounded">{userProfile.email}</p>
                </div>
                
                <div className="p-4 bg-zinc-950 border border-gold-800/20 text-white rounded text-xs leading-relaxed font-serif flex items-start space-x-3">
                  <Key className="h-5 w-5 text-gold-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-gold-400 block mb-0.5">Maison Vault Encryption</span>
                    These parameters are backed by client-side local cache structures synced with active session layers. Security standards are kept at bank grade levels.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ORDER HISTORY */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="border-b border-white/5 pb-3">
                <h3 className="text-base font-serif uppercase tracking-wider text-white font-semibold">Client Historic Procurements</h3>
                <p className="text-xs text-zinc-400 font-serif">Track and inspect current logistic settings of previous luxury investments.</p>
              </div>

              {clientOrders.length > 0 ? (
                <div className="space-y-6">
                  {clientOrders.map(ord => (
                    <div key={ord.id} className="border border-white/5 rounded overflow-hidden shadow-sm" id={`account-order-${ord.id}`}>
                      {/* Summary strip */}
                      <div className="bg-[#050505] px-4 py-3 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs gap-2">
                        <div>
                          <span className="text-zinc-500 font-bold mr-1 block sm:inline font-serif">Order:</span>
                          <span className="font-mono text-white font-bold">{ord.id}</span>
                          <span className="text-zinc-850 mx-2 hidden sm:inline">|</span>
                          <span className="text-zinc-400 font-mono font-bold">{new Date(ord.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-zinc-400 font-serif">Awaiting:</span>
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-serif uppercase tracking-wider font-semibold ${
                            ord.status === 'Delivered' ? 'bg-green-950/40 text-green-400 border border-green-900/30' :
                            ord.status === 'Shipped' ? 'bg-blue-950/40 text-blue-400 border border-blue-900/30' :
                            ord.status === 'Cancelled' ? 'bg-red-950/40 text-red-400 border border-red-900/30' :
                            'bg-amber-950/40 text-gold-400 border border-gold-900/30 animate-pulse'
                          }`}>
                            {ord.status}
                          </span>
                        </div>
                      </div>

                      {/* Item list */}
                      <div className="p-4 space-y-3 text-xs">
                        {ord.cartItems.map((item, idx) => (
                          <div key={idx} className="flex justify-between font-serif">
                            <span>
                              <span className="font-bold text-white">{item.productName}</span>{' '}
                              {item.selectedVariant && <span className="text-[10px] text-zinc-500">({item.selectedVariant})</span>}
                              <span className="text-zinc-500 font-mono"> x{item.quantity}</span>
                            </span>
                            <span className="font-mono text-gold-400 font-semibold">${(item.price * item.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                        
                        {/* Summary Total */}
                        <div className="border-t border-white/5 pt-2 flex justify-between font-sans text-xs">
                          <span className="text-zinc-400 font-serif">Total Investment Net Duty</span>
                          <span className="font-mono text-gold-500 font-bold text-sm">${ord.total.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 space-y-3">
                  <ShoppingBag className="h-8 w-8 text-neutral-700 mx-auto" />
                  <h4 className="text-xs font-serif uppercase tracking-widest text-zinc-500">Maison Suitcase is Vacuum</h4>
                  <p className="text-xs text-zinc-400 font-serif">You haven't procured any high-fashion orders yet.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PHYSICAL SAVED ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <div className="border-b border-white/5 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="text-base font-serif uppercase tracking-wider text-white font-semibold">Saved Courier Delivery Coordinates</h3>
                  <p className="text-xs text-zinc-400 font-serif">Control precise geographic coordinates for safe handoff.</p>
                </div>
                {!showAddressForm && (
                  <button 
                    onClick={() => setShowAddressForm(true)}
                    className="px-3 py-1.5 bg-[#111111] hover:bg-gold-500 text-gold-400 hover:text-black border border-white/10 text-[10px] font-serif uppercase tracking-wider font-bold rounded flex items-center transition-all"
                    id="add-address-trigger"
                  >
                    <Plus className="h-3 w-3 mr-1" /> Add Address
                  </button>
                )}
              </div>

              {/* Address additions Form */}
              {showAddressForm && (
                <form onSubmit={handleAddAddress} className="p-4 bg-[#050505] border border-white/10 rounded-lg space-y-4 animate-in slide-in-from-top text-xs">
                  <div className="grid grid-cols-2 gap-3 text-white">
                    <div>
                      <label className="block text-zinc-405 font-serif uppercase mb-1">Label Address (e.g. 'Office')</label>
                      <input 
                        type="text" 
                        value={newAddress.label}
                        onChange={(e) => setNewAddress(prev => ({ ...prev, label: e.target.value }))}
                        className="w-full bg-[#0A0A0A] border border-white/10 text-white rounded px-2 py-1.5 focus:border-gold-500 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-405 font-serif uppercase mb-1">Receiver Name</label>
                      <input 
                        type="text" 
                        value={newAddress.fullName}
                        onChange={(e) => setNewAddress(prev => ({ ...prev, fullName: e.target.value }))}
                        className="w-full bg-[#0A0A0A] border border-white/10 text-white rounded px-2 py-1.5 focus:border-gold-500 outline-none font-serif"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-zinc-405 font-serif uppercase mb-1">Street Address Coordinates</label>
                    <input 
                      type="text" 
                      value={newAddress.addressLine1}
                      onChange={(e) => setNewAddress(prev => ({ ...prev, addressLine1: e.target.value }))}
                      className="w-full bg-[#0A0A0A] border border-white/10 text-white rounded px-2 py-1.5 focus:border-gold-500 outline-none font-serif"
                      placeholder="42 Belgrave Square"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-white">
                    <div>
                      <label className="block text-zinc-405 font-serif uppercase mb-1">City</label>
                      <input 
                        type="text" 
                        value={newAddress.city}
                        onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                        className="w-full bg-[#0A0A0A] border border-white/10 text-white rounded px-2 py-1.5 focus:border-gold-500 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-405 font-serif uppercase mb-1">State</label>
                      <input 
                        type="text" 
                        value={newAddress.state}
                        onChange={(e) => setNewAddress(prev => ({ ...prev, state: e.target.value }))}
                        className="w-full bg-[#0A0A0A] border border-white/10 text-white rounded px-2 py-1.5 focus:border-gold-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-405 font-serif uppercase mb-1">Postal Zip Code</label>
                      <input 
                        type="text" 
                        value={newAddress.postalCode}
                        onChange={(e) => setNewAddress(prev => ({ ...prev, postalCode: e.target.value }))}
                        className="w-full bg-[#0A0A0A] border border-white/10 text-white rounded px-2 py-1.5 focus:border-gold-500 outline-none"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-zinc-300">
                    <input 
                      type="checkbox" 
                      checked={newAddress.isDefault}
                      onChange={(e) => setNewAddress(prev => ({ ...prev, isDefault: e.target.checked }))}
                      className="rounded border-[#222] text-gold-500 h-4 w-4 bg-black"
                    />
                    <span>Deploy this address as my primary delivery coordinates</span>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button 
                      type="button" 
                      onClick={() => setShowAddressForm(false)}
                      className="px-3 py-1 bg-[#050505] hover:bg-neutral-900 border border-white/10 rounded text-zinc-400 text-[10px] font-serif uppercase transition-colors"
                    >
                      Dismiss
                    </button>
                    <button 
                      type="submit" 
                      className="px-3 py-1 bg-[#111111] text-gold-450 border border-white/10 rounded text-[10px] font-serif uppercase tracking-wider font-bold hover:bg-gold-500 hover:text-black transition-all"
                      id="save-address-btn"
                    >
                      Save Coordinates
                    </button>
                  </div>
                </form>
              )}

              {/* Address lists */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {userProfile.savedAddresses.map(addr => (
                  <div key={addr.id} className="p-4 border border-white/5 bg-[#050505] rounded shadow-sm text-xs relative space-y-1 font-serif text-zinc-300">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-white border border-gold-400/20 px-2 py-0.5 rounded bg-gold-950/20 uppercase tracking-widest text-[9px]">
                        {addr.label}
                      </span>
                      {addr.isDefault && (
                        <span className="text-[9px] text-gold-400 font-bold tracking-widest uppercase">Primary</span>
                      )}
                    </div>
                    <p className="font-bold text-white text-sm">{addr.fullName}</p>
                    <p className="text-zinc-400 font-sans">{addr.addressLine1}</p>
                    <p className="text-zinc-400 font-sans">{addr.city}, {addr.state} {addr.postalCode}</p>
                    <p className="text-zinc-400 font-sans">{addr.country}</p>
                    
                    <button 
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="absolute bottom-4 right-4 text-zinc-500 hover:text-red-500 transition-colors"
                      title="Destroy coordinates record"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: WISHLISTED ITEMS */}
          {activeTab === 'wishlist' && (
            <div className="space-y-6">
              <div className="border-b border-white/5 pb-3">
                <h3 className="text-base font-serif uppercase tracking-wider text-white font-semibold">User Personalized Wishlisted Curation</h3>
                <p className="text-xs text-zinc-400 font-serif">A showcase of items cataloged for imminent style considerations.</p>
              </div>

              {userProfile.wishlist.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userProfile.wishlist.map(wId => {
                    const wishProduct = products.find(p => p.id === wId);
                    if (!wishProduct) return null;
                    return (
                      <div key={wId} className="border border-white/5 bg-[#050505] rounded p-3 select-none flex flex-col justify-between h-full group" id={`wishlist-item-${wId}`}>
                        <div className="cursor-pointer" onClick={() => onSelectProduct(wishProduct)}>
                          <img 
                            src={wishProduct.images[0]} 
                            alt={wishProduct.name} 
                            className="aspect-square w-full object-cover rounded bg-[#0A0A0A] border border-white/5 mb-2 hover:scale-103 transition-transform duration-350" 
                            referrerPolicy="no-referrer"
                          />
                          <h4 className="text-xs font-serif font-bold text-white line-clamp-1 group-hover:text-gold-400 transition-colors">{wishProduct.name}</h4>
                          <span className="text-xs font-mono text-gold-400 font-bold block mt-1">${wishProduct.price.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-2">
                          <button 
                            onClick={() => onSelectProduct(wishProduct)}
                            className="text-[10px] font-serif text-zinc-400 hover:text-gold-400 font-bold transition-colors"
                          >
                            Examine details
                          </button>
                          <button 
                            onClick={() => onRemoveWishlistItem(wId)}
                            className="text-zinc-500 hover:text-red-400 transition-colors"
                            title="Discard wishlist item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 space-y-3">
                  <Heart className="h-8 w-8 text-neutral-700 mx-auto" />
                  <h4 className="text-xs font-serif uppercase tracking-widest text-zinc-500">Wishlist is Blank</h4>
                  <p className="text-xs text-zinc-400 font-serif">Collect fine models in Horology, footwear, outerwear, and fragrances.</p>
                </div>
              )}
            </div>
          )}

        </section>

      </div>
    </main>
  );
}
