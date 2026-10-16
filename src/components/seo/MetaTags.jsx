import { useEffect } from 'react';

/**
 * MetaTags — cabeçalho SEO da página via DOM direto.
 *
 * IMPORTANTE (hotfix 11/09/2026): a versão anterior usava `react-helmet-async`
 * SEM `HelmetProvider` na raiz do app, o que derrubava a página inteira no
 * ErrorBoundary em produção ("Cannot read properties of undefined (reading
 * 'add')" — crash em /Concierge e /Investidores). Para eliminar a dependência
 * e o risco de contexto, gerenciamos as tags do <head> com DOM puro.
 */
export default function MetaTags({
  title = "Trancoso Resolve | Encontre os Melhores Serviços",
  description = "A forma mais fácil de encontrar e contratar serviços de confiança em Trancoso, Bahia.",
  image = "https://media.base44.com/images/public/68eb21726a9614db4a82ba99/322d721b1_tocaapresenta.jpg",
  url = typeof window !== 'undefined' ? window.location.href : '',
  type = "website"
}) {
  const fullTitle = title.includes('Trancoso Resolve') ? title : `${title} | Trancoso Resolve`;

  // Segurança (painel Base44 16/10): valores dinâmicos jamais podem quebrar o
  // atributo e injetar tags no <head> (meta refresh/base/tag injection).
  const esc = (v) => String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
  const safeDescription = esc(description);
  const safeTitle = esc(fullTitle);
  const safeImage = esc(image);
  const safeUrl = esc(url);
  const safeType = esc(type);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = fullTitle;

    const tags = [
      { selector: 'meta[name="description"]', html: '<meta name="description" content="' + safeDescription + '">' },
      { selector: 'meta[property="og:title"]', html: '<meta property="og:title" content="' + safeTitle + '">' },
      { selector: 'meta[property="og:description"]', html: '<meta property="og:description" content="' + safeDescription + '">' },
      { selector: 'meta[property="og:image"]', html: '<meta property="og:image" content="' + safeImage + '">' },
      { selector: 'meta[property="og:url"]', html: '<meta property="og:url" content="' + safeUrl + '">' },
      { selector: 'meta[property="og:type"]', html: '<meta property="og:type" content="' + safeType + '">' },
      { selector: 'meta[property="og:locale"]', html: '<meta property="og:locale" content="pt_BR">' },
      { selector: 'meta[name="twitter:card"]', html: '<meta name="twitter:card" content="summary_large_image">' },
      { selector: 'meta[name="twitter:site"]', html: '<meta name="twitter:site" content="@trancosoresolve">' },
      { selector: 'meta[name="twitter:title"]', html: '<meta name="twitter:title" content="' + safeTitle + '">' },
      { selector: 'meta[name="twitter:description"]', html: '<meta name="twitter:description" content="' + safeDescription + '">' },
      { selector: 'meta[name="twitter:image"]', html: '<meta name="twitter:image" content="' + safeImage + '">' },
      { selector: 'link[rel="canonical"]', html: '<link rel="canonical" href="' + safeUrl + '">' },
    ];

    const inserted = [];
    tags.forEach(({ selector, html }) => {
      let el = document.head.querySelector(selector);
      if (el) {
        el.outerHTML = html;
      } else {
        const container = document.createElement('div');
        container.innerHTML = html;
        el = container.firstElementChild;
        document.head.appendChild(el);
        inserted.push(el);
      }
    });

    return () => {
      inserted.forEach((el) => el && el.remove());
      document.title = previousTitle;
    };
  }, [fullTitle, description, image, url, type]);

  return null;
}
