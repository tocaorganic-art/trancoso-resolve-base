import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Megaphone, Eye, MousePointerClick, TrendingUp } from "lucide-react";
import AnuncioFormModal from "@/components/anuncios/AnuncioFormModal";
import PermissionChecker from "@/components/auth/PermissionChecker";

export default function DashboardLojista() {
  const [anuncios, setAnuncios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [userData, anunciosData] = await Promise.all([
        base44.auth.me(),
        base44.entities.Anuncio.list("-created_date"),
      ]);
      setUser(userData);
      setAnuncios(anunciosData);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (anuncio) => {
    await base44.entities.Anuncio.update(anuncio.id, { ativo: !anuncio.ativo });
    setAnuncios(prev =>
      prev.map(a => a.id === anuncio.id ? { ...a, ativo: !a.ativo } : a)
    );
  };

  const totalImpressoes = anuncios.reduce((sum, a) => sum + (a.impressoes || 0), 0);
  const totalCliques = anuncios.reduce((sum, a) => sum + (a.cliques || 0), 0);
  const ctr = totalImpressoes > 0 ? ((totalCliques / totalImpressoes) * 100).toFixed(1) : "0.0";

  return (
    <PermissionChecker requiredUserType="lojista">
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <Megaphone className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Meus Anúncios</h1>
                <p className="text-sm text-gray-500">Gerencie seus anúncios locais</p>
              </div>
            </div>
            <Button onClick={() => setShowForm(true)} className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
              <Plus className="w-4 h-4" />
              Novo Anúncio
            </Button>
          </div>

          {/* Métricas */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <Eye className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-500">Impressões</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{totalImpressoes.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <MousePointerClick className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-500">Cliques</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{totalCliques.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-500">CTR</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{ctr}%</p>
              </CardContent>
            </Card>
          </div>

          {/* Lista de anúncios */}
          {loading ? (
            <div className="text-center py-12 text-gray-400">Carregando...</div>
          ) : anuncios.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Megaphone className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">Você ainda não tem anúncios</p>
                <Button onClick={() => setShowForm(true)} variant="outline">
                  Criar primeiro anúncio
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {anuncios.map(anuncio => (
                <Card key={anuncio.id}>
                  <CardContent className="py-4 flex items-center gap-4">
                    {anuncio.imagem_url && (
                      <img
                        src={anuncio.imagem_url}
                        alt={anuncio.titulo}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900 truncate">{anuncio.titulo}</h3>
                        {anuncio.categoria && (
                          <Badge variant="secondary" className="text-xs flex-shrink-0">{anuncio.categoria}</Badge>
                        )}
                      </div>
                      {anuncio.descricao && (
                        <p className="text-sm text-gray-500 truncate mt-0.5">{anuncio.descricao}</p>
                      )}
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                        <span><Eye className="w-3 h-3 inline mr-1" />{anuncio.impressoes || 0}</span>
                        <span><MousePointerClick className="w-3 h-3 inline mr-1" />{anuncio.cliques || 0}</span>
                      </div>
                    </div>
                    <Switch
                      checked={anuncio.ativo !== false}
                      onCheckedChange={() => handleToggle(anuncio)}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <AnuncioFormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        onSaved={loadData}
      />
    </PermissionChecker>
  );
}