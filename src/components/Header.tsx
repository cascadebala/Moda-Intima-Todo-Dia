import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  User,
  Heart,
  ShoppingBag,
  Menu,
  X,
  Phone,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import { useWishlist } from '../context/WishlistContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { Product } from '../types/index.ts';

interface HeaderProps {
  currentPath: string;
  navigate: (path: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPath, navigate }) => {
  const { totalItems, toggleCart } = useCart();
  const { wishlistCount } = useWishlist();
  const { customer, isAdmin } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  // Close menus on path change
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
    setAccountMenuOpen(false);
  }, [currentPath]);

  // Live search debouncing
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await api.getProducts({ search: searchQuery });
        setSearchResults(results.slice(0, 5));
      } catch (e) {
        console.error('Search error:', e);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Handle outside click for account menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { label: 'Início', path: '/' },
    { label: 'Feminino', path: '/categoria/lingeries' },
    { label: 'Masculino', path: '/categoria/masculino' },
    { label: 'Lingeries', path: '/categoria/lingeries' },
    { label: 'Sutiãs', path: '/categoria/sutias' },
    { label: 'Calcinhas', path: '/categoria/calcinhas' },
    { label: 'Pijamas', path: '/categoria/pijamas' },
    { label: 'Conjuntos', path: '/categoria/conjuntos' },
    { label: 'Ofertas', path: '/ofertas', highlight: true },
    { label: 'Novidades', path: '/novidades' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      {/* Top Announcement Bar */}
      <div className="bg-[#5B1525] text-white text-xs py-2 px-4 text-center font-medium flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-rose-300 shrink-0" />
        <span>FRETE GRÁTIS para todo o Brasil acima de R$ 199 | Cupom de 10% OFF: <strong>BEMVINDA10</strong></span>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Mobile menu trigger */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-2 text-stone-700 hover:text-[#5B1525] transition-colors focus:outline-none"
              aria-label="Abrir menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 text-stone-700 hover:text-[#5B1525] transition-colors ml-1 focus:outline-none"
              aria-label="Pesquisar"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* Brand Wordmark (Zone 1) */}
          <div className="flex-1 lg:flex-none text-center lg:text-left">
            <button
              onClick={() => navigate('/')}
              className="inline-flex flex-col items-center lg:items-start group text-left"
            >
              <span className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-[#5B1525] group-hover:text-[#7E2235] transition-colors">
                Moda Intima Todo Dia
              </span>
              <span className="text-[10px] tracking-widest uppercase text-stone-500 font-medium -mt-1 hidden sm:block">
                Conforto & Sofisticação
              </span>
            </button>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-8 relative">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    navigate(`/produtos?search=${encodeURIComponent(searchQuery)}`);
                    setSearchResults([]);
                  }
                }}
                placeholder="Buscar lingeries, sutiãs, pijamas, cuecas..."
                className="w-full bg-stone-100/80 hover:bg-stone-100 focus:bg-white text-sm text-stone-900 placeholder-stone-400 pl-10 pr-4 py-2.5 rounded-full border border-stone-200 focus:outline-none focus:border-[#C87D85] focus:ring-2 focus:ring-[#C87D85]/20 transition-all"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Instant Search Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden z-50">
                <div className="p-3 bg-stone-50 border-b border-stone-100 flex items-center justify-between text-xs text-stone-500">
                  <span>Produtos encontrados</span>
                  <button
                    onClick={() => {
                      navigate(`/produtos?search=${encodeURIComponent(searchQuery)}`);
                      setSearchResults([]);
                    }}
                    className="text-[#5B1525] font-semibold hover:underline"
                  >
                    Ver todos
                  </button>
                </div>
                <div className="divide-y divide-stone-100">
                  {searchResults.map(prod => (
                    <button
                      key={prod.id}
                      onClick={() => {
                        navigate(`/produto/${prod.slug}`);
                        setSearchResults([]);
                        setSearchQuery('');
                      }}
                      className="w-full p-3 flex items-center gap-3 hover:bg-rose-50/50 text-left transition-colors"
                    >
                      <img
                        src={prod.images[0]}
                        alt={prod.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-14 object-cover rounded-md bg-stone-100 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-stone-500 uppercase tracking-wider">{prod.category}</p>
                        <p className="text-sm font-medium text-stone-900 truncate">{prod.name}</p>
                        <p className="text-xs font-semibold text-[#5B1525]">
                          R$ {(prod.promoPrice || prod.price).toFixed(2).replace('.', ',')}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Action Icons (Zone 3) */}
          <div className="flex items-center gap-1 sm:gap-3">
            {/* WhatsApp Direct */}
            <a
              href="https://wa.me/5511999998888?text=Ol%C3%A1!%20Gostaria%20de%20tirar%20uma%20d%C3%BAvida%20sobre%20as%20pe%C3%A7as%20da%20Moda%20Intima%20Todo%20Dia."
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-stone-700 hover:text-emerald-700 transition-colors hidden sm:flex items-center gap-1.5 text-xs font-medium"
              title="Atendimento via WhatsApp"
            >
              <Phone className="w-4 h-4 text-emerald-600" />
              <span className="hidden xl:inline">WhatsApp</span>
            </a>

            {/* Account Dropdown */}
            <div className="relative" ref={accountRef}>
              <button
                onClick={() => setAccountMenuOpen(prev => !prev)}
                className="p-2 text-stone-700 hover:text-[#5B1525] transition-colors relative flex items-center gap-1"
                aria-label="Minha Conta"
              >
                <User className="w-5 h-5" />
                <span className="hidden md:inline text-xs font-medium text-stone-700">
                  {customer ? customer.name.split(' ')[0] : 'Entrar'}
                </span>
                <ChevronDown className="w-3 h-3 text-stone-400 hidden md:inline" />
              </button>

              {accountMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-stone-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  {customer ? (
                    <>
                      <div className="px-4 py-2 border-b border-stone-100">
                        <p className="text-xs text-stone-500">Conectado como</p>
                        <p className="text-sm font-semibold text-stone-900 truncate">{customer.name}</p>
                        <p className="text-xs text-stone-400 truncate">{customer.email}</p>
                      </div>
                      <button
                        onClick={() => navigate('/minha-conta')}
                        className="w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 hover:text-[#5B1525]"
                      >
                        Meus Pedidos & Dados
                      </button>
                      <button
                        onClick={() => navigate('/favoritos')}
                        className="w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 hover:text-[#5B1525]"
                      >
                        Meus Favoritos
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="px-4 py-2 border-b border-stone-100 text-xs text-stone-600">
                        Acesse sua conta para ver pedidos e ofertas exclusivas.
                      </div>
                      <button
                        onClick={() => navigate('/login')}
                        className="w-full text-left px-4 py-2 text-sm font-medium text-[#5B1525] hover:bg-rose-50"
                      >
                        Entrar ou Cadastrar
                      </button>
                    </>
                  )}
                  {isAdmin && (
                    <button
                      onClick={() => navigate('/admin')}
                      className="w-full text-left px-4 py-2 text-sm text-amber-800 bg-amber-50 hover:bg-amber-100 border-t border-stone-100 flex items-center justify-between"
                    >
                      <span>Painel Admin</span>
                      <ShieldCheck className="w-4 h-4 text-amber-700" />
                    </button>
                  )}
                  {!isAdmin && (
                    <button
                      onClick={() => navigate('/admin/login')}
                      className="w-full text-left px-4 py-1.5 text-xs text-stone-400 hover:text-stone-700 border-t border-stone-100"
                    >
                      Acesso Administrador
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Wishlist Icon */}
            <button
              onClick={() => navigate('/favoritos')}
              className="p-2 text-stone-700 hover:text-[#5B1525] transition-colors relative"
              aria-label="Favoritos"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute 1 top-1 right-1 w-4 h-4 bg-[#C87D85] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Icon */}
            <button
              onClick={toggleCart}
              className="p-2 text-stone-700 hover:text-[#5B1525] transition-colors relative flex items-center gap-1.5"
              aria-label="Sacola de Compras"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 text-[#5B1525]" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#5B1525] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </div>
              <span className="hidden lg:inline text-xs font-semibold text-stone-800">
                Sacola
              </span>
            </button>
          </div>

        </div>

        {/* Desktop Category Navigation Menu (Zone 2) */}
        <nav className="hidden lg:flex items-center justify-center gap-8 py-3 border-t border-stone-100 text-sm font-medium">
          {navLinks.map(link => (
            <button
              key={link.path + link.label}
              onClick={() => navigate(link.path)}
              className={`transition-colors relative py-1 hover:text-[#5B1525] ${
                currentPath === link.path
                  ? 'text-[#5B1525] font-semibold'
                  : link.highlight
                  ? 'text-rose-700 font-semibold'
                  : 'text-stone-700'
              }`}
            >
              {link.label}
              {link.highlight && (
                <span className="ml-1 text-[9px] uppercase tracking-wider bg-rose-100 text-[#5B1525] px-1.5 py-0.5 rounded-full font-bold">
                  OFF
                </span>
              )}
              {currentPath === link.path && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5B1525] rounded-full" />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Mobile Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm p-4 flex flex-col justify-start">
          <div className="bg-white rounded-2xl p-4 shadow-2xl w-full max-w-lg mx-auto mt-6">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <span className="text-sm font-medium text-stone-800">O que você está procurando?</span>
              <button
                onClick={() => setSearchOpen(false)}
                className="p-1 text-stone-500 hover:text-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-3 relative">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    navigate(`/produtos?search=${encodeURIComponent(searchQuery)}`);
                    setSearchOpen(false);
                  }
                }}
                placeholder="Ex: Conjunto renda, sutiã sustentação, cueca modal..."
                className="w-full bg-stone-100 text-sm text-stone-900 placeholder-stone-400 pl-10 pr-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-[#C87D85]"
              />
              <Search className="w-5 h-5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            {/* Quick Suggestions / Results */}
            {searchResults.length > 0 ? (
              <div className="mt-4 divide-y divide-stone-100 max-h-72 overflow-y-auto">
                {searchResults.map(prod => (
                  <button
                    key={prod.id}
                    onClick={() => {
                      navigate(`/produto/${prod.slug}`);
                      setSearchOpen(false);
                    }}
                    className="w-full py-2.5 flex items-center gap-3 text-left hover:bg-stone-50"
                  >
                    <img
                      src={prod.images[0]}
                      alt={prod.name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-12 object-cover rounded bg-stone-100"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-stone-900 truncate">{prod.name}</p>
                      <p className="text-xs text-[#5B1525] font-semibold">
                        R$ {(prod.promoPrice || prod.price).toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-stone-600">
                <span className="text-stone-400">Sugestões:</span>
                {['Renda', 'Pijamas', 'Sutiã sem aro', 'Cuecas boxer', 'Kits calcinhas'].map(term => (
                  <button
                    key={term}
                    onClick={() => {
                      setSearchQuery(term);
                      navigate(`/produtos?search=${encodeURIComponent(term)}`);
                      setSearchOpen(false);
                    }}
                    className="bg-stone-100 hover:bg-rose-50 px-2.5 py-1 rounded-md text-stone-700"
                  >
                    {term}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Drawer (Menu Hamburger) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm lg:hidden flex">
          <div className="w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-200">
            <div>
              {/* Drawer Header */}
              <div className="p-5 border-b border-stone-100 flex items-center justify-between">
                <div>
                  <span className="font-serif text-xl font-bold text-[#5B1525]">Moda Intima</span>
                  <p className="text-[10px] tracking-wider uppercase text-stone-500">Todo Dia</p>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Navigation Links */}
              <div className="py-3">
                {navLinks.map(link => (
                  <button
                    key={link.path + link.label}
                    onClick={() => {
                      navigate(link.path);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-6 py-3 text-left text-sm ${
                      link.highlight
                        ? 'text-[#5B1525] font-semibold bg-rose-50/50'
                        : currentPath === link.path
                        ? 'text-[#5B1525] font-semibold border-l-4 border-[#5B1525] bg-stone-50'
                        : 'text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <span>{link.label}</span>
                    <ArrowRight className="w-4 h-4 text-stone-400" />
                  </button>
                ))}
              </div>

              <div className="border-t border-stone-100 my-2 px-6 py-3 space-y-2">
                <button
                  onClick={() => {
                    navigate('/minha-conta');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left text-sm text-stone-600 hover:text-[#5B1525] flex items-center gap-2"
                >
                  <User className="w-4 h-4 text-stone-400" />
                  <span>Minha Conta</span>
                </button>
                <button
                  onClick={() => {
                    navigate('/favoritos');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left text-sm text-stone-600 hover:text-[#5B1525] flex items-center gap-2"
                >
                  <Heart className="w-4 h-4 text-stone-400" />
                  <span>Favoritos ({wishlistCount})</span>
                </button>
                <button
                  onClick={() => {
                    navigate('/sobre-nos');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left text-sm text-stone-600 hover:text-[#5B1525] flex items-center gap-2"
                >
                  <span>Sobre a Loja</span>
                </button>
                <button
                  onClick={() => {
                    navigate('/contato');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left text-sm text-stone-600 hover:text-[#5B1525] flex items-center gap-2"
                >
                  <span>Fale Conosco</span>
                </button>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-6 bg-stone-50 border-t border-stone-100 space-y-3">
              <a
                href="https://wa.me/5511999998888?text=Ol%C3%A1!%20Vim%20pelo%20site%20da%20Moda%20Intima%20Todo%20Dia."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>Atendimento WhatsApp</span>
              </a>

              {isAdmin ? (
                <button
                  onClick={() => {
                    navigate('/admin');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center text-xs text-amber-700 hover:underline font-semibold"
                >
                  Painel de Controle Admin
                </button>
              ) : (
                <button
                  onClick={() => {
                    navigate('/admin/login');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center text-[11px] text-stone-400 hover:text-stone-600"
                >
                  Área do Administrador
                </button>
              )}
            </div>
          </div>
          {/* Backdrop click */}
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}
    </header>
  );
};
