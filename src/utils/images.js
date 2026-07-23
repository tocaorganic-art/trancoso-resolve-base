export function getWebPUrl(jpgUrl) {
  if (!jpgUrl) return null;
  if (jpgUrl.startsWith('http') && !jpgUrl.includes('ui-avatars')) {
    return jpgUrl.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  }
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
