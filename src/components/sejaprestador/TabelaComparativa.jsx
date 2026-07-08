import React from 'react';
import { Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';

const items = [
  { label: 'Clientes de alto padrão', solo: false, toca: true },
  { label: 'Custo zero de marketing', solo: false, toca: true },
  { label: 'Gestão de agenda integrada com IA', solo: false, toca: true },
  { label: 'Avaliações e reputação online', solo: false, toca: true },
  { label: 'Agente de IA e suporte 24h', solo: false, toca: true },
  { label: 'Pagamento garantido e seguro', solo: false, toca: true },
  { label: 'Visibilidade em buscas locais', solo: 'Parcial', toca: true },
  { label: 'Criação de imagens com IA (Toca Vision)', solo: false, toca: true },
];

export default function TabelaComparativa() {
  return (
    <section className="py-10 md:py-16 bg-gradient-to-br from-slate-50 to-amber-50">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8 md:mb-12">
          <span className="text-sm font-semibold text-amber-600 uppercase tracking-widest">Por que escolher o Trancoso Resolve?</span>
          <h2 className="text-xl md:text-3xl font-bold text-slate-900 mt-2 mb-3">Trabalhar Sozinho vs. Ser Parceiro Trancoso Resolve</h2>
          <p className="text-slate-500 text-sm md:text-base">Veja a diferença que a nossa plataforma faz para o seu negócio.</p>
        </div>

        {/* Desktop Table */}
         <div className="hidden md:block bg-white rounded-2xl shadow-xl overflow-hidden">
           <div className="grid grid-cols-3 bg-slate-900 text-white text-center">
             <div className="p-4 text-left pl-6 font-bold text-slate-100">Benefício</div>
             <div className="p-4 font-bold text-slate-300">Por conta própria</div>
             <div className="p-4 font-bold text-white bg-gradient-to-b from-amber-600 to-amber-800">
               Parceiro Trancoso Resolve 🌴
             </div>
           </div>
          {items.map((item, i) => (
            <div key={i} className={`grid grid-cols-3 text-center border-b border-slate-100 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
              <div className="p-4 pl-6 text-left text-sm font-semibold text-slate-800">{item.label}</div>
              <div className="p-4 flex items-center justify-center">
                {item.solo === true ? (
                  <Check className="w-5 h-5 text-green-500" />
                ) : item.solo === 'Parcial' ? (
                  <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-full">Parcial</span>
                ) : (
                  <X className="w-5 h-5 text-red-400" />
                )}
              </div>
              <div className="p-4 flex items-center justify-center bg-amber-50/50">
               <Check className="w-5 h-5 text-amber-600 stroke-[2.5]" />
              </div>
            </div>
          ))}
          <div className="grid grid-cols-3 text-center bg-slate-50 p-4">
            <div /><div />
            <div className="flex justify-center">
              <Link to={createPageUrl('CadastroTipo')}>
                <Button className="bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold">
                  Quero ser Parceiro
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {items.map((item, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
              <p className="font-semibold text-slate-800 mb-3 text-sm">{item.label}</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-slate-500 mb-2">Por conta própria</p>
                  {item.solo === true ? (
                    <Check className="w-5 h-5 text-green-500 mx-auto" />
                  ) : item.solo === 'Parcial' ? (
                    <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-full">Parcial</span>
                  ) : (
                    <X className="w-5 h-5 text-red-400 mx-auto" />
                  )}
                </div>
                <div className="bg-amber-50 rounded-lg p-3 text-center border border-amber-100">
                  <p className="text-xs text-amber-600 font-semibold mb-2">Parceiro Trancoso Resolve 🌴</p>
                  <Check className="w-5 h-5 text-amber-600 stroke-[2.5] mx-auto" />
                </div>
              </div>
            </div>
          ))}
          <div className="pt-2">
            <Link to={createPageUrl('CadastroTipo')}>
              <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold h-12">
                Quero ser Parceiro Trancoso Resolve 🌴
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}