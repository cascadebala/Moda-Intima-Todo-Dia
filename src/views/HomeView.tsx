import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  Sparkles,
  CreditCard,
  RefreshCw,
  Star,
  Heart,
  ChevronRight,
  PackageCheck
} from 'lucide-react';
import { Product, Category, Banner, StoreSettings } from '../types/index.ts';
import { api } from '../services/api.ts';
import { ProductCard } from '../components/ProductCard.tsx';
import { CountdownTimer } from '../components/CountdownTimer.tsx';

interface HomeViewProps {
  navigate: (path: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ navigate }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prods, cats, bans, sets] = await Promise.all([
          api.getProducts(),
          api.getCategories(),
          api.getBanners(),
          api.getSettings()
        ]);
        setProducts(prods);
        setCategories(cats);
        setBanners(bans);
        setSettings(sets);
      } catch (e) {
        console.error('Error fetching home data:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const heroBanner = banners.find(b => b.type === 'hero' && b.isActive) || {
    title: 'Moda íntima para todos os dias',
    subtitle: 'Conforto, beleza e estilo para você se sentir incrível todos os dias.',
    buttonText: 'COMPRAR AGORA',
    buttonLink: '/produtos',
    image: '/src/assets/images/hero_lingerie_campaign_1790726065057.jpg'
  };

  const bestSellers = products.filter(p => p.isFeatured).slice(0, 4);
  const onSaleProducts = products.filter(p => p.isOnSale).slice(0, 4);
  const newArrivals = products.filter(p => p.isNew).slice(0, 4);

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      
      {/* Hero Banner Section */}
      <section className="relative w-full overflow-hidden bg-stone-900 min-h-[520px] sm:min-h-[620px] flex items-center">
        <div className="absolute inset-0 z-0">
          <img
            src={heroBanner.image}
            alt={heroBanner.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center sm:object-[center_35%] opacity-75"
          />
          {/* Measured gradient scrim */}
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950/90 via-stone-950/60 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-w-xl space-y-6">
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-rose-300">
              <Sparkles className="w-3.5 h-3.5" />
              Coleção Elegance 2026
            </span>

            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1] text-balance">
              {heroBanner.title}
            </h1>

            <p className="text-sm sm:text-base text-stone-200/90 leading-relaxed font-light">
              {heroBanner.subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => navigate(heroBanner.buttonLink || '/produtos')}
                className="bg-[#5B1525] hover:bg-[#7E2235] text-white text-xs sm:text-sm font-semibold tracking-wider uppercase px-7 py-4 rounded-xl shadow-lg transition-all hover:translate-y-[-2px] flex items-center gap-2 cursor-pointer"
              >
                <span>{heroBanner.buttonText || 'COMPRAR AGORA'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigate('/ofertas')}
                className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/30 text-xs sm:text-sm font-semibold tracking-wider uppercase px-7 py-4 rounded-xl transition-all"
              >
                VER OFERTAS
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Differentials Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-14 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl border border-stone-100 p-6 grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-rose-50 text-[#5B1525] flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-stone-900">Frete Grátis</h4>
              <p className="text-[11px] text-stone-500">Nas compras acima de R$ 199</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-rose-50 text-[#5B1525] flex items-center justify-center shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-stone-900">1ª Troca Grátis</h4>
              <p className="text-[11px] text-stone-500">Sem burocracia em até 30 dias</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-rose-50 text-[#5B1525] flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-stone-900">Até 6x Sem Juros</h4>
              <p className="text-[11px] text-stone-500">Ou desconto especial no PIX</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-rose-50 text-[#5B1525] flex items-center justify-center shrink-0">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-stone-900">Embalagem Discreta</h4>
              <p className="text-[11px] text-stone-500">Perfumada e 100% segura</p>
            </div>
          </div>
        </div>
      </section>

      {/* Secondary Campaigns Banners */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            onClick={() => navigate('/novidades')}
            className="group relative rounded-2xl overflow-hidden aspect-[16/10] bg-stone-900 cursor-pointer shadow-md"
          >
            <img
              src="/src/assets/images/cat_lingerie_renda_1790726076080.jpg"
              alt="Nova Coleção"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/30 to-transparent p-6 flex flex-col justify-end">
              <span className="text-[10px] uppercase font-bold tracking-widest text-rose-300">Coleção Nova</span>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-white mb-1">Renda Chantilly</h3>
              <p className="text-xs text-stone-200 line-clamp-1 mb-2">Peças nobres e delicadas para realçar sua essência.</p>
              <span className="text-xs font-semibold text-rose-200 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Ver Coleção <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          <div
            onClick={() => navigate('/categoria/pijamas')}
            className="group relative rounded-2xl overflow-hidden aspect-[16/10] bg-stone-900 cursor-pointer shadow-md"
          >
            <img
              src="/src/assets/images/cat_sleepwear_satin_1790726084222.jpg"
              alt="Pijamas & Sleepwear"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/30 to-transparent p-6 flex flex-col justify-end">
              <span className="text-[10px] uppercase font-bold tracking-widest text-rose-300">Sleepwear</span>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-white mb-1">Pijamas de Cetim</h3>
              <p className="text-xs text-stone-200 line-clamp-1 mb-2">O luxo de dormir com conforto térmico e elegância.</p>
              <span className="text-xs font-semibold text-rose-200 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Explorar Pijamas <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          <div
            onClick={() => navigate('/categoria/masculino')}
            className="group relative rounded-2xl overflow-hidden aspect-[16/10] bg-stone-900 cursor-pointer shadow-md"
          >
            <img
              src="/src/assets/images/cat_mens_underwear_1790726093399.jpg"
              alt="Moda Íntima Masculina"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/30 to-transparent p-6 flex flex-col justify-end">
              <span className="text-[10px] uppercase font-bold tracking-widest text-rose-300">Linha Masculina</span>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-white mb-1">Cuecas em Modal</h3>
              <p className="text-xs text-stone-200 line-clamp-1 mb-2">Máximo frescor anatômico que não enrola nas pernas.</p>
              <span className="text-xs font-semibold text-rose-200 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Ver Linha Masculina <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-3 border-b border-stone-200">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#5B1525]">Navegue por Linhas</span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
              Categorias Principais
            </h2>
          </div>
          <button
            onClick={() => navigate('/produtos')}
            className="text-xs font-semibold text-[#5B1525] hover:text-[#7E2235] mt-2 sm:mt-0 flex items-center gap-1 group"
          >
            <span>Ver todo o catálogo</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map(cat => (
            <div
              key={cat.id}
              onClick={() => navigate(`/categoria/${cat.slug}`)}
              className="group relative rounded-2xl overflow-hidden aspect-[4/5] bg-stone-100 cursor-pointer shadow-xs hover:shadow-xl transition-all"
            >
              <img
                src={cat.image}
                alt={cat.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent p-5 flex flex-col justify-end">
                <h3 className="font-serif text-lg sm:text-xl font-bold text-white">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-stone-300 line-clamp-1 mt-0.5">
                  {cat.description}
                </p>
                <span className="text-[10px] text-rose-300 font-semibold mt-2 inline-flex items-center gap-1">
                  Ver produtos <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products: Mais Vendidos */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-3 border-b border-stone-200">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#5B1525]">Favoritos das Clientes</span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
              Mais Vendidos
            </h2>
          </div>
          <button
            onClick={() => navigate('/produtos')}
            className="text-xs font-semibold text-[#5B1525] hover:text-[#7E2235] mt-2 sm:mt-0 flex items-center gap-1 group"
          >
            <span>Ver todos</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {bestSellers.map(product => (
            <ProductCard key={product.id} product={product} onNavigate={navigate} />
          ))}
        </div>
      </section>

      {/* Promotional Countdown Section */}
      {settings?.showCountdownPromo && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CountdownTimer
            targetDate={settings.countdownPromoEnd || '2026-10-15T23:59:59'}
            title={settings.countdownPromoTitle}
            onExploreOffers={() => navigate('/ofertas')}
          />
        </section>
      )}

      {/* Special Offers Section: Ofertas Especiais */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-3 border-b border-stone-200">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#5B1525]">Preços Imperdíveis</span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
              Ofertas Especiais
            </h2>
          </div>
          <button
            onClick={() => navigate('/ofertas')}
            className="text-xs font-semibold text-[#5B1525] hover:text-[#7E2235] mt-2 sm:mt-0 flex items-center gap-1 group"
          >
            <span>Ver todas as ofertas</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {onSaleProducts.map(product => (
            <ProductCard key={product.id} product={product} onNavigate={navigate} />
          ))}
        </div>
      </section>

      {/* New Arrivals: Acabou de Chegar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-3 border-b border-stone-200">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#5B1525]">Lançamentos</span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
              Acabou de Chegar
            </h2>
          </div>
          <button
            onClick={() => navigate('/novidades')}
            className="text-xs font-semibold text-[#5B1525] hover:text-[#7E2235] mt-2 sm:mt-0 flex items-center gap-1 group"
          >
            <span>Ver todas as novidades</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {newArrivals.map(product => (
            <ProductCard key={product.id} product={product} onNavigate={navigate} />
          ))}
        </div>
      </section>

      {/* Brand Story Teaser */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#FAF8F7] border border-stone-200 rounded-3xl p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-[#5B1525]">
              Sobre a Moda Intima Todo Dia
            </span>
            <h3 className="font-serif text-2xl sm:text-4xl font-bold text-stone-900 leading-tight">
              Moda íntima feita para acolher seu corpo todos os dias
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Acreditamos que a beleza e a sensualidade começam pelo conforto diário. Nossas peças unem rendas macias que não pinicam, tecidos respiráveis como o algodão nobre e o modal, e cortes anatômicos que abraçam sua silhueta com carinho e naturalidade.
            </p>
            <div className="pt-2">
              <button
                onClick={() => navigate('/sobre-nos')}
                className="bg-[#5B1525] hover:bg-[#7E2235] text-white text-xs font-semibold uppercase tracking-wider px-6 py-3 rounded-xl transition-colors"
              >
                Conheça Nossa História
              </button>
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-lg aspect-[4/3] bg-stone-200">
            <img
              src="/src/assets/images/cat_conjuntos_luxo_1790726102214.jpg"
              alt="Atelier Moda Intima Todo Dia"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

    </div>
  );
};
