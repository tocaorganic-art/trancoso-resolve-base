# Ferramentas da auditoria

Registro de 11/11/2026. Todo número abaixo saiu de comando executado; o que não foi medido está marcado.

## Ambiente

| Ferramenta | Versão | Observação |
|---|---|---|
| Node | v26.13.0 | Acima do mínimo de 22.20 do CLI de skills |
| npm | 11.20.0 | Usado para instalar e rodar scripts |
| pnpm | 12.18.0 | Instalado, mas não usado no projeto (ver abaixo) |
| git | 2.56.0.windows.4 | |
| gh | 2.103.3 | |
| Claude Code | 2.1.322 | |

### Por que npm e não pnpm

- O `pnpm` em `C:\Program Files\nodejs` aponta para um shim do corepack que não existe mais. Foi reinstalado com `npm i -g pnpm`.
- `pnpm install` falha com `ERR_PNPM_IGNORED_BUILDS` (build do esbuild bloqueado). A saída seria aprovar builds de forma interativa ou usar uma flag de bypass, que não foi usada.
- O repo versiona `package-lock.json` e o CI roda `npm ci`. A auditoria seguiu o mesmo caminho. Nenhum `pnpm-lock.yaml` foi criado no repo.

## Linha de base (main em `e0f7f2be`)

| Verificação | Resultado |
|---|---|
| `npm run lint` | 0 erros, 37 avisos |
| `npm run build` | concluído, 47 rotas no prerender |
| `node --test` em cada `tests/*.test.js` | 8 arquivos, 41 testes, 0 falhas |
| Arquivos protegidos | 3 de 3 presentes |
| `base44/functions/*/entry.ts` | 68 |
| Typecheck global | não medido (o projeto tem erros preexistentes) |

## Skills instaladas

Comando: `npx -y skills add <repo> --skill <nome>`. Arquivos em `.agents/skills/`, versão travada em `skills-lock.json`.

| Skill | Origem | Licença declarada | Resultado |
|---|---|---|---|
| web-quality-audit | addyosmani/web-quality-skills | MIT | instalada |
| accessibility | addyosmani/web-quality-skills | MIT | instalada |
| core-web-vitals | addyosmani/web-quality-skills | MIT | instalada |
| performance | addyosmani/web-quality-skills | MIT | instalada |
| seo | addyosmani/web-quality-skills | MIT | instalada |
| best-practices | addyosmani/web-quality-skills | MIT | instalada |
| webapp-testing | anthropics/skills | Apache 2.0 | instalada |
| frontend-design | anthropics/skills | Apache 2.0 | instalada |
| systematic-debugging | obra/superpowers | MIT | instalada |
| verification-before-completion | obra/superpowers | MIT | instalada |
| test-driven-development | obra/superpowers | MIT | instalada |
| requesting-code-review | obra/superpowers | MIT | instalada |
| dispatching-parallel-agents | obra/superpowers | MIT | instalada |

Regras de uso:

- `frontend-design` fica subordinada ao Brand Kit "Trancoso Resolve Casa" (Nunito, `#E8571A`). Ela não define marca, fonte nem paleta.
- Não instaladas por decisão: `vercel-labs/agent-skills` (sem licença declarada) e `brand-guidelines` da Anthropic (aplica outra marca).
- `.claude/skills/` contém junções locais do Windows para `.agents/skills/` e fica fora do git.

## Conectores MCP

Comando: `claude mcp add <nome> -- npx -y <pacote>@latest`. Configuração local do projeto em `~/.claude.json`.

| Conector | Pacote | Estado em `claude mcp list` | Versão |
|---|---|---|---|
| playwright | @playwright/mcp | conectado | não medido (`latest`) |
| chrome-devtools | chrome-devtools-mcp | conectado | não medido (`latest`) |
| lighthouse | lighthouse-mcp | conectado | não medido (`latest`) |

## Acessibilidade em script versionado

- Dependência: `@axe-core/playwright` `^4.14.0` (dev). `playwright` `^1.64.1` já existia.
- Script: `node scripts/a11y-audit.mjs [baseUrl]`. Roda axe (WCAG 2.0 e 2.1, A e AA) em 11 rotas, desktop 1440x900 e mobile 390x844, grava `docs/auditoria/a11y.json` e sai com código 1 se houver violação séria ou crítica.
- Linha de base em 11/11/2026, contra `http://localhost:5173`: **54 violações sérias ou críticas**, 0 rotas com erro. `/login` e `/register` saíram com 0.

Regras que mais se repetem na linha de base:

| Regra | Onde | Situação |
|---|---|---|
| `color-contrast` | botões `bg-brand-primary` com texto branco, em quase todas as rotas | Depende de decisão de marca. Ver pendências. |
| `link-name` | link `.min-w-fit` do cabeçalho, em todas as rotas com layout | Corrigível no código |
| `select-name` | `select` em `/seja-prestador` e `/contato` | Corrigível no código |
| `button-name` | `/seja-prestador` e `/planos` | Corrigível no código |
| `aria-hidden-focus`, `nested-interactive`, `scrollable-region-focusable` | `/investidores`, `/` | Corrigível no código |

## Pendências para o Tony

- **Contraste do CTA.** Texto branco sobre `#E8571A` não atinge AA para texto de tamanho normal. O Brand Kit tem a terracota `#C1440E`, mais escura. Trocar o fundo dos botões é decisão de marca e não foi feita.
- **GitHub Actions.** Em 11/11/2026 o status oficial do GitHub marcava `Actions: major_outage`. Os PRs abertos nesse período ficaram com o CI em fila.
