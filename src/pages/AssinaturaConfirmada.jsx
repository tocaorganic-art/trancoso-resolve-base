import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle, Calendar, CreditCard, ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const PLAN_INFO = {
  lancamento:         { nome: "Plano Prestador - Lançamento", valor: "R$ 29,90/mês", trial: 60 },
  regular:            { nome: "Plano Prestador Mensal",       valor: "R$ 49,90/mês", trial: 7  },
  empresa_lancamento: { nome: "Plano Empresas - Lançamento",  valor: "R$ 59,90/mês", trial: 7  },
  empresa_regular:    { nome: "Plano Empresas Mensal",        valor: "R$ 89,90/mês", trial: 7  },
  avulso_prestador:   { nome: "Uso Avulso - Prestador (1 mês)", valor: "R$ 69,90", trial: 0 },
  avulso_empresa:     { nome: "Uso Avulso - Empresa (1 mês)",   valor: "R$ 99,99", trial: 0 },
};

export default function AssinaturaConfirmada() {
  const [params, setParams] = useState({ avulso: false, plan: null });

  useEffect(() => {
    document.title = "Assinatura Confirmada - Trancoso Resolve";
    const urlParams = new URLSearchParams(window.location.search);
    const avulso = urlParams.get('avulso') === 'true';
    const plan = urlParams.get('plan') || null;
    setParams({ avulso, plan });
  }, []);

  const isAvulso = params.avulso;
  const planInfo = PLAN_INFO[params.plan] || null;

  const trialEndDate = planInfo?.trial > 0
    ? new Date(Date.now() + planInfo.trial * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')
    : null;

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full text-center">

        {/* Ícone de sucesso */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
        </div>

        {/* Título */}
        <h1 className="text-3xl font-extrabold text-white mb-3">
          {isAvulso ? "Acesso ativado!" : "Bem-vindo à Trancoso Resolve!"}
        </h1>

        {/* Mensagem contextual */}
        <p className="text-lg text-slate-300 mb-8">
          {isAvulso
            ? "Seu acesso de 1 mês está ativo! Aproveite a temporada."
            : trialEndDate
              ? `Seu período gratuito começou. Nenhuma cobrança até ${trialEndDate}.`
              : "Sua assinatura foi ativada com sucesso!"}
        </p>

        {/* Card de detalhes */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 mb-8 text-left space-y-4">
          {planInfo && (
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-cyan-400 shrink-0" />
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide">Plano contratado</p>
                <p className="text-white font-semibold">{planInfo.nome}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-green-400 shrink-0" />
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide">Valor</p>
              <p className="text-white font-semibold">
                {trialEndDate ? `Gratuito por ${planInfo.trial} dias, depois ${planInfo?.valor}` : planInfo?.valor || "—"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide">
                {isAvulso ? "Renovação" : "Próxima cobrança"}
              </p>
              <p className="text-white font-semibold">
                {isAvulso
                  ? "Sem renovação automática"
                  : trialEndDate
                    ? trialEndDate
                    : "Mensal automático"}
              </p>
            </div>
          </div>

          {trialEndDate && (
            <div className="flex items-center gap-3 bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
              <Clock className="w-5 h-5 text-blue-400 shrink-0" />
              <p className="text-blue-300 text-sm">
                Seu cartão foi salvo, mas <strong>nenhuma cobrança será feita</strong> durante o período gratuito.
              </p>
            </div>
          )}
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold px-8">
            <Link to="/Dashboard">
              Acessar meu painel <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
            <Link to="/">Voltar ao início</Link>
          </Button>
        </div>

        <p className="text-slate-500 text-sm mt-6">
          Dúvidas? <a href="mailto:suporte@trancosoresolve.com.br" className="underline text-slate-400">suporte@trancosoresolve.com.br</a>
        </p>
      </div>
    </div>
  );
}