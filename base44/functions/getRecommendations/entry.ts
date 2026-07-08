import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

// Lógica de recomendação simplificada (placeholder para o motor de IA real)
const getSimpleRecommendations = async (base44, userId) => {
    // 1. Pega os últimos 3 serviços contratados pelo usuário
    const recentRequests = await base44.entities.ServiceRequest.filter(
        { client_id: userId, status: 'Concluído' }, 
        '-created_date', 
        3
    );
    
    if (recentRequests.length === 0) {
        // Se não há histórico, retorna os serviços em destaque
        return await base44.entities.ServiceListing.filter({ featured: true }, '', 6);
    }
    
    // 2. Pega as categorias desses serviços
    const serviceIds = recentRequests.map(req => req.service_id);
    const recentServices = await base44.entities.ServiceListing.filter({ id: { $in: serviceIds } });
    const recentCategories = [...new Set(recentServices.map(s => s.category))];
    
    // 3. Busca outros serviços populares nessas categorias
    const recommendedServices = await base44.entities.ServiceListing.filter(
        { category: { $in: recentCategories }, id: { $nin: serviceIds } },
        '-created_date', // Simulação de popularidade
        6
    );
    
    return recommendedServices.slice(0, 3); // Retorna até 3 recomendações
};

Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    };

    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
         const base44 = createClientFromRequest(req);
         const user = await base44.auth.me();

         if (!user) {
             // Fallback para usuários não logados: retorna serviços em destaque
             const featured = await base44.asServiceRole.entities.ServiceListing.filter({ featured: true }, '', 3);
             return new Response(JSON.stringify(featured), {
                 headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                 status: 200,
             });
         }

         // SEGURANÇA: Valida se userId pertence ao usuário autenticado ou se é admin
         const { userId } = await req.json();
         const isAdmin = user.role === 'admin';
         if (!isAdmin && userId !== user.id) {
             return new Response(JSON.stringify({ error: 'Forbidden: acesso negado' }), {
                 headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                 status: 403,
             });
         }

         // SEGURANÇA: Usa o userId autenticado, não o do body
         const safeUserId = user.id;
         const recommendations = await getSimpleRecommendations(base44, safeUserId);
        
        return new Response(JSON.stringify(recommendations), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
});