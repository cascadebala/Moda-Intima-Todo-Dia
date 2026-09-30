import React, { useState } from 'react';
import { Heart, Star, ShoppingBag, Check } from 'lucide-react';
import { Product } from '../types/index.ts';
import { useCart } from '../context/CartContext.tsx';
import { useWishlist } from '../context/WishlistContext.tsx';

interface ProductCardProps {
  product: Product;
  onNavigate: (path: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onNavigate }) => {
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [selectedColor, setSelectedColor] = useState(product.colors[0] || { name: 'Padrão', hex: '#5B1525' });
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || 'M');
  const [isHovered, setIsHovered] = useState(false);

  const isFavorite = isInWishlist(product.id);
  const currentPrice = product.promoPrice || product.price;
  const hasDiscount = product.promoPrice && product.promoPrice < product.price;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product, selectedColor, selectedSize, 1);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product, selectedColor, selectedSize, 1);
    onNavigate('/checkout');
  };

  return (
    <div
      onClick={() => onNavigate(`/produto/${product.slug}`)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-white rounded-2xl overflow-hidden border border-stone-100/80 hover:border-stone-200 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between cursor-pointer"
    >
      {/* Visual Image Container */}
      <div className="relative aspect-[3/4] w-full bg-stone-100 overflow-hidden">
        <img
          src={product.images[0]}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.isNew && (
            <span className="bg-stone-900 text-white text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-sm shadow-xs">
              NOVO
            </span>
          )}
          {hasDiscount && product.discountPercent && (
            <span className="bg-[#5B1525] text-white text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-sm shadow-xs">
              -{product.discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={e => {
            e.stopPropagation();
            toggleWishlist(product.id, product.name);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-200 z-10 ${
            isFavorite
              ? 'bg-[#5B1525] text-white shadow-md'
              : 'bg-white/80 text-stone-700 hover:bg-white hover:text-[#5B1525] shadow-xs'
          }`}
          aria-label="Adicionar aos favoritos"
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        {/* Hover Quick Action Drawer (Desktop) */}
        <div
          className={`absolute inset-x-0 bottom-0 p-3 bg-white/95 backdrop-blur-sm border-t border-stone-100 transition-all duration-300 flex gap-2 ${
            isHovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
          } hidden sm:flex`}
        >
          <button
            onClick={handleQuickAdd}
            className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-900 text-xs font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Adicionar</span>
          </button>
          <button
            onClick={handleBuyNow}
            className="flex-1 bg-[#5B1525] hover:bg-[#7E2235] text-white text-xs font-semibold py-2 px-3 rounded-lg transition-colors whitespace-nowrap"
          >
            Comprar
          </button>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span className="uppercase tracking-wider text-[11px] font-medium text-stone-400">
              {product.category}
            </span>
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-stone-700 text-xs">{product.rating.toFixed(1)}</span>
              <span className="text-[10px] text-stone-400">({product.reviewCount})</span>
            </div>
          </div>

          {/* Product Title */}
          <h3 className="font-serif text-base font-semibold text-stone-900 group-hover:text-[#5B1525] transition-colors line-clamp-1 mb-2">
            {product.name}
          </h3>

          {/* Colors Selection Dots */}
          <div className="flex items-center gap-1.5 mb-2.5" onClick={e => e.stopPropagation()}>
            {product.colors.map(c => (
              <button
                key={c.name}
                type="button"
                onClick={() => setSelectedColor(c)}
                title={c.name}
                className={`w-4 h-4 rounded-full border transition-all ${
                  selectedColor.name === c.name ? 'ring-2 ring-[#5B1525] ring-offset-1 scale-110' : 'border-stone-300'
                }`}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>

          {/* Sizes Badges */}
          <div className="flex flex-wrap gap-1 mb-3" onClick={e => e.stopPropagation()}>
            {product.sizes.slice(0, 4).map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setSelectedSize(s)}
                className={`text-[10px] font-medium px-2 py-0.5 rounded border transition-colors ${
                  selectedSize === s
                    ? 'border-[#5B1525] bg-[#5B1525] text-white'
                    : 'border-stone-200 bg-white text-stone-600 hover:border-stone-400'
                }`}
              >
                {s}
              </button>
            ))}
            {product.sizes.length > 4 && (
              <span className="text-[10px] text-stone-400 self-center">+{product.sizes.length - 4}</span>
            )}
          </div>
        </div>

        {/* Pricing & Installments */}
        <div className="pt-2 border-t border-stone-100/80">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-[#5B1525] tabular-nums">
              R$ {currentPrice.toFixed(2).replace('.', ',')}
            </span>
            {hasDiscount && (
              <span className="text-xs text-stone-400 line-through tabular-nums">
                R$ {product.price.toFixed(2).replace('.', ',')}
              </span>
            )}
          </div>
          <p className="text-[11px] text-stone-500 mt-0.5">
            ou 3x de R$ {(currentPrice / 3).toFixed(2).replace('.', ',')} sem juros
          </p>

          {/* Mobile Direct Action Buttons */}
          <div className="mt-3 grid grid-cols-2 gap-2 sm:hidden" onClick={e => e.stopPropagation()}>
            <button
              onClick={handleQuickAdd}
              className="w-full bg-stone-100 text-stone-900 text-xs font-semibold py-2 px-1 rounded-lg flex items-center justify-center gap-1"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Sacola</span>
            </button>
            <button
              onClick={handleBuyNow}
              className="w-full bg-[#5B1525] text-white text-xs font-semibold py-2 px-1 rounded-lg"
            >
              Comprar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
