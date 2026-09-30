import React from 'react';
import { MessageCircle } from 'lucide-react';

interface FloatingWhatsAppProps {
  whatsappNumber?: string;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({
  whatsappNumber = '5511999998888'
}) => {
  const cleanNumber = whatsappNumber.replace(/\D/g, '');
  const defaultMessage = encodeURIComponent(
    'Olá! Estou navegando no site da Moda Intima Todo Dia e gostaria de tirar uma dúvida.'
  );

  return (
    <aside aria-label="Atendimento WhatsApp">
      <a
        href={`https://wa.me/${cleanNumber}?text=${defaultMessage}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 bg-emerald-500 hover:bg-emerald-600 text-white p-3.5 sm:px-4 sm:py-3 rounded-full shadow-xl hover:shadow-2xl flex items-center gap-2.5 transition-all duration-300 hover:scale-105 group"
        aria-label="Fale Conosco pelo WhatsApp"
      >
        <MessageCircle className="w-6 h-6 fill-current" />
        <span className="hidden sm:inline text-xs font-semibold tracking-wide">
          Atendimento WhatsApp
        </span>
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400"></span>
        </span>
      </a>
    </aside>
  );
};
