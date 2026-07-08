import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Cache em memória para traduções (máx 500 entradas)
const translationCache = new Map();

const languageNames = {
  'pt': 'Portuguese',
  'en': 'English',
  'es': 'Spanish',
  'fr': 'French'
};

async function getTranslation(base44, text, sourceLanguage, targetLanguage) {
  if (sourceLanguage === targetLanguage) return text;

  const cacheKey = `${text}|${sourceLanguage}|${targetLanguage}`;
  if (translationCache.has(cacheKey)) {
    console.log(`[TRANSLATE CACHE HIT] ${sourceLanguage}→${targetLanguage}`);
    return translationCache.get(cacheKey);
  }

  try {
    const sourceLang = languageNames[sourceLanguage] || sourceLanguage;
    const targetLang = languageNames[targetLanguage] || targetLanguage;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Translate the following text from ${sourceLang} to ${targetLang}. Return ONLY the translated text, nothing else, no explanations.\n\nText: ${text}`,
    });

    const translated = typeof result === 'string' ? result.trim() : text;

    if (translationCache.size >= 500) {
      const firstKey = translationCache.keys().next().value;
      translationCache.delete(firstKey);
    }
    translationCache.set(cacheKey, translated);

    console.log(`[TRANSLATE] ${sourceLanguage}→${targetLanguage}: OK`);
    return translated;
  } catch (error) {
    console.error('[TRANSLATE ERROR]', error.message);
    return text;
  }
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const { text, sourceLanguage, targetLanguage } = await req.json();

    if (!text || !sourceLanguage || !targetLanguage) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const translated = await getTranslation(base44, text, sourceLanguage, targetLanguage);

    return Response.json({
      success: true,
      original: text,
      translated,
      sourceLanguage,
      targetLanguage,
      cacheSize: translationCache.size
    });
  } catch (error) {
    console.error('[TOCA-TRIA-TRANSLATOR] Error:', error);
    return Response.json({ error: 'Translation error', details: error.message }, { status: 500 });
  }
});