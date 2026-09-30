import React, { useState, useEffect } from 'react';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext.tsx';
import { api } from '../services/api.ts';
import { Product } from '../types/index.ts';
import { ProductCard } from '../components/ProductCard.tsx';

interface WishlistViewProps {
  navigate: (path: string) => void;
}

export const WishlistView: React.FC<WishlistViewProps> = ({ navigate }) => {
  const { wishlistIds } = useWishlist();
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWishlist = async () => {
      setLoading(true);
      try {
        const all = await api.getProducts();
        setFavoriteProducts(all.filter(p => wishlistIds.includes(p.id)));
      } catch (e) {
        console.error('Error loading wishlist:', e);
      } finally {
        setLoading(false);
      }
    };
    loadWishlist();
  }, [wishlistIds]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div className="pb-4 border-b border-stone-200">
        <span className="text-xs uppercase tracking-widest text-[#5B1525] font-bold">
          Sua Lista de Desejos
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 mt-1">
          Meus Favoritos
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Peças salvas para você não perder de vista.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-stone-200 aspect-[3/4] rounded-2xl" />
          ))}
        </div>
      ) : favoriteProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-[#5B1525] flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8 opacity-60" />
          </div>
          <h3 className="font-serif text-xl font-bold text-stone-900">
            Você ainda não salvou nenhum produto
          </h3>
          <p className="text-xs text-stone-500">
            Clique no ícone de coração nos produtos para guardá-los nesta lista e comprar quando quiser.
          </p>
          <button
            onClick={() => navigate('/produtos')}
            className="px-6 py-3 bg-[#5B1525] hover:bg-[#7E2235] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors"
          >
            Explorar Coleção
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {favoriteProducts.map(prod => (
            <ProductCard key={prod.id} product={prod} onNavigate={navigate} />
          ))}
        </div>
      )}
    </div>
  );
};
