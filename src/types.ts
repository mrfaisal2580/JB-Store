/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  description: string;
  details: string[];
  specs: Record<string, string>;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  stock: number;
  images: string[];
  sizes?: string[];
  colors?: string[];
  scents?: string[];
  featured?: boolean;
  newArrival?: boolean;
  bestSeller?: boolean;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  userEmail: string;
  rating: number;
  comment: string;
  date: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  selectedScent?: string;
}

export interface CouponCode {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minSpend?: number;
}

export interface Order {
  id: string;
  date: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  paymentMethod: string;
  paymentDetails?: {
    cardBrand?: string;
    last4?: string;
    transactionId?: string;
  };
  cartItems: {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    selectedVariant?: string;
  }[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
}

export interface UserAddress {
  id: string;
  label: string;
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export interface UserProfile {
  fullName: string;
  email: string;
  phone?: string;
  isLoggedIn: boolean;
  savedAddresses: UserAddress[];
  wishlist: string[]; // Product IDs
}

export interface SalesAnalytics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  totalCustomers: number;
  categorySales: { category: string; value: number }[];
  monthlyRevenue: { month: string; sales: number; profit: number }[];
}
