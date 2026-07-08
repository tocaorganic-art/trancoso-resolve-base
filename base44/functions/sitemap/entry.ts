import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const BASE_URL = 'https://trancosoresolve.com.br';

const staticPages = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/ServicosCategoria', priority: '0.9', changefreq: 'daily' },
  { path: '/SejaPrestador', priority: '0.8', changefreq: 'weekly' },
  { path: '/ComoFunciona', priority: '0.7', changefreq: 'monthly' },
  { path: '/Seguranca', priority: '0.7', changefreq: 'monthly' },
  { path: '/Planos', priority: '0.8', changefreq: 'weekly' },
  { path: '/Manual', priority: '0.5', changefreq: 'monthly' },
  { path: '/PoliticaPrivacidade', priority: '0.3', changefreq: 'yearly' },
  { path: '/About', priority: '0.8', changefreq: 'monthly' },
  { path: '/Contact', priority: '0.7', changefreq: 'monthly' },
  // Páginas de destino (hubs por cidade)
  { path: '/destinos/trancoso', priority: '0.95', changefreq: 'weekly' },
  { path: '/destinos/porto-seguro', priority: '0.95', changefreq: 'weekly' },
  { path: '/destinos/caraiva', priority: '0.95', changefreq: 'weekly' },
  { path: '/servicos/diarista-trancoso', priority: '0.9', changefreq: 'weekly' },
  { path: '/servicos/eletricista-trancoso', priority: '0.9', changefreq: 'weekly' },
  { path: '/servicos/piscineiro-trancoso', priority: '0.9', changefreq: 'weekly' },
  { path: '/servicos/pedreiro-trancoso', priority: '0.9', changefreq: 'weekly' },
  { path: '/servicos/pintor-trancoso', priority: '0.9', changefreq: 'weekly' },
  { path: '/servicos/jardineiro-trancoso', priority: '0.9', changefreq: 'weekly' },
  { path: '/servicos/encanador-trancoso', priority: '0.9', changefreq: 'weekly' },
  { path: '/servicos/chef-trancoso', priority: '0.9', changefreq: 'weekly' },
  { path: '/servicos/seguranca-trancoso', priority: '0.9', changefreq: 'weekly' },
  { path: '/servicos/motorista-trancoso', priority: '0.9', changefreq: 'weekly' },
  { path: '/servicos/quadrado-trancoso', priority: '0.85', changefreq: 'weekly' },
  { path: '/servicos/rio-verde-trancoso', priority: '0.85', changefreq: 'weekly' },
  { path: '/servicos/pitinga-trancoso', priority: '0.85', changefreq: 'weekly' },
  // Porto Seguro
  { path: '/servicos/diarista-porto-seguro', priority: '0.9', changefreq: 'weekly' },
  { path: '/servicos/eletricista-porto-seguro', priority: '0.9', changefreq: 'weekly' },
  { path: '/servicos/piscineiro-porto-seguro', priority: '0.9', changefreq: 'weekly' },
  { path: '/servicos/cozinheiro-porto-seguro', priority: '0.9', changefreq: 'weekly' },
  { path: '/servicos/jardineiro-porto-seguro', priority: '0.9', changefreq: 'weekly' },
  { path: '/servicos/pedreiro-porto-seguro', priority: '0.9', changefreq: 'weekly' },
  // Caraíva
  { path: '/servicos/diarista-caraiva', priority: '0.9', changefreq: 'weekly' },
  { path: '/servicos/eletricista-caraiva', priority: '0.9', changefreq: 'weekly' },
  { path: '/servicos/piscineiro-caraiva', priority: '0.9', changefreq: 'weekly' },
  { path: '/servicos/cozinheiro-caraiva', priority: '0.9', changefreq: 'weekly' },
  { path: '/servicos/jardineiro-caraiva', priority: '0.9', changefreq: 'weekly' },
  { path: '/servicos/pedreiro-caraiva', priority: '0.9', changefreq: 'weekly' },
];

// Landing pages SEO por categoria de serviço
const servicoSlugs = [
  'limpeza-trancoso',
  'eletricista-trancoso',
  'encanador-trancoso',
  'jardinagem-trancoso',
  'cozinheiro-trancoso',
  'pedreiro-trancoso',
  'pintor-trancoso',
  'baba-trancoso',
  'garcom-trancoso',
];

const categoryOccupations = [
  'Limpeza', 'Eletricista', 'Encanador', 'Jardinagem',
  'Cozinheiro', 'Pedreiro', 'Pintor', 'Babá', 'Garçom'
];

function formatDate(dateStr) {
  if (!dateStr) return new Date().toISOString().split('T')[0];
  return new Date(dateStr).toISOString().split('T')[0];
}

function escapeXml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Usa service role para não precisar de auth do usuário
    let providers = [];
    let services = [];
    
    try {
      [providers, services] = await Promise.all([
        base44.asServiceRole.entities.ServiceProvider.list('-updated_date', 200),
        base44.asServiceRole.entities.ServiceListing.filter({ active: true }, '-updated_date', 500),
      ]);
    } catch (dataError) {
      console.warn('Could not fetch provider/service data for sitemap:', dataError.message);
      // Continua sem dados dinâmicos
    }

    const today = new Date().toISOString().split('T')[0];
    const urls = [];

    // Páginas estáticas
    for (const page of staticPages) {
      urls.push(`
  <url>
    <loc>${BASE_URL}${page.path}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    <lastmod>${today}</lastmod>
  </url>`);
    }

    // Landing pages SEO por slug (alta prioridade - conteúdo evergreen)
    for (const slug of servicoSlugs) {
      urls.push(`
  <url>
    <loc>${BASE_URL}/ServicoLanding?slug=${escapeXml(slug)}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.90</priority>
    <lastmod>${today}</lastmod>
  </url>`);
    }

    // Páginas de categoria por ocupação
    for (const occ of categoryOccupations) {
      urls.push(`
  <url>
    <loc>${BASE_URL}/ServicosCategoria?cat=${escapeXml(encodeURIComponent(occ))}</loc>
    <changefreq>daily</changefreq>
    <priority>0.85</priority>
    <lastmod>${today}</lastmod>
  </url>`);
    }

    // Categorias únicas de ServiceListing (pode ter outras além das ocupações)
    const extraCats = [...new Set((services || []).map(s => s.category).filter(Boolean))]
      .filter(c => !categoryOccupations.includes(c));
    for (const cat of extraCats) {
      urls.push(`
  <url>
    <loc>${BASE_URL}/ServicosCategoria?cat=${escapeXml(encodeURIComponent(cat))}</loc>
    <changefreq>daily</changefreq>
    <priority>0.80</priority>
    <lastmod>${today}</lastmod>
  </url>`);
    }

    // Perfis de prestadores verificados (maior prioridade para verificados)
    for (const provider of (providers || [])) {
      if (provider.status_verificacao === 'reprovado') continue;
      const priority = provider.verified ? '0.85' : '0.75';
      urls.push(`
  <url>
    <loc>${BASE_URL}/PrestadorPerfil?id=${escapeXml(provider.id)}</loc>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
    <lastmod>${formatDate(provider.updated_date)}</lastmod>
  </url>`);
    }

    // Páginas de serviços individuais
    for (const service of (services || [])) {
      urls.push(`
  <url>
    <loc>${BASE_URL}/ServicoDetalhes?id=${escapeXml(service.id)}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.70</priority>
    <lastmod>${formatDate(service.updated_date)}</lastmod>
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