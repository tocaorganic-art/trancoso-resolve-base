# Plano de recrutamento direto — primeiros Prestadores Fundadores

> Criado em 27/10/2026, atualizado em 27/10/2026 depois de ler o site real e os dados do
> Base44. Objetivo: sair de **0 prestadores verificados pelo Programa Fundador** para os
> primeiros 10-15 prestadores verificados — priorizando quem **já se cadastrou e nunca
> completou a verificação**, antes de convidar gente nova do zero.

---

## ✅ Preço confirmado (27/10/2026)

R$ 59,90/mês após 2 meses grátis sem cartão — confirmado com Tony. Esse é o valor real da
página `PrestadorFundador.jsx` e já está corrigido em `docs/PRESTADOR_FUNDADOR_IMPLEMENTACAO.md`
(que tinha ficado desatualizado com R$ 19,90). Pode usar os números abaixo sem ressalva.

---

## 0. Prioridade imediata — reativar quem já se cadastrou (antes de convidar gente nova)

Conferindo o site real (`trancosoresolve.com.br`) e os dados do Base44, descobri que a
plataforma **não está em zero**: existem **28 `User` com `user_type: "prestador"`**, a
maioria com nome e email pessoal real, cadastrados entre out/2025 e out/2026 — é esse
número (menos uns 7 admin/teste) que gera o "19 profissionais cadastrados" que aparece na
home. **Nenhum deles chegou a criar um perfil `ServiceProvider` nem passou pela
verificação/Programa Fundador** — entraram por um cadastro simples e pararam ali.

**Isso são leads muito mais quentes que um contato frio**: essas pessoas já demonstraram
interesse ativo no passado. Vale contatá-las antes de sair atrás de gente nova.

⚠️ **Só tenho o email de cada um — não achei telefone** (o cadastro de `User` não tem
campo de telefone). Se você reconhece algum desses nomes e tem o WhatsApp, prefira
WhatsApp; senão, use o e-mail.

⚠️ **Nota técnica separada (não bloqueia o contato):** 3 dos 11 serviços listados na home
(`Instalações e Reparos Elétricos` ×2, `Serviço de Garçom Profissional`) têm `provider_id`
tipo `"provider_eletricista_residencial"` — são placeholders/seed, não ligados a nenhum
desses 28 usuários nem a nenhum `ServiceProvider` real. Aparecem pro visitante como se
fossem reais. Vale decidir separadamente se remove ou mantém até ter prestador de verdade
nessas categorias.

### Lista para contato

**21 contatos reais identificados** (nome, email, data de cadastro), 7 contas admin/teste
excluídas. **A lista com os dados pessoais está em
[`docs/lista-leads-prestadores.confidencial.md`](./lista-leads-prestadores.confidencial.md)**
— um arquivo que o `.gitignore` bloqueia de propósito (`*.confidencial.md`), pra não
versionar dados pessoais de terceiros no Git. Abra esse arquivo localmente pra ver a lista
e marcar o status de cada contato.

### Template de email

```
Assunto: Sua vaga no Programa Prestador Fundador da Trancoso Resolve ainda está aberta

Oi [nome]!

Vi que você se cadastrou na Trancoso Resolve como prestador de serviço, mas o
cadastro não chegou a ser concluído até a verificação.

Separamos 100 vagas pra quem entrar primeiro na plataforma: 2 meses grátis (sem
cartão, sem comissão — você fica com 100% do valor do serviço), e quem completa
a verificação dentro das primeiras 100 vagas ganha o Selo Prestador Fundador pra
sempre.

Pra retomar, é só entrar em trancosoresolve.com.br/prestador-fundador, completar
o cadastro dos seus serviços e enviar o documento pra verificação. Qualquer
dúvida, responda este email ou fale com a gente pelo WhatsApp [seu número].

Um abraço,
Tony — Trancoso Resolve
```

### Como isso muda o cronograma

Trate a seção 0 como a **semana 1** de fato — contatar esses ~20 antes de abrir a lista
de convites novos da seção 2. Mesmo que só 3-5 respondam e completem a verificação, isso
já tira o programa do zero sem precisar de nenhum contato novo.

---

## 1. Categorias prioritárias

Baseado nas páginas de categoria×destino que **já existem e estão no ar** (ou seja, pronto
pra indexar no Google assim que tiverem prestador real por trás):

### Prioridade alta — manutenção essencial de casa/imóvel (demanda recorrente)
1. **Eletricista** — Trancoso, Arraial d'Ajuda, Porto Seguro, Caraíva
2. **Diarista** — Trancoso, Arraial d'Ajuda, Porto Seguro, Caraíva
3. **Encanador** — Trancoso
4. **Jardineiro** — Trancoso, Arraial d'Ajuda, Porto Seguro, Caraíva
5. **Piscineiro** — Trancoso, Arraial d'Ajuda, Porto Seguro, Caraíva
6. **Pedreiro** — Trancoso, Arraial d'Ajuda, Porto Seguro, Caraíva

### Prioridade média — temporada/eventos/pousada
7. **Chef / Cozinheiro** — Trancoso, Arraial d'Ajuda, Porto Seguro, Caraíva
8. **Segurança** — Trancoso
9. **Pintor** — Trancoso
10. **Motorista** — Trancoso

### Prioridade baixa (nicho/evento específico)
11. **DJ** — Trancoso

**Por quê essa ordem:** itens 1-6 são serviços que qualquer morador ou dono de imóvel
precisa com frequência (vazamento, falta de luz, limpeza, jardim, piscina, reforma) —
são os que geram pedido real mais rápido. 7-10 têm demanda mais sazonal/pontual.
11 é nicho.

**Meta inicial:** pelo menos 1 prestador verificado em Eletricista, Diarista e Jardineiro
em Trancoso antes de qualquer divulgação pública — são as 3 páginas que mais provavelmente
recebem busca orgânica primeiro.

---

## 2. Lista de contatos — modelo para você preencher

Preenchi as categorias e destinos prioritários como linhas; os dados de quem convidar
são seus (não tenho como saber quem você conhece em Trancoso). Pode copiar esta tabela
para uma planilha ou Airtable se preferir controlar por lá.

| Categoria | Destino | Nome do contato | WhatsApp | Como você o conhece | Status |
|---|---|---|---|---|---|
| Eletricista | Trancoso | | | | Não contatado |
| Diarista | Trancoso | | | | Não contatado |
| Jardineiro | Trancoso | | | | Não contatado |
| Encanador | Trancoso | | | | Não contatado |
| Piscineiro | Trancoso | | | | Não contatado |
| Pedreiro | Trancoso | | | | Não contatado |
| Eletricista | Arraial d'Ajuda | | | | Não contatado |
| Diarista | Arraial d'Ajuda | | | | Não contatado |
| Chef/Cozinheiro | Trancoso | | | | Não contatado |

**Status sugeridos:** Não contatado → Convite enviado → Respondeu → Cadastrou-se →
Documentos enviados → Em verificação → Aprovado/Fundador.

---

## 3. Script de abordagem (WhatsApp, direto e pessoal)

Baseado no copy real da página `PrestadorFundador.jsx`. Ajuste o nome e o "oi, sou eu"
conforme a relação com cada pessoa — isso aqui é ponto de partida, não para colar igual.

```
Oi [nome]! Tudo bem? Aqui é o Tony, da Trancoso Resolve 🧡

Tô lançando uma plataforma pra conectar prestador de serviço com gente que
precisa resolver algo aqui em Trancoso — elétrica, diarista, jardim, piscina,
esse tipo de coisa.

Separei 100 vagas pra quem entrar primeiro: 2 meses grátis (sem cartão, sem
comissão nenhuma — você negocia direto com o cliente e fica com 100% do
valor), e quem entrar nas primeiras 100 vagas ganha o Selo Prestador Fundador
pra sempre.

É só criar o cadastro, mandar o documento pra verificação e já pode colocar
seus serviços no ar. Quer que eu te mande o link?
```

Se a pessoa topar, mande: `https://trancosoresolve.com.br/prestador-fundador`

---

## 4. Fluxo que a pessoa vai seguir (já existe no código, não precisa construir nada)

1. `CadastroTipo` — escolhe "sou prestador"
2. `SejaPrestador` / `PrestadorFundador` — vê os benefícios e benefícios do programa
3. Cadastra até 10 serviços com fotos e descrição
4. Envia documento de identidade + autorização de verificação de antecedentes
5. Cai na fila (`FilaVerificacao`) — **você precisa aprovar manualmente no admin**
   (`AdminAntecedentes` / painel admin) — isso não é automático
6. Se aprovado e ainda houver vaga, recebe o Selo Fundador automaticamente

**Atenção:** o passo 5 depende de você (ou de quem administra) revisar e aprovar.
Combine com você mesmo um prazo curto (ex: 24-48h) pra não deixar prestador esperando
depois de ele ter topado — isso é o que mais mata conversão num convite pessoal.

---

## 5. Cronograma sugerido

| Semana | Meta |
|---|---|
| 1 | Enviar o email da seção 0 para os ~20 cadastros parados; aprovar quem completar verificação em até 48h |
| 2 | Com o resultado da seção 0 (provavelmente 3-6 convertem), preencher a lista da seção 2 com nomes novos pra cobrir categorias ainda sem ninguém; enviar os primeiros convites novos |
| 3 | Fechar mais cadastros completos; revisar o que funcionou/não funcionou na abordagem |
| 4 | Com 8-10 prestadores verificados cobrindo Eletricista/Diarista/Jardineiro em Trancoso, aí sim considerar divulgação pública (social, SEO, ads) |

---

## 6. Como acompanhar o progresso real (não só a planilha)

Posso consultar o Base44 (app `68eb21726a9614db4a82ba99`) a qualquer momento para te dizer,
com dados reais:
- Quantos `ServiceProvider` existem e quantos têm `status_verificacao: "aprovado"`
- Quantos `FounderGrant` já foram concedidos (quantas das 100 vagas já foram usadas)
- Quantos estão parados na fila de verificação

Só pedir que eu confiro.
