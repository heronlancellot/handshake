---
name: setup
description: Auto-adapta a configuração dos agentes ao repositório real após init.sh
user-invocable: true
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
---

# Setup Skill — Auto-adaptação ao repositório

Roda uma vez após `./init.sh <preset>` copiar os arquivos estáticos.
Detecta o stack real e adapta CLAUDE.md, docs e rules ao projeto.

## Workflow

### 1. Detectar stack real

Ler os seguintes arquivos (se existirem):
- `package.json` — nome do projeto, dependências, scripts
- `tsconfig.json` — configuração TypeScript
- `.env.example` ou `.env.local` — variáveis de ambiente
- `next.config.ts` ou `next.config.js` — configuração Next.js
- `tailwind.config.ts` — configuração Tailwind
- `foundry.toml` ou `hardhat.config.ts` — se houver contratos

### 2. Preencher CLAUDE.md

Substituir placeholders:
- `[PROJECT_NAME]` → nome real do `package.json`
- Stack table → versões reais das dependências
- Commands → scripts reais do `package.json`

### 3. Mapear features existentes

```bash
ls src/feature/ 2>/dev/null || ls apps/web/src/feature/ 2>/dev/null
```

Para cada feature encontrada, documentar brevemente no CLAUDE.md.

### 4. Gerar architecture-overview.md

Reescrever `.claude/docs/architecture-overview.md` com:
- Stack real (versões detectadas)
- Estrutura de diretórios real (`tree src/ -L 2` ou equivalente)
- Features existentes e seus domínios
- Variáveis de ambiente documentadas

### 5. Ajustar commands

Comparar os scripts do `package.json` com os commands no CLAUDE.md.
Se `pnpm run dev` existe mas `pnpm dev` não, ajustar.

### 6. Validar rules

Para cada rule em `.claude/rules/`:
- Verificar se os glob patterns correspondem a diretórios que existem
- Reportar rules cujos paths não existem ainda (pode ser intencional)

## Output

Resumo do que foi detectado e adaptado:
- Projeto: [nome]
- Stack: [versões detectadas]
- Features: [lista]
- Rules validadas: [N/N]
- Ações tomadas: [lista de edits]

## Regras

- Nunca inventar dados — só usar o que foi detectado nos arquivos
- Se um arquivo não existir, pular silenciosamente
- Não modificar rules — apenas reportar incompatibilidades
- Não criar arquivos novos além de editar CLAUDE.md e architecture-overview.md
