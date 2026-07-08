import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Apenas admin pode executar backfill
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Apenas administradores podem executar backfill' }, { status: 403 });
    }

    // Buscar todas as ServiceRequests
    const serviceRequests = await base44.asServiceRole.entities.ServiceRequest.filter({});
    
    if (!serviceRequests || serviceRequests.length === 0) {
      return Response.json({ 
        success: true, 
        message: 'Nenhuma solicitação encontrada',
        updated: 0 
      });
    }

    let updatedCount = 0;
    let errors = [];

    // Para cada solicitação sem provider_email, buscar o ServiceProvider e preencher
    for (const request of serviceRequests) {
      // Pular se já tem provider_email
      if (request.provider_email) {
        continue;
      }

      try {
        // Buscar ServiceProvider pelo provider_id
        const providers = await base44.asServiceRole.entities.ServiceProvider.filter({ 
          id: request.provider_id 
        });

        if (providers && providers.length > 0) {
          const provider = providers[0];
          const providerEmail = provider.email || provider.created_by;

          if (providerEmail) {
            // Atualizar a solicitação com provider_email
            await base44.asServiceRole.entities.ServiceRequest.update(request.id, {
              provider_email: providerEmail
            });
            updatedCount++;
            console.log(`[Backfill] Atualizado request ${request.id} com provider_email: ${providerEmail}`);
          } else {
            errors.push({
              requestId: request.id,
              error: 'Provider sem email',
              providerId: request.provider_id
            });
          }
        } else {
          errors.push({
            requestId: request.id,
            error: 'Provider não encontrado',
            providerId: request.provider_id
          });
        }
      } catch (error) {
        errors.push({
          requestId: request.id,
          error: error.message
        });
      }
    }

    return Response.json({
      success: true,
      message: `Backfill concluído: ${updatedCount} solicitações atualizadas`,
      updated: updatedCount,
      total: serviceRequests.length,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});