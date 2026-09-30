import React from 'react';
import { X, Ruler, HelpCircle } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: string;
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({ isOpen, onClose, category }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <Ruler className="w-5 h-5 text-[#5B1525]" />
          <h3 className="font-serif text-xl font-bold text-stone-900">Guia de Medidas & Tamanhos</h3>
        </div>
        <p className="text-xs text-stone-500 mb-5">
          Descubra o tamanho perfeito para o seu corpo. Todas as medidas estão em centímetros (cm).
        </p>

        {/* Tabela de Sutiãs e Bralettes */}
        <div className="mb-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#5B1525] mb-2.5">
            Sutiãs, Bralettes e Tops
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-stone-600 border border-stone-200 rounded-lg">
              <thead className="bg-[#FAF8F7] text-stone-800 font-semibold border-b border-stone-200">
                <tr>
                  <th className="py-2.5 px-3">Tamanho</th>
                  <th className="py-2.5 px-3">Numeração</th>
                  <th className="py-2.5 px-3">Busto (cm)</th>
                  <th className="py-2.5 px-3">Tórax (cm)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 tabular-nums">
                <tr>
                  <td className="py-2 px-3 font-semibold text-stone-900">P</td>
                  <td className="py-2 px-3">40</td>
                  <td className="py-2 px-3">80 - 86</td>
                  <td className="py-2 px-3">68 - 72</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold text-stone-900">M</td>
                  <td className="py-2 px-3">42</td>
                  <td className="py-2 px-3">87 - 92</td>
                  <td className="py-2 px-3">73 - 77</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold text-stone-900">G</td>
                  <td className="py-2 px-3">44</td>
                  <td className="py-2 px-3">93 - 98</td>
                  <td className="py-2 px-3">78 - 82</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold text-stone-900">GG</td>
                  <td className="py-2 px-3">46</td>
                  <td className="py-2 px-3">99 - 104</td>
                  <td className="py-2 px-3">83 - 87</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold text-stone-900">XG</td>
                  <td className="py-2 px-3">48</td>
                  <td className="py-2 px-3">105 - 112</td>
                  <td className="py-2 px-3">88 - 94</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Tabela de Calcinhas e Pijamas */}
        <div className="mb-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#5B1525] mb-2.5">
            Calcinhas, Pijamas e Sleepwear
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-stone-600 border border-stone-200 rounded-lg">
              <thead className="bg-[#FAF8F7] text-stone-800 font-semibold border-b border-stone-200">
                <tr>
                  <th className="py-2.5 px-3">Tamanho</th>
                  <th className="py-2.5 px-3">Manequim</th>
                  <th className="py-2.5 px-3">Cintura (cm)</th>
                  <th className="py-2.5 px-3">Quadril (cm)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 tabular-nums">
                <tr>
                  <td className="py-2 px-3 font-semibold text-stone-900">P</td>
                  <td className="py-2 px-3">36 - 38</td>
                  <td className="py-2 px-3">64 - 70</td>
                  <td className="py-2 px-3">90 - 95</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold text-stone-900">M</td>
                  <td className="py-2 px-3">40 - 42</td>
                  <td className="py-2 px-3">71 - 77</td>
                  <td className="py-2 px-3">96 - 103</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold text-stone-900">G</td>
                  <td className="py-2 px-3">44</td>
                  <td className="py-2 px-3">78 - 85</td>
                  <td className="py-2 px-3">104 - 111</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold text-stone-900">GG</td>
                  <td className="py-2 px-3">46</td>
                  <td className="py-2 px-3">86 - 93</td>
                  <td className="py-2 px-3">112 - 120</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Como medir */}
        <div className="bg-rose-50/60 p-4 rounded-xl border border-rose-100 text-xs text-stone-700">
          <div className="flex items-center gap-1.5 font-semibold text-[#5B1525] mb-2">
            <HelpCircle className="w-4 h-4" />
            <span>Dicas para medir com fita métrica:</span>
          </div>
          <ul className="list-disc pl-4 space-y-1 text-stone-600">
            <li><strong>Busto:</strong> Passe a fita na parte mais volumosa dos seios com sutiã sem bojo.</li>
            <li><strong>Tórax:</strong> Meça logo abaixo da dobra dos seios, bem ajustado.</li>
            <li><strong>Cintura:</strong> Meça na parte mais fina do abdômen, acima do umbigo.</li>
            <li><strong>Quadril:</strong> Meça na parte mais larga do bumbum.</li>
          </ul>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-2.5 bg-[#5B1525] hover:bg-[#7E2235] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors"
        >
          Entendido
        </button>
      </div>
    </div>
  );
};
