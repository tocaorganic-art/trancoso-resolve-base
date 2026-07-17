import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { CheckCircle, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CheckoutSuccessBanner() {
  const [visible, setVisible] = useState(true);

  // Limpa o query param da URL uma única vez
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.has("checkout")) {
      url.searchParams.delete("checkout");
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  if (!visible) return null;

  return (
    <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl p-5 mb-8 shadow-lg relative">
      <button
        onClick={() => setVisible(false)}
        className="absolute top-3 right-3 text-white/70 hover:text-white"
        aria-label="Fechar"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex items-start gap-4">
        <div className="bg-white/20 rounded-full p-2 shrink-0">
          <CheckCircle className="w-7 h-7 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold mb-1">
            🎉 Assinatura ativada com sucesso!
          </h2>
          <p className="text-green-100 text-sm mb-3">
            Seu painel está liberado e você já pode receber pedidos dos clientes no Trancoso Resolve.
          </p>
          <p className="text-green-100 text-sm mb-4">
            <strong>Próximo passo:</strong> complete seu perfil com fotos e descrição dos seus serviços para aumentar suas chances de ser encontrado e chamado.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Link to={createPageUrl("MeuPerfilPrestador")}>
              <Button size="sm" className="bg-white text-green-700 hover:bg-green-50 font-bold">
                Completar perfil
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <Link to={createPageUrl("MeusServicos")}>
              <Button size="sm" variant="outline" className="border-white/50 text-white hover:bg-white/20">
                Cadastrar serviços
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}