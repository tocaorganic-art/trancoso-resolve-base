// Flags reversíveis de features — nunca remover o código da feature, só
// alternar o booleano aqui para reativar. Ver docs/RELATORIO-MELHORIAS-FLUXOS.md
// seção "Rodada 3" para o histórico e o motivo de cada suspensão.

// Decisão do Tony (17/10/2026): chat IA in-platform (TrIA / Assistentevirtual)
// suspenso para usuários comuns após falha total em produção. Reativar
// trocando para `false` assim que o fix das funções de IA (Rodada 3, Tarefa 1)
// estiver publicado e validado em produção.
export const AI_CHAT_SUSPENDED = true;
