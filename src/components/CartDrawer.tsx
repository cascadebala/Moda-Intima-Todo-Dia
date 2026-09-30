import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Tag,
  Truck,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';

interface CartDrawerProps {
  navigate: (path: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ navigate }) => {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    removeItem,
    updateQuantity,
    subtotal,
    discountAmount,
    shippingCost,
    total,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    freeShippingThreshold,
    remainingForFreeShipping,
    calculateShipping,
    setShipping,
    shippingZip
  } = useCart();

  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [zipInput, setZipInput] = useState(shippingZip || '');
  const [shippingOptions, setShippingOptions] = useState<any[]>([]);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;
    setIsApplyingCoupon(true);
    await applyCoupon(couponCodeInput);
    setIsApplyingCoupon(false);
    setCouponCodeInput('');
  };

  const handleCalcShipping = (e: React.FormEvent) => {
    e.preventDefault();
    const options = calculateShipping(zipInput);
    setShippingOptions(options);
  };

  const freeShippingPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#5B1525]" />
              <h2 className="font-serif text-xl font-bold text-stone-900">Sua Sacola</h2>
              <span className="text-xs text-stone-500 font-medium">({items.length} itens)</span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="bg-[#FAF8F7] px-6 py-3 border-b border-stone-200">
            {remainingForFreeShipping > 0 ? (
              <div>
                <p className="text-xs text-stone-700 mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#C87D85]" />
                  Falta apenas <strong className="text-[#5B1525]">R$ {remainingForFreeShipping.toFixed(2).replace('.', ',')}</strong> para <strong>Frete Grátis</strong>!
                </p>
                <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#5B1525] h-full rounded-full transition-all duration-500"
                    style={{ width: `${freeShippingPercent}%` }}
                  />
                </div>
              </div>
            ) : (
              <p className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Parabéns! Você ganhou <strong>FRETE GRÁTIS</strong> nesta compra.
              </p>
            )}
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-6 divide-y divide-stone-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-[#5B1525]">
                  <ShoppingBag className="w-8 h-8 opacity-60" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-stone-800">Sua sacola está vazia</h3>
                  <p className="text-xs text-stone-500 mt-1 max-w-xs">
                    Descubra nossas lingeries refinadas, pijamas e peças exclusivas para todos os dias.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/produtos');
                  }}
                  className="mt-2 px-6 py-2.5 bg-[#5B1525] hover:bg-[#7E2235] text-white text-xs font-medium uppercase tracking-wider rounded-lg transition-colors"
                >
                  Explorar Coleção
                </button>
              </div>
            ) : (
              items.map((item, idx) => {
                const itemPrice = item.product.promoPrice || item.product.price;
                return (
                  <div key={`${item.product.id}-${item.selectedColor.name}-${item.selectedSize}-${idx}`} className="py-4 flex gap-4">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      referrerPolicy="no-referrer"
                      className="w-20 h-24 object-cover rounded-lg bg-stone-100 shrink-0"
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="text-sm font-semibold text-stone-900 leading-snug line-clamp-1">
                            {item.product.name}
                          </h4>
                          <button
                            onClick={() => removeItem(item.product.id, item.selectedColor.name, item.selectedSize)}
                            className="text-stone-400 hover:text-rose-600 transition-colors ml-2"
                            title="Remover item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-stone-500">
                          <span className="flex items-center gap-1">
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-stone-300 inline-block"
                              style={{ backgroundColor: item.selectedColor.hex }}
                            />
                            {item.selectedColor.name}
                          </span>
                          <span>·</span>
                          <span>Tam: {item.selectedSize}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-stone-200 rounded-md bg-stone-50">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.product.id,
                                item.selectedColor.name,
                                item.selectedSize,
                                item.quantity - 1
                              )
                            }
                            className="p-1 hover:text-[#5B1525] transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2 text-xs font-semibold tabular-nums text-stone-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.product.id,
                                item.selectedColor.name,
                                item.selectedSize,
                                item.quantity + 1
                              )
                            }
                            className="p-1 hover:text-[#5B1525] transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-right">
                          <span className="text-sm font-bold text-[#5B1525] tabular-nums">
                            R$ {(itemPrice * item.quantity).toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Calculations & Checkout */}
          {items.length > 0 && (
            <div className="p-6 bg-stone-50 border-t border-stone-200 space-y-4">
              
              {/* Coupon Accordion / Box */}
              <div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-800">
                      <Tag className="w-4 h-4 text-emerald-600" />
                      <span>Cupom <strong>{appliedCoupon.code}</strong> aplicado</span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-stone-500 hover:text-rose-600 text-xs font-medium"
                    >
                      Remover
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponCodeInput}
                      onChange={e => setCouponCodeInput(e.target.value.toUpperCase())}
                      placeholder="Cupom de desconto"
                      className="flex-1 text-xs uppercase tracking-wider bg-white border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#C87D85]"
                    />
                    <button
                      type="submit"
                      disabled={isApplyingCoupon}
                      className="px-3 py-2 bg-stone-800 hover:bg-stone-900 text-white text-xs font-medium rounded-lg transition-colors"
                    >
                      Aplicar
                    </button>
                  </form>
                )}
              </div>

              {/* Shipping Estimate */}
              <div className="text-xs">
                <form onSubmit={handleCalcShipping} className="flex gap-2 mb-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={zipInput}
                      onChange={e => setZipInput(e.target.value)}
                      placeholder="Calcular CEP (ex: 01310-100)"
                      maxLength={9}
                      className="w-full bg-white border border-stone-200 rounded-lg pl-8 pr-3 py-2 text-xs focus:outline-none focus:border-[#C87D85]"
                    />
                    <Truck className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                  <button
                    type="submit"
                    className="px-3 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-medium rounded-lg"
                  >
                    Calcular
                  </button>
                </form>

                {shippingOptions.length > 0 && (
                  <div className="space-y-1 bg-white p-2 rounded-lg border border-stone-200">
                    {shippingOptions.map((opt, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setShipping(opt.cost, zipInput, opt.name)}
                        className="w-full flex items-center justify-between text-left py-1 text-[11px] hover:text-[#5B1525]"
                      >
                        <span className="text-stone-600">{opt.name} ({opt.days})</span>
                        <strong className="text-stone-900">
                          {opt.cost === 0 ? 'Grátis' : `R$ ${opt.cost.toFixed(2).replace('.', ',')}`}
                        </strong>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Totals Summary */}
              <div className="space-y-1.5 text-xs text-stone-600 pt-2 border-t border-stone-200">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-stone-900 tabular-nums">
                    R$ {subtotal.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Desconto ({appliedCoupon?.code})</span>
                    <span className="font-medium tabular-nums">
                      - R$ {discountAmount.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Frete</span>
                  <span className="font-medium text-stone-900 tabular-nums">
                    {subtotal >= freeShippingThreshold || shippingCost === 0
                      ? 'Grátis'
                      : `R$ ${shippingCost.toFixed(2).replace('.', ',')}`}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-stone-900 pt-2 border-t border-stone-200">
                  <span>Total</span>
                  <span className="text-[#5B1525] tabular-nums">
                    R$ {total.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <p className="text-[11px] text-stone-400 text-right">
                  ou até 6x de R$ {(total / 6).toFixed(2).replace('.', ',')} sem juros
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/checkout');
                  }}
                  className="w-full bg-[#5B1525] hover:bg-[#7E2235] text-white py-3.5 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <span>FINALIZAR PEDIDO</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/produtos');
                  }}
                  className="w-full text-stone-500 hover:text-stone-800 text-xs py-1.5 font-medium transition-colors"
                >
                  Continuar comprando
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-[10px] text-stone-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Compra 100% segura e envio com embalagem discreta</span>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
