/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { SlidersHorizontal, Plus, Edit2, Trash2, Check, TrendingUp, DollarSign, Package, Users, Tag, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Product, Order } from '../types';

interface AdminPanelProps {
  products: Product[];
  orders: Order[];
  onAddProduct: (prod: Omit<Product, 'id' | 'rating' | 'reviewsCount'>) => void;
  onEditProduct: (id: string, updated: Partial<Product>) => void;
  onDeleteProduct: (id: string) => void;
  onUpdateOrderStatus: (id: string, status: string) => void;
}

export default function AdminPanel({
  products,
  orders,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onUpdateOrderStatus
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'analytics' | 'products' | 'orders' | 'discounts'>('analytics');
  
  // Create / Edit states fields
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'watches',
    sku: '',
    price: 350,
    originalPrice: 400,
    stock: 10,
    description: '',
    specs: '', // comma key:val
    images: '', // comma separated URL
    sizes: '', // comma separated size
    colors: '', // comma colors
    scents: '', // comma scents
    featured: false,
    newArrival: false,
    bestSeller: false
  });

  // Calculate live analytics mathematically
  const analytics = useMemo(() => {
    const totalRevenue = orders.reduce((acc, o) => o.status !== 'Cancelled' ? acc + o.total : acc, 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Unique customers
    const uniqueEmails = new Set(orders.map(o => o.customerEmail.toLowerCase()));
    
    // Inventory alerts count <= 2
    const lowStockAlerts = products.filter(p => p.stock <= 2).length;

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      totalCustomers: uniqueEmails.size || 1,
      lowStockAlerts
    };
  }, [orders, products]);

  // Handle Add Form submits
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.sku) return;

    // Build specs record object
    const specsObj: Record<string, string> = {};
    if (productForm.specs) {
      productForm.specs.split(',').forEach(pair => {
        const parts = pair.split(':');
        if (parts.length === 2) {
          specsObj[parts[0].trim()] = parts[1].trim();
        }
      });
    } else {
      // Default placeholder specs
      specsObj['Material'] = 'Luxury Standard Grade';
      specsObj['Origin'] = 'Maison Direct Atelier';
    }

    const payload = {
      name: productForm.name,
      sku: productForm.sku,
      category: productForm.category,
      price: Number(productForm.price),
      originalPrice: productForm.originalPrice ? Number(productForm.originalPrice) : undefined,
      stock: Number(productForm.stock),
      description: productForm.description,
      details: ['Crafted in custom limited luxury runs', 'Sealed with the Maison stamp'],
      specs: specsObj,
      images: productForm.images ? productForm.images.split(',').map(u => u.trim()) : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800'],
      sizes: productForm.sizes ? productForm.sizes.split(',').map(s => s.trim()) : undefined,
      colors: productForm.colors ? productForm.colors.split(',').map(c => c.trim()) : undefined,
      scents: productForm.scents ? productForm.scents.split(',').map(sc => sc.trim()) : undefined,
      featured: productForm.featured,
      newArrival: productForm.newArrival,
      bestSeller: productForm.bestSeller
    };

    onAddProduct(payload);
    setShowAddForm(false);
    resetProductForm();
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    // Specs rebuild
    const specsObj: Record<string, string> = {};
    if (productForm.specs) {
      productForm.specs.split(',').forEach(pair => {
        const parts = pair.split(':');
        if (parts.length === 2) {
          specsObj[parts[0].trim()] = parts[1].trim();
        }
      });
    }

    const updated: Partial<Product> = {
      name: productForm.name,
      sku: productForm.sku,
      category: productForm.category,
      price: Number(productForm.price),
      originalPrice: productForm.originalPrice ? Number(productForm.originalPrice) : undefined,
      stock: Number(productForm.stock),
      description: productForm.description,
      specs: specsObj,
      images: productForm.images ? productForm.images.split(',').map(u => u.trim()) : [editingProduct.images[0]],
      featured: productForm.featured,
      newArrival: productForm.newArrival,
      bestSeller: productForm.bestSeller
    };

    onEditProduct(editingProduct.id, updated);
    setEditingProduct(null);
    resetProductForm();
  };

  const triggerEdit = (prod: Product) => {
    setEditingProduct(prod);
    
    // Deconstruct specs
    const specsStr = Object.entries(prod.specs).map(([k, v]) => `${k}:${v}`).join(', ');

    setProductForm({
      name: prod.name,
      category: prod.category,
      sku: prod.sku,
      price: prod.price,
      originalPrice: prod.originalPrice || 0,
      stock: prod.stock,
      description: prod.description,
      specs: specsStr,
      images: prod.images.join(', '),
      sizes: prod.sizes?.join(', ') || '',
      colors: prod.colors?.join(', ') || '',
      scents: prod.scents?.join(', ') || '',
      featured: !!prod.featured,
      newArrival: !!prod.newArrival,
      bestSeller: !!prod.bestSeller
    });
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      category: 'watches',
      sku: '',
      price: 1500,
      originalPrice: 1800,
      stock: 5,
      description: '',
      specs: 'Material: Solid Grade, Origin: Swiss Tailored',
      images: '',
      sizes: '',
      colors: '',
      scents: '',
      featured: false,
      newArrival: false,
      bestSeller: false
    });
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 font-sans bg-[#FBFBFB] min-h-[700px]" id="executive-admin-panel">
      
      {/* Title & subtitle bar */}
      <section className="mb-10 text-left flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <span className="font-serif text-[10px] uppercase tracking-[0.3em] text-gold-600 block mb-1 font-bold">Consolidated Executive suite</span>
          <h1 className="text-2xl sm:text-3xl font-serif tracking-wider font-bold text-black uppercase flex items-center">
            Maison Atelier Control Dash
          </h1>
          <p className="text-xs text-zinc-500 font-serif">Configure parameters, dispatch delivery couriers, and modify custom product items.</p>
        </div>
        
        {/* Quick selector tabs */}
        <div className="flex bg-zinc-200 p-1.5 rounded-lg text-xs font-serif uppercase tracking-wider space-x-1.5 self-start md:self-auto">
          {[
            { id: 'analytics', label: 'Analytics' },
            { id: 'products', label: 'Products Catalogue' },
            { id: 'orders', label: 'Orders Dispatch' }
          ].map(tb => (
            <button
              key={tb.id}
              onClick={() => setActiveTab(tb.id as any)}
              className={`px-4 py-2 rounded transition-colors font-bold ${
                activeTab === tb.id ? 'bg-black text-white shadow' : 'text-zinc-600 hover:text-black'
              }`}
            >
              {tb.label}
            </button>
          ))}
        </div>
      </section>

      {/* TAB 1: EXECUTIVE ANALYTICS */}
      {activeTab === 'analytics' && (
        <section className="space-y-10">
          
          {/* Dynamic numerical grids */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            
            <div className="p-5 bg-black border border-gold-800/10 rounded text-left relative overflow-hidden group">
              <span className="text-zinc-500 text-[9px] uppercase tracking-widest font-serif block mb-2">Sovereign Revenue</span>
              <span className="font-mono text-xl sm:text-2xl font-bold text-gold-100 block">${analytics.totalRevenue.toLocaleString()}</span>
              <div className="absolute top-4 right-4 text-gold-500 shrink-0"><DollarSign className="h-5 w-5 opacity-60" /></div>
            </div>

            <div className="p-5 bg-white border border-zinc-200 rounded text-left relative">
              <span className="text-zinc-500 text-[9px] uppercase tracking-widest font-serif block mb-2">Order Procurements</span>
              <span className="font-mono text-xl sm:text-2xl font-bold text-zinc-950 block">{analytics.totalOrders} active</span>
              <div className="absolute top-4 right-4 text-zinc-400 shrink-0"><Package className="h-5 w-5" /></div>
            </div>

            <div className="p-5 bg-white border border-zinc-200 rounded text-left relative">
              <span className="text-zinc-500 text-[9px] uppercase tracking-widest font-serif block mb-2">Mean Order Value</span>
              <span className="font-mono text-xl sm:text-2xl font-bold text-zinc-950 block">${Math.round(analytics.averageOrderValue).toLocaleString()}</span>
              <div className="absolute top-4 right-4 text-zinc-400 shrink-0"><TrendingUp className="h-5 w-5" /></div>
            </div>

            <div className="p-5 bg-white border border-zinc-200 rounded text-left relative">
              <span className="text-zinc-500 text-[9px] uppercase tracking-widest font-serif block mb-2">Authenticated Clients</span>
              <span className="font-mono text-xl sm:text-2xl font-bold text-zinc-950 block">{analytics.totalCustomers} direct</span>
              <div className="absolute top-4 right-4 text-zinc-400 shrink-0"><Users className="h-5 w-5" /></div>
            </div>

            <div className="p-5 bg-white border border-zinc-200 rounded text-left relative col-span-2 lg:col-span-1">
              <span className="text-zinc-500 text-[9px] uppercase tracking-widest font-serif block mb-2">Inventory Stock alerts</span>
              <span className={`font-mono text-xl sm:text-2xl font-bold block ${analytics.lowStockAlerts > 0 ? 'text-amber-500' : 'text-zinc-950'}`}>
                {analytics.lowStockAlerts} items
              </span>
              <div className="absolute top-4 right-4 shrink-0"><AlertTriangle className={`h-5 w-5 ${analytics.lowStockAlerts > 0 ? 'text-amber-500' : 'text-zinc-300'}`} /></div>
            </div>

          </div>

          {/* Micro chart mockup or stats lines */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs font-serif text-zinc-650 leading-relaxed">
            <div className="p-6 bg-white border border-zinc-200 rounded-lg space-y-4">
              <h4 className="text-sm font-semibold text-black uppercase tracking-wider pb-2 border-b border-zinc-100">Regional Distribution statistics</h4>
              <ul className="space-y-2.5">
                <li className="flex justify-between"><span>Europe (Switzerland, Geneva)</span> <span className="font-mono text-black font-semibold">45% placement</span></li>
                <li className="flex justify-between"><span>Gulf Council (GCC Dubai)</span> <span className="font-mono text-black font-semibold">30% placement</span></li>
                <li className="flex justify-between"><span>Americas / United Kingdom</span> <span className="font-mono text-black font-semibold">25% placement</span></li>
              </ul>
            </div>
            
            <div className="p-6 bg-white border border-zinc-200 rounded-lg space-y-4">
              <h4 className="text-sm font-semibold text-black uppercase tracking-wider pb-2 border-b border-zinc-100">Atelier Stock warning tracker</h4>
              <div className="space-y-2">
                {products.filter(p => p.stock <= 2).map(p => (
                  <div key={p.id} className="flex justify-between bg-amber-50/50 p-2 border border-amber-200/60 rounded text-[11px] font-mono">
                    <span className="font-serif font-bold text-zinc-950 truncate max-w-[200px]">{p.name} ({p.sku})</span>
                    <span className="text-amber-600 font-bold">Only {p.stock} units!</span>
                  </div>
                ))}
                {analytics.lowStockAlerts === 0 && (
                  <div className="text-center py-6 text-zinc-400">All atelier collections are properly stocked above minimum safety marks.</div>
                )}
              </div>
            </div>
          </div>

        </section>
      )}

      {/* TAB 2: PRODUCTS CATALOGUE MANAGE */}
      {activeTab === 'products' && (
        <section className="space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-zinc-200">
            <span className="text-xs text-zinc-500 font-serif">Displaying {products.length} cataloged designs</span>
            {!showAddForm && !editingProduct && (
              <button 
                onClick={() => { setShowAddForm(true); resetProductForm(); }}
                className="px-4 py-2 bg-black hover:bg-gold-500 text-white hover:text-black text-xs font-serif uppercase font-semibold tracking-wider rounded flex items-center shadow"
                id="admin-add-prod-btn"
              >
                <Plus className="h-4 w-4 mr-1.5" /> Launch New Creation
              </button>
            )}
          </div>

          {/* Add / Edit product inline Form */}
          {(showAddForm || editingProduct) && (
            <form onSubmit={editingProduct ? handleEditSubmit : handleAddSubmit} className="p-6 bg-white border-2 border-black rounded-lg space-y-4 text-xs font-serif">
              <div className="flex justify-between items-center border-b border-zinc-200 pb-2">
                <span className="font-bold text-black uppercase tracking-wider">{editingProduct ? 'Modifying Creation' : 'Acquire New Creation details'}</span>
                <button type="button" onClick={() => { setShowAddForm(false); setEditingProduct(null); }} className="text-zinc-500 hover:text-black">Dismiss</button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-500 uppercase mb-1">Creation Label *</label>
                  <input 
                    type="text" 
                    value={productForm.name} 
                    onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-zinc-50 border border-zinc-250 rounded px-2.5 py-1.5"
                    placeholder="Bespoke Horizon chronograph"
                    required
                  />
                </div>
                <div>
                  <label className="block text-zinc-500 uppercase mb-1">SKU identifier *</label>
                  <input 
                    type="text" 
                    value={productForm.sku} 
                    onChange={(e) => setProductForm(prev => ({ ...prev, sku: e.target.value }))}
                    className="w-full bg-zinc-50 border border-zinc-250 rounded px-2.5 py-1.5"
                    placeholder="JB-W-HOR-01"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-zinc-500 uppercase mb-1">Category House</label>
                  <select 
                    value={productForm.category} 
                    onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full bg-zinc-50 border border-zinc-250 rounded px-2 py-1.5"
                  >
                    <option value="watches">Horology Watches</option>
                    <option value="shoes">Couture Shoes</option>
                    <option value="jackets">Outerwear Jackets</option>
                    <option value="perfumes">Elixir Parfums</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-500 uppercase mb-1">Price ($) *</label>
                  <input 
                    type="number" 
                    value={productForm.price} 
                    onChange={(e) => setProductForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                    className="w-full bg-zinc-50 border border-zinc-250 rounded px-2 py-1.5 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-zinc-500 uppercase mb-1">Original Retail price ($)</label>
                  <input 
                    type="number" 
                    value={productForm.originalPrice} 
                    onChange={(e) => setProductForm(prev => ({ ...prev, originalPrice: Number(e.target.value) }))}
                    className="w-full bg-zinc-50 border border-zinc-250 rounded px-2 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-500 uppercase mb-1">Stock Level Units</label>
                  <input 
                    type="number" 
                    value={productForm.stock} 
                    onChange={(e) => setProductForm(prev => ({ ...prev, stock: Number(e.target.value) }))}
                    className="w-full bg-zinc-50 border border-zinc-250 rounded px-2 py-1.5 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-500 uppercase mb-1">Detailed Narrative</label>
                <textarea 
                  value={productForm.description} 
                  onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  className="w-full bg-zinc-50 border border-zinc-250 rounded px-2.5 py-1.5"
                  placeholder="Details regarding materials and heritage parameters..."
                />
              </div>

              <div>
                <label className="block text-zinc-500 uppercase mb-1">Specifications (Format format comma Key:Val, Key2:Val2)</label>
                <input 
                  type="text" 
                  value={productForm.specs} 
                  onChange={(e) => setProductForm(prev => ({ ...prev, specs: e.target.value }))}
                  className="w-full bg-zinc-50 border border-zinc-250 rounded px-2.5 py-1.5"
                  placeholder="Material: Solid Gold, Weight: 1.5kg, Origin: Geneva"
                />
              </div>

              <div>
                <label className="block text-zinc-500 uppercase mb-1">Product Images (Paste Unsplash or static URL, comma separated if multiple)</label>
                <input 
                  type="text" 
                  value={productForm.images} 
                  onChange={(e) => setProductForm(prev => ({ ...prev, images: e.target.value }))}
                  className="w-full bg-zinc-50 border border-zinc-250 rounded px-2.5 py-1.5 font-mono"
                  placeholder="https://images.unsplash.com/photo-1523275335684-37898b6baf30?..."
                />
              </div>

              <div className="flex space-x-6 items-center">
                <label className="flex items-center space-x-1.5">
                  <input type="checkbox" checked={productForm.featured} onChange={(e) => setProductForm(prev => ({ ...prev, featured: e.target.checked }))} className="rounded text-gold-500" />
                  <span>Featured Maison Selector</span>
                </label>
                <label className="flex items-center space-x-1.5">
                  <input type="checkbox" checked={productForm.newArrival} onChange={(e) => setProductForm(prev => ({ ...prev, newArrival: e.target.checked }))} className="rounded text-gold-500" />
                  <span>Nouveau Arrival</span>
                </label>
                <label className="flex items-center space-x-1.5">
                  <input type="checkbox" checked={productForm.bestSeller} onChange={(e) => setProductForm(prev => ({ ...prev, bestSeller: e.target.checked }))} className="rounded text-gold-500" />
                  <span>Sells Leader Elite Badge</span>
                </label>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button type="submit" className="px-4 py-2 bg-black hover:bg-gold-500 text-white hover:text-black font-semibold rounded uppercase tracking-wider" id="prod-form-save">
                  {editingProduct ? 'Confirm Modifications' : 'Launch Creation'}
                </button>
              </div>
            </form>
          )}

          {/* Table display */}
          <div className="bg-white border border-zinc-200 rounded-lg shadow-sm overflow-x-auto text-[11px] sm:text-xs">
            <table className="w-full text-left font-serif">
              <thead className="bg-zinc-50 text-zinc-500 uppercase tracking-wider text-[9px] border-b border-zinc-100">
                <tr>
                  <th className="p-4">Creation Code</th>
                  <th className="p-4">SKU</th>
                  <th className="p-4">House Category</th>
                  <th className="p-4">Price Value</th>
                  <th className="p-4">Stock Left</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-zinc-50/50" id={`admin-row-${p.id}`}>
                    <td className="p-4 font-bold text-zinc-950 flex items-center">
                      <img src={p.images[0]} alt={p.name} className="h-8 w-8 object-cover rounded mr-2" referrerPolicy="no-referrer" />
                      <span className="truncate max-w-[150px]">{p.name}</span>
                    </td>
                    <td className="p-4 font-mono">{p.sku}</td>
                    <td className="p-4 uppercase text-[10px] text-zinc-500">{p.category}</td>
                    <td className="p-4 font-bold font-mono">${p.price.toLocaleString()}</td>
                    <td className="p-4 font-mono font-bold">
                      <span className={p.stock <= 2 ? 'text-amber-500 border border-amber-200 bg-amber-50 px-1 py-0.5 rounded font-black' : ''}>
                        {p.stock} units
                      </span>
                    </td>
                    <td className="p-4 text-center space-x-2">
                      <button 
                        onClick={() => triggerEdit(p)}
                        className="p-1 hover:text-gold-600 inline-block transition-colors"
                        title="Modifications adjustments"
                        id={`admin-edit-${p.id}`}
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => onDeleteProduct(p.id)}
                        className="p-1 hover:text-red-500 inline-block transition-colors"
                        title="Dissipate from catalogue"
                        id={`admin-delete-${p.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </section>
      )}

      {/* TAB 3: ORDERS DISPATCH MANAGEMENT */}
      {activeTab === 'orders' && (
        <section className="space-y-6">
          <div className="pb-3 border-b border-zinc-200">
            <span className="text-xs text-zinc-500 font-serif">Awaiting and active logistic registries</span>
          </div>

          <div className="grid grid-cols-1 gap-4 text-xs font-serif">
            {orders.map(ord => (
              <div key={ord.id} className="p-5 bg-white border border-zinc-200 rounded-lg shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4" id={`admin-ord-card-${ord.id}`}>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 flex-wrap">
                    <span className="font-mono text-black font-bold text-sm">{ord.id}</span>
                    <span className="text-zinc-300">|</span>
                    <span className="text-zinc-500">{ord.customerName} ({ord.customerEmail})</span>
                  </div>
                  <p className="text-zinc-400 font-sans text-[11px]">
                    {ord.cartItems.map(i => `${i.productName} (x${i.quantity})`).join(', ')}
                  </p>
                  <p className="text-[11px] font-sans"><span className="text-zinc-500 block">Deliver coordinates:</span> {ord.shippingAddress.addressLine1}, {ord.shippingAddress.city} {ord.shippingAddress.postalCode}</p>
                </div>

                <div className="flex items-center space-x-4 self-stretch md:self-auto justify-between md:justify-end pt-3 md:pt-0 border-t md:border-t-0 border-zinc-150">
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-400 block mb-0.5 uppercase tracking-wider font-bold">Total Settled</span>
                    <span className="font-mono text-gold-600 font-bold text-sm">${ord.total.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <select
                      value={ord.status}
                      onChange={(e) => onUpdateOrderStatus(ord.id, e.target.value)}
                      className="bg-zinc-100 border border-zinc-200 text-xs text-neutral-800 rounded px-2.5 py-1.5 focus:outline-none"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}

            {orders.length === 0 && (
              <div className="text-center py-12 text-zinc-400">No client orders registered inside Sandbox DB memory yet.</div>
            )}
          </div>
        </section>
      )}

    </main>
  );
}
