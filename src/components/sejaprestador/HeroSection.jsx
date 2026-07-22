import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star, Shield, Users } from 'lucide-react';

export default function HeroSection() {
  return (
    <div className="relative min-h-[50vh] md:min-h-[70vh] flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
          alt="Praia paradisíaca de Trancoso"
          className="w-full h-full object-cover [filter:sepia(0.45)_saturate(1.3)_hue-rotate(-15deg)_brightness(0.9)]"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-orange-900/90 via-terracotta/70 to-transparent" />
        <div className="absolute inset-0 bg-neutral-900/30" />
      </div>

      <div className="relative container mx-auto px-4 py-10 md:py-24">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-400/40 rounded-full px-4 py-1.5 mb-4">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-amber-200 text-sm font-medium">Programa de Parceiros Trancoso Resolve</span>
          </div>

          <h1 className="text-2xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-4">
            Seja um Parceiro{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
              Trancoso Resolve
            </span>
          </h1>

          <p className="text-base md:text-xl text-slate-300 mb-6 leading-relaxed max-w-xl">
            Conecte-se com clientes que buscam profissionais qualificados em Trancoso. 
            Cadastre seus serviços e comece a receber solicitações hoje.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <Link to={createPageUrl('CadastroTipo')}>
              <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-base md:text-lg px-6 md:px-8 min-h-[48px] shadow-xl w-full sm:w-auto">
                Quero ser Parceiro
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <a href="#como-funciona" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 font-medium px-6 md:px-8 min-h-[48px] w-full">
                Como funciona?
              </Button>
            </a>
          </div>

          {/* Mini stats */}
          <div className="flex flex-wrap gap-4 md:gap-10">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-orange-300" />
              <span className="text-white font-semibold text-sm">500+</span>
              <span className="text-slate-400 text-xs">Clientes ativos</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-400" />
              <span className="text-white font-semibold text-sm">100%</span>
              <span className="text-slate-400 text-xs">Pagamento seguro</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400" />
              <span className="text-white font-semibold text-sm">4.9</span>
              <span className="text-slate-400 text-xs">Avaliação média</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}