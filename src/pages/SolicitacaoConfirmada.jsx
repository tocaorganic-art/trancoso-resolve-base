import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

export default function SolicitacaoConfirmadaPage() {
  useEffect(() => {
    document.title = "Solicitação Enviada! — Trancoso Resolve";
  }, []);

  return (
    <div className="bg-[#0a1628] min-h-screen pb-24">
      <div className="text-center px-6 pt-10">
        {/* Ícone de sucesso animado */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="w-20 h-20 mx-auto rounded-full bg-emerald-500/15 flex items-center justify-center"
        >
          <span className="text-emerald-400 text-4xl font-bold">✓</span>
        </motion.div>

        <h1 className="text-2xl font-extrabold text-white mt-6">
          Solicitação enviada com sucesso!
        </h1>

        <p className="text-slate-300 mt-3 text-sm">
          Em breve o prestador entrará em contato pelo WhatsApp ou telefone informado.
        </p>

        {/* Timeline */}
        <div className="flex items-center justify-between mt-8 text-xs px-4">
          <span className="text-emerald-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Enviada
          </span>
          <div className="flex-1 mx-2 h-px bg-slate-700"></div>
          <span className="text-amber-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            Aguardando
          </span>
          <div className="flex-1 mx-2 h-px bg-slate-700"></div>
          <span className="text-slate-500 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-slate-500"></span>
            Realizado
          </span>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3 mt-10 px-4">
          <Link to={createPageUrl("ServicosCategoria")}>
            <button className="w-full py-3 rounded-xl gradient-amber text-white font-semibold">
              Ver mais prestadores
            </button>
          </Link>
          <Link to="/">
            <button className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 font-medium">
              Voltar para o início
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}