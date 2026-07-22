export function isAccessibilityCompliant() {
  const issues = [];

  if (typeof document === 'undefined') return issues;

  const images = document.querySelectorAll('img:not([aria-hidden="true"])');
  images.forEach((img) => {
    if (!img.alt || img.alt.trim() === '') {
      issues.push(`Image missing alt text: ${img.src}`);
    }
  });

  const buttons = document.querySelectorAll('button');
  buttons.forEach((btn) => {
    const text = btn.textContent?.trim();
    const hasAriaLabel = btn.hasAttribute('aria-label');
    const isIcon = btn.querySelector('svg') && !text;
    if (isIcon && !hasAriaLabel) {
      issues.push(`Icon button missing aria-label`);
    }
  });

  const links = document.querySelectorAll('a');
  links.forEach((link) => {
    const text = link.textContent?.trim();
    const hasAriaLabel = link.hasAttribute('aria-label');
    if (!text && !hasAriaLabel) {
      issues.push(`Link missing accessible text: ${link.href}`);
    }
  });

  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const headingLevels = Array.from(headings).map(h => parseInt(h.tagName[1]));
  for (let i = 1; i < headingLevels.length; i++) {
    if (headingLevels[i] - headingLevels[i - 1] > 1) {
      issues.push(`Heading hierarchy broken at H${headingLevels[i]}`);
    }
  }

  return issues;
}

export function checkColorContrast(foreground, background) {
  const getLuminance = (color) => {
    const rgb = parseInt(color.substring(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;

    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return lum <= 0.03928 ? lum / 12.92 : Math.pow((lum + 0.055) / 1.055, 2.4);
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const contrast = l1 > l2 ? (l1 + 0.05) / (l2 + 0.05) : (l2 + 0.05) / (l1 + 0.05);

  return {
    ratio: contrast.toFixed(2),
    isAACompliant: contrast >= 4.5,
    isAAACompliant: contrast >= 7,
  };
}
