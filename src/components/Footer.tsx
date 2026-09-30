import React, { useState } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Instagram,
  Facebook,
  ShieldCheck,
  CreditCard,
  Lock,
  ArrowRight,
  Sparkles,
  Heart
} from 'lucide-react';
import { useToast } from '../context/ToastContext.tsx';

interface FooterProps {
  navigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  const { showToast } = useToast();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || !newsletterEmail.includes('@')) {
      showToast('Por favor, informe um e-mail válido.', 'error');
      return;
    }
    setIsSubscribing(true);
    setTimeout(() => {
      showToast('Obrigada! Você receberá nossas novidades e cupons exclusivos em primeira mão.');
      setNewsletterEmail('');
      setIsSubscribing(false);
    }, 600);
  };

  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      {/* Newsletter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="bg-[#5B1525] rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-2xl text-white">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-rose-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl mx-auto text-center space-y-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-rose-200">
              <Sparkles className="w-3.5 h-3.5" />
              Receba nossas novidades
            </span>
            <h3 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight text-white">
              Ganhe 10% OFF no seu primeiro pedido
            </h3>
            <p className="text-sm text-rose-100/90 max-w-md mx-auto">
              Cadastre seu e-mail e receba ofertas, novidades e condições especiais antes de todo mundo.
            </p>

            <form onSubmit={handleNewsletterSubmit} className="mt-6 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={newsletterEmail}
                onChange={e => setNewsletterEmail(e.target.value)}
                placeholder="Digite seu melhor e-mail"
                required
                className="flex-1 bg-white/10 text-white placeholder-rose-200/70 border border-rose-300/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:bg-white/20 focus:border-white transition-all"
              />
              <button
                type="submit"
                disabled={isSubscribing}
                className="bg-white hover:bg-rose-50 text-[#5B1525] font-semibold text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition-colors shrink-0 shadow-md"
              >
                QUERO RECEBER
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-stone-800">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <button onClick={() => navigate('/')} className="text-left group">
              <span className="font-serif text-2xl font-bold text-white group-hover:text-rose-300 transition-colors">
                Moda Intima Todo Dia
              </span>
              <p className="text-xs tracking-wider uppercase text-rose-200/70 mt-0.5">
                Conforto & Sofisticação
              </p>
            </button>
            <p className="text-xs text-stone-400 leading-relaxed max-w-sm">
              Peças desenvolvidas com tecidos premium, rendas nobres e modelagens anatômicas para abraçar seu corpo e te fazer sentir linda, confiante e confortável todos os dias.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-stone-800 hover:bg-[#5B1525] text-stone-300 hover:text-white flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-stone-800 hover:bg-[#5B1525] text-stone-300 hover:text-white flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-stone-800 hover:bg-[#5B1525] text-stone-300 hover:text-white flex items-center justify-center transition-colors text-xs font-bold"
                aria-label="TikTok"
              >
                TK
              </a>
            </div>
          </div>

          {/* Atendimento */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Atendimento</h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li>
                <a
                  href="https://wa.me/5511999998888"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-rose-300 flex items-center gap-2"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-500" />
                  <span>(11) 99999-8888</span>
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-stone-500" />
                <span className="truncate">atendimento@modaintimatododia.com.br</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-stone-500" />
                <span>Seg a Sex: 09h às 19h</span>
              </li>
              <li>
                <button onClick={() => navigate('/contato')} className="hover:text-rose-300 transition-colors">
                  Fale Conosco
                </button>
              </li>
            </ul>
          </div>

          {/* Institucional */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Institucional</h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <button onClick={() => navigate('/sobre-nos')} className="hover:text-white transition-colors">
                  Sobre a Moda Intima Todo Dia
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/trocas-e-devolucoes')} className="hover:text-white transition-colors">
                  Política de Trocas e Devoluções
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/politica-de-entrega')} className="hover:text-white transition-colors">
                  Prazos e Formas de Entrega
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/politica-de-privacidade')} className="hover:text-white transition-colors">
                  Política de Privacidade
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/termos-de-uso')} className="hover:text-white transition-colors">
                  Termos e Condições de Uso
                </button>
              </li>
            </ul>
          </div>

          {/* Categorias & Compras */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Comprar</h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <button onClick={() => navigate('/categoria/lingeries')} className="hover:text-white transition-colors">
                  Lingeries de Renda
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/categoria/sutias')} className="hover:text-white transition-colors">
                  Sutiãs & Bralettes
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/categoria/calcinhas')} className="hover:text-white transition-colors">
                  Calcinhas Confort
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/categoria/pijamas')} className="hover:text-white transition-colors">
                  Pijamas & Sleepwear
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/categoria/masculino')} className="hover:text-white transition-colors">
                  Moda Íntima Masculina
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/ofertas')} className="text-rose-400 hover:text-rose-300 font-semibold transition-colors">
                  Ofertas Especiais
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/novidades')} className="hover:text-white transition-colors">
                  Lançamentos
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Security & Payment Badges */}
        <div className="py-8 grid grid-cols-1 md:grid-cols-2 gap-6 items-center text-xs text-stone-400 border-b border-stone-800">
          <div>
            <span className="block text-[11px] uppercase tracking-wider font-semibold text-stone-300 mb-2">
              Formas de Pagamento
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-stone-800 text-stone-200 px-2.5 py-1 rounded text-[11px] font-bold border border-stone-700">
                PIX à Vista
              </span>
              <span className="bg-stone-800 text-stone-200 px-2.5 py-1 rounded text-[11px] font-bold border border-stone-700">
                Visa
              </span>
              <span className="bg-stone-800 text-stone-200 px-2.5 py-1 rounded text-[11px] font-bold border border-stone-700">
                Mastercard
              </span>
              <span className="bg-stone-800 text-stone-200 px-2.5 py-1 rounded text-[11px] font-bold border border-stone-700">
                Elo
              </span>
              <span className="bg-stone-800 text-stone-200 px-2.5 py-1 rounded text-[11px] font-bold border border-stone-700">
                Hipercard
              </span>
              <span className="bg-stone-800 text-stone-200 px-2.5 py-1 rounded text-[11px] font-bold border border-stone-700">
                Boleto
              </span>
            </div>
          </div>

          <div className="md:text-right">
            <span className="block text-[11px] uppercase tracking-wider font-semibold text-stone-300 mb-2">
              Segurança & Confiança
            </span>
            <div className="flex flex-wrap items-center md:justify-end gap-3 text-[11px]">
              <span className="flex items-center gap-1.5 text-stone-300">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                Certificado SSL 256-bit
              </span>
              <span className="flex items-center gap-1.5 text-stone-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Embalagem Discreta e Perfumada
              </span>
            </div>
          </div>
        </div>

        {/* Copyright & Disclaimer */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© {new Date().getFullYear()} Moda Intima Todo Dia. Todos os direitos reservados.</p>
          <div className="flex items-center gap-1">
            <span>Feito com</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
            <span>para o seu dia a dia</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
