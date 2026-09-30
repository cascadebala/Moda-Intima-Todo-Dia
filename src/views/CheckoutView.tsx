import React, { useState } from 'react';
import {
  ShieldCheck,
  CreditCard,
  QrCode,
  Truck,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShoppingBag,
  Copy,
  ChevronLeft,
  FileText
} from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { api } from '../services/api.ts';
import { Order } from '../types/index.ts';

interface CheckoutViewProps {
  navigate: (path: string) => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({ navigate }) => {
  const { items, subtotal, discountAmount, shippingCost, total, appliedCoupon, clearCart, shippingOption } = useCart();
  const { customer } = useAuth();
  const { showToast } = useToast();

  // Form Fields
  const [name, setName] = useState(customer?.name || '');
  const [email, setEmail] = useState(customer?.email || '');
  const [phone, setPhone] = useState(customer?.phone || '');
  const [cpf, setCpf] = useState(customer?.cpf || '');

  // Address
  const [cep, setCep] = useState('01310-100');
  const [street, setStreet] = useState('Avenida Paulista');
  const [number, setNumber] = useState('1000');
  const [complement, setComplement] = useState('Apto 52');
  const [neighborhood, setNeighborhood] = useState('Bela Vista');
  const [city, setCity] = useState('São Paulo');
  const [state, setState] = useState('SP');

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<'Pix' | 'Cartão de Crédito' | 'Cartão de Débito' | 'Boleto'>('Pix');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [installments, setInstallments] = useState(1);

  // Status
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [copiedPix, setCopiedPix] = useState(false);

  // If cart is empty and no completed order, show empty state
  if (items.length === 0 && !completedOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-[#5B1525] flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8 opacity-60" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-stone-900">Sua sacola está vazia</h2>
        <p className="text-sm text-stone-500">Adicione peças antes de prosseguir para o checkout.</p>
        <button
          onClick={() => navigate('/produtos')}
          className="px-6 py-3 bg-[#5B1525] hover:bg-[#7E2235] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors"
        >
          Voltar às Compras
        </button>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !phone.trim() || !cpf.trim()) {
      showToast('Por favor, preencha todos os dados de contato e CPF.', 'error');
      return;
    }
    if (!cep.trim() || !street.trim() || !number.trim() || !city.trim()) {
      showToast('Por favor, informe o endereço de entrega completo.', 'error');
      return;
    }

    if (paymentMethod === 'Cartão de Crédito') {
      if (cardNumber.replace(/\s/g, '').length < 16 || !cardExpiry || !cardCvv) {
        showToast('Por favor, confira os dados do cartão de crédito.', 'error');
        return;
      }
    }

    setIsProcessing(true);

    try {
      const orderPayload = {
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        customerCpf: cpf,
        shippingAddress: {
          cep,
          street,
          number,
          complement,
          neighborhood,
          city,
          state
        },
        shippingMethod: shippingOption || 'Envio Padrão',
        shippingCost,
        items: items.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          price: item.product.promoPrice || item.product.price,
          selectedColor: item.selectedColor.name,
          selectedSize: item.selectedSize,
          quantity: item.quantity,
          image: item.product.images[0]
        })),
        subtotal,
        discount: discountAmount,
        couponCode: appliedCoupon?.code,
        total,
        paymentMethod,
        paymentDetails: {
          installments: paymentMethod === 'Cartão de Crédito' ? installments : 1,
          pixCode:
            paymentMethod === 'Pix'
              ? '00020126580014br.gov.bcb.pix0136123e4567-e89b-12d3-a456-4266141740005204000053039865802BR5925MODA INTIMA TODO DIA6009SAO PAULO62070503***6304E8A2'
              : undefined,
          cardLast4: paymentMethod === 'Cartão de Crédito' ? cardNumber.slice(-4) || '4242' : undefined
        },
        status: (paymentMethod === 'Pix' ? 'Novo pedido' : 'Pago') as Order['status']
      };

      const order = await api.createOrder(orderPayload);
      setCompletedOrder(order);
      clearCart();
      showToast('Pedido realizado com sucesso!', 'success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      showToast(err.message || 'Erro ao processar pedido', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyPixCode = () => {
    if (completedOrder?.paymentDetails?.pixCode) {
      navigator.clipboard.writeText(completedOrder.paymentDetails.pixCode);
      setCopiedPix(true);
      showToast('Código PIX Copia e Cola copiado!');
      setTimeout(() => setCopiedPix(false), 3000);
    }
  };

  // Order Confirmed View
  if (completedOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-8">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-stone-200/80 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <span className="text-xs uppercase tracking-widest text-[#5B1525] font-bold">
            Pedido Confirmado
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
            Obrigada pela sua compra, {completedOrder.customerName.split(' ')[0]}!
          </h1>
          <p className="text-sm text-stone-600 max-w-md mx-auto">
            Seu pedido <strong className="text-stone-900 font-mono">#{completedOrder.orderNumber}</strong> foi gerado e estamos preparando tudo com muito carinho e discrição.
          </p>

          {/* Pix QR Code Display */}
          {completedOrder.paymentMethod === 'Pix' && (
            <div className="my-8 p-6 bg-stone-50 rounded-2xl border border-stone-200 text-left space-y-4 max-w-md mx-auto">
              <div className="flex items-center gap-2 text-stone-900 font-semibold text-sm">
                <QrCode className="w-5 h-5 text-[#5B1525]" />
                <span>Pague via PIX para aprovação imediata</span>
              </div>
              <p className="text-xs text-stone-600">
                Abra o aplicativo do seu banco, escolha <strong>PIX Copia e Cola</strong> e cole o código abaixo:
              </p>

              <div className="bg-white p-3 rounded-xl border border-stone-300 font-mono text-[11px] text-stone-600 break-all select-all flex items-center justify-between gap-2">
                <span className="line-clamp-2">{completedOrder.paymentDetails?.pixCode}</span>
                <button
                  onClick={copyPixCode}
                  className="bg-[#5B1525] hover:bg-[#7E2235] text-white p-2 rounded-lg shrink-0 flex items-center gap-1 text-xs font-sans font-medium"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedPix ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>

              <p className="text-[11px] text-stone-400">
                O pagamento é identificado automaticamente em menos de 1 minuto.
              </p>
            </div>
          )}

          {/* Order Summary Receipt Box */}
          <div className="bg-[#FAF8F7] p-6 rounded-2xl border border-stone-200 text-left space-y-4 text-xs">
            <h4 className="font-bold text-stone-900 uppercase tracking-wider text-xs border-b border-stone-200 pb-2">
              Resumo do Pedido #{completedOrder.orderNumber}
            </h4>
            <div className="divide-y divide-stone-200">
              {completedOrder.items.map((item, i) => (
                <div key={i} className="py-2.5 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <img src={item.image} alt="" className="w-10 h-12 object-cover rounded bg-stone-100" />
                    <div>
                      <p className="font-semibold text-stone-900">{item.name}</p>
                      <p className="text-stone-500 text-[11px]">
                        Cor: {item.selectedColor} · Tam: {item.selectedSize} · Qtd: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-stone-900 tabular-nums">
                    R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-stone-200 space-y-1">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span className="tabular-nums">R$ {completedOrder.subtotal.toFixed(2).replace('.', ',')}</span>
              </div>
              {completedOrder.discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Desconto ({completedOrder.couponCode})</span>
                  <span className="tabular-nums">- R$ {completedOrder.discount.toFixed(2).replace('.', ',')}</span>
                </div>
              )}
              <div className="flex justify-between text-stone-600">
                <span>Frete ({completedOrder.shippingMethod})</span>
                <span className="tabular-nums">
                  {completedOrder.shippingCost === 0 ? 'Grátis' : `R$ ${completedOrder.shippingCost.toFixed(2).replace('.', ',')}`}
                </span>
              </div>
              <div className="flex justify-between font-bold text-base text-stone-900 pt-2 border-t border-stone-200">
                <span>Total Pago / A Pagar</span>
                <span className="text-[#5B1525] tabular-nums">R$ {completedOrder.total.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>

            <div className="pt-2 text-stone-500 text-[11px]">
              <p><strong>Endereço de Entrega:</strong> {completedOrder.shippingAddress.street}, {completedOrder.shippingAddress.number} {completedOrder.shippingAddress.complement ? `(${completedOrder.shippingAddress.complement})` : ''} - {completedOrder.shippingAddress.neighborhood}, {completedOrder.shippingAddress.city}/{completedOrder.shippingAddress.state} - CEP {completedOrder.shippingAddress.cep}</p>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => {
                const msg = encodeURIComponent(`Olá! Realizei o pedido #${completedOrder.orderNumber} no site e gostaria de confirmar o envio.`);
                window.open(`https://wa.me/5511999998888?text=${msg}`, '_blank');
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-3 px-6 rounded-xl transition-colors"
            >
              Confirmar pelo WhatsApp
            </button>
            <button
              onClick={() => navigate('/minha-conta')}
              className="bg-stone-800 hover:bg-stone-900 text-white font-semibold text-xs py-3 px-6 rounded-xl transition-colors"
            >
              Acompanhar Pedido
            </button>
            <button
              onClick={() => navigate('/')}
              className="border border-stone-200 text-stone-700 hover:bg-stone-50 font-semibold text-xs py-3 px-6 rounded-xl transition-colors"
            >
              Voltar à Loja
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top back button */}
      <div>
        <button
          onClick={() => navigate('/produtos')}
          className="text-xs font-semibold text-stone-600 hover:text-[#5B1525] flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Continuar comprando</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Form: Customer Details, Address, Payment (8 cols) */}
        <form onSubmit={handlePlaceOrder} className="lg:col-span-7 space-y-8">
          
          {/* Step 1: Customer Data */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs space-y-4">
            <h3 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#5B1525] text-white text-xs flex items-center justify-center font-sans font-bold">1</span>
              <span>Dados do Cliente</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-stone-700 font-medium mb-1">Nome Completo *</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Seu nome completo"
                  required
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-[#C87D85]"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">E-mail *</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="exemplo@email.com"
                  required
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-[#C87D85]"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">CPF *</label>
                <input
                  type="text"
                  value={cpf}
                  onChange={e => setCpf(e.target.value)}
                  placeholder="000.000.000-00"
                  required
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-[#C87D85]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-stone-700 font-medium mb-1">WhatsApp / Telefone *</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  required
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-[#C87D85]"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Shipping Address */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs space-y-4">
            <h3 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#5B1525] text-white text-xs flex items-center justify-center font-sans font-bold">2</span>
              <span>Endereço de Entrega</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-stone-700 font-medium mb-1">CEP *</label>
                <input
                  type="text"
                  value={cep}
                  onChange={e => setCep(e.target.value)}
                  placeholder="00000-000"
                  required
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-[#C87D85]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-stone-700 font-medium mb-1">Rua / Logradouro *</label>
                <input
                  type="text"
                  value={street}
                  onChange={e => setStreet(e.target.value)}
                  placeholder="Rua, Avenida, Alameda..."
                  required
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-[#C87D85]"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Número *</label>
                <input
                  type="text"
                  value={number}
                  onChange={e => setNumber(e.target.value)}
                  placeholder="123"
                  required
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-[#C87D85]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-stone-700 font-medium mb-1">Complemento</label>
                <input
                  type="text"
                  value={complement}
                  onChange={e => setComplement(e.target.value)}
                  placeholder="Apto, Bloco, Casa..."
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-[#C87D85]"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Bairro *</label>
                <input
                  type="text"
                  value={neighborhood}
                  onChange={e => setNeighborhood(e.target.value)}
                  placeholder="Bairro"
                  required
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-[#C87D85]"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Cidade *</label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="Cidade"
                  required
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-[#C87D85]"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Estado (UF) *</label>
                <input
                  type="text"
                  value={state}
                  onChange={e => setState(e.target.value.toUpperCase())}
                  placeholder="SP"
                  maxLength={2}
                  required
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-[#C87D85]"
                />
              </div>
            </div>
          </div>

          {/* Step 3: Payment Method */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs space-y-4">
            <h3 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#5B1525] text-white text-xs flex items-center justify-center font-sans font-bold">3</span>
              <span>Forma de Pagamento</span>
            </h3>

            {/* Payment Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'Pix', label: 'PIX (Instantâneo)', icon: QrCode, badge: '5% OFF' },
                { id: 'Cartão de Crédito', label: 'Cartão de Crédito', icon: CreditCard },
                { id: 'Cartão de Débito', label: 'Cartão de Débito', icon: CreditCard },
                { id: 'Boleto', label: 'Boleto Bancário', icon: FileText }
              ].map(opt => {
                const Icon = opt.icon;
                const isSelected = paymentMethod === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPaymentMethod(opt.id as any)}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      isSelected
                        ? 'border-[#5B1525] bg-rose-50/40 text-[#5B1525] shadow-xs'
                        : 'border-stone-200 hover:border-stone-300 text-stone-700'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <Icon className="w-5 h-5" />
                      {opt.badge && (
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                          {opt.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-semibold">{opt.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Payment Details Box */}
            {paymentMethod === 'Pix' && (
              <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 text-xs text-stone-700 space-y-2">
                <p className="font-semibold text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Aprovação imediata e envio mais rápido!
                </p>
                <p>O QR Code e o código Pix Copia e Cola serão gerados na tela seguinte após clicar em finalizar.</p>
              </div>
            )}

            {paymentMethod === 'Cartão de Crédito' && (
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3 text-xs">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Número do Cartão</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={e => setCardNumber(e.target.value)}
                    placeholder="0000 0000 0000 0000"
                    maxLength={19}
                    required
                    className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-medium mb-1">Nome Impresso no Cartão</label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={e => setCardName(e.target.value.toUpperCase())}
                    placeholder="NOME COMO NO CARTÃO"
                    required
                    className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-stone-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-700 font-medium mb-1">Validade (MM/AA)</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={e => setCardExpiry(e.target.value)}
                      placeholder="12/28"
                      maxLength={5}
                      required
                      className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-700 font-medium mb-1">CVV</label>
                    <input
                      type="password"
                      value={cardCvv}
                      onChange={e => setCardCvv(e.target.value)}
                      placeholder="123"
                      maxLength={4}
                      required
                      className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-stone-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-stone-700 font-medium mb-1">Parcelamento</label>
                  <select
                    value={installments}
                    onChange={e => setInstallments(Number(e.target.value))}
                    className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-stone-900"
                  >
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <option key={i} value={i}>
                        {i}x de R$ {(total / i).toFixed(2).replace('.', ',')} sem juros
                      </option>
                    ))}
                  </select>
                </div>

                <p className="text-[10px] text-stone-500 flex items-center gap-1 pt-1">
                  <Lock className="w-3.5 h-3.5 text-stone-400" />
                  Seus dados não são armazenados em nosso servidor e trafegam com criptografia TLS 256-bit.
                </p>
              </div>
            )}

            {paymentMethod === 'Boleto' && (
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-700 space-y-1">
                <p>O boleto terá vencimento em até 3 dias úteis. A aprovação ocorre em 1 a 2 dias úteis após o pagamento.</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-4 px-6 bg-[#5B1525] hover:bg-[#7E2235] text-white text-sm font-semibold uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{isProcessing ? 'Processando pedido...' : `FINALIZAR PEDIDO (R$ ${total.toFixed(2).replace('.', ',')})`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </form>

        {/* Right: Order Summary (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs space-y-6 sticky top-28">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200">
            <h3 className="font-serif text-lg font-bold text-stone-900">Resumo da Compra</h3>
            <span className="text-xs text-stone-500 font-medium">({items.length} itens)</span>
          </div>

          <div className="divide-y divide-stone-100 max-h-72 overflow-y-auto pr-1">
            {items.map((item, idx) => {
              const price = item.product.promoPrice || item.product.price;
              return (
                <div key={idx} className="py-3 flex gap-3 text-xs">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    referrerPolicy="no-referrer"
                    className="w-12 h-14 object-cover rounded-lg bg-stone-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-stone-900 truncate">{item.product.name}</p>
                    <p className="text-stone-500 text-[11px]">
                      {item.selectedColor.name} · Tam: {item.selectedSize} · Qtd: {item.quantity}
                    </p>
                    <p className="text-xs font-bold text-[#5B1525] mt-1 tabular-nums">
                      R$ {(price * item.quantity).toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-2 text-xs text-stone-600 pt-3 border-t border-stone-200">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="tabular-nums font-medium text-stone-900">R$ {subtotal.toFixed(2).replace('.', ',')}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Desconto ({appliedCoupon?.code})</span>
                <span className="tabular-nums font-medium">- R$ {discountAmount.toFixed(2).replace('.', ',')}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Frete ({shippingOption || 'PAC'})</span>
              <span className="tabular-nums font-medium text-stone-900">
                {shippingCost === 0 ? 'Grátis' : `R$ ${shippingCost.toFixed(2).replace('.', ',')}`}
              </span>
            </div>
            <div className="flex justify-between text-base font-bold text-stone-900 pt-2 border-t border-stone-200">
              <span>Total</span>
              <span className="text-[#5B1525] tabular-nums">R$ {total.toFixed(2).replace('.', ',')}</span>
            </div>
          </div>

          <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-100 text-[11px] text-stone-700 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-[#5B1525]">
              <ShieldCheck className="w-4 h-4" />
              <span>Garantia Moda Intima Todo Dia</span>
            </div>
            <p>1ª troca gratuita, embalagem 100% lacrada e sem etiquetas externas de lingerie.</p>
          </div>
        </div>

      </div>
    </div>
  );
};
