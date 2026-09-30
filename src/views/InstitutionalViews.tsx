import React, { useState } from 'react';
import {
  Heart,
  ShieldCheck,
  Truck,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  Clock,
  Sparkles,
  Send,
  CheckCircle2
} from 'lucide-react';
import { useToast } from '../context/ToastContext.tsx';

interface PageProps {
  navigate: (path: string) => void;
}

export const AboutView: React.FC<PageProps> = ({ navigate }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-widest text-[#5B1525] font-bold">
          Nossa Essência
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900 leading-tight">
          Feito para você se sentir incrível todos os dias
        </h1>
        <p className="text-sm text-stone-600 leading-relaxed font-light">
          A Moda Intima Todo Dia nasceu do desejo genuíno de transformar a relação com a moda íntima: peças que não precisam de ocasião especial para serem belas e confortáveis.
        </p>
      </div>

      <div className="rounded-3xl overflow-hidden aspect-[16/9] shadow-xl bg-stone-900 relative">
        <img
          src="/src/assets/images/hero_lingerie_campaign_1790726065057.jpg"
          alt="Moda Intima Todo Dia Atelier"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent flex items-end p-8">
          <p className="text-white text-xs sm:text-sm font-light max-w-lg">
            Design autoral brasileiro com tecidos nobres, rendas ultrafinas e costuras inteligentes que não marcam sob a roupa.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6">
        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#5B1525] flex items-center justify-center">
            <Heart className="w-5 h-5 fill-current" />
          </div>
          <h3 className="font-serif text-lg font-bold text-stone-900">Nossa Missão</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            Oferecer roupas íntimas que celebrem a pluralidade do corpo feminino e masculino, proporcionando bem-estar diário, alta durabilidade e elegância acessível.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#5B1525] flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-serif text-lg font-bold text-stone-900">Qualidade Sem Concessões</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            Utilizamos matérias-primas selecionadas: algodão nobre penteado, fibra de modal macia e respirável, e rendas florais de toque aveludado que não coçam.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#5B1525] flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-serif text-lg font-bold text-stone-900">Cuidado em Cada Detalhe</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            Desde o atendimento acolhedor no WhatsApp até a entrega em caixas perfumadas e 100% lacradas com máxima discrição.
          </p>
        </div>
      </div>

      <div className="text-center pt-8">
        <button
          onClick={() => navigate('/produtos')}
          className="px-8 py-3.5 bg-[#5B1525] hover:bg-[#7E2235] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors shadow-md"
        >
          Conhecer os Produtos
        </button>
      </div>
    </div>
  );
};

export const ContactView: React.FC<PageProps> = () => {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setTimeout(() => {
      showToast('Mensagem enviada com sucesso! Responderemos em breve.');
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      setIsSending(false);
    }, 600);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs uppercase tracking-widest text-[#5B1525] font-bold">
          Fale Conosco
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
          Central de Atendimento
        </h1>
        <p className="text-xs sm:text-sm text-stone-500">
          Estamos à disposição para tirar dúvidas sobre tamanhos, pedidos, trocas e encomendas.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* Contact Info Cards */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
            <h3 className="font-serif text-lg font-bold text-stone-900">Canais Diretos</h3>
            
            <div className="space-y-4 text-xs">
              <a
                href="https://wa.me/5511999998888"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-stone-800 hover:bg-emerald-50 transition-colors"
              >
                <div className="p-2 bg-emerald-500 text-white rounded-lg">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-emerald-900">Atendimento WhatsApp</span>
                  <p className="text-emerald-700 mt-0.5">(11) 99999-8888</p>
                  <p className="text-[10px] text-emerald-600">Resposta rápida em horário comercial</p>
                </div>
              </a>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200">
                <div className="p-2 bg-stone-800 text-white rounded-lg">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-stone-900">E-mail Oficial</span>
                  <p className="text-stone-600 mt-0.5">atendimento@modaintimatododia.com.br</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200">
                <div className="p-2 bg-stone-800 text-white rounded-lg">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-stone-900">Horário de Atendimento</span>
                  <p className="text-stone-600 mt-0.5">Segunda a Sexta: 09h às 19h | Sábado: 09h às 14h</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200">
                <div className="p-2 bg-stone-800 text-white rounded-lg">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-stone-900">Showroom & Distribuição</span>
                  <p className="text-stone-600 mt-0.5">Av. Paulista, 1500 - Bela Vista, São Paulo - SP</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-xs">
          <h3 className="font-serif text-lg font-bold text-stone-900 mb-4">Envie uma Mensagem</h3>
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-stone-700 font-medium mb-1">Seu Nome *</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Nome completo"
                required
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-[#C87D85]"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-medium mb-1">Seu E-mail *</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-[#C87D85]"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-medium mb-1">Assunto</label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="Dúvida sobre tamanho, pedido..."
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-[#C87D85]"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-medium mb-1">Mensagem *</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Como podemos te ajudar?"
                rows={4}
                required
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-[#C87D85]"
              />
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="w-full py-3 bg-[#5B1525] hover:bg-[#7E2235] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSending ? 'Enviando...' : 'Enviar Mensagem'}</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export const ExchangesPolicyView: React.FC<PageProps> = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-6 text-stone-700 text-xs sm:text-sm leading-relaxed">
      <div className="pb-4 border-b border-stone-200">
        <span className="text-xs uppercase tracking-widest text-[#5B1525] font-bold">Transparência & Respeito</span>
        <h1 className="font-serif text-3xl font-bold text-stone-900 mt-1">
          Política de Trocas e Devoluções
        </h1>
      </div>

      <div className="space-y-4">
        <h3 className="font-serif text-lg font-bold text-stone-900">1. Primeira Troca Grátis</h3>
        <p>
          Queremos que você se apaixone pelo seu produto. Caso o tamanho não fique perfeito ou prefira outra cor, a primeira troca é por nossa conta em compras realizadas na loja online da Moda Intima Todo Dia.
        </p>

        <h3 className="font-serif text-lg font-bold text-stone-900">2. Prazos</h3>
        <p>
          Conforme o Código de Defesa do Consumidor, o prazo para solicitação de troca ou devolução por arrependimento é de até <strong>7 (sete) dias corridos</strong> após a entrega. Para troca de numeração ou modelo, estendemos esse benefício para até <strong>30 (trinta) dias corridos</strong>.
        </p>

        <h3 className="font-serif text-lg font-bold text-stone-900">3. Condições das Peças Íntimas</h3>
        <p>
          Por se tratarem de artigos de moda íntima e visando à saúde e higiene de todos os nossos clientes, a troca só será aceita se o produto estiver:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Com a etiqueta original fixada na peça;</li>
          <li>Sem qualquer indício de uso, lavagem ou odores;</li>
          <li>Acompanhado de sua embalagem protetora original.</li>
        </ul>

        <h3 className="font-serif text-lg font-bold text-stone-900">4. Como Solicitar</h3>
        <p>
          Basta entrar em contato com nosso time de atendimento através do WhatsApp (11) 99999-8888 ou e-mail atendimento@modaintimatododia.com.br informando o número do pedido e o item a ser trocado.
        </p>
      </div>
    </div>
  );
};

export const ShippingPolicyView: React.FC<PageProps> = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-6 text-stone-700 text-xs sm:text-sm leading-relaxed">
      <div className="pb-4 border-b border-stone-200">
        <span className="text-xs uppercase tracking-widest text-[#5B1525] font-bold">Entrega Segura</span>
        <h1 className="font-serif text-3xl font-bold text-stone-900 mt-1">
          Prazos e Formas de Entrega
        </h1>
      </div>

      <div className="space-y-4">
        <h3 className="font-serif text-lg font-bold text-stone-900">1. Frete Grátis</h3>
        <p>
          Oferecemos frete grátis para todo o território nacional nas compras com valor final a partir de <strong>R$ 199,00</strong>.
        </p>

        <h3 className="font-serif text-lg font-bold text-stone-900">2. Prazos de Envio</h3>
        <p>
          Após a confirmação do pagamento, seu pedido é separado, perfumado e despachado em até <strong>1 dia útil</strong>. O prazo total de entrega varia conforme a localidade e a modalidade escolhida (Sedex ou PAC).
        </p>

        <h3 className="font-serif text-lg font-bold text-stone-900">3. Embalagem 100% Discreta</h3>
        <p>
          Privacidade é prioridade absoluta. Nossos pacotes são caixas ou envelopes kraft lacrados, sem nenhuma menção externa à palavras como "lingerie", "moda íntima" ou conteúdo das peças. O remetente é discreto e profissional.
        </p>
      </div>
    </div>
  );
};

export const PrivacyPolicyView: React.FC<PageProps> = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-6 text-stone-700 text-xs sm:text-sm leading-relaxed">
      <div className="pb-4 border-b border-stone-200">
        <span className="text-xs uppercase tracking-widest text-[#5B1525] font-bold">LGPD & Segurança</span>
        <h1 className="font-serif text-3xl font-bold text-stone-900 mt-1">
          Política de Privacidade
        </h1>
      </div>

      <div className="space-y-4">
        <p>
          A Moda Intima Todo Dia tem o compromisso de proteger sua privacidade e seus dados pessoais em total conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD).
        </p>
        <h3 className="font-serif text-lg font-bold text-stone-900">1. Coleta e Uso de Informações</h3>
        <p>
          Seus dados (nome, CPF, endereço, e-mail e telefone) são coletados exclusivamente para fins de faturamento, emissão de nota fiscal, envio de mercadorias e comunicações sobre o status do seu pedido.
        </p>
        <h3 className="font-serif text-lg font-bold text-stone-900">2. Segurança dos Pagamentos</h3>
        <p>
          Não armazenamos dados completos de cartão de crédito em nossa infraestrutura. Todas as transações financeiras são processadas por gateways de pagamento certificados com criptografia TLS/SSL de 256 bits.
        </p>
      </div>
    </div>
  );
};
