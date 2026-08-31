import '@testing-library/jest-dom';

// Mock matchMedia (não existe no jsdom)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock IntersectionObserver (não existe no jsdom)
// eslint-disable-next-line no-undef
global.IntersectionObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};