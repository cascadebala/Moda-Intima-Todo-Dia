import { Product, Category, Order, Coupon, Banner, Review, StoreSettings } from '../types/index.ts';

const API_BASE = '/api';

export const api = {
  // Products
  async getProducts(params?: {
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
    isNew?: boolean;
    isOnSale?: boolean;
  }): Promise<Product[]> {
    try {
      const query = new URLSearchParams();
      if (params?.category) query.append('category', params.category);
      if (params?.search) query.append('search', params.search);
      if (params?.minPrice) query.append('minPrice', params.minPrice.toString());
      if (params?.maxPrice) query.append('maxPrice', params.maxPrice.toString());
      if (params?.sort) query.append('sort', params.sort);
      if (params?.isNew) query.append('isNew', 'true');
      if (params?.isOnSale) query.append('isOnSale', 'true');

      const res = await fetch(`${API_BASE}/products?${query.toString()}`);
      if (!res.ok) throw new Error('Falha ao buscar produtos');
      return await res.json();
    } catch (e) {
      console.error('getProducts error:', e);
      return [];
    }
  },

  async getProductById(id: string): Promise<Product | null> {
    try {
      const res = await fetch(`${API_BASE}/products/${id}`);
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      console.error('getProductById error:', e);
      return null;
    }
  },

  async createProduct(productData: Partial<Product>): Promise<Product> {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    if (!res.ok) throw new Error('Falha ao criar produto');
    return await res.json();
  },

  async updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    if (!res.ok) throw new Error('Falha ao atualizar produto');
    return await res.json();
  },

  async deleteProduct(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE'
    });
    return res.ok;
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    try {
      const res = await fetch(`${API_BASE}/categories`);
      if (!res.ok) throw new Error('Falha ao buscar categorias');
      return await res.json();
    } catch (e) {
      console.error('getCategories error:', e);
      return [];
    }
  },

  // Orders
  async getOrders(email?: string): Promise<Order[]> {
    try {
      const query = email ? `?email=${encodeURIComponent(email)}` : '';
      const res = await fetch(`${API_BASE}/orders${query}`);
      if (!res.ok) throw new Error('Falha ao buscar pedidos');
      return await res.json();
    } catch (e) {
      console.error('getOrders error:', e);
      return [];
    }
  },

  async getOrderById(id: string): Promise<Order | null> {
    try {
      const res = await fetch(`${API_BASE}/orders/${id}`);
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      console.error('getOrderById error:', e);
      return null;
    }
  },

  async createOrder(orderData: any): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Falha ao processar pedido');
    }
    return await res.json();
  },

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Falha ao atualizar status do pedido');
    return await res.json();
  },

  // Coupons
  async getCoupons(): Promise<Coupon[]> {
    try {
      const res = await fetch(`${API_BASE}/coupons`);
      return await res.json();
    } catch {
      return [];
    }
  },

  async createCoupon(couponData: any): Promise<Coupon> {
    const res = await fetch(`${API_BASE}/coupons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(couponData)
    });
    if (!res.ok) throw new Error('Falha ao criar cupom');
    return await res.json();
  },

  async deleteCoupon(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/coupons/${id}`, { method: 'DELETE' });
    return res.ok;
  },

  async validateCoupon(code: string, cartTotal: number): Promise<{ valid: boolean; discount: number; message: string; coupon?: Coupon }> {
    const res = await fetch(`${API_BASE}/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, cartTotal })
    });
    return await res.json();
  },

  // Banners
  async getBanners(): Promise<Banner[]> {
    try {
      const res = await fetch(`${API_BASE}/banners`);
      return await res.json();
    } catch {
      return [];
    }
  },

  async updateBanner(id: string, data: Partial<Banner>): Promise<Banner> {
    const res = await fetch(`${API_BASE}/banners/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  },

  // Reviews
  async getReviews(productId?: string): Promise<Review[]> {
    try {
      const query = productId ? `?productId=${productId}` : '';
      const res = await fetch(`${API_BASE}/reviews${query}`);
      return await res.json();
    } catch {
      return [];
    }
  },

  async addReview(reviewData: any): Promise<Review> {
    const res = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviewData)
    });
    return await res.json();
  },

  async updateReviewStatus(id: string, status: string): Promise<Review> {
    const res = await fetch(`${API_BASE}/reviews/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return await res.json();
  },

  // Settings
  async getSettings(): Promise<StoreSettings> {
    const res = await fetch(`${API_BASE}/settings`);
    return await res.json();
  },

  async updateSettings(data: Partial<StoreSettings>): Promise<StoreSettings> {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  },

  // Stats
  async getStats(): Promise<any> {
    const res = await fetch(`${API_BASE}/stats`);
    return await res.json();
  },

  // Stock Adjustment
  async adjustStock(productId: string, change: number, reason: string): Promise<any> {
    const res = await fetch(`${API_BASE}/stock/adjust`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, change, reason })
    });
    return await res.json();
  },

  // Admin login
  async adminLogin(email: string, password: string): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Credenciais inválidas');
    }
    return await res.json();
  }
};
