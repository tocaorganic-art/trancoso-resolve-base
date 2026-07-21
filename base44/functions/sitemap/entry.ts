import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const BASE_URL = 'https://trancosoresolve.com.br';

/**
 * ROTAS ESTÁTICAS DO SITEMAP
 *
 * IMPORTANTE: Os caminhos aqui DEVEM corresponder exatamente às rotas
 * declaradas no React Router (src/App.jsx e src/pages.config.js).
 *
 * CORRIGIDO (2026-07): URLs institucionais ajustadas para usar as
 * rotas reais do app (PascalCase / caminhos exatos do React Router).
 * As versões em kebab-case anteriores geravam 404 no Google.
 *
 * Mapeamento corrigido:
 *   /seja-prestador      → /SejaPrestador
 *   /como-funciona       → /ComoFunciona
 *   /planos              → /Planos
 *   /sobre               → /About
 *   /contato             → /Contact
 *   /politica-privacidade → /PoliticaPrivacidade
 */
const staticPages = [
  // === PÁGINAS INSTITUCIONAIS PÚBLICAS ===
  { path: '/',                    priority: '1.0', changefreq: 'daily'   },
  { path: '/ServicosCategoria',   priority: '0.9', changefreq: 'daily'   },
  { path: '/SejaPrestador',       priority: '0.9', changefreq: 'weekly'  },
  { path: '/ComoFunciona',        priority: '0.8', changefreq: 'monthly' },
  { path: '/Seguranca',           priority: '0.7', changefreq: 'monthly' },
  { path: '/Planos',              priority: '0.9', changefreq: 'weekly'  },
  { path: '/About',               priority: '0.7', changefreq: 'monthly' },
  { path: '/Contact',             priority: '0.7', changefreq: 'monthly' },
  { path: '/Assistentevirtual',   priority: '0.6', changefreq: 'monthly' },
  { path: '/PoliticaPrivacidade', priority: '0.3', changefreq: 'yearly'  },
  { path: '/TermosDeServico',     priority: '0.3', changefreq: 'yearly'  },
  { path: '/PoliticaDevolucoes',  priority: '0.3', changefreq: 'yearly'  },

  // === DESTINOS (hubs por cidade) ===
  { path: '/destinos/trancoso',       priority: '0.95', changefreq: 'weekly' },
  { path: '/destinos/porto-seguro',   priority: '0.95', changefreq: 'weekly' },
  { path: '/destinos/caraiva',        priority: '0.95', changefreq: 'weekly' },
  { path: '/destinos/arraial-dajuda', priority: '0.95', changefreq: 'weekly' },

  // === SERVIÇOS — TRANCOSO ===
  { path: '/servicos/diarista-trancoso',    priority: '0.9',  changefreq: 'weekly' },
  { path: '/servicos/eletricista-trancoso', priority: '0.9',  changefreq: 'weekly' },
  { path: '/servicos/piscineiro-trancoso',  priority: '0.9',  changefreq: 'weekly' },
  { path: '/servicos/pedreiro-trancoso',    priority: '0.9',  changefreq: 'weekly' },
  { path: '/servicos/pintor-trancoso',      priority: '0.9',  changefreq: 'weekly' },
  { path: '/servicos/jardineiro-trancoso',  priority: '0.9',  changefreq: 'weekly' },
  { path: '/servicos/encanador-trancoso',   priority: '0.9',  changefreq: 'weekly' },
  { path: '/servicos/chef-trancoso',        priority: '0.9',  changefreq: 'weekly' },
  { path: '/servicos/seguranca-trancoso',   priority: '0.9',  changefreq: 'weekly' },
  { path: '/servicos/motorista-trancoso',   priority: '0.9',  changefreq: 'weekly' },
  { path: '/servicos/quadrado-trancoso',    priority: '0.85', changefreq: 'weekly' },
  { path: '/servicos/rio-verde-trancoso',   priority: '0.85', changefreq: 'weekly' },
  { path: '/servicos/pitinga-trancoso',     priority: '0.85', changefreq: 'weekly' },

  // === SERVIÇOS — PORTO SEGURO ===
  { path: '/servicos/diarista-porto-seguro',    priority: '0.9', changefreq: 'weekly' },
  { path: '/servicos/eletricista-porto-seguro', priority: '0.9', changefreq: 'weekly' },
  { path: '/servicos/piscineiro-porto-seguro',  priority: '0.9', changefreq: 'weekly' },
  { path: '/servicos/cozinheiro-porto-seguro',  priority: '0.9', changefreq: 'weekly' },
  { path: '/servicos/jardineiro-porto-seguro',  priority: '0.9', changefreq: 'weekly' },
  { path: '/servicos/pedreiro-porto-seguro',    priority: '0.9', changefreq: 'weekly' },

  // === SERVIÇOS — CARAÍVA ===
  { path: '/servicos/diarista-caraiva',    priority: '0.9', changefreq: 'weekly' },
  { path: '/servicos/eletricista-caraiva', priority: '0.9', changefreq: 'weekly' },
  { path: '/servicos/piscineiro-caraiva',  priority: '0.9', changefreq: 'weekly' },
  { path: '/servicos/cozinheiro-caraiva',  priority: '0.9', changefreq: 'weekly' },
  { path: '/servicos/jardineiro-caraiva',  priority: '0.9', changefreq: 'weekly' },
  { path: '/servicos/pedreiro-caraiva',    priority: '0.9', changefreq: 'weekly' },

  // === SERVIÇOS — ARRAIAL D'AJUDA ===
  { path: '/servicos/diarista-arraial-dajuda',    priority: '0.9', changefreq: 'weekly' },
  { path: '/servicos/eletricista-arraial-dajuda', priority: '0.9', changefreq: 'weekly' },
  { path: '/servicos/piscineiro-arraial-dajuda',  priority: '0.9', changefreq: 'weekly' },
  { path: '/servicos/jardineiro-arraial-dajuda',  priority: '0.9', changefreq: 'weekly' },
  { path: '/servicos/pedreiro-arraial-dajuda',    priority: '0.9', changefreq: 'weekly' },
  { path: '/servicos/cozinheiro-arraial-dajuda',  priority: '0.9', changefreq: 'weekly' },
  { path: '/servicos/dj-trancoso',                priority: '0.9', changefreq: 'weekly' },

  // === GUIAS E CONTEÚDO EDITORIAL ===
  { path: '/guides/morar-em-trancoso',            priority: '0.8', changefreq: 'monthly' },

  // === PÁGINAS ESPECIAIS (CASAMENTO / EVENTOS) ===
  { path: '/destinos/casamento-trancoso',          priority: '0.9', changefreq: 'weekly' },
  { path: '/destinos/reveillon-trancoso',          priority: '0.9', changefreq: 'weekly' },

];

/**
 * Ocupações para gerar URLs de categoria.
 * Mantidas apenas as que têm rotas /servicos/* correspondentes.
 * URLs com ?cat= são mantidas para compatibilidade com busca interna,
 * mas NÃO são a fonte primária de indexação (as rotas /servicos/* são).
 */
const categoryOccupations = [
  'Limpeza', 'Eletricista', 'Encanador', 'Jardinagem',
  'Cozinheiro', 'Pedreiro', 'Pintor', 'Babá', 'Garçom', 'Piscineiro'
];

function escapeXml(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

Deno.serve(async (req: Request) => {
  try {
    const base44 = createClientFromRequest(req);

    let services: any[] = [];

    try {
      services = await base44.asServiceRole.entities.ServiceListing.filter(
        { active: true },
        '-updated_date',
        500
      );
    } catch (dataError: any) {
      console.warn('Sitemap: falha ao buscar ServiceListing:', dataError.message);
    }

    const today = new Date().toISOString().split('T')[0];
    const urls: string[] = [];

    // 1. Páginas estáticas (rotas reais do React Router)
    for (const page of staticPages) {
      urls.push(`
  <url>
    <loc>${BASE_URL}${page.path}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    <lastmod>${today}</lastmod>
  </url>`);
    }

    // 2. Páginas de categoria por ocupação (/ServicosCategoria?cat=X)
    //    Mantidas como URLs suplementares — as rotas /servicos/* são as principais
    for (const occ of categoryOccupations) {
      urls.push(`
  <url>
    <loc>${BASE_URL}/ServicosCategoria?cat=${escapeXml(encodeURIComponent(occ))}</loc>
    <changefreq>daily</changefreq>
    <priority>0.75</priority>
    <lastmod>${today}</lastmod>
  </url>`);
    }

    // 3. Categorias extras de ServiceListing que não estão no enum padrão
    const extraCats = [
      ...new Set((services || []).map((s: any) => s.category).filter(Boolean))
    ].filter((c: string) => !categoryOccupations.includes(c));

    for (const cat of extraCats) {
      urls.push(`
  <url>
    <loc>${BASE_URL}/ServicosCategoria?cat=${escapeXml(encodeURIComponent(cat))}</loc>
    <changefreq>daily</changefreq>
    <priority>0.70</priority>
    <lastmod>${today}</lastmod>
  </url>`);
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urls.join('')}
</urlset>`;

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Sitemap error:', error);
    return new Response('Error generating sitemap', { status: 500 });
  }
});
