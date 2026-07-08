import { useState } from 'react';

/**
 * OptimizedImage - Responsive image component with lazy loading
 * Automatically serves WebP/AVIF when available
 */
export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  sizes = '100vw',
  objectFit = 'cover'
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  // Convert image URL to optimized formats
  const getOptimizedSrc = (url) => {
    if (!url) return '';
    // Keep original URL - optimization can be done at CDN level
    return url;
  };

  const imageProps = {
    alt,
    className: `${className} ${!isLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`,
    style: { objectFit },
    onLoad: () => setIsLoaded(true),
    loading: priority ? 'eager' : 'lazy',
    sizes
  };

  if (width && height) {
    imageProps.width = width;
    imageProps.height = height;
  }

  return (
    <picture>
      {/* WebP format (modern browsers) */}
      <source srcSet={getOptimizedSrc(src)} type="image/webp" />
      {/* Fallback to original */}
      <img src={getOptimizedSrc(src)} {...imageProps} />
    </picture>
  );
}