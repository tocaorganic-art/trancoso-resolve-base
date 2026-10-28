# Regras de voz — Trancoso Resolve

> Gerado a partir dos textos reais já publicados no produto (páginas em
> `src/pages/`) e do que `CLAUDE.md` já documentava sobre voz e tom. Não há
> nenhuma frase inventada aqui: todo exemplo citado existe hoje no código do
> repositório, salvo onde marcado como lacuna.

## 1. Como a gente soa

**Caloroso, de vizinho** — fala como quem conhece a vila, não como um app genérico.
> "De uma faxina a um passeio exclusivo. Encontre, agende e resolva sem sair do sofá."
> — `src/pages/ComoFunciona.jsx`

**Direto e resolutivo** — vai ao ponto, sem rodeio institucional, e usa o próprio
nome da marca como verbo de ação (o trocadilho "Resolve" já é regra em `CLAUDE.md`:
*"A gente resolve.", "Resolva hoje."*).
> "Pronto para Resolver?"
> — `src/pages/ComoFunciona.jsx`

**Confiante e transparente** — afirma fato e condição sem hedging corporativo,
mesmo em respostas delicadas (preço, comissão, cancelamento).
> "Não. Você negocia diretamente com o cliente e fica com 100% do valor.
> Cobramos apenas a assinatura da plataforma."
> — FAQ, `src/pages/Planos.jsx`

## 2. Palavras e expressões que a gente usa

- **"A gente"** como voz coletiva da marca (não "nós" formal, não "a empresa").
- **"Resolve" / "resolva"** como verbo — o trocadilho é regra de marca, não acidente.
- **Geografia real e específica**: "Trancoso", "o Quadrado", "Arraial d'Ajuda",
  "Porto Seguro", "Caraíva", "Costa do Descobrimento" — nunca "sua região" genérico.
- **"Prestador"** (nunca "fornecedor", "terceirizado" ou "freelancer").
- Condições claras e sem letra pequena: *"sem fidelidade"*, *"sem multa"*,
  *"sem cartão de crédito"*, *"de graça"*, *"sem comissão sobre os serviços"*.
- Benefício em linguagem concreta, não abstrata: *"sem sair do sofá"*,
  *"Transforme seu talento em negócio"*, *"Custo Zero de Marketing"*.

## 3. Palavras e expressões que a gente NUNCA usaria

- Jargão corporativo/B2B: "sinergia", "stakeholder", "parceiro estratégico",
  "solução enterprise", "outsourcing".
- Tratamento por **"tu"** — `CLAUDE.md` fixa **"você"** em todas as respostas e telas.
- Promessa vaga sem condição ("economize muito", "milhares de clientes") quando o
  texto real da marca prefere número e condição explícita (ex.: "17% de desconto",
  "até 10 serviços ativos simultâneos", "os primeiros 100 aprovados").
- Tom de SaaS genérico ("revolucione sua gestão", "plataforma all-in-one") — o produto
  fala de Trancoso, não de mercado abstrato.

## 4. Tamanho de frase, emoji, gírias, você/tu, formalidade

- **Pronome**: sempre **você** — nunca "tu", nunca "senhor(a)". Regra fixada em `CLAUDE.md`.
- **Registro**: descontraído e profissional — "caloroso, de vizinho, confiante.
  Nunca corporativo" (`CLAUDE.md`, seção "Estilo & voz").
- **Frase**: curta e direta nos títulos e CTAs (*"Como funciona"*, *"Simples e
  rápido"*, *"Começar grátis"*); mais longa só na FAQ, quando a resposta precisa
  de uma condição (ex.: a resposta sobre comissão, com duas frases encadeadas por
  causa e efeito).
- **Gíria/sabor local**: geográfico, não gíria de internet — nomes de praias, bairros
  e a palavra "vila" fazem o trabalho de soar local.
- **Emoji**: a regra documentada em `CLAUDE.md` é *"Sem emoji na UI"*. Na prática,
  `src/pages/ComoFunciona.jsx` usa um ("✅ Perfil verificado"). **Inconsistência a
  confirmar com quem decide a marca** — não resolvi isso por conta própria porque é
  uma decisão de estilo, não um bug.

## 5. Mesmo parágrafo, jeito certo e jeito errado

**Cenário**: anunciar o programa de Prestador Fundador (100 vagas, taxa zero por
um período).

| Jeito certo (voz real da marca) | Jeito errado (soa IA/corporativo) |
|---|---|
| "Seja um dos 100 Prestadores Fundadores da Costa do Descobrimento. Cadastre-se, ganhe o selo e fique isento de taxa enquanto durar o programa — sem letra pequena." | "Estamos entusiasmados em anunciar nosso exclusivo Programa de Fundadores, uma oportunidade única para parceiros estratégicos se juntarem ao nosso ecossistema em crescimento e desfrutarem de benefícios incomparáveis." |

A diferença não é só tom: a versão certa nomeia o número (100), a condição (enquanto
durar) e o benefício concreto (selo, isenção). A errada usa adjetivo em vez de fato.

---

## Lacunas conhecidas

Esta skill (`/slopmonster`) não fabrica prova. Os itens abaixo precisam de alguém
da marca para preencher — não foram inventados:

- Quantidade real de prestadores/clientes ativos hoje (para "Prova" no `brand-dna.md`).
- Confirmação se o uso de emoji em listas de benefícios (seção 4) é intencional ou
  desvio da regra "sem emoji na UI".
