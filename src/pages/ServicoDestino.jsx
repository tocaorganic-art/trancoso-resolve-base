import { useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { MapPin, CheckCircle, Clock, Shield, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DESTINO_MAP, CATEGORIA_MAP, BASE_URL } from '@/data/seoLocal';
import LeadCaptureForm from '@/components/servicos/LeadCaptureForm';
import WhatsAppStickyBar from '@/components/servicos/WhatsAppStickyBar';
import { trackContatoWhatsApp } from '@/utils/analytics';

const WHATSAPP_NUMBER = '5573998283579';

const FAQS = {
  eletricista: [
    { q: 'O eletricista atende emergências?', r: 'Sim! Nossos eletricistas verificados atendem emergências como curtos-circuitos e quedas de energia.' },
    { q: 'Os profissionais têm certificação?', r: 'Todos passam por verificação de identidade e antecedentes. Muitos possuem certificações NR10 e registro no CREA.' },
    { q: 'Como solicitar orçamento?', r: 'Preencha o formulário abaixo ou clique em WhatsApp. Retornamos em até 2 horas.' },
  ],
  diarista: [
    { q: 'As diaristas são verificadas?', r: 'Sim. Todas têm identidade verificada e análise de antecedentes criminais.' },
    { q: 'Posso agendar limpezas recorrentes?', r: 'Sim! Combine frequência semanal ou quinzenal direto com a diarista.' },
    { q: 'A diarista leva material?', r: 'Depende do combinado. Acerte diretamente com a profissional.' },
  ],
  encanador: [
    { q: 'Atende com urgência?', r: 'Sim! Descreva o problema e receba contato de encanadores disponíveis para atendimento rápido.' },
    { q: 'O serviço tem garantia?', r: 'Cada profissional define sua política. Confirme antes de contratar. Todos têm avaliações públicas.' },
    { q: 'Atendem pousadas e condomínios?', r: 'Sim! Nossos encanadores têm experiência em residências, pousadas e villas da região.' },
  ],
  jardineiro: [
    { q: 'Trabalham com plantas tropicais?', r: 'Sim! Especializados na flora tropical do litoral baiano — palmeiras, bromélias e espécies nativas.' },
    { q: 'Fazem manutenção periódica?', r: 'Sim! Combine frequência semanal ou quinzenal diretamente com o profissional.' },
    { q: 'Fazem visita de avaliação?', r: 'Muitos oferecem visita inicial gratuita para avaliar o jardim e propor o serviço.' },
  ],
  chef: [
    { q: 'O chef leva os ingredientes?', r: 'Depende do combinado. Muitos oferecem o serviço completo (compra + preparo) ou só o preparo.' },
    { q: 'Atendem eventos e festas?', r: 'Sim! Nossos chefs atendem jantares, almoços em família e eventos corporativos em villas e pousadas.' },
    { q: 'Fazem culinária baiana autêntica?', r: 'Sim! Você pode solicitar culinária baiana, internacional ou dietas específicas.' },
  ],
};

export default function ServicoDestino() {
  const { destino, categoria } = useParams();
  const dest = DESTINO_MAP[destino];
  const cat = CATEGORIA_MAP[categoria];
  const destinoLabel = dest?.label || '';
  const categoriaLabel = cat?.label || '';
  const emoji = cat?.emoji || '';
  const faqs = FAQS[categoria] || [];
  const waMsg = encodeURIComponent(`Olá! Preciso de ${categoriaLabel.toLowerCase()} em ${destinoLabel}. Podem me ajudar?`);
  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${waMsg}`;

  useEffect(() => {
    if (!dest || !cat) return;
    const prev = document.title;
    const metaTitle = `${categoriaLabel} em ${destinoLabel} | Profissionais Verificados — Trancoso Resolve`;
    document.title = metaTitle;

    const metaDesc = document.querySelector('meta[name="description"]');
    const prevDesc = metaDesc?.getAttribute('content') || '';
    if (metaDesc) metaDesc.setAttribute('content', `Encontre ${categoriaLabel.toLowerCase()} verificado em ${destinoLabel}, BA. Contrate com segurança e rapidez pela Trancoso Resolve. Resposta em até 2 horas.`);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = `${BASE_URL}/${destino}/${categoria}`;

    const schemaId = `schema-servico-${destino}-${categoria}`;
    document.getElementById(schemaId)?.remove();
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = schemaId;
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: `${categoriaLabel} em ${destinoLabel}`,
      description: `Profissionais de ${categoriaLabel.toLowerCase()} verificados em ${destinoLabel}, Bahia. Contrate com segurança pela Trancoso Resolve.`,
      areaServed: { '@type': 'City', name: destinoLabel, addressRegion: 'BA', addressCountry: 'BR' },
      provider: { '@type': 'LocalBusiness', name: 'Trancoso Resolve', url: BASE_URL },
      url: `${BASE_URL}/${destino}/${categoria}`,
    });
    document.head.appendChild(script);

    return () => {
      document.title = prev;
      if (metaDesc) metaDesc.setAttribute('content', prevDesc);
      document.getElementById(schemaId)?.remove();
    };
  }, [destino, categoria, dest, cat, destinoLabel, categoriaLabel]);

  if (!dest || !cat) return <Navigate to="/" replace />;

  return (
    <div className="bg-background overflow-x-hidden">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1A1208] via-[#2d1f10] to-[#1A1208] text-white py-16 md:py-24">
        <div className="container mx-auto max-w-5xl px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-orange-700/40 border border-orange-400/30 rounded-full px-4 py-1.5 text-sm font-medium text-orange-200 mb-6">
            <MapPin className="w-4 h-4" /> {destinoLabel}, Bahia
          </div>
          <div className="text-5xl mb-4">{emoji}</div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
            {categoriaLabel} em {destinoLabel}
          </h1>
          <p className="text-lg text-orange-100 max-w-2xl mx-auto mb-8">
            Profissionais verificados disponíveis em {destinoLabel}. Solicite orçamento e receba contato em até 2 horas.
          </p>
          <a href={waLink} target="_blank" rel="noopener noreferrer" onClick={() => trackContatoWhatsApp(`${categoriaLabel} ${destinoLabel}`)}>
            <Button className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-3 text-base gap-2">
              <MessageCircle className="w-5 h-5" /> Falar pelo WhatsApp
            </Button>
          </a>
        </div>
      </section>

      {/* Benefícios */}
      <section className="py-16 container mx-auto max-w-5xl px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: CheckCircle, title: 'Profissional verificado',  desc: 'Identidade e antecedentes conferidos antes de aparecer na plataforma.' },
            { icon: Clock,       title: 'Resposta rápida',          desc: 'Retorno em até 2 horas após o pedido de orçamento.' },
            { icon: Shield,      title: 'Contrate com segurança',   desc: 'Avaliações reais de clientes. Combine direto sem intermediários.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-4 p-6 rounded-2xl border border-border">
              <Icon className="w-6 h-6 text-orange-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Formulário */}
      <section className="py-16 bg-sand/30">
        <div className="container mx-auto max-w-2xl px-4">
          <h2 className="text-2xl font-bold text-center mb-2">
            Contratar {categoriaLabel} em {destinoLabel}
          </h2>
          <p className="text-center text-muted-foreground mb-8">Deixe seu contato — respondemos em até 2 horas pelo WhatsApp.</p>
          <LeadCaptureForm serviceInterest={categoriaLabel} serviceLabel={categoriaLabel} source={`${destino}-${categoria}`} />
        </div>
      </section>

      {/* FAQ */}
      {faqs.length > 0 && (
        <section className="py-16 container mx-auto max-w-3xl px-4">
          <h2 className="text-2xl font-bold text-center mb-8">Perguntas frequentes sobre {categoriaLabel} em {destinoLabel}</h2>
          <div className="space-y-3">
            {faqs.map(({ q, r }) => (
              <details key={q} className="group border border-border rounded-xl p-4">
                <summary className="flex items-center justify-between cursor-pointer font-semibold text-neutral-900 list-none">
                  {q}
                  <span className="ml-2 shrink-0 text-muted-foreground group-open:rotate-180 transition-transform">▾</span>
                </summary>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{r}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* Botão flutuante WhatsApp */}
      <a
        href={waLink}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackContatoWhatsApp(`${categoriaLabel} ${destinoLabel}`)}
        className="fixed bottom-24 right-6 z-50 hidden md:flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-5 py-3 rounded-full shadow-lg transition-all hover:scale-105"
        aria-label={`Falar pelo WhatsApp sobre ${categoriaLabel} em ${destinoLabel}`}
      >
        <MessageCircle className="w-5 h-5" />
        <span className="text-sm">WhatsApp</span>
      </a>

      <WhatsAppStickyBar serviceLabel={`${categoriaLabel} em ${destinoLabel}`} />
    </div>
  );
}
