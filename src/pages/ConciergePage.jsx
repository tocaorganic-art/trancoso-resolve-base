import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, BadgeCheck, CalendarDays, CheckCircle2, Home as HomeIcon,
  Loader2, MapPin, Music4, Send, Sparkles, UtensilsCrossed, Car, Globe2,
  PlaneTakeoff, KeyRound,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import MetaTags from '@/components/seo/MetaTags';
import {
  CONCIERGE_CONTATO, CONCIERGE_MEDIA, ETAPAS, PILARES, PRACAS, TEXTOS,
} from '@/data/conciergeContent';

const ICONES = {
  casas: HomeIcon,
  logistica: Car,
  gastronomia: UtensilsCrossed,
  eventos: Music4,
  aviacao: PlaneTakeoff,
  imoveis: KeyRound,
};

const FORM_INICIAL = {
  nome: '', whatsapp: '', email: '', origem: '', destino: '',
  periodo: '', grupo: '', servico: '', mensagem: '', consent: false,
  necessidades: [],
};

/** Campo de texto reutilizado no formulário VIP. */
function Campo({ label, children }) {
  return (
    <label className="block">
      <span className="block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputCls =
  'w-full rounded-brand-md border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 ' +
  'placeholder:text-slate-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20';

export default function ConciergePage() {
  const [lang, setLang] = useState('pt');
  const t = TEXTOS[lang];
  const [form, setForm] = useState(FORM_INICIAL);
  const [status, setStatus] = useState('idle');
  const [aviso, setAviso] = useState('');

  const toggleNecessidade = (item) => () => {
    setForm((s) => ({
      ...s,
      necessidades: s.necessidades.includes(item)
        ? s.necessidades.filter((n) => n !== item)
        : [...s.necessidades, item],
    }));
  };

  const set = (chave) => (e) => {
    const valor = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((s) => ({ ...s, [chave]: valor }));
  };

  const utms = useMemo(() => {
    if (typeof window === 'undefined') return {};
    const p = new URLSearchParams(window.location.search);
    return {
      utm_source: p.get('utm_source') || undefined,
      utm_medium: p.get('utm_medium') || undefined,
      utm_campaign: p.get('utm_campaign') || undefined,
      utm_content: p.get('utm_content') || undefined,
      utm_term: p.get('utm_term') || undefined,
    };
  }, []);

  const enviar = async (e) => {
    e.preventDefault();
    if (!form.consent) { setAviso(t.consentObrigatorio); return; }
    setAviso('');
    setStatus('loading');
    try {
      await base44.entities.Lead.create({
        name: form.nome,
        phone: form.whatsapp,
        email: form.email || undefined,
        source: 'site',
        consent: true,
        consent_at: new Date().toISOString(),
        service_interest: form.servico || 'Concierge de alto padrão',
        location: form.destino || undefined,
        profile_type: 'cliente',
        // Tag oficial de segmentação do lead VIP.
        category_interest: 'concierge_vip_lead',
        origem: 'pagina-concierge',
        message: form.mensagem || undefined,
        notas: [
          `Origem do cliente: ${form.origem || 'não informado'}`,
          `Período: ${form.periodo || 'não informado'}`,
          `Pessoas: ${form.grupo || 'não informado'}`,
          `Idioma da página: ${lang}`,
          form.necessidades.length ? `Necessidades VIP: ${form.necessidades.join(', ')}` : null,
        ].filter(Boolean).join(' · '),
        lead_status: 'new',
        ...utms,
      });
      setStatus('success');
      setForm(FORM_INICIAL);
    } catch {
      setStatus('error');
      setAviso(t.erro);
    }
  };

  const temGaleria = CONCIERGE_MEDIA.galeriaTrabalhos.length > 0;
  const temGaleriaDj = CONCIERGE_MEDIA.galeriaDj.length > 0;

  return (
    <div className="bg-white">
      <MetaTags
        title="Concierge de Alto Padrão — Presencial em Todo o Brasil"
        description="Concierge 100% presencial de alto padrão em qualquer destino do Brasil: mansões e vilas exclusivas, aviação executiva e helicóptero, receptivo de aeroporto, chef particular, equipe de casa e eventos privados. Matriz em Trancoso, equipes presenciais em São Paulo, Rio de Janeiro e sob demanda. Atendimento em português, espanhol e inglês."
      />

      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden bg-slate-900">
        {CONCIERGE_MEDIA.heroPrincipal && (
          <img
            src={CONCIERGE_MEDIA.heroPrincipal}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-40"
            loading="eager"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/95 via-slate-900/85 to-slate-900/60" />

        <div className="relative mx-auto max-w-6xl px-5 py-16 sm:py-24">
          <div className="flex justify-end mb-8">
            <div className="inline-flex rounded-full border border-white/20 bg-white/10 p-0.5 backdrop-blur">
              {['pt', 'es'].map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLang(l)}
                  className={`rounded-full px-3.5 py-1 text-xs font-bold uppercase tracking-wider transition ${
                    lang === l ? 'bg-white text-slate-900' : 'text-white/70 hover:text-white'
                  }`}
                >
                  {l === 'pt' ? 'PT' : 'ES'}
                </button>
              ))}
            </div>
          </div>

          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-orange-400/40 bg-orange-500/15 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-orange-200">
              <Sparkles className="h-3.5 w-3.5" />
              {t.eyebrow}
            </span>

            <h1 className="mt-5 text-3xl font-black leading-[1.1] text-white sm:text-5xl">
              {t.h1}
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
              {t.sub}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#solicitar"
                className="inline-flex items-center justify-center gap-2 rounded-brand-md bg-orange-600 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-orange-700"
              >
                {t.ctaPrimario}
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href={CONCIERGE_CONTATO.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-brand-md border border-white/25 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/10"
              >
                {t.ctaSecundario}
              </a>
            </div>

            <p className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-slate-400">
              <Globe2 className="h-3.5 w-3.5" />
              {t.idiomas}
            </p>
          </div>
        </div>
      </section>

      {/* ===== PRAÇAS PRESENCIAIS ===== */}
      <section className="mx-auto max-w-6xl px-5 py-14 sm:py-20">
        <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">{t.pracasTitulo}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
          {t.pracasSub}
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PRACAS.map((p) => (
            <div
              key={p.cidade}
              className={`rounded-brand-lg border p-5 ${
                p.destaque
                  ? 'border-orange-300 bg-orange-50'
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              {p.destaque ? (
                <Globe2 className="h-4 w-4 text-orange-600" />
              ) : (
                <MapPin className="h-4 w-4 text-orange-600" />
              )}
              <p className="mt-3 text-base font-bold text-slate-900">
                {p.cidade} <span className="text-slate-400">· {p.uf}</span>
              </p>
              {p.matriz && (
                <span className="mt-1.5 inline-block rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  Matriz
                </span>
              )}
              <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{p.nota}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-brand-lg border border-slate-200 p-6 sm:p-8">
          <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-slate-500">
            {t.perfilTitulo}
          </h3>
          <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
            {t.perfilItens.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-slate-700">
                <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-orange-600" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ===== QUEM COMANDA A EXPERIÊNCIA ===== */}
      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
            <div>
              {CONCIERGE_MEDIA.retratoFundador ? (
                <img
                  src={CONCIERGE_MEDIA.retratoFundador}
                  alt="Antonio Monteiro Pereira Junior — Toca Experience"
                  className="aspect-[4/5] w-full rounded-brand-xl object-cover shadow-brand"
                  loading="lazy"
                />
              ) : (
                <div className="flex aspect-[4/5] w-full items-center justify-center rounded-brand-xl border-2 border-dashed border-slate-300 bg-white p-6 text-center">
                  <p className="text-xs font-semibold leading-relaxed text-slate-400">
                    Espaço reservado para a foto real do fundador
                  </p>
                </div>
              )}
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-orange-600">
                {t.fundadorEyebrow}
              </span>
              <h2 className="mt-3 text-2xl font-black leading-tight text-slate-900 sm:text-3xl">
                {t.fundadorTitulo}
              </h2>
              <p className="mt-5 text-sm leading-relaxed text-slate-600 sm:text-base">
                {t.fundadorTexto}
              </p>
              <a
                href={CONCIERGE_CONTATO.siteToca}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-orange-600 hover:text-orange-700"
              >
                {t.fundadorCta}
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PILARES ===== */}
      <section className="mx-auto max-w-6xl px-5 py-14 sm:py-20">
        <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-orange-600">
          {t.pilaresEyebrow}
        </span>
        <h2 className="mt-3 text-2xl font-black text-slate-900 sm:text-3xl">{t.pilaresTitulo}</h2>

        <div className="mt-9 grid gap-5 sm:grid-cols-2">
          {PILARES.map((pilar) => {
            const Icone = ICONES[pilar.id] || Sparkles;
            return (
              <div key={pilar.id} className="rounded-brand-lg border border-slate-200 p-6 sm:p-7">
                <div className="flex h-11 w-11 items-center justify-center rounded-brand-md bg-orange-50">
                  <Icone className="h-5 w-5 text-orange-600" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-900">{pilar.titulo[lang]}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{pilar.resumo[lang]}</p>
                <ul className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                  {pilar.itens[lang].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-orange-600" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== COMO FUNCIONA ===== */}
      <section className="border-y border-slate-200 bg-slate-900">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:py-20">
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-orange-400">
            {t.etapasEyebrow}
          </span>
          <h2 className="mt-3 text-2xl font-black text-white sm:text-3xl">{t.etapasTitulo}</h2>

          <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {ETAPAS.map((etapa) => (
              <div key={etapa.n} className="rounded-brand-lg border border-white/10 bg-white/[0.04] p-6">
                <span className="text-2xl font-black text-orange-400">{etapa.n}</span>
                <h3 className="mt-3 text-base font-bold text-white">{etapa.titulo[lang]}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{etapa.texto[lang]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== GALERIAS DE TRABALHOS REAIS ===== */}
      <section className="mx-auto max-w-6xl px-5 py-14 sm:py-20">
        <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">{t.galeriaTitulo}</h2>
        <p className="mt-3 text-sm text-slate-600">{t.galeriaSub}</p>

        {temGaleria ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CONCIERGE_MEDIA.galeriaTrabalhos.map((foto) => (
              <figure key={foto.src} className="overflow-hidden rounded-brand-lg border border-slate-200">
                <img src={foto.src} alt={foto.alt} className="aspect-[4/3] w-full object-cover" loading="lazy" />
                {foto.local && (
                  <figcaption className="px-4 py-3 text-xs font-semibold text-slate-500">{foto.local}</figcaption>
                )}
              </figure>
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-brand-lg border-2 border-dashed border-slate-300 p-10 text-center">
            <p className="text-sm font-semibold text-slate-400">{t.galeriaVazia}</p>
          </div>
        )}

        {temGaleriaDj && (
          <div className="mt-14">
            <h3 className="text-xl font-black text-slate-900">{t.djTitulo}</h3>
            <p className="mt-2 text-sm text-slate-600">{t.djSub}</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {CONCIERGE_MEDIA.galeriaDj.map((foto) => (
                <figure key={foto.src} className="overflow-hidden rounded-brand-lg border border-slate-200">
                  <img src={foto.src} alt={foto.alt} className="aspect-[4/3] w-full object-cover" loading="lazy" />
                  {foto.local && (
                    <figcaption className="px-4 py-3 text-xs font-semibold text-slate-500">{foto.local}</figcaption>
                  )}
                </figure>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ===== FORMULÁRIO VIP ===== */}
      <section id="solicitar" className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-3xl px-5 py-14 sm:py-20">
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-orange-600">
            {t.formEyebrow}
          </span>
          <h2 className="mt-3 text-2xl font-black text-slate-900 sm:text-3xl">{t.formTitulo}</h2>
          <p className="mt-3 text-sm text-slate-600">{t.formSub}</p>

          {status === 'success' ? (
            <div className="mt-8 rounded-brand-lg border border-emerald-200 bg-emerald-50 p-8 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
              <p className="mt-3 text-base font-bold text-emerald-900">{t.sucesso}</p>
              <a
                href={CONCIERGE_CONTATO.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 rounded-brand-md bg-orange-600 px-5 py-3 text-sm font-bold text-white hover:bg-orange-700"
              >
                {t.ctaSecundario}
              </a>
            </div>
          ) : (
            <form onSubmit={enviar} className="mt-8 space-y-4 rounded-brand-lg border border-slate-200 bg-white p-6 sm:p-8">
              <div className="grid gap-4 sm:grid-cols-2">
                <Campo label={t.labels.nome}>
                  <input required value={form.nome} onChange={set('nome')} className={inputCls} />
                </Campo>
                <Campo label={t.labels.whatsapp}>
                  <input
                    required value={form.whatsapp} onChange={set('whatsapp')}
                    placeholder="+54 9 11 ... / +55 11 ..." className={inputCls}
                  />
                </Campo>
                <Campo label={t.labels.email}>
                  <input type="email" value={form.email} onChange={set('email')} className={inputCls} />
                </Campo>
                <Campo label={t.labels.origem}>
                  <select required value={form.origem} onChange={set('origem')} className={inputCls}>
                    <option value="">—</option>
                    {t.origens.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </Campo>
                <Campo label={t.labels.destino}>
                  <input
                    value={form.destino} onChange={set('destino')}
                    placeholder="Ex.: São Paulo/SP, Angra dos Reis/RJ, Trancoso/BA..."
                    list="destinos-brasil" className={inputCls}
                  />
                  <datalist id="destinos-brasil">
                    {['São Paulo/SP','Rio de Janeiro/RJ','Trancoso/BA','Angra dos Reis/RJ','Búzios/RJ','Florianópolis/SC','Balneário Camboriú/SC','Porto Seguro/BA','Fernando de Noronha/PE','Jericoacoara/CE','Alto Paraíso/GO','Campos do Jordão/SP'].map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </Campo>
                <Campo label={t.labels.periodo}>
                  <div className="relative">
                    <input value={form.periodo} onChange={set('periodo')} placeholder="20–25 Nov" className={inputCls} />
                    <CalendarDays className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
                </Campo>
                <Campo label={t.labels.grupo}>
                  <input type="number" min="1" value={form.grupo} onChange={set('grupo')} className={inputCls} />
                </Campo>
                <Campo label={t.labels.servico}>
                  <select value={form.servico} onChange={set('servico')} className={inputCls}>
                    <option value="">—</option>
                    {t.servicos.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Campo>
              </div>

              <fieldset className="rounded-brand-md border border-slate-200 bg-slate-50 p-4">
                <legend className="px-1 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                  {t.necessidadesLabel}
                </legend>
                <div className="mt-1 space-y-2.5">
                  {t.necessidades.map((item) => (
                    <label key={item} className="flex items-start gap-2.5 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={form.necessidades.includes(item)}
                        onChange={toggleNecessidade(item)}
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                      />
                      {item}
                    </label>
                  ))}
                </div>
              </fieldset>

              <Campo label={t.labels.mensagem}>
                <textarea rows={4} value={form.mensagem} onChange={set('mensagem')} className={inputCls} />
              </Campo>

              <label className="flex items-start gap-3 text-xs leading-relaxed text-slate-600">
                <input
                  type="checkbox" checked={form.consent} onChange={set('consent')}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                />
                {t.labels.consent}
              </label>

              {aviso && <p className="text-xs font-semibold text-red-600">{aviso}</p>}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="inline-flex w-full items-center justify-center gap-2 rounded-brand-md bg-orange-600 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-orange-700 disabled:opacity-60"
              >
                {status === 'loading'
                  ? <><Loader2 className="h-4 w-4 animate-spin" />{t.labels.enviando}</>
                  : <><Send className="h-4 w-4" />{t.labels.enviar}</>}
              </button>

              <p className="text-center text-[11px] text-slate-400">
                {CONCIERGE_CONTATO.whatsapp} · {CONCIERGE_CONTATO.email}
              </p>
            </form>
          )}

          <p className="mt-8 text-center text-xs text-slate-500">
            <Link to="/" className="font-semibold text-orange-600 hover:text-orange-700">
              Trancoso Resolve
            </Link>{' '}
            · Vitrine Oficial de Serviços e Profissionais da Costa do Descobrimento
          </p>
        </div>
      </section>
    </div>
  );
}
