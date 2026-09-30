import React, { useState, useEffect } from 'react';
import {
  Star,
  Heart,
  ShoppingBag,
  Ruler,
  Truck,
  RefreshCw,
  ShieldCheck,
  Plus,
  Minus,
  MessageCircle,
  ChevronRight,
  ZoomIn,
  X,
  CreditCard,
  Share2,
  CheckCircle2
} from 'lucide-react';
import { Product, Review } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useCart } from '../context/CartContext.tsx';
import { useWishlist } from '../context/WishlistContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { SizeGuideModal } from '../components/SizeGuideModal.tsx';
import { ProductCard } from '../components/ProductCard.tsx';

interface ProductDetailViewProps {
  productSlug: string;
  navigate: (path: string) => void;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({ productSlug, navigate }) => {
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { showToast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<{ name: string; hex: string } | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'desc' | 'materials' | 'care' | 'shipping' | 'exchanges'>('desc');
  const [loading, setLoading] = useState(true);

  // New review state
  const [reviewAuthor, setReviewAuthor] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    const loadProductData = async () => {
      setLoading(true);
      try {
        const prod = await api.getProductById(productSlug);
        if (prod) {
          setProduct(prod);
          setSelectedColor(prod.colors[0] || null);
          setSelectedSize(prod.sizes[0] || '');
          setSelectedImageIndex(0);

          // Fetch related
          const all = await api.getProducts({ category: prod.category });
          setRelatedProducts(all.filter(p => p.id !== prod.id).slice(0, 4));

          // Fetch reviews
          const revs = await api.getReviews(prod.id);
          setReviews(revs);
        }
      } catch (e) {
        console.error('Error loading product:', e);
      } finally {
        setLoading(false);
      }
    };
    loadProductData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [productSlug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-pulse space-y-8">
        <div className="h-6 bg-stone-200 w-1/4 rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-[3/4] bg-stone-200 rounded-3xl" />
          <div className="space-y-4">
            <div className="h-10 bg-stone-200 rounded w-3/4" />
            <div className="h-6 bg-stone-200 rounded w-1/2" />
            <div className="h-24 bg-stone-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="font-serif text-3xl font-bold text-stone-900">Produto não encontrado</h2>
        <p className="text-sm text-stone-500">O produto que você procura pode ter esgotado ou sido removido.</p>
        <button
          onClick={() => navigate('/produtos')}
          className="px-6 py-3 bg-[#5B1525] text-white text-xs font-semibold uppercase tracking-wider rounded-xl"
        >
          Voltar para a loja
        </button>
      </div>
    );
  }

  const isFavorite = isInWishlist(product.id);
  const currentPrice = product.promoPrice || product.price;
  const hasDiscount = product.promoPrice && product.promoPrice < product.price;

  const handleAddToCart = () => {
    if (!selectedColor) return;
    addItem(product, selectedColor, selectedSize, quantity);
  };

  const handleBuyNow = () => {
    if (!selectedColor) return;
    addItem(product, selectedColor, selectedSize, quantity);
    navigate('/checkout');
  };

  const handleWhatsAppBuy = () => {
    const message = encodeURIComponent(
      `Olá! Tenho interesse no produto "${product.name}" (Código: ${product.sku}), na cor ${selectedColor?.name || 'padrão'} e tamanho ${selectedSize}. Gostaria de saber mais informações!`
    );
    window.open(`https://wa.me/5511999998888?text=${message}`, '_blank');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewAuthor.trim() || !reviewComment.trim()) {
      showToast('Por favor, preencha seu nome e comentário.', 'error');
      return;
    }
    setIsSubmittingReview(true);
    try {
      const created = await api.addReview({
        productId: product.id,
        productName: product.name,
        authorName: reviewAuthor,
        rating: reviewRating,
        title: 'Avaliação de Cliente',
        comment: reviewComment
      });
      setReviews(prev => [created, ...prev]);
      showToast('Obrigada por avaliar nosso produto!');
      setReviewAuthor('');
      setReviewComment('');
    } catch {
      showToast('Erro ao enviar avaliação.', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16">
      
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-stone-500 overflow-x-auto">
        <button onClick={() => navigate('/')} className="hover:text-stone-900 transition-colors">
          Início
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        <button onClick={() => navigate(`/categoria/${product.category.toLowerCase()}`)} className="hover:text-stone-900 transition-colors">
          {product.category}
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        <span className="text-stone-900 font-medium truncate">{product.name}</span>
      </nav>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
        
        {/* Left: Gallery & Zoom */}
        <div className="space-y-4">
          <div className="relative aspect-[3/4] bg-stone-100 rounded-3xl overflow-hidden shadow-xs border border-stone-100">
            <img
              src={product.images[selectedImageIndex] || product.images[0]}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center cursor-zoom-in"
              onClick={() => setIsZoomModalOpen(true)}
            />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.isNew && (
                <span className="bg-stone-900 text-white text-[11px] font-bold tracking-widest uppercase px-3 py-1 rounded-sm shadow-xs">
                  NOVO
                </span>
              )}
              {hasDiscount && (
                <span className="bg-[#5B1525] text-white text-[11px] font-bold tracking-wider px-2.5 py-1 rounded-sm shadow-xs">
                  -{product.discountPercent}% OFF
                </span>
              )}
            </div>

            {/* Zoom Action Icon */}
            <button
              onClick={() => setIsZoomModalOpen(true)}
              className="absolute bottom-4 right-4 p-2.5 rounded-full bg-white/80 hover:bg-white text-stone-800 shadow-md backdrop-blur-sm transition-all"
              title="Ampliar imagem"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
          </div>

          {/* Thumbnails row */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImageIndex(i)}
                  className={`w-20 aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImageIndex === i ? 'border-[#5B1525] ring-2 ring-[#5B1525]/20' : 'border-stone-200 hover:border-stone-400'
                  }`}
                >
                  <img src={img} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Contiguous Purchase Module */}
        <div className="space-y-6">
          
          {/* Header & Rating */}
          <div>
            <div className="flex items-center justify-between text-xs text-stone-500 mb-1.5">
              <span className="uppercase tracking-widest font-semibold text-[#5B1525]">
                {product.category} {product.subcategory && `· ${product.subcategory}`}
              </span>
              <span className="text-stone-400 font-mono text-[11px]">Cód: {product.sku}</span>
            </div>

            <h1 className="font-serif text-2xl sm:text-4xl font-bold text-stone-900 tracking-tight leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 mt-2.5">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-stone-300'}`}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-stone-700">{product.rating.toFixed(1)}</span>
              <span className="text-xs text-stone-400">({reviews.length || product.reviewCount} avaliações)</span>
            </div>
          </div>

          {/* Price Block */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-1">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-[#5B1525] tabular-nums">
                R$ {currentPrice.toFixed(2).replace('.', ',')}
              </span>
              {hasDiscount && (
                <span className="text-base text-stone-400 line-through tabular-nums">
                  R$ {product.price.toFixed(2).replace('.', ',')}
                </span>
              )}
            </div>
            <p className="text-xs text-stone-600">
              em até <strong>6x de R$ {(currentPrice / 6).toFixed(2).replace('.', ',')}</strong> sem juros no cartão
            </p>
            <p className="text-[11px] text-emerald-800 font-medium">
              ✨ 5% de desconto no PIX à vista
            </p>
          </div>

          {/* Colors Selection */}
          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="font-semibold text-stone-800">
                Cor: <span className="font-normal text-stone-600">{selectedColor?.name}</span>
              </span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {product.colors.map(col => (
                <button
                  key={col.name}
                  onClick={() => setSelectedColor(col)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                    selectedColor?.name === col.name
                      ? 'border-[#5B1525] bg-rose-50/50 text-[#5B1525] shadow-xs'
                      : 'border-stone-200 hover:border-stone-400 text-stone-700'
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-stone-300"
                    style={{ backgroundColor: col.hex }}
                  />
                  <span>{col.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Size Selection & Guide */}
          <div>
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="font-semibold text-stone-800">
                Tamanho: <span className="font-normal text-stone-600">{selectedSize}</span>
              </span>
              <button
                onClick={() => setIsSizeGuideOpen(true)}
                className="text-[#5B1525] hover:underline font-semibold flex items-center gap-1"
              >
                <Ruler className="w-3.5 h-3.5" />
                <span>Guia de Tamanhos</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`min-w-[48px] py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
                    selectedSize === size
                      ? 'bg-[#5B1525] border-[#5B1525] text-white shadow-xs'
                      : 'border-stone-200 hover:border-stone-400 text-stone-700 bg-white'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity & Stock Status */}
          <div className="flex items-center gap-4">
            <div className="flex items-center border border-stone-200 rounded-xl bg-white p-1">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="p-1.5 text-stone-600 hover:text-stone-900"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-4 text-xs font-bold tabular-nums text-stone-900">{quantity}</span>
              <button
                onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                className="p-1.5 text-stone-600 hover:text-stone-900"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-stone-500">
              {product.stock > 0 ? (
                <span className="text-emerald-700 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Em estoque ({product.stock} disponíveis)
                </span>
              ) : (
                <span className="text-rose-600 font-medium">Esgotado no momento</span>
              )}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-3 pt-2">
            <div className="flex gap-3">
              <button
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="flex-1 bg-[#5B1525] hover:bg-[#7E2235] text-white font-semibold text-xs sm:text-sm uppercase tracking-wider py-4 px-6 rounded-xl shadow-lg transition-all cursor-pointer"
              >
                COMPRAR AGORA
              </button>

              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-900 font-semibold text-xs sm:text-sm uppercase tracking-wider py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>ADICIONAR À SACOLA</span>
              </button>

              <button
                onClick={() => toggleWishlist(product.id, product.name)}
                className={`p-4 rounded-xl border transition-colors ${
                  isFavorite
                    ? 'border-[#5B1525] bg-[#5B1525] text-white'
                    : 'border-stone-200 text-stone-600 hover:text-[#5B1525]'
                }`}
                title="Favoritar"
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Comprar pelo WhatsApp */}
            <button
              onClick={handleWhatsAppBuy}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>COMPRAR PELO WHATSAPP</span>
            </button>
          </div>

          {/* Shipping and Trust Badges */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-stone-200 text-xs text-stone-600">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#5B1525]" />
              <span>Envio para todo o Brasil</span>
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-[#5B1525]" />
              <span>1ª troca grátis em 30 dias</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#5B1525]" />
              <span>Embalagem 100% discreta</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#5B1525]" />
              <span>Pagamento criptografado</span>
            </div>
          </div>

        </div>
      </div>

      {/* Tabs / Accordion for Details */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200/80 shadow-xs space-y-6">
        <div className="flex border-b border-stone-200 overflow-x-auto gap-4 sm:gap-8 text-xs sm:text-sm font-semibold">
          {[
            { id: 'desc', label: 'Descrição Completa' },
            { id: 'materials', label: 'Material & Composição' },
            { id: 'care', label: 'Cuidados com a Peça' },
            { id: 'shipping', label: 'Envio & Entregas' },
            { id: 'exchanges', label: 'Política de Troca' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-[#5B1525] text-[#5B1525]'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-3xl">
          {activeTab === 'desc' && (
            <div className="space-y-3">
              <p>{product.description}</p>
              <p>Modelagem pensada para o uso diário, oferecendo firmeza, caimento anatômico e liberdade absoluta de movimentos.</p>
            </div>
          )}
          {activeTab === 'materials' && (
            <div className="space-y-3">
              <p><strong>Composição:</strong> {product.material}</p>
              <p>Tecidos de toque suave com tratamento hipoalergênico e forro em puro algodão nas calcinhas e partes de contato íntimo.</p>
            </div>
          )}
          {activeTab === 'care' && (
            <div className="space-y-3">
              <p><strong>Instruções de conservação:</strong></p>
              <p>{product.careInstructions}</p>
              <p className="text-stone-400 text-xs">Dica: Lingeries finas de renda mantêm o brilho e elasticidade por muito mais tempo quando secas à sombra em superfície plana.</p>
            </div>
          )}
          {activeTab === 'shipping' && (
            <div className="space-y-3">
              <p>Realizamos envios via Correios (Sedex e PAC) e transportadoras parceiras para todo o território nacional.</p>
              <p>Todas as peças são embaladas em caixas lacradas, sem nenhuma identificação externa da loja ou conteúdo, garantindo total privacidade e discrição.</p>
            </div>
          )}
          {activeTab === 'exchanges' && (
            <div className="space-y-3">
              <p>Sua primeira troca é 100% gratuita por nossa conta!</p>
              <p>Você tem até 30 dias corridos após o recebimento para solicitar a troca de tamanho ou modelo, desde que as peças estejam sem sinais de uso e com a etiqueta original intacta.</p>
            </div>
          )}
        </div>
      </div>

      {/* Customer Reviews & Add Review */}
      <div className="bg-stone-50 rounded-3xl p-6 sm:p-10 border border-stone-200/80 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-200 gap-4">
          <div>
            <h3 className="font-serif text-2xl font-bold text-stone-900">Avaliações das Clientes</h3>
            <p className="text-xs text-stone-500 mt-1">O que quem já comprou achou desta peça</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-current" />
              ))}
            </div>
            <span className="font-bold text-stone-900 text-lg">{product.rating.toFixed(1)}</span>
            <span className="text-xs text-stone-500">/ 5.0</span>
          </div>
        </div>

        {/* Existing reviews list */}
        <div className="divide-y divide-stone-200">
          {reviews.length > 0 ? (
            reviews.map(rev => (
              <div key={rev.id} className="py-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs sm:text-sm text-stone-900">{rev.authorName}</span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
                      Compra Verificada
                    </span>
                  </div>
                  <span className="text-[11px] text-stone-400">{rev.date}</span>
                </div>
                <div className="flex text-amber-400">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-stone-600">{rev.comment}</p>
              </div>
            ))
          ) : (
            <p className="py-4 text-xs text-stone-500">Seja a primeira a avaliar este produto!</p>
          )}
        </div>

        {/* Add Review Form */}
        <div className="pt-6 border-t border-stone-200">
          <h4 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-4">
            Deixe sua Avaliação
          </h4>
          <form onSubmit={handleReviewSubmit} className="space-y-4 max-w-xl">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">Sua Nota</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="p-1 text-amber-400"
                  >
                    <Star className={`w-6 h-6 ${star <= reviewRating ? 'fill-current' : 'text-stone-300'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Seu Nome</label>
                <input
                  type="text"
                  value={reviewAuthor}
                  onChange={e => setReviewAuthor(e.target.value)}
                  placeholder="Ex: Júlia M."
                  required
                  className="w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#C87D85]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">Seu Comentário</label>
              <textarea
                value={reviewComment}
                onChange={e => setReviewComment(e.target.value)}
                placeholder="Conte sobre o tecido, o caimento, o conforto no corpo..."
                rows={3}
                required
                className="w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#C87D85]"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingReview}
              className="bg-[#5B1525] hover:bg-[#7E2235] text-white text-xs font-semibold uppercase tracking-wider px-6 py-3 rounded-xl transition-colors"
            >
              {isSubmittingReview ? 'Enviando...' : 'Enviar Avaliação'}
            </button>
          </form>
        </div>
      </div>

      {/* Related Products: Você Também Pode Gostar */}
      {relatedProducts.length > 0 && (
        <div className="space-y-8">
          <div className="pb-3 border-b border-stone-200">
            <span className="text-xs font-bold uppercase tracking-widest text-[#5B1525]">Recomendações</span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
              Você Também Pode Gostar
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map(prod => (
              <ProductCard key={prod.id} product={prod} onNavigate={navigate} />
            ))}
          </div>
        </div>
      )}

      {/* Zoom Modal */}
      {isZoomModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <button
            onClick={() => setIsZoomModalOpen(false)}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/20 text-white hover:bg-white/40"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl">
            <img
              src={product.images[selectedImageIndex] || product.images[0]}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}

      {/* Size Guide Modal */}
      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
        category={product.category}
      />

    </div>
  );
};
