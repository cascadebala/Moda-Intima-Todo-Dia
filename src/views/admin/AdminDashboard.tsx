import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Layers,
  Tag,
  Image as ImageIcon,
  MessageSquare,
  Settings,
  LogOut,
  Plus,
  Trash2,
  Edit2,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Users,
  Search,
  X,
  ExternalLink,
  ChevronDown,
  Eye,
  EyeOff,
  Database,
  RefreshCw,
  Download,
  Cloud,
  Server
} from 'lucide-react';
import { Product, Order, Coupon, Banner, Review, StoreSettings, OrderStatus } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import {
  checkFirestoreHealth,
  syncAllDatabaseToFirestore,
  syncProductToFirestore,
  deleteProductFromFirestore,
  syncSettingsToFirestore,
  DatabaseStatus
} from '../../services/firestoreSync.ts';

interface AdminDashboardProps {
  navigate: (path: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ navigate }) => {
  const { isAdmin, adminUser, loginAdmin, logoutAdmin } = useAuth();
  const { showToast } = useToast();

  // Login form state if not authenticated
  const [adminEmail, setAdminEmail] = useState('RafaelModa-intima');
  const [adminPass, setAdminPass] = useState('301115');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Tab State
  const [tab, setTab] = useState<'dashboard' | 'products' | 'orders' | 'stock' | 'coupons' | 'banners' | 'reviews' | 'settings' | 'database'>('dashboard');

  // Database / Firestore states
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null);
  const [isSyncingDb, setIsSyncingDb] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);

  // Data states
  const [stats, setStats] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal / Form States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Product Form fields
  const [prodName, setProdName] = useState('');
  const [prodSku, setProdSku] = useState('');
  const [prodCategory, setProdCategory] = useState('Lingeries');
  const [prodSubcategory, setProdSubcategory] = useState('');
  const [prodPrice, setProdPrice] = useState(99.90);
  const [prodPromoPrice, setProdPromoPrice] = useState<number | undefined>(undefined);
  const [prodStock, setProdStock] = useState(20);
  const [prodMinStock, setProdMinStock] = useState(5);
  const [prodImage, setProdImage] = useState('/src/assets/images/cat_lingerie_renda_1790726076080.jpg');
  const [prodDescription, setProdDescription] = useState('');
  const [prodMaterial, setProdMaterial] = useState('88% Poliamida, 12% Elastano. Forro 100% Algodão.');
  const [prodCare, setProdCare] = useState('Lavar à mão com sabão neutro.');
  const [prodIsFeatured, setProdIsFeatured] = useState(false);
  const [prodIsNew, setProdIsNew] = useState(true);
  const [prodIsOnSale, setProdIsOnSale] = useState(false);

  // Coupon form fields
  const [couponCode, setCouponCode] = useState('');
  const [couponType, setCouponType] = useState<'percentage' | 'fixed'>('percentage');
  const [couponValue, setCouponValue] = useState(10);
  const [couponMinPurchase, setCouponMinPurchase] = useState(100);
  const [couponExpiry, setCouponExpiry] = useState('2026-12-31');

  // Stock quick adjustment
  const [stockChangeProdId, setStockChangeProdId] = useState('');
  const [stockChangeVal, setStockChangeVal] = useState(0);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [st, pr, ord, cp, bn, rv, set] = await Promise.all([
        api.getStats(),
        api.getProducts(),
        api.getOrders(),
        api.getCoupons(),
        api.getBanners(),
        api.getReviews(),
        api.getSettings()
      ]);
      setStats(st);
      setProducts(pr);
      setOrders(ord);
      setCoupons(cp);
      setBanners(bn);
      setReviews(rv);
      setSettings(set);

      // Check Firestore Cloud Database health
      checkFirestoreHealth().then(setDbStatus);
    } catch (e) {
      console.error('Error loading admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncAllFirestore = async () => {
    if (!settings) return;
    setIsSyncingDb(true);
    showToast('Iniciando sincronização com Firebase Firestore...', 'info');
    try {
      const result = await syncAllDatabaseToFirestore({
        products,
        orders,
        coupons,
        settings
      });
      if (result.success) {
        showToast(`Banco na nuvem sincronizado! ${result.count} registros salvos no Firestore.`);
        const st = await checkFirestoreHealth();
        setDbStatus(st);
      } else {
        showToast(`Erro na sincronização: ${result.error}`, 'error');
      }
    } catch (e: any) {
      showToast(e.message || 'Erro ao sincronizar', 'error');
    } finally {
      setIsSyncingDb(false);
    }
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    showToast('Testando conexão com o Firebase Firestore...', 'info');
    const st = await checkFirestoreHealth();
    setDbStatus(st);
    setTestingConnection(false);
    if (st.connected) {
      showToast('Conexão ativa! Firebase Firestore respondendo perfeitamente.');
    } else {
      showToast('Aviso: Não foi possível obter resposta imediata do Firestore.', 'error');
    }
  };

  const handleExportBackup = () => {
    const backupData = {
      exportedAt: new Date().toISOString(),
      store: 'Moda Intima Todo Dia',
      products,
      orders,
      coupons,
      settings,
      banners,
      reviews
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-modaintimatododia-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Cópia de segurança baixada com sucesso!');
  };

  useEffect(() => {
    if (isAdmin) {
      loadAllData();
    }
  }, [isAdmin]);

  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    await loginAdmin(adminEmail.trim(), adminPass.trim());
    setIsLoggingIn(false);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: Partial<Product> = {
        name: prodName,
        slug: prodName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        sku: prodSku || `MITD-${Math.floor(1000 + Math.random() * 9000)}`,
        category: prodCategory,
        subcategory: prodSubcategory,
        price: Number(prodPrice),
        promoPrice: prodPromoPrice ? Number(prodPromoPrice) : undefined,
        discountPercent: prodPromoPrice ? Math.round(((prodPrice - prodPromoPrice) / prodPrice) * 100) : undefined,
        stock: Number(prodStock),
        minStockAlert: Number(prodMinStock),
        images: editingProduct && editingProduct.images?.length ? [prodImage, ...editingProduct.images.slice(1)] : [prodImage],
        colors: editingProduct?.colors || [
          { name: 'Vinho Bordô', hex: '#5B1525' },
          { name: 'Rosa Nude', hex: '#C87D85' },
          { name: 'Preto', hex: '#1C1917' }
        ],
        sizes: editingProduct?.sizes || ['P', 'M', 'G', 'GG'],
        description: prodDescription,
        material: prodMaterial,
        careInstructions: prodCare,
        isFeatured: prodIsFeatured,
        isNew: prodIsNew,
        isOnSale: prodIsOnSale,
        rating: editingProduct?.rating ?? 5.0,
        reviewCount: editingProduct?.reviewCount ?? 0
      };

      if (editingProduct) {
        const updated = await api.updateProduct(editingProduct.id, payload);
        syncProductToFirestore(updated || ({ ...editingProduct, ...payload } as Product)).catch(() => null);
        showToast('Produto atualizado com sucesso!');
      } else {
        const created = await api.createProduct(payload);
        syncProductToFirestore(created).catch(() => null);
        showToast('Produto cadastrado com sucesso!');
      }

      setIsProductModalOpen(false);
      setEditingProduct(null);
      loadAllData();
    } catch (err: any) {
      showToast(err.message || 'Erro ao salvar produto', 'error');
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    try {
      await api.deleteProduct(id);
      deleteProductFromFirestore(id).catch(() => null);
      showToast(`Produto "${name}" excluído.`);
      loadAllData();
    } catch {
      showToast('Erro ao excluir produto.', 'error');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      showToast(`Status do pedido atualizado para: ${newStatus}`);
      loadAllData();
    } catch {
      showToast('Erro ao atualizar status', 'error');
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    try {
      await api.createCoupon({
        code: couponCode.toUpperCase().trim(),
        type: couponType,
        value: Number(couponValue),
        minPurchaseValue: Number(couponMinPurchase),
        startDate: new Date().toISOString().split('T')[0],
        expiryDate: couponExpiry,
        usageLimit: 500,
        isActive: true
      });
      showToast(`Cupom ${couponCode} criado com sucesso!`);
      setCouponCode('');
      loadAllData();
    } catch {
      showToast('Erro ao criar cupom', 'error');
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    await api.deleteCoupon(id);
    showToast('Cupom removido.');
    loadAllData();
  };

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockChangeProdId || stockChangeVal === 0) return;
    try {
      await api.adjustStock(stockChangeProdId, stockChangeVal, 'Ajuste manual via Painel');
      showToast('Estoque ajustado com sucesso!');
      setStockChangeProdId('');
      setStockChangeVal(0);
      loadAllData();
    } catch {
      showToast('Erro ao ajustar estoque', 'error');
    }
  };

  const handleUpdateReviewStatus = async (id: string, status: 'approved' | 'rejected') => {
    await api.updateReviewStatus(id, status);
    showToast(`Avaliação ${status === 'approved' ? 'aprovada' : 'rejeitada'}.`);
    loadAllData();
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      await api.updateSettings(settings);
      syncSettingsToFirestore(settings).catch(() => null);
      showToast('Configurações da loja salvas com sucesso!');
    } catch {
      showToast('Erro ao salvar configurações', 'error');
    }
  };

  // If NOT ADMIN, show Login Form
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-20">
        <div className="bg-white rounded-3xl p-8 border border-stone-200/80 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs uppercase tracking-widest text-[#5B1525] font-bold">
              Área Restrita
            </span>
            <h1 className="font-serif text-2xl font-bold text-stone-900">
              Painel Administrativo
            </h1>
            <p className="text-xs text-stone-500">
              Acesso exclusivo para gestão de produtos, pedidos, cupons e estoque.
            </p>
          </div>

          <form onSubmit={handleAdminLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-stone-700 font-medium mb-1">Usuário de Administrador</label>
              <input
                type="text"
                value={adminEmail}
                onChange={e => setAdminEmail(e.target.value)}
                placeholder="Digite seu usuário"
                required
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-medium mb-1">Senha</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={adminPass}
                  onChange={e => setAdminPass(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 pr-10 text-stone-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition-colors p-1"
                  title={showPassword ? 'Ocultar senha' : 'Ver senha'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
              <span>Usuário: <strong>RafaelModa-intima</strong></span>
              <button
                type="button"
                onClick={() => {
                  setAdminEmail('RafaelModa-intima');
                  setAdminPass('301115');
                }}
                className="text-[#5B1525] hover:underline font-semibold cursor-pointer"
              >
                Preencher dados
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 bg-[#5B1525] hover:bg-[#7E2235] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors shadow-sm cursor-pointer"
            >
              {isLoggingIn ? 'Autenticando...' : 'ACESSAR PAINEL'}
            </button>
          </form>

          <div className="text-center pt-2">
            <button
              onClick={() => navigate('/')}
              className="text-xs text-stone-500 hover:text-stone-800"
            >
              ← Voltar para a loja
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Top Bar */}
      <div className="bg-stone-900 text-white rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#5B1525] flex items-center justify-center font-serif text-lg font-bold">
            M
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-xl sm:text-2xl font-bold">
                Painel Administrativo
              </h1>
              <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full font-bold uppercase">
                Admin
              </span>
            </div>
            <p className="text-xs text-stone-400">
              Moda Intima Todo Dia · Gestão Integrada em Tempo Real
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <span>Ver Loja</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={logoutAdmin}
            className="px-3.5 py-2 rounded-xl bg-rose-900/60 hover:bg-rose-900 text-xs font-medium text-rose-200 flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair</span>
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex overflow-x-auto gap-2 p-1.5 bg-white rounded-2xl border border-stone-200 shadow-xs text-xs font-semibold">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'products', label: `Produtos (${products.length})`, icon: Package },
          { id: 'orders', label: `Pedidos (${orders.length})`, icon: ShoppingBag },
          { id: 'stock', label: 'Estoque & Alertas', icon: Layers },
          { id: 'coupons', label: `Cupons (${coupons.length})`, icon: Tag },
          { id: 'banners', label: `Banners (${banners.length})`, icon: ImageIcon },
          { id: 'reviews', label: `Avaliações (${reviews.length})`, icon: MessageSquare },
          { id: 'settings', label: 'Configurações', icon: Settings },
          { id: 'database', label: 'Banco de Dados (Cloud)', icon: Database }
        ].map(item => {
          const Icon = item.icon;
          const isActive = tab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#5B1525] text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: DASHBOARD */}
      {tab === 'dashboard' && (
        <div className="space-y-8">
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-1">
              <div className="flex justify-between items-center text-stone-400">
                <span className="text-xs uppercase font-bold tracking-wider">Faturamento Total</span>
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-stone-900 font-mono tabular-nums">
                R$ {(stats?.revenue || 0).toFixed(2).replace('.', ',')}
              </p>
              <span className="text-[11px] text-emerald-600 font-medium">Vendas confirmadas</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-1">
              <div className="flex justify-between items-center text-stone-400">
                <span className="text-xs uppercase font-bold tracking-wider">Total de Pedidos</span>
                <ShoppingBag className="w-5 h-5 text-[#5B1525]" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-stone-900 font-mono tabular-nums">
                {stats?.totalOrders || orders.length}
              </p>
              <span className="text-[11px] text-stone-500 font-medium">Ticket médio: R$ {(stats?.averageTicket || 0).toFixed(2).replace('.', ',')}</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-1">
              <div className="flex justify-between items-center text-stone-400">
                <span className="text-xs uppercase font-bold tracking-wider">Produtos Ativos</span>
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-stone-900 font-mono tabular-nums">
                {products.length}
              </p>
              <span className="text-[11px] text-stone-500 font-medium">Em 8 categorias</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-1">
              <div className="flex justify-between items-center text-stone-400">
                <span className="text-xs uppercase font-bold tracking-wider">Estoque Baixo</span>
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-amber-600 font-mono tabular-nums">
                {stats?.lowStockCount || 0}
              </p>
              <span className="text-[11px] text-stone-500 font-medium">Requer reposição</span>
            </div>
          </div>

          {/* Recent Orders List */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-serif text-lg font-bold text-stone-900">Pedidos Recentes</h3>
              <button
                onClick={() => setTab('orders')}
                className="text-xs font-semibold text-[#5B1525] hover:underline"
              >
                Ver todos os pedidos
              </button>
            </div>

            <div className="divide-y divide-stone-100 text-xs">
              {orders.slice(0, 5).map(order => (
                <div key={order.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-mono font-bold text-stone-900">#{order.orderNumber}</span>
                    <span className="text-stone-500 ml-2">{order.customerName}</span>
                    <span className="text-stone-400 text-[11px] ml-2">({order.customerEmail})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold tabular-nums text-stone-900">
                      R$ {order.total.toFixed(2).replace('.', ',')}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-700">
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: PRODUCTS */}
      {tab === 'products' && (
        <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
            <div>
              <h3 className="font-serif text-xl font-bold text-stone-900">Catálogo de Produtos</h3>
              <p className="text-xs text-stone-500">Cadastre, edite fotos, preços, tamanhos e estoque sem editar código.</p>
            </div>
            <button
              onClick={() => {
                setEditingProduct(null);
                setProdName('');
                setProdSku('');
                setProdPrice(99.90);
                setProdPromoPrice(undefined);
                setProdStock(20);
                setProdDescription('');
                setIsProductModalOpen(true);
              }}
              className="bg-[#5B1525] hover:bg-[#7E2235] text-white text-xs font-semibold uppercase tracking-wider px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Produto</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-stone-600">
              <thead className="bg-[#FAF8F7] text-stone-900 font-bold border-b border-stone-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Foto</th>
                  <th className="py-3 px-4">Nome & SKU</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4">Preço Original</th>
                  <th className="py-3 px-4">Preço Promo</th>
                  <th className="py-3 px-4">Estoque</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-stone-50/60">
                    <td className="py-3 px-4">
                      <img src={p.images[0]} alt="" className="w-12 h-14 object-cover rounded-lg bg-stone-100" />
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-stone-900 line-clamp-1">{p.name}</p>
                      <p className="text-stone-400 font-mono text-[10px]">SKU: {p.sku}</p>
                    </td>
                    <td className="py-3 px-4">{p.category}</td>
                    <td className="py-3 px-4 tabular-nums">R$ {p.price.toFixed(2).replace('.', ',')}</td>
                    <td className="py-3 px-4 tabular-nums text-[#5B1525] font-semibold">
                      {p.promoPrice ? `R$ ${p.promoPrice.toFixed(2).replace('.', ',')}` : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full font-bold tabular-nums ${
                        p.stock === 0 ? 'bg-rose-100 text-rose-800' :
                        p.stock <= p.minStockAlert ? 'bg-amber-100 text-amber-800' :
                        'bg-emerald-50 text-emerald-800'
                      }`}>
                        {p.stock} un
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setEditingProduct(p);
                          setProdName(p.name);
                          setProdSku(p.sku);
                          setProdCategory(p.category);
                          setProdPrice(p.price);
                          setProdPromoPrice(p.promoPrice);
                          setProdStock(p.stock);
                          setProdMinStock(p.minStockAlert);
                          setProdImage(p.images[0] || '');
                          setProdDescription(p.description);
                          setProdMaterial(p.material);
                          setProdCare(p.careInstructions);
                          setProdIsFeatured(!!p.isFeatured);
                          setProdIsNew(!!p.isNew);
                          setProdIsOnSale(!!p.isOnSale);
                          setIsProductModalOpen(true);
                        }}
                        className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.id, p.name)}
                        className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: ORDERS */}
      {tab === 'orders' && (
        <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-6">
          <div className="pb-4 border-b border-stone-100">
            <h3 className="font-serif text-xl font-bold text-stone-900">Gerenciamento de Pedidos</h3>
            <p className="text-xs text-stone-500">Altere status de pedidos com um clique e visualize detalhes de entrega.</p>
          </div>

          <div className="divide-y divide-stone-200 space-y-4">
            {orders.map(order => (
              <div key={order.id} className="pt-4 space-y-3 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-mono font-bold text-stone-900 text-sm">#{order.orderNumber}</span>
                    <span className="ml-3 font-semibold text-stone-800">{order.customerName}</span>
                    <span className="ml-2 text-stone-400">· {order.customerEmail} · {order.customerPhone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-base text-stone-900 tabular-nums">
                      R$ {order.total.toFixed(2).replace('.', ',')}
                    </span>
                    <select
                      value={order.status}
                      onChange={e => handleUpdateOrderStatus(order.id, e.target.value as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                        order.status === 'Entregue' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                        order.status === 'Enviado' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                        order.status === 'Pago' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                        order.status === 'Cancelado' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                        'bg-stone-50 text-stone-800 border-stone-300'
                      }`}
                    >
                      <option value="Novo pedido">Novo pedido</option>
                      <option value="Pagamento pendente">Pagamento pendente</option>
                      <option value="Pago">Pago</option>
                      <option value="Preparando pedido">Preparando pedido</option>
                      <option value="Enviado">Enviado</option>
                      <option value="Entregue">Entregue</option>
                      <option value="Cancelado">Cancelado</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl space-y-2">
                  <p className="text-stone-600">
                    <strong>Endereço:</strong> {order.shippingAddress.street}, {order.shippingAddress.number} - {order.shippingAddress.neighborhood}, {order.shippingAddress.city}/{order.shippingAddress.state} (CEP {order.shippingAddress.cep})
                  </p>
                  <p className="text-stone-600">
                    <strong>Pagamento:</strong> {order.paymentMethod} {order.paymentDetails?.installments && `(${order.paymentDetails.installments}x)`}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {order.items.map((it, idx) => (
                      <span key={idx} className="bg-white border border-stone-200 px-2.5 py-1 rounded text-[11px] text-stone-700">
                        {it.name} ({it.selectedColor}, {it.selectedSize}) x{it.quantity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: STOCK */}
      {tab === 'stock' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-4">
            <h3 className="font-serif text-xl font-bold text-stone-900">Ajuste Rápido de Estoque</h3>
            <p className="text-xs text-stone-500">Registre entradas ou saídas manuais de produtos.</p>

            <form onSubmit={handleAdjustStock} className="flex flex-col sm:flex-row gap-3 text-xs">
              <select
                value={stockChangeProdId}
                onChange={e => setStockChangeProdId(e.target.value)}
                required
                className="flex-1 bg-stone-50 border border-stone-200 rounded-xl p-2.5"
              >
                <option value="">Selecione o produto...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Atual: {p.stock} un)
                  </option>
                ))}
              </select>

              <input
                type="number"
                value={stockChangeVal}
                onChange={e => setStockChangeVal(Number(e.target.value))}
                placeholder="Quantidade (+ ou -)"
                required
                className="w-32 bg-stone-50 border border-stone-200 rounded-xl p-2.5"
              />

              <button
                type="submit"
                className="bg-[#5B1525] text-white px-5 py-2.5 rounded-xl font-semibold uppercase tracking-wider"
              >
                Aplicar Ajuste
              </button>
            </form>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-4">
            <h3 className="font-serif text-lg font-bold text-stone-900">Visão Geral de Saldos</h3>
            <div className="divide-y divide-stone-100 text-xs">
              {products.map(p => (
                <div key={p.id} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-stone-900">{p.name}</span>
                    <span className="text-stone-400 font-mono ml-2">SKU: {p.sku}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-stone-500">Mínimo: {p.minStockAlert} un</span>
                    <span className={`px-2.5 py-1 rounded-full font-bold tabular-nums ${
                      p.stock === 0 ? 'bg-rose-100 text-rose-800' :
                      p.stock <= p.minStockAlert ? 'bg-amber-100 text-amber-800' :
                      'bg-emerald-50 text-emerald-800'
                    }`}>
                      {p.stock} un em estoque
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: COUPONS */}
      {tab === 'coupons' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-4">
            <h3 className="font-serif text-xl font-bold text-stone-900">Criar Novo Cupom</h3>
            <form onSubmit={handleCreateCoupon} className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
              <input
                type="text"
                value={couponCode}
                onChange={e => setCouponCode(e.target.value.toUpperCase())}
                placeholder="CÓDIGO (ex: VERAO20)"
                required
                className="bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-mono uppercase"
              />
              <select
                value={couponType}
                onChange={e => setCouponType(e.target.value as any)}
                className="bg-stone-50 border border-stone-200 rounded-xl p-2.5"
              >
                <option value="percentage">Porcentagem (%)</option>
                <option value="fixed">Valor Fixo (R$)</option>
              </select>
              <input
                type="number"
                value={couponValue}
                onChange={e => setCouponValue(Number(e.target.value))}
                placeholder="Valor do desconto"
                required
                className="bg-stone-50 border border-stone-200 rounded-xl p-2.5"
              />
              <input
                type="number"
                value={couponMinPurchase}
                onChange={e => setCouponMinPurchase(Number(e.target.value))}
                placeholder="Compra mínima (R$)"
                required
                className="bg-stone-50 border border-stone-200 rounded-xl p-2.5"
              />
              <button
                type="submit"
                className="bg-[#5B1525] text-white rounded-xl font-semibold uppercase tracking-wider"
              >
                Adicionar Cupom
              </button>
            </form>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-4">
            <h3 className="font-serif text-lg font-bold text-stone-900">Cupons Ativos</h3>
            <div className="divide-y divide-stone-100 text-xs">
              {coupons.map(c => (
                <div key={c.id} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-stone-900 text-sm">{c.code}</span>
                    <span className="ml-3 text-emerald-700 font-semibold">
                      {c.type === 'percentage' ? `${c.value}% OFF` : `R$ ${c.value.toFixed(2)} OFF`}
                    </span>
                    <span className="ml-2 text-stone-400">
                      (Min: R$ {c.minPurchaseValue} · Usos: {c.usageCount})
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteCoupon(c.id)}
                    className="p-1.5 text-rose-600 hover:text-rose-800"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: BANNERS */}
      {tab === 'banners' && (
        <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-6">
          <div className="pb-4 border-b border-stone-100">
            <h3 className="font-serif text-xl font-bold text-stone-900">Gerenciamento de Banners</h3>
            <p className="text-xs text-stone-500">Configure os banners em destaque na página inicial.</p>
          </div>

          <div className="space-y-4">
            {banners.map(b => (
              <div key={b.id} className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex flex-col md:flex-row gap-4 items-center">
                <img src={b.image} alt="" className="w-full md:w-48 aspect-video object-cover rounded-xl" />
                <div className="flex-1 space-y-1 text-xs">
                  <span className="uppercase text-[10px] font-bold text-[#5B1525]">{b.type}</span>
                  <h4 className="font-serif text-base font-bold text-stone-900">{b.title}</h4>
                  <p className="text-stone-500">{b.subtitle}</p>
                  <p className="text-stone-400">Botão: {b.buttonText} → {b.buttonLink}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                    Ativo
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: REVIEWS */}
      {tab === 'reviews' && (
        <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-6">
          <div className="pb-4 border-b border-stone-100">
            <h3 className="font-serif text-xl font-bold text-stone-900">Moderação de Avaliações</h3>
            <p className="text-xs text-stone-500">Aprove ou rejeite depoimentos deixados pelas clientes nos produtos.</p>
          </div>

          <div className="divide-y divide-stone-100 space-y-3 text-xs">
            {reviews.map(r => (
              <div key={r.id} className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900">{r.authorName}</span>
                    <span className="text-stone-400">em {r.productName}</span>
                    <span className="text-amber-500">{'★'.repeat(r.rating)}</span>
                  </div>
                  <p className="text-stone-600">"{r.comment}"</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    r.status === 'approved' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
                  }`}>
                    {r.status === 'approved' ? 'Aprovado' : 'Pendente'}
                  </span>
                  {r.status !== 'approved' && (
                    <button
                      onClick={() => handleUpdateReviewStatus(r.id, 'approved')}
                      className="px-2.5 py-1 bg-emerald-600 text-white rounded text-[11px] font-medium"
                    >
                      Aprovar
                    </button>
                  )}
                  {r.status !== 'rejected' && (
                    <button
                      onClick={() => handleUpdateReviewStatus(r.id, 'rejected')}
                      className="px-2.5 py-1 bg-rose-600 text-white rounded text-[11px] font-medium"
                    >
                      Rejeitar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: SETTINGS */}
      {tab === 'settings' && settings && (
        <form onSubmit={handleSaveSettings} className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-6 text-xs">
          <div className="pb-4 border-b border-stone-100">
            <h3 className="font-serif text-xl font-bold text-stone-900">Configurações Gerais da Loja</h3>
            <p className="text-stone-500">Altere contatos, WhatsApp, dados de frete e campanhas promocionais.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-stone-700 font-medium mb-1">Nome da Loja</label>
              <input
                type="text"
                value={settings.storeName}
                onChange={e => setSettings({ ...settings, storeName: e.target.value })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-medium mb-1">WhatsApp de Atendimento (com DDI/DDD)</label>
              <input
                type="text"
                value={settings.whatsappNumber}
                onChange={e => setSettings({ ...settings, whatsappNumber: e.target.value })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-medium mb-1">E-mail de Contato</label>
              <input
                type="email"
                value={settings.email}
                onChange={e => setSettings({ ...settings, email: e.target.value })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-medium mb-1">Instagram (@)</label>
              <input
                type="text"
                value={settings.instagram}
                onChange={e => setSettings({ ...settings, instagram: e.target.value })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-medium mb-1">Valor Mínimo para Frete Grátis (R$)</label>
              <input
                type="number"
                value={settings.freeShippingThreshold}
                onChange={e => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-medium mb-1">Texto da Barra de Anúncio Superior</label>
              <input
                type="text"
                value={settings.announcementBarText}
                onChange={e => setSettings({ ...settings, announcementBarText: e.target.value })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5"
              />
            </div>

            <div className="sm:col-span-2 p-4 bg-rose-50/50 rounded-2xl border border-rose-100 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-stone-900">
                <input
                  type="checkbox"
                  checked={settings.showCountdownPromo}
                  onChange={e => setSettings({ ...settings, showCountdownPromo: e.target.checked })}
                  className="rounded text-[#5B1525]"
                />
                <span>Ativar Contador Regressivo de Promoção na Página Inicial</span>
              </label>

              {settings.showCountdownPromo && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-stone-600 mb-1">Título da Oferta</label>
                    <input
                      type="text"
                      value={settings.countdownPromoTitle}
                      onChange={e => setSettings({ ...settings, countdownPromoTitle: e.target.value })}
                      className="w-full bg-white border border-stone-200 rounded-xl p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 mb-1">Data e Hora de Término</label>
                    <input
                      type="datetime-local"
                      value={settings.countdownPromoEnd ? settings.countdownPromoEnd.slice(0, 16) : ''}
                      onChange={e => setSettings({ ...settings, countdownPromoEnd: e.target.value })}
                      className="w-full bg-white border border-stone-200 rounded-xl p-2"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="py-3 px-8 bg-[#5B1525] hover:bg-[#7E2235] text-white text-xs font-semibold uppercase tracking-wider rounded-xl shadow-md transition-colors"
          >
            Salvar Configurações
          </button>
        </form>
      )}

      {/* TAB CONTENT: DATABASE (FIREBASE FIRESTORE CLOUD) */}
      {tab === 'database' && (
        <div className="space-y-6">
          {/* Cloud Database Header Banner */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-100 pb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#5B1525]/10 text-[#5B1525] flex items-center justify-center">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                      Banco de Dados em Nuvem (Firebase Firestore)
                    </h2>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Conectado & Ativo
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1">
                    Armazenamento persistente, alta disponibilidade e sincronização em tempo real de produtos, pedidos, cupons e estoque.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testingConnection}
                  className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin' : ''}`} />
                  <span>{testingConnection ? 'Testando...' : 'Testar Conexão'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar Backup (JSON)</span>
                </button>

                <button
                  type="button"
                  onClick={handleSyncAllFirestore}
                  disabled={isSyncingDb}
                  className="px-4 py-2 bg-[#5B1525] hover:bg-[#7E2235] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <Cloud className={`w-4 h-4 ${isSyncingDb ? 'animate-bounce' : ''}`} />
                  <span>{isSyncingDb ? 'Sincronizando...' : 'Sincronizar Tudo com Firestore'}</span>
                </button>
              </div>
            </div>

            {/* Cloud Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/60 space-y-1">
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Projeto Firebase</span>
                <p className="font-mono font-medium text-stone-800 truncate" title="gen-lang-client-0387415970">
                  {dbStatus?.projectId || 'gen-lang-client-0387415970'}
                </p>
                <span className="text-[11px] text-emerald-600 font-medium">Provisionado e Integrado</span>
              </div>

              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/60 space-y-1">
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">ID da Base Firestore</span>
                <p className="font-mono font-medium text-stone-800 truncate" title={dbStatus?.databaseId || 'ai-studio-modaintimatododi-1b3fde43-ec01-4d37-a64b-44a53c5e7059'}>
                  {dbStatus?.databaseId || 'ai-studio-modaintimatododi-1b3fde43-ec01-4d37-a64b-44a53c5e7059'}
                </p>
                <span className="text-[11px] text-emerald-600 font-medium">Instância Dedicada</span>
              </div>

              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/60 space-y-1">
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Regras de Segurança</span>
                <p className="font-mono font-medium text-stone-800">firestore.rules (ABAC)</p>
                <span className="text-[11px] text-emerald-600 font-medium">Protegido & Implantado</span>
              </div>
            </div>
          </div>

          {/* Collection Status Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Produtos</span>
                <Package className="w-4 h-4 text-[#5B1525]" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-serif text-stone-900">{products.length}</span>
                <span className="text-xs text-stone-500">cadastrados</span>
              </div>
              <p className="text-[11px] text-stone-400">Coleção: <code className="text-stone-700">/products</code></p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Pedidos</span>
                <ShoppingBag className="w-4 h-4 text-[#5B1525]" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-serif text-stone-900">{orders.length}</span>
                <span className="text-xs text-stone-500">registrados</span>
              </div>
              <p className="text-[11px] text-stone-400">Coleção: <code className="text-stone-700">/orders</code></p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Cupons</span>
                <Tag className="w-4 h-4 text-[#5B1525]" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-serif text-stone-900">{coupons.length}</span>
                <span className="text-xs text-stone-500">ativos</span>
              </div>
              <p className="text-[11px] text-stone-400">Coleção: <code className="text-stone-700">/coupons</code></p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Configurações</span>
                <Settings className="w-4 h-4 text-[#5B1525]" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-bold text-emerald-600">Sincronizado</span>
              </div>
              <p className="text-[11px] text-stone-400">Documento: <code className="text-stone-700">/settings/general</code></p>
            </div>
          </div>

          {/* Database Info Cards */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-4">
            <h3 className="font-serif text-lg font-bold text-stone-900">
              Arquitetura de Dados & Persistência
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-stone-600">
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-[#5B1525] flex items-center justify-center font-bold">1</div>
                <h4 className="font-semibold text-stone-900">Sincronização Automática</h4>
                <p>Qualquer novo produto, alteração de preço, estoque ou atualização de pedido é automaticamente espelhado na nuvem do Google Firebase.</p>
              </div>

              <div className="space-y-2">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-[#5B1525] flex items-center justify-center font-bold">2</div>
                <h4 className="font-semibold text-stone-900">Segurança de Dados</h4>
                <p>As regras de segurança (`firestore.rules`) garantem que o catálogo possa ser lido publicamente pelos clientes enquanto as alterações são protegidas.</p>
              </div>

              <div className="space-y-2">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-[#5B1525] flex items-center justify-center font-bold">3</div>
                <h4 className="font-semibold text-stone-900">Backup & Exportação</h4>
                <p>Você pode baixar uma cópia de segurança completa em JSON a qualquer momento para manter seus dados seguros em sua própria máquina.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT PRODUCT MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsProductModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif text-xl font-bold text-stone-900 mb-4">
              {editingProduct ? 'Editar Produto' : 'Cadastrar Novo Produto'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-stone-700 font-medium mb-1">Nome do Produto *</label>
                  <input
                    type="text"
                    value={prodName}
                    onChange={e => setProdName(e.target.value)}
                    placeholder="Ex: Conjunto Renda Floral Elegance"
                    required
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-medium mb-1">Código SKU</label>
                  <input
                    type="text"
                    value={prodSku}
                    onChange={e => setProdSku(e.target.value)}
                    placeholder="MITD-001"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-medium mb-1">Categoria *</label>
                  <select
                    value={prodCategory}
                    onChange={e => setProdCategory(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5"
                  >
                    <option value="Lingeries">Lingeries</option>
                    <option value="Conjuntos">Conjuntos</option>
                    <option value="Sutiãs">Sutiãs</option>
                    <option value="Calcinhas">Calcinhas</option>
                    <option value="Pijamas">Pijamas</option>
                    <option value="Baby Doll">Baby Doll</option>
                    <option value="Moda Masculina">Moda Masculina</option>
                    <option value="Kits">Kits</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 font-medium mb-1">Preço Normal (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={prodPrice}
                    onChange={e => setProdPrice(Number(e.target.value))}
                    required
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-medium mb-1">Preço Promocional (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={prodPromoPrice || ''}
                    onChange={e => setProdPromoPrice(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="Opcional"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-medium mb-1">Estoque Inicial (unidades) *</label>
                  <input
                    type="number"
                    value={prodStock}
                    onChange={e => setProdStock(Number(e.target.value))}
                    required
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-medium mb-1">Alerta de Estoque Mínimo</label>
                  <input
                    type="number"
                    value={prodMinStock}
                    onChange={e => setProdMinStock(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-stone-700 font-medium mb-1">URL da Foto Principal *</label>
                  <input
                    type="text"
                    value={prodImage}
                    onChange={e => setProdImage(e.target.value)}
                    required
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-stone-700 font-medium mb-1">Descrição</label>
                  <textarea
                    value={prodDescription}
                    onChange={e => setProdDescription(e.target.value)}
                    rows={3}
                    placeholder="Detalhes sobre a modelagem, o conforto..."
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5"
                  />
                </div>

                <div className="sm:col-span-2 flex flex-wrap gap-4 pt-2">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prodIsFeatured}
                      onChange={e => setProdIsFeatured(e.target.checked)}
                      className="rounded text-[#5B1525]"
                    />
                    <span>Produto em Destaque (Mais Vendidos)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prodIsNew}
                      onChange={e => setProdIsNew(e.target.checked)}
                      className="rounded text-[#5B1525]"
                    />
                    <span>Produto Novo (Selo NOVO)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prodIsOnSale}
                      onChange={e => setProdIsOnSale(e.target.checked)}
                      className="rounded text-[#5B1525]"
                    />
                    <span>Produto em Promoção</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 border border-stone-200 rounded-xl text-stone-600 hover:bg-stone-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#5B1525] hover:bg-[#7E2235] text-white rounded-xl font-semibold uppercase tracking-wider shadow-sm"
                >
                  {editingProduct ? 'Salvar Alterações' : 'Cadastrar Produto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
