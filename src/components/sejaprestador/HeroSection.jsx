import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star, Shield, Users } from 'lucide-react';
import { LogoMark } from '@/components/brand/Logo';

export default function HeroSection() {
  return (
    <div className="relative min-h-[50vh] md:min-h-[70vh] flex items-center overflow-hidden">
      {/* Background Image — 3 profissionais da Costa do Descobrimento */}
      <div className="absolute inset-0">
        <img
          src="https://base44.app/api/apps/6a0754c82a7c1aae19211408/files/mp/public/6a0754c82a7c1aae19211408/0d15d2c04_hero_sejaprestador_3prof.png"
          alt="Eletricista, chef e arquiteto — profissionais que atuam na Costa do Descobrimento"
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-orange-950/95 via-orange-900/75 to-transparent" />
        <div className="absolute inset-0 bg-neutral-900/20" />

        {/* Logo oficial — canto superior esquerdo */}
        <div
          className="absolute top-4 left-4 md:top-6 md:left-6 z-20 flex items-center gap-2.5 pointer-events-none"
          style={{ fontFamily: 'Nunito, sans-serif' }}
        >
          <LogoMark className="h-10 w-10 md:h-12 md:w-12 drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)]" />
          <span className="flex flex-col leading-none">
            <span className="font-bold tracking-wide text-white text-base md:text-lg drop-shadow-[0_2px_4px_rgba(0,0,0,0.55)]">
              Trancoso
            </span>
            <span className="font-black uppercase tracking-tight text-[#FFD600] text-lg md:text-xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.55)]">
              RESOLVE
            </span>
          </span>
        </div>
      </div>

      <div className="relative container mx-auto px-4 py-10 md:py-24">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-400/40 rounded-full px-4 py-1.5 mb-4">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-amber-200 text-sm font-medium">Marketplace Profissional da Costa do Descobrimento</span>
          </div>

          <h1 className="text-2xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-4">
            A Vitrine Oficial de Serviços e Profissionais{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
              da Costa do Descobrimento
            </span>
          </h1>

          <p className="text-base md:text-xl text-slate-200 mb-6 leading-relaxed max-w-xl">
            De técnicos e especialistas em hospitalidade a consultores e serviços autônomos. 
            Conecte sua expertise a pousadas, moradores e turistas.
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
