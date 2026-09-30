import React, { useState, useEffect } from 'react';
import {
  User,
  Package,
  Heart,
  MapPin,
  Lock,
  LogOut,
  Clock,
  CheckCircle,
  Truck,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { api } from '../services/api.ts';
import { Order } from '../types/index.ts';

interface AccountViewProps {
  navigate: (path: string) => void;
  defaultTab?: 'login' | 'register' | 'orders';
}

export const AccountView: React.FC<AccountViewProps> = ({ navigate, defaultTab = 'orders' }) => {
  const { customer, loginCustomer, registerCustomer, logoutCustomer } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'addresses'>('orders');
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'recover'>('login');

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCpf, setRegCpf] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (customer?.email) {
      setLoadingOrders(true);
      api.getOrders(customer.email)
        .then(res => setOrders(res))
        .catch(e => console.error(e))
        .finally(() => setLoadingOrders(false));
    }
  }, [customer]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) {
      showToast('Informe seu e-mail', 'error');
      return;
    }
    loginCustomer(loginEmail);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regPhone.trim()) {
      showToast('Preencha os campos obrigatórios', 'error');
      return;
    }
    registerCustomer({
      name: regName,
      email: regEmail,
      phone: regPhone,
      cpf: regCpf
    });
  };

  const handleRecoverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(`Instruções de recuperação de senha enviadas para ${loginEmail}`);
    setAuthMode('login');
  };

  // If NOT logged in, show Auth Screen
  if (!customer) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl p-8 border border-stone-200/80 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs uppercase tracking-widest text-[#5B1525] font-bold">
              Minha Conta
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
              {authMode === 'login' && 'Acessar Conta'}
              {authMode === 'register' && 'Criar Nova Conta'}
              {authMode === 'recover' && 'Recuperar Senha'}
            </h1>
            <p className="text-xs text-stone-500">
              {authMode === 'login' && 'Acompanhe seus pedidos, favoritos e dados de entrega.'}
              {authMode === 'register' && 'Cadastre-se para compras mais rápidas e ofertas exclusivas.'}
              {authMode === 'recover' && 'Digite seu e-mail para redefinir sua senha.'}
            </p>
          </div>

          {authMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-700 font-medium mb-1">E-mail</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-[#C87D85]"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-stone-700 font-medium">Senha</label>
                  <button
                    type="button"
                    onClick={() => setAuthMode('recover')}
                    className="text-[#5B1525] hover:underline"
                  >
                    Esqueceu?
                  </button>
                </div>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-[#C87D85]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#5B1525] hover:bg-[#7E2235] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors shadow-sm"
              >
                ENTRAR
              </button>

              <div className="text-center pt-2 text-stone-500">
                <span>Não tem uma conta? </span>
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className="text-[#5B1525] font-semibold hover:underline"
                >
                  Cadastre-se aqui
                </button>
              </div>
            </form>
          )}

          {authMode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-stone-700 font-medium mb-1">Nome Completo *</label>
                <input
                  type="text"
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  placeholder="Seu nome"
                  required
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-[#C87D85]"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">E-mail *</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-[#C87D85]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">WhatsApp *</label>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={e => setRegPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    required
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-[#C87D85]"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-medium mb-1">CPF *</label>
                  <input
                    type="text"
                    value={regCpf}
                    onChange={e => setRegCpf(e.target.value)}
                    placeholder="000.000.000-00"
                    required
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-[#C87D85]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Crie uma Senha *</label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  placeholder="Mínimo 6 dígitos"
                  required
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-[#C87D85]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#5B1525] hover:bg-[#7E2235] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors shadow-sm"
              >
                CRIAR CONTA
              </button>

              <div className="text-center pt-2 text-stone-500">
                <span>Já possui conta? </span>
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="text-[#5B1525] font-semibold hover:underline"
                >
                  Fazer login
                </button>
              </div>
            </form>
          )}

          {authMode === 'recover' && (
            <form onSubmit={handleRecoverSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-700 font-medium mb-1">E-mail Cadastrado</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-[#C87D85]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#5B1525] hover:bg-[#7E2235] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors shadow-sm"
              >
                ENVIAR LINK DE RECUPERAÇÃO
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="text-stone-500 hover:text-stone-800"
                >
                  Voltar ao login
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  // LOGGED IN DASHBOARD
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#5B1525] font-bold">Painel da Cliente</span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
            Olá, {customer.name}!
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">{customer.email} · {customer.phone}</p>
        </div>

        <button
          onClick={logoutCustomer}
          className="self-start sm:self-center px-4 py-2 border border-stone-200 hover:bg-stone-50 text-stone-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sair da Conta</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 gap-6 text-xs sm:text-sm font-semibold">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'orders' ? 'border-[#5B1525] text-[#5B1525]' : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Meus Pedidos</span>
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'profile' ? 'border-[#5B1525] text-[#5B1525]' : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Dados Pessoais</span>
        </button>
        <button
          onClick={() => setActiveTab('addresses')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'addresses' ? 'border-[#5B1525] text-[#5B1525]' : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Endereços</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {loadingOrders ? (
            <p className="text-xs text-stone-500">Carregando seus pedidos...</p>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-stone-200 space-y-3">
              <Package className="w-10 h-10 text-stone-400 mx-auto" />
              <h3 className="font-serif text-lg font-bold text-stone-800">Você ainda não realizou pedidos</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Explore nossas coleções de lingeries de renda, conjuntos e pijamas macios.
              </p>
              <button
                onClick={() => navigate('/produtos')}
                className="mt-2 px-6 py-2.5 bg-[#5B1525] text-white text-xs font-semibold uppercase tracking-wider rounded-xl"
              >
                Ver Coleções
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-100 gap-2">
                    <div>
                      <span className="font-mono font-bold text-stone-900 text-sm">Pedido #{order.orderNumber}</span>
                      <p className="text-[11px] text-stone-400">
                        Realizado em {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        order.status === 'Entregue' ? 'bg-emerald-50 text-emerald-700' :
                        order.status === 'Enviado' ? 'bg-blue-50 text-blue-700' :
                        order.status === 'Pago' ? 'bg-amber-50 text-amber-700' :
                        'bg-stone-100 text-stone-700'
                      }`}>
                        {order.status}
                      </span>
                      <span className="font-bold text-stone-900 text-sm tabular-nums">
                        R$ {order.total.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="divide-y divide-stone-100">
                    {order.items.map((it, idx) => (
                      <div key={idx} className="py-2 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <img src={it.image} alt="" className="w-10 h-12 object-cover rounded bg-stone-100" />
                          <div>
                            <p className="font-semibold text-stone-900">{it.name}</p>
                            <p className="text-stone-500 text-[11px]">
                              Cor: {it.selectedColor} · Tam: {it.selectedSize} · Qtd: {it.quantity}
                            </p>
                          </div>
                        </div>
                        <span className="font-bold text-stone-900 tabular-nums">
                          R$ {(it.price * it.quantity).toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row justify-between text-[11px] text-stone-500 border-t border-stone-100 gap-2">
                    <p>Entrega: {order.shippingAddress.street}, {order.shippingAddress.number} - {order.shippingAddress.city}/{order.shippingAddress.state}</p>
                    <p>Pagamento: {order.paymentMethod}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200/80 shadow-xs max-w-xl space-y-4 text-xs">
          <h3 className="font-serif text-lg font-bold text-stone-900">Seus Dados</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-stone-500 mb-1">Nome Completo</label>
              <input type="text" defaultValue={customer.name} disabled className="w-full bg-stone-50 p-2.5 rounded-xl border border-stone-200 text-stone-800" />
            </div>
            <div>
              <label className="block text-stone-500 mb-1">E-mail</label>
              <input type="email" defaultValue={customer.email} disabled className="w-full bg-stone-50 p-2.5 rounded-xl border border-stone-200 text-stone-800" />
            </div>
            <div>
              <label className="block text-stone-500 mb-1">Telefone / WhatsApp</label>
              <input type="text" defaultValue={customer.phone} disabled className="w-full bg-stone-50 p-2.5 rounded-xl border border-stone-200 text-stone-800" />
            </div>
            <div>
              <label className="block text-stone-500 mb-1">CPF</label>
              <input type="text" defaultValue={customer.cpf} disabled className="w-full bg-stone-50 p-2.5 rounded-xl border border-stone-200 text-stone-800" />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'addresses' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200/80 shadow-xs max-w-xl space-y-4 text-xs">
          <h3 className="font-serif text-lg font-bold text-stone-900">Endereço Principal</h3>
          {customer.addresses.length > 0 ? (
            customer.addresses.map(a => (
              <div key={a.id} className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                <span className="font-bold text-stone-900">{a.title}</span>
                <p className="text-stone-600">{a.street}, {a.number} {a.complement && `(${a.complement})`}</p>
                <p className="text-stone-600">{a.neighborhood} - {a.city}/{a.state}</p>
                <p className="text-stone-500 font-mono">CEP: {a.cep}</p>
              </div>
            ))
          ) : (
            <p className="text-stone-500">Nenhum endereço cadastrado ainda.</p>
          )}
        </div>
      )}

    </div>
  );
};
