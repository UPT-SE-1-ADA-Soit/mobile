import { Platform } from 'react-native';
import { getToken } from './storage';
import type {
  ApiAuthResponse,
  ApiCategory,
  ApiOrder,
  ApiProductDetail,
  ApiProductSummary,
  ApiUserProfile,
  ApiValidateResponse,
} from '@/types/api';

const AUTH_URL = Platform.OS === 'web'
  ? 'http://localhost:8081'
  : (process.env.EXPO_PUBLIC_AUTH_API_URL ?? 'http://192.168.1.16:8081');

const PRODUCT_URL = Platform.OS === 'web'
  ? 'http://localhost:8080'
  : (process.env.EXPO_PUBLIC_PRODUCT_API_URL ?? 'http://192.168.1.16:8080');

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
  }
}

async function request<T>(
  baseUrl: string,
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${baseUrl}${path}`, { ...options, headers });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new ApiError(res.status, text);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ── Auth ────────────────────────────────────────────────────────────────────

export const authApi = {
  login: (email: string, password: string) =>
    request<ApiAuthResponse>(AUTH_URL, '/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (name: string, email: string, password: string) =>
    request<ApiAuthResponse>(AUTH_URL, '/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  validate: () => request<ApiValidateResponse>(AUTH_URL, '/auth/validate'),

  updateProfile: (data: { name?: string; location?: string; avatarUrl?: string }) =>
    request<ApiValidateResponse>(AUTH_URL, '/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getUserById: (userId: number) =>
    request<ApiUserProfile>(AUTH_URL, `/auth/user/${userId}`),
};

// ── Products ─────────────────────────────────────────────────────────────────

type ProductFilters = {
  categoryId?: number;
  priceMin?: number;
  priceMax?: number;
  recommendForUserId?: number;
  searchQuery?: string;
  inStock?: boolean;
};

export const productApi = {
  getProducts: (filters: ProductFilters = {}) => {
    const q = new URLSearchParams();
    if (filters.categoryId)          q.set('categoryId',          String(filters.categoryId));
    if (filters.priceMin != null)    q.set('priceMin',            String(filters.priceMin));
    if (filters.priceMax != null)    q.set('priceMax',            String(filters.priceMax));
    if (filters.recommendForUserId)  q.set('recommendForUserId',  String(filters.recommendForUserId));
    if (filters.searchQuery)         q.set('searchQuery',         filters.searchQuery);
    if (filters.inStock != null)     q.set('inStock',             String(filters.inStock));
    const qs = q.toString() ? `?${q}` : '';
    return request<ApiProductSummary[]>(PRODUCT_URL, `/product${qs}`);
  },

  getProductById: (id: number) =>
    request<ApiProductDetail>(PRODUCT_URL, `/product/${id}`),

  createProduct: (data: {
    name: string;
    categoryId: number;
    price: number;
    description?: string;
    region: string;
    imageUrls?: string[];
    attributes?: { attributeId: number; attributeValueId: number }[];
  }) =>
    request<ApiProductDetail>(PRODUCT_URL, '/product', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getCategories: () => request<ApiCategory[]>(PRODUCT_URL, '/category'),

  // Favorites
  getFavorites: (userId: number) =>
    request<ApiProductSummary[]>(PRODUCT_URL, `/user/${userId}/favorites`),

  addFavorite: (userId: number, productId: number) =>
    request<void>(PRODUCT_URL, `/user/${userId}/favorites/${productId}`, { method: 'POST' }),

  removeFavorite: (userId: number, productId: number) =>
    request<void>(PRODUCT_URL, `/user/${userId}/favorites/${productId}`, { method: 'DELETE' }),

  // Listings
  getListedProducts: (userId: number) =>
    request<ApiProductSummary[]>(PRODUCT_URL, `/user/${userId}/listed-products`),

  removeListedProduct: (userId: number, productId: number) =>
    request<void>(PRODUCT_URL, `/user/${userId}/listed-products/${productId}`, { method: 'DELETE' }),

  // Orders
  getOrders: (userId: number) =>
    request<ApiOrder[]>(PRODUCT_URL, `/user/${userId}/orders`),

  createOrder: (productId: number) =>
    request<ApiOrder>(PRODUCT_URL, '/order', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    }),

  cancelOrder: (orderId: number) =>
    request<void>(PRODUCT_URL, `/order/${orderId}`, { method: 'DELETE' }),

  // History
  addToHistory: (userId: number, productId: number) =>
    request<void>(PRODUCT_URL, `/user/${userId}/history/${productId}`, { method: 'POST' }),
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<string, string> = {
  Clothing: 'shirt-outline',
  Electronics: 'phone-portrait-outline',
  Furniture: 'bed-outline',
  Books: 'book-outline',
  Sports: 'basketball-outline',
  Vehicles: 'car-outline',
  'Home & Garden': 'home-outline',
  Other: 'grid-outline',
};

export function getCategoryIcon(name: string): string {
  return CATEGORY_ICONS[name] ?? 'grid-outline';
}
