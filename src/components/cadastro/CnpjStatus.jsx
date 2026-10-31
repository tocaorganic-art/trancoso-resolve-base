import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

// Linha de status abaixo do campo CNPJ. Informativa: nunca bloqueia o envio.
export default function CnpjStatus({ status, dados }) {
  if (status === 'idle') return null;

  let conteudo = null;
  if (status === 'buscando') {
    conteudo = (
      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
        <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
        Consultando CNPJ na Receita Federal...
      </span>
    );
  } else if (status === 'ok') {
    const ativa = !dados?.situacao || dados.situacao === 'ATIVA';
    conteudo = ativa ? (
      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
        <CheckCircle2 className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
        CNPJ encontrado. Confira os dados preenchidos abaixo.
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5 text-destructive">
        <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
        Situação cadastral na Receita: {dados.situacao}. Confira se o CNPJ está correto.
      </span>
    );
  } else if (status === 'nao_encontrado') {
    conteudo = (
      <span className="inline-flex items-center gap-1.5 text-destructive">
        <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
        CNPJ não encontrado na Receita. Confira os números.
      </span>
    );
  } else if (status === 'erro') {
    conteudo = (
      <span className="text-muted-foreground">
        Não foi possível consultar o CNPJ agora. Preencha os dados manualmente.
      </span>
    );
  }

  return (
    <p className="text-xs mt-1" role="status" aria-live="polite">
      {conteudo}
    </p>
  );
}
