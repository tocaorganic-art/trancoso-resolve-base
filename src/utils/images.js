export function getWebPUrl(jpgUrl) {
  // DESATIVADO: trocar a extensão .png/.jpg por .webp gera URLs que NÃO existem
  // (manuscdn 403, media.base44.com 404), quebrando o <picture> do LazyImage e
  // exibindo o ícone de imagem quebrada nos cards da Home. Nenhum domínio usado
  // pelo projeto serve variantes .webp por troca de extensão. Só reativar quando
  // houver um domínio que realmente suporte isso.
  return null;
}

export function getImageFormats(url) {
  const webpUrl = getWebPUrl(url);
  return {
    original: url,
    webp: webpUrl,
    hasWebp: !!webpUrl
  };
}
