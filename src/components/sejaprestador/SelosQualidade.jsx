import React from 'react';
import { Shield, Star, Award, Zap } from 'lucide-react';

const selos = [
  {
    icon: Shield,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    title: 'Prestador Verificado',
    description: 'Documentos e identidade conferidos pela equipe Trancoso Resolve, garantindo segurança e confiança.',
  },
  {
    icon: Star,
    color: 'text-amber-500',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    title: 'Selo de Excelência',
    description: 'Concedido a prestadores com avaliação acima de 4.8 estrelas.',
  },
  {
    icon: Award,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-100',
    title: 'Parceiro Premium',
    description: 'Destaque no topo das buscas e acesso a clientes VIP.',
  },
  {
    icon: Zap,
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-100',
    title: 'Resposta Rápida',
    description: 'Prestadores que respondem em menos de 2h ganham destaque.',
  },
];

export default function SelosQualidade() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-8 md:mb-12">
          <span className="text-sm font-semibold text-blue-600 uppercase tracking-widest">Programa de Qualidade</span>
          <h2 className="text-xl md:text-3xl font-bold text-slate-900 mt-2 mb-3">Selos de Reconhecimento Trancoso Resolve</h2>
          <p className="text-sm md:text-base text-slate-500 max-w-xl mx-auto">
            Nossa plataforma reconhece e destaca os melhores profissionais com selos que aumentam sua visibilidade e credibilidade.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {selos.map((selo, i) => {
            const Icon = selo.icon;
            return (
              <div key={i} className={`rounded-2xl border ${selo.border} ${selo.bg} p-6 text-center`}>
                <div className={`w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center mx-auto mb-4`}>
                  <Icon className={`w-7 h-7 ${selo.color}`} />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{selo.title}</h3>
                <p className="text-sm text-slate-500">{selo.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}