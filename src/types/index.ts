export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  category: string;
  subcategory?: string;
  price: number;
  promoPrice?: number;
  discountPercent?: number;
  stock: number;
  minStockAlert: number;
  isFeatured?: boolean;
  isNew?: boolean;
  isOnSale?: boolean;
  rating: number;
  reviewCount: number;
  images: string[];
  colors: { name: string; hex: string }[];
  sizes: string[];
  description: string;
  material: string;
  careInstructions: string;
  dimensions?: string;
  weightGrams?: number;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  itemCount?: number;
}

export interface CartItem {
  product: Product;
  selectedColor: { name: string; hex: string };
  selectedSize: string;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  selectedColor: string;
  selectedSize: string;
  quantity: number;
  image: string;
}

export type OrderStatus =
  | 'Novo pedido'
  | 'Pagamento pendente'
  | 'Pago'
  | 'Preparando pedido'
  | 'Enviado'
  | 'Entregue'
  | 'Cancelado';

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCpf: string;
  shippingAddress: {
    cep: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  shippingMethod: string;
  shippingCost: number;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  total: number;
  paymentMethod: 'Pix' | 'Cartão de Crédito' | 'Cartão de Débito' | 'Boleto';
  paymentDetails?: {
    installments?: number;
    pixCode?: string;
    pixQrCode?: string;
    cardLast4?: string;
  };
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minPurchaseValue: number;
  startDate: string;
  expiryDate: string;
  usageLimit?: number;
  usageCount: number;
  isActive: boolean;
}

export interface Banner {
  id: string;
  type: 'hero' | 'secondary' | 'strip';
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  image: string;
  order: number;
  isActive: boolean;
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  authorName: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  status: 'approved' | 'pending' | 'rejected';
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  logoUrl: string;
  whatsappNumber: string;
  whatsappMessage: string;
  email: string;
  phone: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  address: string;
  businessHours: string;
  freeShippingThreshold: number;
  defaultShippingCost: number;
  announcementBarText: string;
  showAnnouncementBar: boolean;
  showCountdownPromo: boolean;
  countdownPromoEnd: string;
  countdownPromoTitle: string;
}

export interface CustomerUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  addresses: {
    id: string;
    title: string;
    cep: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    isDefault?: boolean;
  }[];
}
