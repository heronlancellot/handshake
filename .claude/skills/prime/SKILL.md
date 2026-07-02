---
name: prime
description: Orienta o agente com contexto completo do projeto antes de começar qualquer trabalho
user-invocable: true
allowed-tools:
  - Read
  - Glob
  - Bash
---

# /prime

Carrega contexto focado do projeto para orientar o agente antes de iniciar trabalho. Em vez de explorar o codebase inteiro (gasto desnecessário de contexto), este comando carrega apenas o essencial.

## Processo

### 1. Ler documentação principal

Leia `CLAUDE.md` na íntegra — contém a referência autoritativa de arquitetura, convenções, comandos e agentes disponíveis.

Leia `.claude/docs/architecture-overview.md` — overview detalhado da stack, estrutura de diretórios e regras de layering.

### 2. Analisar estrutura do projeto

Liste a estrutura de alto nível:

```bash
ls src/
ls src/feature/
ls src/components/
```

### 3. Entender as features existentes

Para cada feature em `src/feature/`, leia apenas o `_types/index.ts` para entender o domínio sem carregar implementação completa.

### 4. Verificar estado atual

```bash
git log --oneline -10
git status
git branch --show-current
```

Verifique se existe um `HANDOFF.md` na raiz — se sim, leia-o primeiro pois contém o contexto da sessão anterior.

### 5. Verificar planos em andamento

Liste tarefas existentes:
```bash
ls developer/tasks/ 2>/dev/null || echo "(nenhuma tarefa em andamento)"
```

Se houver tarefas, leia o `MAIN.md` da mais recente para entender o estado atual.

## Relatório de saída

Forneça um resumo conciso (menos de 200 palavras) cobrindo:

### Visão geral do projeto
- Nome, propósito e stack principal
- Gerenciador de pacotes e comandos principais

### Estrutura de features
- Lista das features existentes e seus domínios
- Padrão de organização identificado

### Estado atual
- Branch ativa, mudanças recentes, trabalho não commitado
- Tarefa em andamento (se houver)
- Próxima ação recomendada

**Seja direto — bullets, não prosa.**
