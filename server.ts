/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { Product, Order, Review } from './src/types';
import { MOCK_PRODUCTS, MOCK_REVIEWS } from './src/data/products';

dotenv.config();

const app = express();
const PORT = 3000;

// Express JSON middleware
app.use(express.json());

// In-Memory Database (Seeded with high-end luxury assets)
let DB_PRODUCTS: Product[] = [...MOCK_PRODUCTS];
let DB_REVIEWS: Review[] = [...MOCK_REVIEWS];
let DB_ORDERS: Order[] = [
  {
    id: 'ORD-99120',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    customerName: 'Marcus Sterling',
    customerEmail: 'muhammadfaisalabbaskhan@gmail.com',
    shippingAddress: {
      fullName: 'Marcus Sterling',
      addressLine1: '42 Belgrave Square',
      city: 'London',
      state: 'England',
      postalCode: 'SW1X 8PG',
      country: 'United Kingdom',
      phone: '+44 20 7123 4567'
    },
    paymentMethod: 'Stripe',
    paymentDetails: {
      cardBrand: 'Visa Gold',
      last4: '4242',
      transactionId: 'ch_3Mv1sL2eZvKYlo2C2u89fGsA'
    },
    cartItems: [
      {
        productId: 's1',
        productName: 'Sartorial Oxford Chelsea Boot',
        price: 1250,
        quantity: 1,
        selectedVariant: 'Mahogany, Size: 43'
      },
      {
        productId: 'p1',
        productName: 'Privé Oud Royal Seduction',
        price: 420,
        quantity: 1,
        selectedVariant: 'Private Reserve Oud'
      }
    ],
    subtotal: 1670,
    tax: 133.6,
    shipping: 0,
    discount: 100,
    total: 1703.6,
    status: 'Shipped'
  }
];

// Seeded Promo Coupons
const VALID_COUPONS = [
  { code: 'JB20', discountType: 'percentage', discountValue: 20 },
  { code: 'LUXURYGOLD', discountType: 'percentage', discountValue: 15 },
  { code: 'ROYAL100', discountType: 'fixed', discountValue: 100, minSpend: 500 },
  { code: 'WELCOMEVIP', discountType: 'percentage', discountValue: 10 }
];

// Admin security verification middleware
const requireAdmin = (req: Request, res: Response, next: () => void): void => {
  const adminEmail = req.headers['x-admin-email'];
  if (!adminEmail || String(adminEmail).trim().toLowerCase() !== 'muhammadfaisalabbaskhan@gmail.com') {
    res.status(403).json({ error: 'Access Denied: You do not have privilege authorization to modify Maison resources.' });
    return;
  }
  next();
};

// --- API ENDPOINTS ---

// 1. Google Gemini AI Luxury Concierge
app.post('/api/concierge', async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, chatHistory } = req.get('Content-Type') === 'application/json' ? req.body : { message: '', chatHistory: [] };
    
    if (!message) {
       res.status(400).json({ error: 'Message content is required' });
       return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      res.json({
        reply: "Welcome to the JB Store Luxury Suite. Pleased to assist you. *[AI Service in Sandbox - Please deploy your Gemini API Key in Settings to get real-time tailored wardrobe insights. Currently in high-fashion concierge mode]* Based on your interest in our collections, I would suggest our curated **Royale Chronograph Skeleton** gold watch for exceptional mechanics, or our addictive wild Cambodian **Privé Oud Royal Seduction** fragrance."
      });
      return;
    }

    // Initialize @google/genai
    const ai = new GoogleGenAI({ apiKey });

    // Format chat history for context
    const formattedHistory = (chatHistory || []).map((h: { sender: 'user' | 'bot'; text: string }) => 
      `${h.sender === 'user' ? 'Guest' : 'JB Butler'}: ${h.text}`
    ).join('\n');

    // Curation of our inventory
    const inventorySummary = DB_PRODUCTS.map(p => 
      `- ID: ${p.id}, "${p.name}" (${p.category}): Price $${p.price}. SKU: ${p.sku}. ${p.description}. Specs: ${JSON.stringify(p.specs)}`
    ).join('\n');

    const prompt = `You are "Jean-Baptiste", an ultra-exclusive, warm, highly polished personal style butler and luxury concierge at "JB Store", an international high-fashion brand specializing in exceptional Horology watches, handcrafted Italian footwear, tailored leather jackets, and rare private-reserve perfumes.

Your communication style:
- Speak with pristine, sophisticated Swiss-French boutique tailored tone. Be warm, elegant, discrete, and intellectual.
- Offer refined styling advice, suggesting specific matches across our inventory.
- Emphasize the exquisite materials (e.g., "18k gold", "Cambodian Oud", "Nappa leather", "whole-grain whole cut", "shaved shearling wool").
- Keep responses compact, readable, and highly engaging. Use luxurious formatting.

Here is JB Store's active product catalog:
${inventorySummary}

Current Guest Session Thread:
${formattedHistory}
Guest: ${message}

Please formulate a helpful, boutique responses recommending suitable pieces from our active catalog. Refuse to discuss anything unrelated to luxury fashion and our lifestyle catalog.`;

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const reply = result.text || 'An absolute honor to assist you. May I interest you in exploring our bespoke leather boots or watch complications?';
    res.json({ reply });
  } catch (error: any) {
    console.error('Gemini Concierge Direct Error:', error);
    res.status(500).json({ 
      error: 'Concierge error', 
      reply: 'An elegant delay has occurred in our service stream. Let me guide you through our collections directly.' 
    });
  }
});

// 2. Fetch Products Catalog
app.get('/api/products', (req: Request, res: Response) => {
  res.json(DB_PRODUCTS);
});

// 3. Admin: Add Product
app.post('/api/products', requireAdmin, (req: Request, res: Response): void => {
  const productData = req.body;
  if (!productData.name || !productData.category || !productData.price) {
     res.status(400).json({ error: 'Missing required product properties.' });
     return;
  }

  const newProduct: Product = {
    id: `prod-${Date.now()}`,
    sku: productData.sku || `JB-CUST-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
    name: productData.name,
    category: productData.category,
    description: productData.description || 'Exclusive luxury item.',
    details: productData.details || [],
    specs: productData.specs || {},
    price: Number(productData.price),
    originalPrice: productData.originalPrice ? Number(productData.originalPrice) : undefined,
    rating: 5.0,
    reviewsCount: 0,
    stock: productData.stock !== undefined ? Number(productData.stock) : 10,
    images: productData.images && productData.images.length > 0 ? productData.images : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800'],
    sizes: productData.sizes,
    colors: productData.colors,
    scents: productData.scents,
    featured: !!productData.featured,
    newArrival: !!productData.newArrival,
    bestSeller: !!productData.bestSeller
  };

  DB_PRODUCTS.unshift(newProduct);
  res.status(201).json(newProduct);
});

// 4. Admin: Edit Product
app.put('/api/products/:id', requireAdmin, (req: Request, res: Response): void => {
  const { id } = req.params;
  const updateData = req.body;
  
  const index = DB_PRODUCTS.findIndex(p => p.id === id);
  if (index === -1) {
     res.status(404).json({ error: 'Product not found.' });
     return;
  }

  const existing = DB_PRODUCTS[index];
  DB_PRODUCTS[index] = {
    ...existing,
    ...updateData,
    price: updateData.price !== undefined ? Number(updateData.price) : existing.price,
    originalPrice: updateData.originalPrice !== undefined ? (updateData.originalPrice ? Number(updateData.originalPrice) : undefined) : existing.originalPrice,
    stock: updateData.stock !== undefined ? Number(updateData.stock) : existing.stock
  };

  res.json(DB_PRODUCTS[index]);
});

// 5. Admin: Delete Product
app.delete('/api/products/:id', requireAdmin, (req: Request, res: Response): void => {
  const { id } = req.params;
  const index = DB_PRODUCTS.findIndex(p => p.id === id);
  if (index === -1) {
     res.status(404).json({ error: 'Product not found.' });
     return;
  }
  DB_PRODUCTS.splice(index, 1);
  res.json({ success: true, message: 'Product deleted.' });
});

// 6. Fetch Reviews
app.get('/api/reviews/:productId', (req: Request, res: Response) => {
  const { productId } = req.params;
  const reviews = DB_REVIEWS.filter(r => r.productId === productId);
  res.json(reviews);
});

// 7. Submit Review
app.post('/api/reviews', (req: Request, res: Response): void => {
  const { productId, userName, userEmail, rating, comment } = req.body;
  if (!productId || !userName || !rating) {
     res.status(400).json({ error: 'Missing review properties.' });
     return;
  }

  const newReview: Review = {
    id: `rev-${Date.now()}`,
    productId,
    userName,
    userEmail: userEmail || 'anonymous@jb-store.com',
    rating: Number(rating),
    comment: comment || 'Sensational performance.',
    date: new Date().toISOString().split('T')[0]
  };

  DB_REVIEWS.unshift(newReview);

  // Recalculate rating on the product
  const product = DB_PRODUCTS.find(p => p.id === productId);
  if (product) {
    const prodReviews = DB_REVIEWS.filter(r => r.productId === productId);
    const sum = prodReviews.reduce((acc, r) => acc + r.rating, 0);
    product.rating = Number((sum / prodReviews.length).toFixed(1));
    product.reviewsCount = prodReviews.length;
  }

  res.status(201).json(newReview);
});

// 8. Promo Coupon Code Check
app.post('/api/coupon', (req: Request, res: Response): void => {
  const { code, spend } = req.body;
  const coupon = VALID_COUPONS.find(c => c.code.toUpperCase() === String(code).trim().toUpperCase());
  if (!coupon) {
     res.status(404).json({ error: 'Invalid invitation coupon code' });
     return;
  }
  if (coupon.minSpend && spend < coupon.minSpend) {
     res.status(400).json({ error: `Invite coupon requires minimum spend of $${coupon.minSpend}` });
     return;
  }
  res.json(coupon);
});

// 9. Payment Sandboxes Intents & Checkout Submissions
app.post('/api/payment/intent', (req: Request, res: Response) => {
  const { gateway, amount } = req.body;
  // Dynamic secure gateways supported: Stripe, PayPal, PayFast, Easypaisa, JazzCash
  // Creating simulated authorization block
  const txId = `TX-${gateway.toUpperCase().substring(0, 3)}-${Math.floor(Math.random() * 9000000) + 1000000}`;
  res.json({
    success: true,
    clientSecret: `sec_${txId.toLowerCase()}`,
    transactionId: txId,
    mode: 'Sandbox-Verified',
    status: 'Authorized'
  });
});

// 10. Orders Handlers
app.get('/api/orders', (req: Request, res: Response) => {
  res.json(DB_ORDERS);
});

app.post('/api/orders', (req: Request, res: Response): void => {
  const orderData = req.body;
  if (!orderData.fullName || !orderData.email || !orderData.cartItems || orderData.cartItems.length === 0) {
     res.status(400).json({ error: 'Missing shipping detail or items in cart.' });
     return;
  }

  const newOrder: Order = {
    id: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
    date: new Date().toISOString(),
    customerName: orderData.fullName,
    customerEmail: orderData.email,
    shippingAddress: {
      fullName: orderData.fullName,
      addressLine1: orderData.addressLine1,
      addressLine2: orderData.addressLine2,
      city: orderData.city,
      state: orderData.state,
      postalCode: orderData.postalCode,
      country: orderData.country,
      phone: orderData.phone || '+1 555-0199'
    },
    paymentMethod: orderData.paymentMethod || 'Stripe Sandbox',
    paymentDetails: orderData.paymentDetails || {
      cardBrand: 'Visa Elegance',
      last4: '8888',
      transactionId: `TX-SAND-${Date.now().toString().slice(-6)}`
    },
    cartItems: orderData.cartItems,
    subtotal: Number(orderData.subtotal),
    tax: Number(orderData.tax),
    shipping: Number(orderData.shipping),
    discount: Number(orderData.discount || 0),
    total: Number(orderData.total),
    status: 'Pending'
  };

  // Adjust Stock Levels upon successful reservation
  newOrder.cartItems.forEach(item => {
    const product = DB_PRODUCTS.find(p => p.id === item.productId);
    if (product) {
      product.stock = Math.max(0, product.stock - item.quantity);
    }
  });

  DB_ORDERS.unshift(newOrder);
  res.status(201).json(newOrder);
});

// 11. Admin State: Update Order Status
app.put('/api/orders/:id', requireAdmin, (req: Request, res: Response): void => {
  const { id } = req.params;
  const { status } = req.body;
  const order = DB_ORDERS.find(o => o.id === id);
  if (!order) {
     res.status(404).json({ error: 'Order not found.' });
     return;
  }
  order.status = status;
  res.json(order);
});

// --- VITE MIDDLEWARE SETUP ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Luxury service running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
