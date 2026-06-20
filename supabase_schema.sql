-- ==========================================
-- MAISON JB STORE - SUPABASE DATABASE SCHEMA
-- ==========================================
-- This script configures fully relational tables, automated triggers for updated_at,
-- indexes for performance, Row Level Security (RLS) policies, and admin helpers.
-- Paste this script directly into the Supabase SQL Editor.

-- Drop existing tables if they exist to start fresh (in reverse foreign-key order)
DROP TABLE IF EXISTS public.wishlist CASCADE;
DROP TABLE IF EXISTS public.cart_items CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.addresses CASCADE;
DROP TABLE IF EXISTS public.coupons CASCADE;
DROP TABLE IF EXISTS public.product_images CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.users_profiles CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. STAGE & REFERENCE TABLES
-- ==========================================

-- A. USERS PROFILES TABLE (Syncs with Supabase Auth)
CREATE TABLE public.users_profiles (
    id UUID PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'customer' CONSTRAINT chk_user_role CHECK (role IN ('customer', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- B. CATEGORIES TABLE
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- C. PRODUCTS TABLE
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    sku TEXT UNIQUE NOT NULL,
    description TEXT,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    brand TEXT DEFAULT 'Maison JB' NOT NULL,
    price NUMERIC(12,2) NOT NULL CONSTRAINT positive_price CHECK (price >= 0),
    sale_price NUMERIC(12,2) CONSTRAINT positive_sale_price CHECK (sale_price >= 0),
    stock_quantity INTEGER NOT NULL DEFAULT 0 CONSTRAINT positive_stock CHECK (stock_quantity >= 0),
    featured BOOLEAN DEFAULT false NOT NULL,
    new_arrival BOOLEAN DEFAULT false NOT NULL,
    best_seller BOOLEAN DEFAULT false NOT NULL,
    image_url TEXT, -- primary image
    rating NUMERIC(3,2) DEFAULT 5.0 CONSTRAINT valid_rating CHECK (rating >= 0 AND rating <= 5),
    reviews_count INTEGER DEFAULT 0 NOT NULL,
    sizes TEXT[], -- e.g. ARRAY['8', '9', '10']
    colors TEXT[], -- e.g. ARRAY['Gold', 'Silver', 'Black']
    scents TEXT[], -- e.g. ARRAY['Oud Intense', 'Royal Rose']
    details TEXT[], -- bullet points
    specs JSONB, -- key-value list of specifications
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT sale_less_than_regular CHECK (sale_price IS NULL OR sale_price <= price)
);

-- D. PRODUCT IMAGES TABLE (For carousel galleries)
CREATE TABLE public.product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    image_url TEXT NOT NULL,
    display_order INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- E. COUPONS TABLE
CREATE TABLE public.coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT NOT NULL CONSTRAINT chk_discount_type CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC(12,2) NOT NULL CONSTRAINT positive_discount CHECK (discount_value > 0),
    min_spend NUMERIC(12,2) DEFAULT 0.0 NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- F. ADDRESSES TABLE
CREATE TABLE public.addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users_profiles(id) ON DELETE CASCADE NOT NULL,
    label TEXT DEFAULT 'Home' NOT NULL,
    full_name TEXT NOT NULL,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT NOT NULL,
    phone TEXT NOT NULL,
    is_default BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 2. TRANSACTIONS & ACTIVITY TABLES
-- ==========================================

-- G. ORDERS TABLE
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users_profiles(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    subtotal NUMERIC(12,2) NOT NULL CONSTRAINT positive_subtotal CHECK (subtotal >= 0),
    tax NUMERIC(12,2) DEFAULT 0.0 NOT NULL,
    shipping NUMERIC(12,2) DEFAULT 0.0 NOT NULL,
    discount NUMERIC(12,2) DEFAULT 0.0 NOT NULL,
    total NUMERIC(12,2) NOT NULL CONSTRAINT positive_total CHECK (total >= 0),
    status TEXT NOT NULL DEFAULT 'Pending' CONSTRAINT chk_order_status CHECK (status IN ('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled')),
    payment_method TEXT DEFAULT 'Credit Card' NOT NULL,
    payment_brand TEXT,
    payment_last4 TEXT,
    transaction_id TEXT,
    shipping_full_name TEXT NOT NULL,
    shipping_address_line1 TEXT NOT NULL,
    shipping_address_line2 TEXT,
    shipping_city TEXT NOT NULL,
    shipping_state TEXT NOT NULL,
    shipping_postal_code TEXT NOT NULL,
    shipping_country TEXT NOT NULL,
    shipping_phone TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- H. ORDER ITEMS TABLE
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    price NUMERIC(12,2) NOT NULL CONSTRAINT positive_item_price CHECK (price >= 0),
    quantity INTEGER NOT NULL CONSTRAINT positive_qty CHECK (quantity > 0),
    selected_variant TEXT -- Combination e.g. "Size: 10, Scent: Royal Oud"
);

-- I. REVIEWS TABLE
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users_profiles(id) ON DELETE SET NULL,
    user_name TEXT NOT NULL,
    user_email TEXT NOT NULL,
    rating INTEGER NOT NULL CONSTRAINT valid_review_rating CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- J. WISHLIST TABLE
CREATE TABLE public.wishlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users_profiles(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_user_wishlist UNIQUE (user_id, product_id)
);

-- K. CART ITEMS TABLE
CREATE TABLE public.cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users_profiles(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    quantity INTEGER DEFAULT 1 NOT NULL CONSTRAINT pos_cart_qty CHECK (quantity > 0),
    selected_size TEXT,
    selected_color TEXT,
    selected_scent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_user_cart_item UNIQUE (user_id, product_id, selected_size, selected_color, selected_scent)
);

-- ==========================================
-- 3. INDEXES FOR EXQUISITE PERFORMANCE
-- ==========================================
CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_products_slug ON public.products(slug);
CREATE INDEX idx_products_featured ON public.products(featured) WHERE featured = true;
CREATE INDEX idx_product_images_product ON public.product_images(product_id);
CREATE INDEX idx_addresses_user ON public.addresses(user_id);
CREATE INDEX idx_orders_user ON public.orders(user_id);
CREATE INDEX idx_order_items_order ON public.order_items(order_id);
CREATE INDEX idx_reviews_product ON public.reviews(product_id);
CREATE INDEX idx_wishlist_user ON public.wishlist(user_id);
CREATE INDEX idx_cart_items_user ON public.cart_items(user_id);

-- ==========================================
-- 4. TRIGGER FUNCTION FOR updated_at COLUMNS
-- ==========================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at Triggers
CREATE TRIGGER trigger_users_profiles_updated_at BEFORE UPDATE ON public.users_profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trigger_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trigger_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trigger_addresses_updated_at BEFORE UPDATE ON public.addresses FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trigger_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==========================================
-- 5. SAFETY DEFUNCT: NEW USER SIGNUP AUTO PROFILE PROVISIONING
-- ==========================================
-- Automatically copies users from auth.users to public.users_profiles on sign-up.
CREATE OR REPLACE FUNCTION public.handle_new_user_provisioning()
RETURNS TRIGGER AS $$
DECLARE
    v_role TEXT := 'customer';
BEGIN
    -- Automatically set muhammadfaisalabbaskhan@gmail.com as Admin
    IF NEW.email = 'muhammadfaisalabbaskhan@gmail.com' THEN
        v_role := 'admin';
    END IF;

    INSERT INTO public.users_profiles (id, full_name, email, role, phone)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'fullName', 'Maison Sovereign'),
        NEW.email,
        v_role,
        NEW.phone
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_new_user_provisioning ON auth.users;
CREATE TRIGGER trigger_new_user_provisioning
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_provisioning();

-- ==========================================
-- 6. SECURITY: ROW LEVEL SECURITY & GRANULAR POLICIES
-- ==========================================

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.users_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Security helper function to check if requesting client is an authorized system Admin (uses verified JWT email to prevent RLS recursion)
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE(auth.jwt() ->> 'email', '') = 'muhammadfaisalabbaskhan@gmail.com';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- --- A. USERS PROFILES POLICIES ---
CREATE POLICY "Admins have complete control over all user profiles"
ON public.users_profiles FOR ALL
TO authenticated
USING (public.check_is_admin());

CREATE POLICY "Users can view their own profile"
ON public.users_profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.users_profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- --- B. CATEGORIES POLICIES ---
CREATE POLICY "Anyone can view categories"
ON public.categories FOR SELECT
TO public
USING (true);

CREATE POLICY "Admins have full write rights over categories"
ON public.categories FOR ALL
TO authenticated
USING (public.check_is_admin());

-- --- C. PRODUCTS & PRODUCT IMAGES POLICIES ---
CREATE POLICY "Anyone can view products"
ON public.products FOR SELECT
TO public
USING (true);

CREATE POLICY "Admins have full write rights over products"
ON public.products FOR ALL
TO authenticated
USING (public.check_is_admin());

CREATE POLICY "Anyone can view product carousel images"
ON public.product_images FOR SELECT
TO public
USING (true);

CREATE POLICY "Admins have full write rights over product images"
ON public.product_images FOR ALL
TO authenticated
USING (public.check_is_admin());

-- --- D. COUPONS POLICIES ---
CREATE POLICY "Anyone can view active coupon codes"
ON public.coupons FOR SELECT
TO public
USING (is_active = true OR public.check_is_admin());

CREATE POLICY "Admins have full write rights over coupons"
ON public.coupons FOR ALL
TO authenticated
USING (public.check_is_admin());

-- --- E. ADDRESSES POLICIES ---
CREATE POLICY "Admins can view and manage all address records"
ON public.addresses FOR ALL
TO authenticated
USING (public.check_is_admin());

CREATE POLICY "Users can manage their own addresses"
ON public.addresses FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- --- F. ORDERS & ITEMS POLICIES ---
CREATE POLICY "Admins can view and modify all orders"
ON public.orders FOR ALL
TO authenticated
USING (public.check_is_admin());

CREATE POLICY "Users can view their own orders"
ON public.orders FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can submit their own orders"
ON public.orders FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage order items"
ON public.order_items FOR ALL
TO authenticated
USING (public.check_is_admin());

CREATE POLICY "Users can inspect their order items"
ON public.order_items FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.orders
        WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert order items into their own order"
ON public.order_items FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.orders
        WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
);

-- --- G. REVIEWS POLICIES ---
CREATE POLICY "Anyone can view product reviews"
ON public.reviews FOR SELECT
TO public
USING (true);

CREATE POLICY "Users can publish reviews of products"
ON public.reviews FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can modify their own reviews"
ON public.reviews FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users and admins can delete reviews"
ON public.reviews FOR DELETE
TO authenticated
USING (auth.uid() = user_id OR public.check_is_admin());

-- --- H. WISHLIST POLICIES ---
CREATE POLICY "Admins can manage all wishlists"
ON public.wishlist FOR ALL
TO authenticated
USING (public.check_is_admin());

CREATE POLICY "Users can manage their own personal wishlists"
ON public.wishlist FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- --- I. CART ITEMS POLICIES ---
CREATE POLICY "Admins can inspect all shopping carts"
ON public.cart_items FOR ALL
TO authenticated
USING (public.check_is_admin());

CREATE POLICY "Users can manage their own shopping carts"
ON public.cart_items FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- 7. SEED INITIAL SAMPLE CATEGORIES
-- ==========================================
INSERT INTO public.categories (name, slug, image_url)
VALUES 
('Horology', 'watches', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600'),
('Footwear', 'shoes', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=600'),
('Outerwear', 'jackets', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=600'),
('Parfums', 'perfumes', 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=600')
ON CONFLICT (slug) DO NOTHING;
