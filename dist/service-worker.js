/**
 * Trancoso Resolve — Service Worker PWA
 *
 * CORRIGIDO: STATIC_ASSETS não lista mais caminhos de dev (/src/main.jsx,
 * /src/index.css) que não existem em produção. O Vite gera assets com hash
 * em /assets/. Cacheamos apenas a shell do app.
 *
 * Estratégia: Network First com fallback para cache.
 * Assets com hash no nome são imutáveis e podem ser cacheados por tempo indeterminado.
 */

const CACHE_VERSION = 'trancoso-resolve-v3';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/robots.txt'
];

// ── Install: pré-cacheia a shell estática ──────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        // Falha silenciosa para não bloquear o install
        console.warn('[SW] Falha ao pré-cachear assets estáticos:', err);
      });
    })
  );
  // Ativa imediatamente sem esperar a aba ser fechada
  self.skipWaiting();
});

// ── Activate: limpa caches de versões antigas ──────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_VERSION)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// ── Fetch: Network First, fallback para cache ──────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Ignora requisições não-GET
  if (request.method !== 'GET') return;

  // Ignora extensões do Chrome
  if (request.url.startsWith('chrome-extension://')) return;

  // Ignora chamadas de API/funções (sempre network)
  const url = new URL(request.url);
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/functions/')
  ) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Não cacheia respostas com erro
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        // Clona e cacheia assets estáticos com hash (imutáveis)
        const isHashedAsset = url.pathname.match(/\/assets\/.+\.[a-f0-9]{8,}\.(js|css|woff2?)$/);
        const isShellAsset = STATIC_ASSETS.includes(url.pathname);

        if (isHashedAsset || isShellAsset) {
          const responseClone = response.clone();
          caches.open(CACHE_VERSION).then((cache) => {
            cache.put(request, responseClone);
          });
        }

        return response;
      })
      .catch(() => {
        // Sem rede: retorna do cache
        return caches.match(request).then((cached) => {
          if (cached) return cached;
          // Fallback final: retorna a shell do app para navegação SPA
          if (request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          return new Response('Offline', { status: 503 });
        });
      })
  );
});

// ── Push Notifications (uso futuro) ───────────────────────────────────────
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    self.registration.showNotification(data.title || 'Trancoso Resolve', {
      body: data.body || '',
      icon: 'https://media.base44.com/images/public/68eb21726a9614db4a82ba99/866729f3e_trancoso_resolve_logo_principal.png',
      badge: 'https://media.base44.com/images/public/68eb21726a9614db4a82ba99/855e7dab6_logo-mark.svg'
    });
  }
});
