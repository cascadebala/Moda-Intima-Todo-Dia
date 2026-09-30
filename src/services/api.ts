import { Product, Category, Order, Coupon, Banner, Review, StoreSettings } from '../types/index.ts';
import {
  syncProductToFirestore,
  deleteProductFromFirestore,
  fetchProductsFromFirestore,
  syncBannerToFirestore,
  deleteBannerFromFirestore,
  fetchBannersFromFirestore,
  seedInitialDataToFirestoreIfEmpty
} from './firestoreSync.ts';

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
    let prods: Product[] = [];

    // Try fetching from Firestore first for real-time persisted data
    try {
      const firestoreProds = await fetchProductsFromFirestore();
      if (firestoreProds && firestoreProds.length > 0) {
        prods = firestoreProds;
      }
    } catch {
      // Fallback
    }

    // If Firestore empty or not available, fetch from API
    if (prods.length === 0) {
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
        if (res.ok) {
          prods = await res.json();
          // Seed Firestore in background so it's persisted permanently
          if (prods.length > 0) {
            seedInitialDataToFirestoreIfEmpty(prods, []).catch(() => null);
          }
        }
      } catch (e) {
        console.error('getProducts error:', e);
      }
    }

    // Apply client filters if we loaded directly from Firestore
    if (params) {
      if (params.category) {
        prods = prods.filter(p => p.category.toLowerCase() === params.category!.toLowerCase());
      }
      if (params.search) {
        const q = params.search.toLowerCase();
        prods = prods.filter(p => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
      }
      if (params.minPrice !== undefined) {
        prods = prods.filter(p => (p.promoPrice || p.price) >= params.minPrice!);
      }
      if (params.maxPrice !== undefined) {
        prods = prods.filter(p => (p.promoPrice || p.price) <= params.maxPrice!);
      }
      if (params.isNew) {
        prods = prods.filter(p => p.isNew);
      }
      if (params.isOnSale) {
        prods = prods.filter(p => p.isOnSale || (p.promoPrice && p.promoPrice < p.price));
      }
      if (params.sort) {
        if (params.sort === 'price-asc') prods.sort((a, b) => (a.promoPrice || a.price) - (b.promoPrice || b.price));
        if (params.sort === 'price-desc') prods.sort((a, b) => (b.promoPrice || b.price) - (a.promoPrice || a.price));
        if (params.sort === 'rating') prods.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        if (params.sort === 'newest') prods.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      }
    }

    return prods;
  },

  async getProductById(id: string): Promise<Product | null> {
    try {
      // Check from Firestore first
      const allProds = await this.getProducts();
      const found = allProds.find(p => p.id === id || p.slug === id);
      if (found) return found;

      const res = await fetch(`${API_BASE}/products/${id}`);
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      console.error('getProductById error:', e);
      return null;
    }
  },

  async createProduct(productData: Partial<Product>): Promise<Product> {
    let createdProduct: Product | null = null;
    try {
      const res = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      if (res.ok) {
        createdProduct = await res.json();
      }
    } catch {
      // Fallback
    }

    if (!createdProduct) {
      const newId = 'prod-' + Date.now();
      createdProduct = {
        id: newId,
        name: productData.name || 'Novo Produto',
        slug: (productData.name || 'novo-produto').toLowerCase().replace(/\s+/g, '-'),
        sku: productData.sku || `MITD-${Date.now().toString().slice(-4)}`,
        category: productData.category || 'Lingerie',
        price: productData.price || 0,
        promoPrice: productData.promoPrice,
        stock: productData.stock || 1,
        minStockAlert: productData.minStockAlert || 3,
        images: productData.images || ['https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&q=80&w=800'],
        sizes: productData.sizes || ['P', 'M', 'G', 'GG'],
        colors: productData.colors || [{ name: 'Vinho', hex: '#5B1525' }],
        description: productData.description || '',
        material: productData.material || 'Renda e Microfibra',
        careInstructions: productData.careInstructions || 'Lavar à mão.',
        rating: 5.0,
        reviewCount: 0,
        createdAt: new Date().toISOString(),
        ...productData
      } as Product;
    }

    // Persist to Cloud Firestore
    await syncProductToFirestore(createdProduct);
    return createdProduct;
  },

  async updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
    let updatedProduct: Product | null = null;
    try {
      const res = await fetch(`${API_BASE}/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      if (res.ok) {
        updatedProduct = await res.json();
      }
    } catch {
      // Fallback
    }

    if (!updatedProduct) {
      const all = await this.getProducts();
      const existing = all.find(p => p.id === id);
      updatedProduct = { ...(existing || {}), ...productData, id } as Product;
    }

    // Persist to Cloud Firestore
    await syncProductToFirestore(updatedProduct);
    return updatedProduct;
  },

  async deleteProduct(id: string): Promise<boolean> {
    try {
      await fetch(`${API_BASE}/products/${id}`, { method: 'DELETE' });
    } catch {
      // ignore
    }
    // Delete from Cloud Firestore
    await deleteProductFromFirestore(id);
    return true;
  },

  async adjustStock(productId: string, change: number, reason: string): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/stock/adjust`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, change, reason })
    });
    if (!res.ok) throw new Error('Falha ao ajustar estoque');
    const data = await res.json();
    if (data.product) {
      syncProductToFirestore(data.product).catch(() => null);
    }
    return data;
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
  async getOrders(customerEmail?: string): Promise<Order[]> {
    try {
      const url = customerEmail
        ? `${API_BASE}/orders?customerEmail=${encodeURIComponent(customerEmail)}`
        : `${API_BASE}/orders`;
      const res = await fetch(url);
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

  // Banners with Cloud Firestore Persistence
  async getBanners(): Promise<Banner[]> {
    let banners: Banner[] = [];

    // Try fetching from Firestore first for saved custom banners
    try {
      const firestoreBanners = await fetchBannersFromFirestore();
      if (firestoreBanners && firestoreBanners.length > 0) {
        banners = firestoreBanners;
      }
    } catch {
      // Fallback
    }

    if (banners.length === 0) {
      try {
        const res = await fetch(`${API_BASE}/banners`);
        if (res.ok) {
          banners = await res.json();
          // Seed Firestore so they are permanently saved in cloud
          if (banners.length > 0) {
            seedInitialDataToFirestoreIfEmpty([], banners).catch(() => null);
          }
        }
      } catch {
        banners = [];
      }
    }

    return banners;
  },

  async createBanner(bannerData: Partial<Banner>): Promise<Banner> {
    let createdBanner: Banner | null = null;
    try {
      const res = await fetch(`${API_BASE}/banners`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bannerData)
      });
      if (res.ok) {
        createdBanner = await res.json();
      }
    } catch {
      // Fallback
    }

    if (!createdBanner) {
      const newId = 'banner-' + Date.now();
      createdBanner = {
        id: newId,
        type: bannerData.type || 'hero',
        title: bannerData.title || 'Novo Banner Promocional',
        subtitle: bannerData.subtitle || '',
        buttonText: bannerData.buttonText || 'Ver Coleção',
        buttonLink: bannerData.buttonLink || '/produtos',
        image: bannerData.image || 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&q=80&w=1600',
        order: bannerData.order || 1,
        isActive: bannerData.isActive ?? true
      };
    }

    // Persist to Cloud Firestore
    await syncBannerToFirestore(createdBanner);
    return createdBanner;
  },

  async updateBanner(id: string, data: Partial<Banner>): Promise<Banner> {
    let updatedBanner: Banner | null = null;
    try {
      const res = await fetch(`${API_BASE}/banners/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        updatedBanner = await res.json();
      }
    } catch {
      // Fallback
    }

    if (!updatedBanner) {
      const current = await this.getBanners();
      const existing = current.find(b => b.id === id);
      updatedBanner = { ...(existing || {}), ...data, id } as Banner;
    }

    // Persist to Cloud Firestore
    await syncBannerToFirestore(updatedBanner);
    return updatedBanner;
  },

  async deleteBanner(id: string): Promise<boolean> {
    try {
      await fetch(`${API_BASE}/banners/${id}`, { method: 'DELETE' });
    } catch {
      // ignore
    }
    // Delete from Cloud Firestore
    await deleteBannerFromFirestore(id);
    return true;
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
    try {
      const res = await fetch(`${API_BASE}/admin/stats`);
      return await res.json();
    } catch {
      return null;
    }
  },

  // Admin Auth
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
