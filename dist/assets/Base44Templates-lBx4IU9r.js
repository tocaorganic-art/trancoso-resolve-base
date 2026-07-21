import{c as x,j as e,r as b,N as C,C as a,e as i,f as r,B as s,b as o,t as N}from"./index-Bb7ZZVcv.js";import{T as n}from"./textarea-DqmostJn.js";import{T as f,a as T,b as c,c as l}from"./tabs-DuKlOb0n.js";import{P as g}from"./PermissionChecker-zbQFFE6d.js";import{F as A}from"./file-json-B8rspWUG.js";/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const E=[["path",{d:"M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20",key:"k3hazp"}]],S=x("Book",E);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const w=[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]],m=x("Copy",w),d=`{
  "command_id": "BASE44_Command_Name_V1",
  "version": "1.0",
  "environment": "production",
  "project": "NomeDoProjeto / DescriçãoCurta",
  "objective": "Descreva aqui o objetivo geral (ex.: Executar build, QA e monitoramento).",
  "operations": [
    {
      "id": "section_1_identifier",
      "actions": [
        "descrição_da_ação_1",
        "descrição_da_ação_2",
        "descrição_da_ação_3"
      ]
    },
    {
      "id": "section_2_identifier",
      "actions": [
        "descrição_da_ação_1",
        "descrição_da_ação_2"
      ]
    }
  ],
  "validation": {
    "qa_score_min": 85,
    "security_issues": 0
  },
  "reporting": {
    "outputs": [
      "arquivo1.json",
      "arquivo2.html",
      "arquivo3.csv"
    ],
    "delivery_channel": "Base44.Dashboard > Logs > Latest"
  },
  "status_after_completion": "✅ Descreva aqui o estado final esperado (ex.: Todos os critérios validados, sistema pronto para produção)."
}`,p=`# 📊 RELATÓRIO EXECUTIVO – {{command_id}}

**Projeto:** {{project}}  
**Ambiente:** {{environment}}  
**Data:** {{data_execucao}}  
**Versão:** {{version}}  
**Status:** {{status_execucao}}

---

## 🎯 OBJETIVO

{{objective}}

---

## ⚙️ OPERAÇÕES EXECUTADAS

{{#each operations}}
### {{this.id}}

**Ações:**
{{#each this.actions}}
- ✅ {{this}}
{{/each}}

{{/each}}

---

## ✅ RESULTADOS

| Área | Score | Status |
|------|-------|--------|
| **Build** | {{resultado_build}} | {{build_status}} |
| **QA** | {{qa_score}} / 100 | {{qa_status}} |
| **Segurança** | {{security_score}} / 100 | {{security_status}} |
| **Acessibilidade** | {{a11y_score}} / 100 | {{a11y_status}} |
| **SEO** | {{seo_score}} / 100 | {{seo_status}} |
| **Monitoramento** | {{monitoring_status}} | {{monitoring_icon}} |

---

## 📈 MÉTRICAS-CHAVE

| Métrica | Valor | Limite | Status |
|---------|-------|--------|--------|
| **LCP** | {{lcp_value}} ms | < 2500 ms | {{lcp_status}} |
| **FID** | {{fid_value}} ms | < 100 ms | {{fid_status}} |
| **CLS** | {{cls_value}} | < 0.1 | {{cls_status}} |
| **Uptime** | {{uptime_value}}% | ≥ 99% | {{uptime_status}} |
| **SEO** | {{seo_score}} | ≥ 85 pts | {{seo_status}} |

---

## 🔐 VALIDAÇÃO DOS CRITÉRIOS

\`\`\`json
{
  "qa_score_min": 85,
  "security_issues": 0,
  "actual_qa_score": {{qa_score}},
  "actual_security_issues": {{security_issues_total}}
}
\`\`\`

**Resultado:** {{validation_result}}

---

## 🧾 RELATÓRIOS GERADOS

{{#each reporting.outputs}}
- 📄 {{this}}
{{/each}}

**Canal de entrega:** {{reporting.delivery_channel}}

---

## 🟢 STATUS FINAL

{{status_after_completion}}

---

## ✍️ OBSERVAÇÕES

{{observacoes}}

---

*Gerado automaticamente pelo sistema Base 44 AI Codificado – Política de Comando Único Versão 1.0 (Responsável: Tony).*`,u=`# 📚 Templates Base44 - Guia de Uso

## Visão Geral

Sistema **Base44 Comando Único Codificado** - Templates padronizados para criar comandos e relatórios.

## Workflow Completo

\`\`\`
1. Tony preenche template de comando JSON
   ↓
2. Envia comando para a IA
   ↓
3. IA executa via <action_group>
   ↓
4. IA gera relatório padronizado
   ↓
5. Visualização em Base44ReportViewer
\`\`\`

## Como Usar

### 1. Criar Comando

Copie o template JSON, preencha os campos e envie para a IA:

**Campos principais:**
- \`command_id\`: Identificador único (ex: BASE44_Deploy_V1)
- \`objective\`: O que o comando faz
- \`operations\`: Lista de operações
- \`validation\`: Critérios de validação
- \`reporting\`: Configuração de relatórios

### 2. Executar

Envie o JSON completo. A IA vai:
- Validar o comando
- Executar todas as operações
- Gerar relatório automático

### 3. Visualizar

Acesse \`/Base44ReportViewer\` para ver relatórios de forma visual.

## Exemplos

### Comando Simples

\`\`\`json
{
  "command_id": "BASE44_Deploy_V1",
  "version": "1.0",
  "environment": "production",
  "project": "MeuApp",
  "objective": "Deploy em produção",
  "operations": [
    {
      "id": "build",
      "actions": ["npm install", "npm run build"]
    }
  ],
  "validation": {
    "qa_score_min": 90
  }
}
\`\`\`

### Comando Completo

Use o template completo da aba "Comando Template" com todas as seções.

## Convenções

- **IDs**: \`BASE44_<Nome>_V<Versão>\`
- **Versões**: Semântico (1.0, 1.1, 2.0)
- **Status**: success, warning, error, running
- **Ambientes**: production, staging, development

## Componentes Disponíveis

### Base44ReportPreview
Componente React para visualizar relatórios.

\`\`\`jsx
import Base44ReportPreview from '@/components/base44/Base44ReportPreview';

<Base44ReportPreview reportData={reportData} />
\`\`\`

### Base44ReportViewer
Página completa: \`/Base44ReportViewer\`

## Suporte

**Responsável:** Tony  
**Email:** tony@base44.io  
**Versão:** 1.0`;function y(){const[h,j]=b.useState("command"),t=(_,v)=>{navigator.clipboard.writeText(_),N.success(`${v} copiado!`,{description:"Cole onde precisar usar."})};return e.jsx("div",{className:"container mx-auto px-4 py-8",children:e.jsxs("div",{className:"max-w-6xl mx-auto",children:[e.jsxs("div",{className:"mb-8",children:[e.jsx("h1",{className:"text-3xl font-bold text-slate-900 mb-2",children:"📚 Templates Base44"}),e.jsx("p",{className:"text-slate-600",children:"Sistema de Comando Único Codificado - Templates e Documentação"})]}),e.jsxs(f,{value:h,onValueChange:j,children:[e.jsxs(T,{className:"grid w-full grid-cols-3",children:[e.jsxs(c,{value:"command",className:"flex items-center gap-2",children:[e.jsx(A,{className:"w-4 h-4"}),"Comando Template"]}),e.jsxs(c,{value:"report",className:"flex items-center gap-2",children:[e.jsx(C,{className:"w-4 h-4"}),"Relatório Template"]}),e.jsxs(c,{value:"docs",className:"flex items-center gap-2",children:[e.jsx(S,{className:"w-4 h-4"}),"Documentação"]})]}),e.jsx(l,{value:"command",className:"mt-6",children:e.jsxs(a,{children:[e.jsx(i,{children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx(r,{children:"Template de Comando JSON"}),e.jsxs(s,{size:"sm",variant:"outline",onClick:()=>t(d,"Template de comando"),children:[e.jsx(m,{className:"w-4 h-4 mr-2"}),"Copiar"]})]})}),e.jsxs(o,{children:[e.jsx(n,{value:d,readOnly:!0,className:"font-mono text-xs h-[600px]"}),e.jsxs("div",{className:"mt-4 p-4 bg-blue-50 rounded-lg",children:[e.jsx("h4",{className:"font-semibold text-blue-900 mb-2",children:"Como usar:"}),e.jsxs("ol",{className:"text-sm text-blue-800 space-y-1",children:[e.jsx("li",{children:"1. Copie este template"}),e.jsx("li",{children:"2. Preencha os campos conforme sua necessidade"}),e.jsx("li",{children:"3. Envie o JSON completo para a IA executar"}),e.jsx("li",{children:"4. Receba o relatório automático de execução"})]})]})]})]})}),e.jsx(l,{value:"report",className:"mt-6",children:e.jsxs(a,{children:[e.jsx(i,{children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx(r,{children:"Template de Relatório Markdown"}),e.jsxs(s,{size:"sm",variant:"outline",onClick:()=>t(p,"Template de relatório"),children:[e.jsx(m,{className:"w-4 h-4 mr-2"}),"Copiar"]})]})}),e.jsxs(o,{children:[e.jsx(n,{value:p,readOnly:!0,className:"font-mono text-xs h-[600px]"}),e.jsxs("div",{className:"mt-4 p-4 bg-green-50 rounded-lg",children:[e.jsx("h4",{className:"font-semibold text-green-900 mb-2",children:"Sobre este template:"}),e.jsx("p",{className:"text-sm text-green-800",children:"Este é o template Markdown usado pela IA para gerar relatórios de execução. Você não precisa preenchê-lo manualmente - ele é gerado automaticamente após a execução de um comando Base44."})]})]})]})}),e.jsx(l,{value:"docs",className:"mt-6",children:e.jsxs(a,{children:[e.jsx(i,{children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx(r,{children:"Documentação Completa"}),e.jsxs(s,{size:"sm",variant:"outline",onClick:()=>t(u,"Documentação"),children:[e.jsx(m,{className:"w-4 h-4 mr-2"}),"Copiar"]})]})}),e.jsx(o,{children:e.jsx(n,{value:u,readOnly:!0,className:"font-mono text-xs h-[600px]"})})]})})]}),e.jsxs("div",{className:"mt-8 grid grid-cols-1 md:grid-cols-2 gap-4",children:[e.jsx(a,{className:"bg-blue-50 border-blue-200",children:e.jsxs(o,{className:"p-6",children:[e.jsx("h3",{className:"font-semibold text-blue-900 mb-2",children:"🎯 Próximos Passos"}),e.jsx("p",{className:"text-sm text-blue-800 mb-4",children:"Acesse o visualizador de relatórios para testar o sistema completo."}),e.jsx(s,{onClick:()=>window.location.href="/Base44ReportViewer",className:"w-full",children:"Abrir Base44ReportViewer"})]})}),e.jsx(a,{className:"bg-green-50 border-green-200",children:e.jsxs(o,{className:"p-6",children:[e.jsx("h3",{className:"font-semibold text-green-900 mb-2",children:"📊 Exemplo Prático"}),e.jsx("p",{className:"text-sm text-green-800 mb-4",children:"Veja um relatório de exemplo já renderizado e funcional."}),e.jsx(s,{onClick:()=>window.location.href="/Base44ReportViewer",variant:"outline",className:"w-full",children:"Ver Exemplo"})]})})]})]})})}function I(){return e.jsx(g,{requiredRole:"admin",children:e.jsx(y,{})})}export{I as default};
