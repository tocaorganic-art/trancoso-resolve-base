import { Card, CardContent } from "@/components/ui/card";

function StatCard({ label, value }) {
  return (
    <Card className="bg-white border-[#E3DED5]">
      <CardContent className="p-4 text-center">
        <p className="text-2xl font-bold text-[#20382C]">{value}</p>
        <p className="text-xs text-[#666] mt-1">{label}</p>
      </CardContent>
    </Card>
  );
}

function groupCount(items, field) {
  const map = {};
  (items || []).forEach((it) => {
    const v = it[field];
    if (!v) return;
    map[v] = (map[v] || 0) + 1;
  });
  return map;
}

export default function VisaoGeralTab({ posts, leads, approvals }) {
  const totalPosts = (posts || []).length;
  const totalLeads = (leads || []).length;
  const pendingValidations = (posts || []).filter(
    (p) => p.validation_status === "pending_validation" || p.validation_status === "partially_confirmed"
  ).length;
  const scheduled = (posts || []).filter(
    (p) => p.production_status === "scheduled" || p.production_status === "published"
  ).length;

  const byLocality = groupCount(posts, "localities");
  const byChannel = groupCount(posts, "channels");
  const byStatus = groupCount(posts, "production_status");
  const leadsByProfile = groupCount(leads, "profile_type");
  const leadsByLocality = groupCount(leads, "locality");

  const Empty = ({ label }) => (
    <p className="text-sm text-[#999] italic text-center py-4">Sem dados registrados — {label}</p>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Conteúdos totais" value={totalPosts} />
        <StatCard label="Leads recebidos" value={totalLeads} />
        <StatCard label="Pendências de validação" value={pendingValidations} />
        <StatCard label="Próximos programados" value={scheduled} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-white border-[#E3DED5]">
          <CardContent className="p-4">
            <h3 className="font-bold text-[#333333] mb-3">Conteúdos por localidade</h3>
            {Object.keys(byLocality).length === 0 ? (
              <Empty label="nenhuma localidade" />
            ) : (
              <ul className="space-y-1 text-sm">
                {Object.entries(byLocality).map(([k, v]) => (
                  <li key={k} className="flex justify-between text-[#555]">
                    <span>{k}</span>
                    <span className="font-semibold text-[#20382C]">{v}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white border-[#E3DED5]">
          <CardContent className="p-4">
            <h3 className="font-bold text-[#333333] mb-3">Conteúdos por canal</h3>
            {Object.keys(byChannel).length === 0 ? (
              <Empty label="nenhum canal" />
            ) : (
              <ul className="space-y-1 text-sm">
                {Object.entries(byChannel).map(([k, v]) => (
                  <li key={k} className="flex justify-between text-[#555]">
                    <span>{k}</span>
                    <span className="font-semibold text-[#20382C]">{v}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white border-[#E3DED5]">
          <CardContent className="p-4">
            <h3 className="font-bold text-[#333333] mb-3">Conteúdos por status</h3>
            {Object.keys(byStatus).length === 0 ? (
              <Empty label="nenhum status" />
            ) : (
              <ul className="space-y-1 text-sm">
                {Object.entries(byStatus).map(([k, v]) => (
                  <li key={k} className="flex justify-between text-[#555]">
                    <span>{k}</span>
                    <span className="font-semibold text-[#20382C]">{v}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white border-[#E3DED5]">
          <CardContent className="p-4">
            <h3 className="font-bold text-[#333333] mb-3">Leads por perfil</h3>
            {Object.keys(leadsByProfile).length === 0 ? (
              <Empty label="nenhum lead" />
            ) : (
              <ul className="space-y-1 text-sm">
                {Object.entries(leadsByProfile).map(([k, v]) => (
                  <li key={k} className="flex justify-between text-[#555]">
                    <span>{k}</span>
                    <span className="font-semibold text-[#20382C]">{v}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border-[#E3DED5]">
        <CardContent className="p-4">
          <h3 className="font-bold text-[#333333] mb-3">Leads por localidade</h3>
          {Object.keys(leadsByLocality).length === 0 ? (
            <Empty label="nenhum lead" />
          ) : (
            <ul className="space-y-1 text-sm">
              {Object.entries(leadsByLocality).map(([k, v]) => (
                <li key={k} className="flex justify-between text-[#555]">
                  <span>{k}</span>
                  <span className="font-semibold text-[#20382C]">{v}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}