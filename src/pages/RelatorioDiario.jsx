import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Clock, FileText, Palette, Code, Layout, Download } from "lucide-react";
import { Link } from "react-router-dom";

export default function RelatorioDiarioPage() {
  const dataHoje = "2026-06-04";
  
  const tarefasConcluidas = [
    {
      categoria: "Identidade Visual - Paleta Terrosa",
      icon: Palette,
      cor: "amber",
      itens: [
        "Substituição de gradientes azul/ciano por âmbar em ServicosCategoria.jsx",
        "Atualização de botões CTA de cyan-500/blue-600 para amber-600",
        "Mudança de badges de categoria de cyan para âmbar",
        "Atualização de preços de cyan-600 para amber-700",
        "Alteração de indicadores de loading de azul para âmbar",
        "Substituição de pull-to-refresh de azul para âmbar",
        "Atualização de links 'Ver todos' de cyan para âmbar",
        "Mudança de foco de ring de cyan-500 para amber-500",
        "Atualização de hover borders de cyan-400 para amber-400",
        "Substituição de backgrounds gradientes de cyan/blue para amber/orange",
        "Alteração de ícones de step de cyan para âmbar",
        "Atualização de botões de ação em MeusServicos.jsx",
        "Mudança de cards de alerta de azul para âmbar",
        "Substituição de badges de status ativo para âmbar-100/amber-800",
      ]
    },
    {
      categoria: "Arquivos Modificados",
      icon: Code,
      cor: "blue",
      itens: [
        "pages/ServicosCategoria.jsx - 10 substituições de cores",
        "pages/MeusServicos.jsx - 4 substituições de cores",
        "pages/Home.jsx - 13 substituições de cores",
        "components/verificacao/VerificarIdentidadeModal.jsx - 8 substituições de cores",
      ]
    },
    {
      categoria: "Componentes Atualizados",
      icon: Layout,
      cor: "green",
      itens: [
        "ProviderCard (ServicosCategoria) - capa, botão, badge",
        "ServiceCard (Home) - badge categoria, preço, botão",
        "LeadCaptureForm - já usava cores terrosas (mantido)",
        "ServicoLocalPage - já usava cores terrosas (mantido)",
        "VerificarIdentidadeModal - upload modes, borders, loading states",
      ]
    }
  ];

  const tarefasPendentes = [
    {
      descricao: "Verificar páginas de serviços locais (DiaristaTrancoso, EletricistaTrancoso, etc.)",
      prioridade: "baixa",
      motivo: "Usam componente ServicoLocalPage que já está com cores terrosas"
    },
    {
      descricao: "Atualizar componentes de dashboard administrativo",
      prioridade: "média",
      motivo: "Foco foi nas páginas públicas e do prestador"
    },
    {
      descricao: "Revisar páginas de autenticação (Login, Register)",
      prioridade: "baixa",
      motivo: "Não foram solicitadas na refatoração atual"
    },
    {
      descricao: "Otimizar tamanho dos arquivos (warnings de 580-709 linhas)",
      prioridade: "média",
      motivo: "Split em componentes menores recomendado mas não crítico"
    },
    {
      descricao: "Adicionar testes de regressão visual",
      prioridade: "baixa",
      motivo: "Mudanças são cosméticas e não afetam funcionalidade"
    }
  ];

  const metricas = {
    arquivosModificados: 4,
    substituicoesCores: 35,
    componentesAtualizados: 5,
    pendencias: 5
  };

  const gerarMarkdown = () => {
    const md = `# Relatório Diário de Desenvolvimento

**Data:** ${new Date(dataHoje).toLocaleDateString('pt-BR')}  
**Projeto:** Trancoso Resolve - Refatoração de Identidade Visual

---

## 📊 Métricas

| Arquivos Modificados | Substituições de Cores | Componentes Atualizados | Pendências |
|---------------------|----------------------|----------------------|------------|
| ${metricas.arquivosModificados} | ${metricas.substituicoesCores} | ${metricas.componentesAtualizados} | ${metricas.pendencias} |

---

## ✅ Concluído Hoje

### Identidade Visual - Paleta Terrosa
${tarefasConcluidas[0].itens.map(item => `- ${item}`).join('\n')}

### Arquivos Modificados
${tarefasConcluidas[1].itens.map(item => `- ${item}`).join('\n')}

### Componentes Atualizados
${tarefasConcluidas[2].itens.map(item => `- ${item}`).join('\n')}

---

## ⏳ Pendências

${tarefasPendentes.map((t, i) => `### ${i + 1}. ${t.descricao}
- **Prioridade:** ${t.prioridade}
- **Motivo:** ${t.motivo}
`).join('\n')}

---

## 🎨 Resumo da Migração de Cores

### ❌ Removido (Azul/Ciano)
- from-cyan-500 to-blue-600 (gradientes)
- text-cyan-600 (textos e links)
- bg-blue-50 (fundos)
- border-blue-200 (bordas)
- ring-cyan-500 (focus states)

### ✅ Adicionado (Âmbar/Terroso)
- bg-amber-600 (botões CTA)
- text-amber-700 (textos e links)
- from-amber-800 to-amber-600 (gradientes)
- bg-amber-50 (fundos)
- border-amber-200 (bordas)
- ring-amber-500 (focus states)

---

*Relatório gerado em ${new Date().toLocaleString('pt-BR')}*
`;
    return md;
  };

  const handleExportMarkdown = () => {
    const md = gerarMarkdown();
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-diario-${dataHoje}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-800 to-orange-600 text-white rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Relatório Diário de Desenvolvimento</h1>
          </div>
          <p className="text-orange-100 text-lg">Data: {new Date(dataHoje).toLocaleDateString('pt-BR')}</p>
          <p className="text-orange-50 text-sm mt-1">Projeto: Trancoso Resolve - Refatoração de Identidade Visual</p>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Code className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{metricas.arquivosModificados}</p>
                <p className="text-sm text-muted-foreground">Arquivos</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Palette className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{metricas.substituicoesCores}</p>
                <p className="text-sm text-muted-foreground">Substituições</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Layout className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{metricas.componentesAtualizados}</p>
                <p className="text-sm text-muted-foreground">Componentes</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Clock className="w-8 h-8 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{metricas.pendencias}</p>
                <p className="text-sm text-muted-foreground">Pendências</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tarefas Concluídas */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-[#3E8E5A]" />
            Concluído Hoje
          </h2>
          <div className="space-y-4">
            {tarefasConcluidas.map((tarefa, idx) => {
              const Icon = tarefa.icon;
              return (
                <Card key={idx} className="border-border">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-5 h-5 text-${tarefa.cor}-600`} />
                      <CardTitle className="text-lg">{tarefa.categoria}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {tarefa.itens.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                          <CheckCircle2 className="w-4 h-4 text-[#3E8E5A] mt-0.5 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Tarefas Pendentes */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Clock className="w-6 h-6 text-orange-600" />
            Pendências
          </h2>
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-6">
              <ul className="space-y-4">
                {tarefasPendentes.map((tarefa, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-orange-600 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{tarefa.descricao}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={
                          tarefa.prioridade === "alta" ? "bg-red-100 text-red-800" :
                          tarefa.prioridade === "média" ? "bg-orange-100 text-orange-800" :
                          "bg-muted text-muted-foreground"
                        }>
                          Prioridade: {tarefa.prioridade}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{tarefa.motivo}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Resumo da Mudança de Identidade */}
        <Card className="mb-8 border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Palette className="w-5 h-5 text-orange-600" />
              Resumo da Migração de Cores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-muted rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-2">❌ Removido (Azul/Ciano)</h3>
                <ul className="space-y-1 text-sm text-foreground">
                  <li>• from-cyan-500 to-blue-600 (gradientes)</li>
                  <li>• text-cyan-600 (textos e links)</li>
                  <li>• bg-blue-50 (fundos)</li>
                  <li>• border-blue-200 (bordas)</li>
                  <li>• ring-cyan-500 (focus states)</li>
                </ul>
              </div>
              <div className="bg-orange-100 rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-2">✅ Adicionado (Âmbar/Terroso)</h3>
                <ul className="space-y-1 text-sm text-foreground">
                  <li>• bg-amber-600 (botões CTA)</li>
                  <li>• text-amber-700 (textos e links)</li>
                  <li>• from-amber-800 to-amber-600 (gradientes)</li>
                  <li>• bg-amber-50 (fundos)</li>
                  <li>• border-amber-200 (bordas)</li>
                  <li>• ring-amber-500 (focus states)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ações */}
        <div className="flex gap-3">
          <Button onClick={handleExportMarkdown} className="bg-orange-600 hover:bg-orange-700">
            <Download className="w-4 h-4 mr-2" />
            Exportar Markdown
          </Button>
          <Link to="/">
            <Button variant="outline">
              Voltar ao Início
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}