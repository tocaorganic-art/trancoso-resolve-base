import { useEffect } from 'react';

const BASE_URL = 'https://www.trancosoresolve.com.br';

export function useSEO({ title, description, canonical, ogImage, noIndex = false }) {
  useEffect(() => {
    const fullTitle = title.includes('Trancoso Resolve') ? title : `${title} | Trancoso Resolve`;
    const canonicalHref = canonical ? `${BASE_URL}${canonical}` : null;

    const snapMeta = (sel) => document.querySelector(sel)?.content ?? null;
    const snapHref = (sel) => document.querySelector(sel)?.href ?? null;

    const prev = {
      title: document.title,
      desc: snapMeta('meta[name="description"]'),
      robots: snapMeta('meta[name="robots"]'),
      ogTitle: snapMeta('meta[property="og:title"]'),
      ogDesc: snapMeta('meta[property="og:description"]'),
      ogUrl: snapMeta('meta[property="og:url"]'),
      ogImage: snapMeta('meta[property="og:image"]'),
      twTitle: snapMeta('meta[name="twitter:title"]'),
      twDesc: snapMeta('meta[name="twitter:description"]'),
      canonical: snapHref('link[rel="canonical"]'),
    };

    document.title = fullTitle;
    setMeta('name', 'description', description);
    setMeta('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow');
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', description);
    if (canonicalHref) setMeta('property', 'og:url', canonicalHref);
    if (ogImage) setMeta('property', 'og:image', ogImage);
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', description);
    if (ogImage) setMeta('name', 'twitter:image', ogImage);

    let canonicalEl = document.querySelector('link[rel="canonical"]');
    const canonWasNew = !canonicalEl;
    if (canonicalHref) {
      if (!canonicalEl) {
        canonicalEl = document.createElement('link');
        canonicalEl.rel = 'canonical';
        document.head.appendChild(canonicalEl);
      }
      canonicalEl.href = canonicalHref;
    }

    return () => {
      document.title = prev.title;
      if (prev.desc !== null) setMeta('name', 'description', prev.desc);
      if (prev.robots !== null) setMeta('name', 'robots', prev.robots);
      if (prev.ogTitle !== null) setMeta('property', 'og:title', prev.ogTitle);
      if (prev.ogDesc !== null) setMeta('property', 'og:description', prev.ogDesc);
      if (prev.ogUrl !== null) setMeta('property', 'og:url', prev.ogUrl);
      if (prev.ogImage !== null) setMeta('property', 'og:image', prev.ogImage);
      if (prev.twTitle !== null) setMeta('name', 'twitter:title', prev.twTitle);
      if (prev.twDesc !== null) setMeta('name', 'twitter:description', prev.twDesc);
      if (canonicalEl) {
        if (canonWasNew) canonicalEl.remove();
        else if (prev.canonical) canonicalEl.href = prev.canonical;
      }
    };
  }, [title, description, canonical, ogImage, noIndex]);
}

function setMeta(attr, name, content) {
  const selector = attr === 'property' ? `meta[property="${name}"]` : `meta[name="${name}"]`;
  let el = document.querySelector(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}
