# Maison JB Store - Supabase Integration Setup Guide

This guide details the folder structure, environment keys, and execution steps to fully activate the Supabase backend database, authentication system, and Row Level Security (RLS) policies for your eCommerce store.

---

## 1. Architecural Design & Dual-Mode Fallback
To ensure a highly responsive, unbreakable client experience:
* **Direct Client Mode**: The application leverages `src/lib/supabase.ts` to directly fetch collections, trigger checkouts, register users, and authenticate login paths.
* **Resilient Fallback Mode**: If you run the app before configuring Supabase variables or copying the SQL script, the system gracefully falls back to the in-memory Express REST API server and local mocks. The client experiences zero disruption!

---

## 2. Integrated Folder Structure

The Supabase integration spans the following files:

```text
├── /                         # Workspace Root
│   ├── .env.example          # Environment templates (VITE_SUPERBASE_* declarations)
│   ├── supabase_schema.sql  # High-performance Relational Schema & Security Script
│   ├── SUPABASE_SETUP.md     # Setup, step-by-step operations guide (This File)
│   ├── package.json          # Dependency registrations (contains @supabase/supabase-js)
│   └── src/
│       ├── types.ts          # Pure unified strict types (Product, Custom Orders, Profile)
│       ├── App.tsx           # Orchestrates boot adapters, listeners and state sync
│       └── lib/
│           └── supabase.ts   # Client creation, auth helpers, product/cart/order services
```

---

## 3. Step-by-Step Setup Instructions

Follow these 4 simple steps to connect your fully fledged Live Supabase database:

### Step 1: Execute Database Setup on Supabase
1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
2. Click on the **SQL Editor** in the left navigation sidebar.
3. Click **New Query** to create blank workspace sheet.
4. Copy the entire contents of the `/supabase_schema.sql` file located in the root of this project and paste it into the query editor.
5. Click **Run** (or press `Cmd + Enter` / `Ctrl + Enter`).
   * *What this does*: Creates all tables (`categories`, `products`, `product_images`, `users_profiles`, `orders`, `order_items`, `reviews`, `wishlist`, `cart_items`, `addresses`, `coupons`), establishes relational integrity (foreign keys), triggers automatic user profiling on sign-up (for `muhammadfaisalabbaskhan@gmail.com`), sets up performance indexes, and enables RLS policies.

### Step 2: Configure Environment Connection Variables
1. Ensure your `.env` file in the project (or of your Vercel/GitHub deployment) has the following variables configured:
   ```env
   VITE_SUPABASE_URL="https://syvzanzkmkhlamhdxcod.supabase.co"
   VITE_SUPABASE_ANON_KEY="sb_publishable_3OCH_-i_S-D4U09tpoXB2g_AMVLQLQ6"
   ```
2. For local testing, any changes to these environment values are loaded immediately.

### Step 3: Seed Products with Custom Assets
* When running the SQL database script from Step 1, initial Categories are seeded instantly.
* You can easily create customized timepiece, shoe, outerwear, and parfum assets using the admin dashboard inside the website (when signed in with `muhammadfaisalabbaskhan@gmail.com`), and because the SQL handles constraints, they will appear immediately.

### Step 4: Perform User Sign Up and Admin Lock Verification
1. Open the website, click on the **Account/Profile** menu option to enter the "Maison Lounge" authentication interface.
2. Under "Inscribe New Account", enter your noble full name, your personal administrator email `muhammadfaisalabbaskhan@gmail.com`, and a secure pass-phrase.
3. Click "Create Privilege Profile" to register via Supabase Auth.
4. Once completed, a profile event triggers inside auth listeners, checking that you are the system administrator. It immediately brings up the high-contrast **Admin Console Panel** where you can view all customers, edit products, and track real checkouts!
5. Test a login with a secondary unauthorized email to see the security system prompt you with the immediate lock restrictions.

---

## 4. DB Services API Summary Reference

All services inside `/src/lib/supabase.ts` utilize strict typing and return client-readable objects:

* `getProducts()`: Joins `products` with `categories` and `product_images` to return fully populated lists.
* `getProductById(id)`: Returns individual detail record from the database.
* `getProductsByCategory(slug)`: Returns filtered segment matching one category.
* `addToCart(userId, productId, qty, ...variants)`: Writes directly to the database user table `cart_items` for persistence across screens and sessions.
* `removeFromCart(...)`: Deletes shopping cart items.
* `createOrder(userId, orderDetail)`: Creates high-performance transactional order lists, saves underlying line item arrays (`order_items`), automatically decrements primary product inventories, and clears the user's active shopping cart.
* `getOrders(userId?)`: Selects detailed purchase history (admins have query locks to select all global client checkouts).
* `addReview(...)`: Lets verified users comment, automatically updating the master product rating & count averages.
* `addWishlist(...)`: Adds/toggles items on the member's wishlist.
