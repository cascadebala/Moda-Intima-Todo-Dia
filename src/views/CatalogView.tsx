import React, { useState, useEffect, useMemo } from 'react';
import {
  Filter,
  X,
  ChevronDown,
  SlidersHorizontal,
  ArrowUpDown,
  Search,
  Sparkles
} from 'lucide-react';
import { Product, Category } from '../types/index.ts';
import { api } from '../services/api.ts';
import { ProductCard } from '../components/ProductCard.tsx';

interface CatalogViewProps {
  initialCategory?: string;
  initialSearch?: string;
  isSaleOnly?: boolean;
  isNewOnly?: boolean;
  pageTitle?: string;
  pageSubtitle?: string;
  navigate: (path: string) => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  initialCategory,
  initialSearch,
  isSaleOnly,
  isNewOnly,
  pageTitle,
  pageSubtitle,
  navigate
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || '');
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch || '');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<number>(300);
  const [onlySale, setOnlySale] = useState<boolean>(!!isSaleOnly);
  const [onlyNew, setOnlyNew] = useState<boolean>(!!isNewOnly);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    setSelectedCategory(initialCategory || '');
    setSearchQuery(initialSearch || '');
    setOnlySale(!!isSaleOnly);
    setOnlyNew(!!isNewOnly);
  }, [initialCategory, initialSearch, isSaleOnly, isNewOnly]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [allProds, allCats] = await Promise.all([
          api.getProducts(),
          api.getCategories()
        ]);
        setProducts(allProds);
        setCategories(allCats);
      } catch (e) {
        console.error('Error loading catalog:', e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Filter and sort computation
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Category filter
      if (selectedCategory) {
        const catMatch =
          p.category.toLowerCase() === selectedCategory.toLowerCase() ||
          p.slug.toLowerCase().includes(selectedCategory.toLowerCase()) ||
          (p.subcategory && p.subcategory.toLowerCase().includes(selectedCategory.toLowerCase()));
        if (!catMatch) return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const textMatch =
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q);
        if (!textMatch) return false;
      }

      // Price filter
      const curPrice = p.promoPrice || p.price;
      if (curPrice > maxPrice) return false;

      // Size filter
      if (selectedSize && !p.sizes.some(s => s.toLowerCase().includes(selectedSize.toLowerCase()))) {
        return false;
      }

      // Color filter
      if (selectedColor && !p.colors.some(c => c.name.toLowerCase().includes(selectedColor.toLowerCase()))) {
        return false;
      }

      // Sale & New filters
      if (onlySale && !p.isOnSale) return false;
      if (onlyNew && !p.isNew) return false;

      return true;
    }).sort((a, b) => {
      const priceA = a.promoPrice || a.price;
      const priceB = b.promoPrice || b.price;

      if (sortBy === 'price-asc') return priceA - priceB;
      if (sortBy === 'price-desc') return priceB - priceA;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    });
  }, [products, selectedCategory, searchQuery, maxPrice, selectedSize, selectedColor, onlySale, onlyNew, sortBy]);

  const clearAllFilters = () => {
    setSelectedCategory('');
    setSearchQuery('');
    setSelectedSize('');
    setSelectedColor('');
    setMaxPrice(300);
    setOnlySale(false);
    setOnlyNew(false);
    setSortBy('featured');
  };

  const hasActiveFilters =
    selectedCategory ||
    searchQuery ||
    selectedSize ||
    selectedColor ||
    maxPrice < 300 ||
    onlySale ||
    onlyNew;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header section */}
      <div className="mb-8 pb-4 border-b border-stone-200">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
          {pageTitle || (selectedCategory ? `Linha ${selectedCategory}` : 'Todos os Produtos')}
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-xl">
          {pageSubtitle || 'Peças desenvolvidas com design refinado, rendas nobres e toque macio para o seu bem-estar diário.'}
        </p>
      </div>

      {/* Control bar: Filters mobile toggle, count, sorting */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8 bg-white p-4 rounded-xl border border-stone-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold px-4 py-2 rounded-lg"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filtrar</span>
          </button>

          <span className="text-xs text-stone-500 font-medium">
            Exibindo <strong className="text-stone-900">{filteredProducts.length}</strong> produtos
          </span>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-[#5B1525] hover:underline font-semibold"
            >
              Limpar filtros
            </button>
          )}
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <ArrowUpDown className="w-4 h-4 text-stone-400" />
          <span className="text-xs text-stone-500 hidden sm:inline">Ordenar por:</span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="text-xs bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-800 focus:outline-none focus:border-[#C87D85]"
          >
            <option value="featured">Mais vendidos & Destaques</option>
            <option value="newest">Mais recentes</option>
            <option value="price-asc">Menor preço</option>
            <option value="price-desc">Maior preço</option>
            <option value="rating">Melhor avaliação</option>
          </select>
        </div>
      </div>

      {/* Layout Grid: Sidebar Filters (Desktop) + Product List */}
      <div className="flex gap-8">
        
        {/* Desktop Sidebar Filters */}
        <aside className="w-64 shrink-0 hidden lg:block space-y-6">
          
          {/* Categories */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900">
              Categorias
            </h3>
            <div className="space-y-1 text-xs">
              <button
                onClick={() => setSelectedCategory('')}
                className={`w-full text-left py-1 px-2 rounded-md transition-colors ${
                  selectedCategory === '' ? 'bg-rose-50 text-[#5B1525] font-bold' : 'text-stone-600 hover:bg-stone-50'
                }`}
              >
                Todas as categorias
              </button>
              {categories.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.name)}
                  className={`w-full text-left py-1 px-2 rounded-md transition-colors ${
                    selectedCategory.toLowerCase() === c.name.toLowerCase()
                      ? 'bg-rose-50 text-[#5B1525] font-bold'
                      : 'text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900">Preço Máximo</h3>
              <span className="text-xs font-bold text-[#5B1525] tabular-nums">
                Até R$ {maxPrice.toFixed(2).replace('.', ',')}
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="350"
              step="10"
              value={maxPrice}
              onChange={e => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[#5B1525] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-400">
              <span>R$ 20</span>
              <span>R$ 350+</span>
            </div>
          </div>

          {/* Sizes */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900">Tamanho</h3>
            <div className="flex flex-wrap gap-1.5">
              {['P', 'M', 'G', 'GG', 'XG', '40', '42', '44', '46'].map(sz => (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(selectedSize === sz ? '' : sz)}
                  className={`px-3 py-1 text-xs rounded-md border font-medium transition-colors ${
                    selectedSize === sz
                      ? 'bg-[#5B1525] border-[#5B1525] text-white'
                      : 'border-stone-200 text-stone-600 hover:border-stone-400'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900">Cores</h3>
            <div className="flex flex-wrap gap-2">
              {[
                { name: 'Vinho', hex: '#5B1525' },
                { name: 'Bordô', hex: '#781D31' },
                { name: 'Rosa', hex: '#C87D85' },
                { name: 'Nude', hex: '#EFE6E1' },
                { name: 'Preto', hex: '#1C1917' },
                { name: 'Branco', hex: '#FFFFFF' },
                { name: 'Azul', hex: '#1E293B' }
              ].map(c => (
                <button
                  key={c.name}
                  onClick={() => setSelectedColor(selectedColor === c.name ? '' : c.name)}
                  title={c.name}
                  className={`w-6 h-6 rounded-full border transition-all ${
                    selectedColor === c.name
                      ? 'ring-2 ring-[#5B1525] ring-offset-2 scale-110'
                      : 'border-stone-300 hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>

          {/* Special Toggles */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-2">
            <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
              <input
                type="checkbox"
                checked={onlySale}
                onChange={e => setOnlySale(e.target.checked)}
                className="rounded text-[#5B1525] focus:ring-[#5B1525]"
              />
              <span>Somente peças em <strong>Promoção</strong></span>
            </label>
            <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyNew}
                onChange={e => setOnlyNew(e.target.checked)}
                className="rounded text-[#5B1525] focus:ring-[#5B1525]"
              />
              <span>Somente <strong>Lançamentos (Novo)</strong></span>
            </label>
          </div>

        </aside>

        {/* Product Grid */}
        <main className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-stone-200 aspect-[3/4] rounded-2xl" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-stone-200 space-y-4">
              <div className="w-16 h-16 rounded-full bg-rose-50 text-[#5B1525] flex items-center justify-center mx-auto">
                <Search className="w-8 h-8 opacity-60" />
              </div>
              <h3 className="font-serif text-xl font-bold text-stone-800">
                Nenhum produto encontrado
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Tente ajustar os filtros selecionados, alterar os termos de busca ou conferir todas as categorias.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-6 py-2.5 bg-[#5B1525] hover:bg-[#7E2235] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors"
              >
                Limpar todos os filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredProducts.map(prod => (
                <ProductCard key={prod.id} product={prod} onNavigate={navigate} />
              ))}
            </div>
          )}
        </main>

      </div>

      {/* Mobile Filters Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-stone-900/60 backdrop-blur-xs">
          <div className="w-4/5 max-w-sm bg-white h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <h3 className="font-serif text-lg font-bold text-stone-900">Filtros</h3>
                <button onClick={() => setMobileFilterOpen(false)} className="p-1 text-stone-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Categories */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 mb-2">Categoria</h4>
                <div className="space-y-1 text-xs">
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={`block w-full text-left py-1 ${selectedCategory === '' ? 'text-[#5B1525] font-bold' : 'text-stone-600'}`}
                  >
                    Todas
                  </button>
                  {categories.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCategory(c.name)}
                      className={`block w-full text-left py-1 ${selectedCategory.toLowerCase() === c.name.toLowerCase() ? 'text-[#5B1525] font-bold' : 'text-stone-600'}`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-bold uppercase tracking-wider text-stone-800">Preço Máximo</span>
                  <span className="font-bold text-[#5B1525]">R$ {maxPrice}</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="350"
                  step="10"
                  value={maxPrice}
                  onChange={e => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#5B1525]"
                />
              </div>

              {/* Sizes */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 mb-2">Tamanho</h4>
                <div className="flex flex-wrap gap-1.5">
                  {['P', 'M', 'G', 'GG', 'XG'].map(sz => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(selectedSize === sz ? '' : sz)}
                      className={`px-3 py-1 text-xs rounded border ${
                        selectedSize === sz ? 'bg-[#5B1525] text-white' : 'border-stone-200'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-stone-100 flex gap-2">
              <button
                onClick={clearAllFilters}
                className="flex-1 py-2.5 text-xs font-medium text-stone-600 border border-stone-200 rounded-xl"
              >
                Limpar
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-2.5 bg-[#5B1525] text-white text-xs font-medium rounded-xl"
              >
                Ver Resultados
              </button>
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileFilterOpen(false)} />
        </div>
      )}
    </div>
  );
};
