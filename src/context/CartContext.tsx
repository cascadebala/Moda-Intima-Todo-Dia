import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, CartItem } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useToast } from './ToastContext.tsx';

interface AppliedCoupon {
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
  value: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, color: { name: string; hex: string }, size: string, quantity?: number) => void;
  removeItem: (productId: string, colorName: string, size: string) => void;
  updateQuantity: (productId: string, colorName: string, size: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  discountAmount: number;
  shippingCost: number;
  shippingZip: string;
  shippingOption: string;
  total: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  toggleCart: () => void;
  appliedCoupon: AppliedCoupon | null;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  calculateShipping: (zip: string) => { name: string; cost: number; days: string }[];
  setShipping: (cost: number, zip: string, optionName?: string) => void;
  freeShippingThreshold: number;
  remainingForFreeShipping: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('mitd_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(() => {
    try {
      const saved = localStorage.getItem('mitd_coupon');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [shippingCost, setShippingCost] = useState<number>(0);
  const [shippingZip, setShippingZip] = useState<string>('');
  const [shippingOption, setShippingOption] = useState<string>('PAC');

  const freeShippingThreshold = 199.0;

  useEffect(() => {
    localStorage.setItem('mitd_cart', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem('mitd_coupon', JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem('mitd_coupon');
    }
  }, [appliedCoupon]);

  const subtotal = items.reduce((sum, item) => {
    const price = item.product.promoPrice ?? item.product.price;
    return sum + price * item.quantity;
  }, 0);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  // Recalculate discount based on subtotal
  const discountAmount = appliedCoupon
    ? appliedCoupon.type === 'percentage'
      ? Math.round(((subtotal * appliedCoupon.value) / 100) * 100) / 100
      : Math.min(appliedCoupon.value, subtotal)
    : 0;

  const total = Math.max(0, subtotal - discountAmount + (subtotal >= freeShippingThreshold ? 0 : shippingCost));

  const addItem = (product: Product, color: { name: string; hex: string }, size: string, quantity = 1) => {
    setItems(prev => {
      const index = prev.findIndex(
        i => i.product.id === product.id && i.selectedColor.name === color.name && i.selectedSize === size
      );

      if (index > -1) {
        const next = [...prev];
        const newQty = next[index].quantity + quantity;
        if (newQty > product.stock) {
          showToast(`Estoque máximo disponível: ${product.stock} unidades.`, 'info');
          next[index].quantity = product.stock;
        } else {
          next[index].quantity = newQty;
          showToast(`${product.name} adicionado à sacola!`);
        }
        return next;
      } else {
        showToast(`${product.name} adicionado à sacola!`);
        return [...prev, { product, selectedColor: color, selectedSize: size, quantity }];
      }
    });

    setIsCartOpen(true);
  };

  const removeItem = (productId: string, colorName: string, size: string) => {
    setItems(prev =>
      prev.filter(
        i => !(i.product.id === productId && i.selectedColor.name === colorName && i.selectedSize === size)
      )
    );
    showToast('Item removido da sacola', 'info');
  };

  const updateQuantity = (productId: string, colorName: string, size: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId, colorName, size);
      return;
    }
    setItems(prev =>
      prev.map(i => {
        if (i.product.id === productId && i.selectedColor.name === colorName && i.selectedSize === size) {
          const clamped = Math.min(quantity, i.product.stock);
          return { ...i, quantity: clamped };
        }
        return i;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
    setShippingCost(0);
    setShippingZip('');
    localStorage.removeItem('mitd_cart');
    localStorage.removeItem('mitd_coupon');
  };

  const applyCoupon = async (code: string): Promise<boolean> => {
    try {
      const res = await api.validateCoupon(code, subtotal);
      if (res.valid && res.coupon) {
        setAppliedCoupon({
          code: res.coupon.code,
          discount: res.discount,
          type: res.coupon.type,
          value: res.coupon.value
        });
        showToast(res.message, 'success');
        return true;
      } else {
        showToast(res.message || 'Cupom inválido', 'error');
        return false;
      }
    } catch {
      showToast('Erro ao validar cupom', 'error');
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('Cupom removido', 'info');
  };

  const calculateShipping = (zip: string) => {
    const cleanZip = zip.replace(/\D/g, '');
    if (cleanZip.length !== 8) return [];

    const isFree = subtotal >= freeShippingThreshold;

    return [
      {
        name: isFree ? 'Frete Grátis Promocional' : 'PAC Econômico',
        cost: isFree ? 0 : 16.90,
        days: '4 a 7 dias úteis'
      },
      {
        name: 'Sedex Expresso',
        cost: 29.90,
        days: '1 a 3 dias úteis'
      }
    ];
  };

  const setShipping = (cost: number, zip: string, optionName = 'PAC Econômico') => {
    setShippingCost(cost);
    setShippingZip(zip);
    setShippingOption(optionName);
    showToast(`Frete selecionado: ${optionName}`);
  };

  const toggleCart = () => setIsCartOpen(prev => !prev);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        discountAmount,
        shippingCost,
        shippingZip,
        shippingOption,
        total,
        isCartOpen,
        setIsCartOpen,
        toggleCart,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        calculateShipping,
        setShipping,
        freeShippingThreshold,
        remainingForFreeShipping
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
