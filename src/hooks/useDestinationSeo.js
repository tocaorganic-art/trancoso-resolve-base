import { useEffect } from 'react';

export function useDestinationSeo({ title, description, canonical, schemaId, schema }) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;

    let metaDesc = document.querySelector('meta[name="description"]');
    const metaWasNew = !metaDesc;
    if (!metaDesc) { metaDesc = document.createElement('meta'); metaDesc.name = 'description'; document.head.appendChild(metaDesc); }
    const prevDesc = metaDesc.content;
    metaDesc.content = description;

    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) { ogTitle = document.createElement('meta'); ogTitle.setAttribute('property', 'og:title'); document.head.appendChild(ogTitle); }
    const prevOgTitle = ogTitle.content;
    ogTitle.content = title;

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (!ogDesc) { ogDesc = document.createElement('meta'); ogDesc.setAttribute('property', 'og:description'); document.head.appendChild(ogDesc); }
    const prevOgDesc = ogDesc.content;
    ogDesc.content = description;

    let canonicalEl = document.querySelector('link[rel="canonical"]');
    const canonicalWasNew = !canonicalEl;
    if (!canonicalEl) { canonicalEl = document.createElement('link'); canonicalEl.rel = 'canonical'; document.head.appendChild(canonicalEl); }
    const prevCanonical = canonicalEl.href;
    canonicalEl.href = canonical;

    const existingSchema = document.getElementById(schemaId);
    if (existingSchema) existingSchema.remove();
    const schemaEl = document.createElement('script');
    schemaEl.id = schemaId;
    schemaEl.type = 'application/ld+json';
    schemaEl.text = JSON.stringify(schema);
    document.head.appendChild(schemaEl);

    return () => {
      document.title = prevTitle;

      metaDesc.content = prevDesc;
      if (metaWasNew) metaDesc.remove();

      ogTitle.content = prevOgTitle;
      ogDesc.content = prevOgDesc;

      if (canonicalWasNew) {
        canonicalEl.remove();
      } else {
        canonicalEl.href = prevCanonical;
      }

      const s = document.getElementById(schemaId);
      if (s) s.remove();
    };
  // Deps intentionally empty: runs once on mount, restores on unmount.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
