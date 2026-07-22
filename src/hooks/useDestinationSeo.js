import { useEffect } from 'react';

export function useDestinationSeo({ title, description, canonical, schemaId, schema, noIndex = false }) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;

    const snapMeta = (selector) => document.querySelector(selector)?.content;
    const snapHref = (selector) => document.querySelector(selector)?.href;

    const prev = {
      desc: snapMeta('meta[name="description"]'),
      robots: snapMeta('meta[name="robots"]'),
      ogTitle: snapMeta('meta[property="og:title"]'),
      ogDesc: snapMeta('meta[property="og:description"]'),
      ogUrl: snapMeta('meta[property="og:url"]'),
      twTitle: snapMeta('meta[name="twitter:title"]'),
      twDesc: snapMeta('meta[name="twitter:description"]'),
      canonical: snapHref('link[rel="canonical"]'),
    };

    setMeta('name', 'description', description);
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', canonical);
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow');

    let canonicalEl = document.querySelector('link[rel="canonical"]');
    const canonicalWasNew = !canonicalEl;
    if (!canonicalEl) {
      canonicalEl = document.createElement('link');
      canonicalEl.rel = 'canonical';
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.href = canonical;

    const existingSchema = schemaId ? document.getElementById(schemaId) : null;
    if (existingSchema) existingSchema.remove();
    if (schemaId && schema) {
      const schemaEl = document.createElement('script');
      schemaEl.id = schemaId;
      schemaEl.type = 'application/ld+json';
      schemaEl.text = JSON.stringify(schema);
      document.head.appendChild(schemaEl);
    }

    return () => {
      document.title = prevTitle;

      if (prev.desc !== undefined) setMeta('name', 'description', prev.desc);
      if (prev.robots !== undefined) setMeta('name', 'robots', prev.robots);
      if (prev.ogTitle !== undefined) setMeta('property', 'og:title', prev.ogTitle);
      if (prev.ogDesc !== undefined) setMeta('property', 'og:description', prev.ogDesc);
      if (prev.ogUrl !== undefined) setMeta('property', 'og:url', prev.ogUrl);
      if (prev.twTitle !== undefined) setMeta('name', 'twitter:title', prev.twTitle);
      if (prev.twDesc !== undefined) setMeta('name', 'twitter:description', prev.twDesc);

      if (canonicalWasNew) {
        canonicalEl.remove();
      } else if (prev.canonical) {
        canonicalEl.href = prev.canonical;
      }

      if (schemaId) {
        const s = document.getElementById(schemaId);
        if (s) s.remove();
      }
    };
  }, []); // deps intencionalmente vazias: executa uma vez por mount/unmount
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
