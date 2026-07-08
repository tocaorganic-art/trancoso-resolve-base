import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const requestIds = [
      '69d3f76ddc4c868a7f40a42c',
      '69d3f5fbe9f804b2162c152c',
      '69d3f023cf8bc1b366646923',
      '69d3ee9500f114fa38317803'
    ];

    for (const id of requestIds) {
      await base44.asServiceRole.entities.ServiceRequest.delete(id);
    }

    return Response.json({ success: true, deleted: requestIds.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});