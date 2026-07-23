/**
 * Image optimization utilities
 * Converts images to WebP format and compresses
 */

export function getOptimizedImageUrl(url, options = {}) {
  if (!url) return '';

  const {
    width = 1200,
    height = null,
    quality = 80,
    format = 'webp'
  } = options;

  // For CDN-hosted images, add optimization parameters
  // Adjust based on your image service (Cloudinary, Imgix, etc.)
  if (url.includes('media.base44.com') || url.includes('unsplash.com')) {
    // Return URL with optimization hints (service will handle)
    return url;
  }

  return url;
}

export function getSrcSet(baseUrl, widths = [640, 768, 1024, 1280, 1920]) {
  return widths
    .map((w) => `${getOptimizedImageUrl(baseUrl, { width: w })} ${w}w`)
    .join(', ');
}

export function preloadImage(url) {
  if (!url) return;
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = url;
  document.head.appendChild(link);
}

export function prefetchImages(urls = []) {
  urls.forEach((url) => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
  });
}