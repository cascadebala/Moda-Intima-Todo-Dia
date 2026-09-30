import React, { useState, useEffect } from 'react';
import { Clock, Flame } from 'lucide-react';

interface CountdownTimerProps {
  targetDate: string;
  title?: string;
  onExploreOffers?: () => void;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetDate,
  title = 'Ofertas Especiais da Semana',
  onExploreOffers
}) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTime = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="bg-gradient-to-r from-[#5B1525] via-[#7E2235] to-[#3E0C17] text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="space-y-1.5 text-center md:text-left">
        <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-rose-200 font-semibold bg-white/10 px-3 py-1 rounded-full">
          <Flame className="w-3.5 h-3.5 text-amber-300" />
          <span>Por Tempo Limitado</span>
        </div>
        <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-rose-100 max-w-md">
          Aproveite peças selecionadas com até 35% OFF e frete grátis em compras elegíveis.
        </p>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-xl p-3 sm:p-4 text-center min-w-[60px] sm:min-w-[70px]">
          <span className="block text-xl sm:text-3xl font-bold font-mono tabular-nums leading-none">
            {String(timeLeft.days).padStart(2, '0')}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-rose-200 mt-1 block">Dias</span>
        </div>
        <span className="text-xl font-bold text-rose-200">:</span>

        <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-xl p-3 sm:p-4 text-center min-w-[60px] sm:min-w-[70px]">
          <span className="block text-xl sm:text-3xl font-bold font-mono tabular-nums leading-none">
            {String(timeLeft.hours).padStart(2, '0')}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-rose-200 mt-1 block">Horas</span>
        </div>
        <span className="text-xl font-bold text-rose-200">:</span>

        <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-xl p-3 sm:p-4 text-center min-w-[60px] sm:min-w-[70px]">
          <span className="block text-xl sm:text-3xl font-bold font-mono tabular-nums leading-none">
            {String(timeLeft.minutes).padStart(2, '0')}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-rose-200 mt-1 block">Min</span>
        </div>
        <span className="text-xl font-bold text-rose-200">:</span>

        <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-xl p-3 sm:p-4 text-center min-w-[60px] sm:min-w-[70px]">
          <span className="block text-xl sm:text-3xl font-bold font-mono tabular-nums leading-none text-rose-300">
            {String(timeLeft.seconds).padStart(2, '0')}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-rose-200 mt-1 block">Seg</span>
        </div>
      </div>

      {onExploreOffers && (
        <button
          onClick={onExploreOffers}
          className="bg-white hover:bg-rose-50 text-[#5B1525] font-semibold text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl transition-all shadow-md shrink-0 whitespace-nowrap"
        >
          VER OFERTAS AGORA
        </button>
      )}
    </div>
  );
};
