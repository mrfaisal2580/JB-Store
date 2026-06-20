/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';
import { Product, Review, CartItem, Order, UserAddress, UserProfile } from '../types';

// Load Supabase environment configurations with secure fallbacks
const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || 'https://syvzanzkmkhlamhdxcod.supabase.co').trim();
const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_3OCH_-i_S-D4U09tpoXB2g_AMVLQLQ6').trim();

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// ==========================================
// AUTHENTICATION SYSTEM APIS
// ==========================================

export async function signUp(email: string, password: string, fullName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        fullName: fullName,
        full_name: fullName
      }
    }
  });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function resetPasswordForEmail(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/#reset-password`
  });
  if (error) throw error;
  return data;
}

export async function updatePassword(password: string) {
  const { data, error } = await supabase.auth.updateUser({
    password
  });
  if (error) throw error;
  return data;
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// ==========================================
// DATA STRUCTURAL MAPPERS (Db <-> UI)
// ==========================================

export function mapProductFromDb(db: any): Product {
  if (!db) return {} as Product;
  return {
    id: db.id,
    name: db.name,
    sku: db.sku || '',
    category: db.categories?.name || db.category_name || 'all',
    description: db.description || '',
    details: db.details || [],
    specs: db.specs || {},
    price: Number(db.price || 0),
    originalPrice: db.sale_price ? Number(db.price) : undefined, // reverse map sale price if existing
    rating: Number(db.rating || 5.0),
    reviewsCount: Number(db.reviews_count || 0),
    stock: Number(db.stock_quantity || 0),
    images: db.product_images?.map((img: any) => img.image_url) || [db.image_url].filter(Boolean),
    sizes: db.sizes || [],
    colors: db.colors || [],
    scents: db.scents || [],
    featured: !!db.featured,
    newArrival: !!db.new_arrival,
    bestSeller: !!db.best_seller
  };
}

export function mapOrderFromDb(db: any): Order {
  if (!db) return {} as Order;
  return {
    id: db.id,
    date: new Date(db.created_at).toLocaleDateString(),
    customerName: db.customer_name,
    customerEmail: db.customer_email,
    shippingAddress: {
      fullName: db.shipping_full_name,
      addressLine1: db.shipping_address_line1,
      addressLine2: db.shipping_address_line2 || undefined,
      city: db.shipping_city,
      state: db.shipping_state,
      postalCode: db.shipping_postal_code,
      country: db.shipping_country,
      phone: db.shipping_phone
    },
    paymentMethod: db.payment_method || 'Credit Card',
    paymentDetails: db.transaction_id ? {
      cardBrand: db.payment_brand || undefined,
      last4: db.payment_last4 || undefined,
      transactionId: db.transaction_id || undefined
    } : undefined,
    cartItems: (db.order_items || []).map((item: any) => ({
      productId: item.product_id,
      productName: item.product_name,
      price: Number(item.price || 0),
      quantity: Number(item.quantity || 1),
      selectedVariant: item.selected_variant || undefined
    })),
    subtotal: Number(db.subtotal || 0),
    tax: Number(db.tax || 0),
    shipping: Number(db.shipping || 0),
    discount: Number(db.discount || 0),
    total: Number(db.total || 0),
    status: db.status as any
  };
}

// ==========================================
// ECOMMERCE DATABASE SERVICE APIS
// ==========================================

/**
 * 1. Fetch all products from products table with preloaded carousel images relations
 */
export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name), product_images(image_url, display_order)');

  if (error) {
    console.warn('Supabase not fully configured or tables missing, using Express/local fallback:', error.message);
    throw error;
  }
  return (data || []).map(mapProductFromDb);
}

/**
 * 2. Fetch specific single product by UUID
 */
export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name), product_images(image_url, display_order)')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching product ID ${id}:`, error.message);
    return null;
  }
  return mapProductFromDb(data);
}

/**
 * 3. Fetch products filtered by category slug
 */
export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories!inner(name, slug), product_images(image_url, display_order)')
    .eq('categories.slug', categorySlug);

  if (error) {
    console.error(`Error fetching products filter by ${categorySlug}:`, error.message);
    throw error;
  }
  return (data || []).map(mapProductFromDb);
}

/**
 * 4. Add items to real-time sync database user table cart_items
 */
export async function addToCart(
  userId: string, 
  productId: string, 
  quantity: number = 1,
  selectedSize?: string,
  selectedColor?: string,
  selectedScent?: string
): Promise<boolean> {
  const { error } = await supabase
    .from('cart_items')
    .upsert({
      user_id: userId,
      product_id: productId,
      quantity,
      selected_size: selectedSize || null,
      selected_color: selectedColor || null,
      selected_scent: selectedScent || null
    }, {
      onConflict: 'user_id,product_id,selected_size,selected_color,selected_scent'
    });

  if (error) {
    console.error('Error adding/updating cart in Supabase:', error.message);
    return false;
  }
  return true;
}

/**
 * 5. Remove items from database cart table
 */
export async function removeFromCart(
  userId: string,
  productId: string,
  selectedSize?: string,
  selectedColor?: string,
  selectedScent?: string
): Promise<boolean> {
  let query = supabase
    .from('cart_items')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId);

  if (selectedSize) query = query.eq('selected_size', selectedSize);
  if (selectedColor) query = query.eq('selected_color', selectedColor);
  if (selectedScent) query = query.eq('selected_scent', selectedScent);

  const { error } = await query;
  if (error) {
    console.error('Error removing from cart on Supabase:', error.message);
    return false;
  }
  return true;
}

/**
 * 6. Submit a complete order, saving to orders and order_items transaction tables
 */
export async function createOrder(userId: string | null, order: Omit<Order, 'id' | 'date'>): Promise<Order | null> {
  // First insert primary details into orders table
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      customer_name: order.customerName,
      customer_email: order.customerEmail,
      subtotal: order.subtotal,
      tax: order.tax,
      shipping: order.shipping,
      discount: order.discount,
      total: order.total,
      status: order.status || 'Pending',
      payment_method: order.paymentMethod,
      payment_brand: order.paymentDetails?.cardBrand || null,
      payment_last4: order.paymentDetails?.last4 || null,
      transaction_id: order.paymentDetails?.transactionId || null,
      shipping_full_name: order.shippingAddress.fullName,
      shipping_address_line1: order.shippingAddress.addressLine1,
      shipping_address_line2: order.shippingAddress.addressLine2 || null,
      shipping_city: order.shippingAddress.city,
      shipping_state: order.shippingAddress.state,
      shipping_postal_code: order.shippingAddress.postalCode,
      shipping_country: order.shippingAddress.country,
      shipping_phone: order.shippingAddress.phone
    })
    .select()
    .single();

  if (orderError) {
    console.error('Error creating primary order in Supabase:', orderError.message);
    throw orderError;
  }

  // Next: Insert children items into order_items
  const itemsToInsert = order.cartItems.map(item => ({
    order_id: orderData.id,
    product_id: item.productId,
    product_name: item.productName,
    price: item.price,
    quantity: item.quantity,
    selected_variant: item.selectedVariant || null
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(itemsToInsert);

  if (itemsError) {
    console.error('Error inserting nested items to Supabase order_items:', itemsError.message);
    // Continue despite failing items, but log it explicitly
  }

  // Sync back product inventory counts
  for (const item of order.cartItems) {
    try {
      const { data: currentProd } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', item.productId)
        .single();

      if (currentProd) {
        const nextStock = Math.max(0, currentProd.stock_quantity - item.quantity);
        await supabase
          .from('products')
          .update({ stock_quantity: nextStock })
          .eq('id', item.productId);
      }
    } catch (invErr) {
      console.warn('Inventory sync failed for product ID:', item.productId);
    }
  }

  // Clear user's cart in db after successful order checkout
  if (userId) {
    await supabase.from('cart_items').delete().eq('user_id', userId);
  }

  // Retrieve complete populated tree
  const { data: completeOrder, error: retrieveError } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', orderData.id)
    .single();

  if (retrieveError) {
    return mapOrderFromDb(orderData);
  }

  return mapOrderFromDb(completeOrder);
}

/**
 * 7. Retrieve orders history for authenticated Client or all orders for Admin console
 */
export async function getOrders(userId?: string): Promise<Order[]> {
  let query = supabase
    .from('orders')
    .select('*, order_items(*)');

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.warn('Supabase orders not available yet, using Express/local fallback:', error.message);
    throw error;
  }
  return (data || []).map(mapOrderFromDb);
}

/**
 * 8. Submit customer review for specific product
 */
export async function addReview(review: Omit<Review, 'id' | 'date'>, userId?: string): Promise<boolean> {
  const { error } = await supabase
    .from('reviews')
    .insert({
      product_id: review.productId,
      user_id: userId || null,
      user_name: review.userName,
      user_email: review.userEmail,
      rating: review.rating,
      comment: review.comment
    });

  if (error) {
    console.error('Error recording review to Supabase:', error.message);
    return false;
  }

  // Recalculate and update avg rating & review counts trigger
  try {
    const { data: allReviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('product_id', review.productId);

    if (allReviews && allReviews.length > 0) {
      const totalRatings = allReviews.reduce((sum, r) => sum + r.rating, 0);
      const avgRating = Number((totalRatings / allReviews.length).toFixed(1));
      
      await supabase
        .from('products')
        .update({
          rating: avgRating,
          reviews_count: allReviews.length
        })
        .eq('id', review.productId);
    }
  } catch (syncErr) {
    console.warn('Reviews score synching issue:', syncErr);
  }

  return true;
}

/**
 * 9. Modify a customer wishlist save profile
 */
export async function addWishlist(userId: string, productId: string): Promise<boolean> {
  const { error } = await supabase
    .from('wishlist')
    .insert({
      user_id: userId,
      product_id: productId
    });

  if (error) {
    // If already exists (PK constraint), treat as success toggle or handle nicely
    if (error.code === '23505') {
      // Trigger removal to act as a proper toggle!
      const { error: delError } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);

      return !delError;
    }
    console.error('Wishlist write error on Supabase:', error.message);
    return false;
  }
  return true;
}

/**
 * 10. Fetch current user's profile detail
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data: profile, error: profileErr } = await supabase
    .from('users_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileErr) return null;

  const { data: addresses } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', userId);

  const { data: wishlist } = await supabase
    .from('wishlist')
    .select('product_id')
    .eq('user_id', userId);

  const savedAddresses: UserAddress[] = (addresses || []).map(addr => ({
    id: addr.id,
    label: addr.label,
    fullName: addr.full_name,
    addressLine1: addr.address_line1,
    addressLine2: addr.address_line2 || undefined,
    city: addr.city,
    state: addr.state,
    postalCode: addr.postal_code,
    country: addr.country,
    phone: addr.phone,
    isDefault: !!addr.is_default
  }));

  return {
    fullName: profile.full_name,
    email: profile.email,
    phone: profile.phone || undefined,
    isLoggedIn: true,
    savedAddresses,
    wishlist: (wishlist || []).map(w => w.product_id)
  };
}
