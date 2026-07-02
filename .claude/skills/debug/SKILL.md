---
name: debug
description: Systematic debugging workflow for tracking down and fixing bugs
user-invocable: true
allowed-tools:
  - Read
  - Edit
  - Grep
  - Glob
  - Bash
---

# Debug Skill

Workflow sistemático para encontrar e corrigir bugs. Segue 6 passos obrigatórios.

## Workflow

### 1. Reproduce — Entender e reproduzir o bug
- Ler a mensagem de erro ou descrição do problema
- Encontrar o código relevante
- Entender o comportamento esperado vs real
- Se possível, rodar o código e confirmar o erro

### 2. Isolate — Reduzir o escopo
- Usar Grep para encontrar código relacionado
- Traçar o fluxo de execução
- Identificar a função/linha específica causando o problema
- Descartar hipóteses falsas antes de prosseguir

### 3. Diagnose — Entender a causa raiz
- Verificar input/output em cada passo
- Procurar edge cases
- Checar mudanças recentes que podem ter introduzido o bug
- Identificar se é bug de lógica, tipagem, estado, timing, ou dependência

### 4. Fix — Implementar a correção mínima
- Fazer a menor mudança que corrige o bug
- NÃO refatorar enquanto corrige
- Preservar comportamento existente para casos não-bugados
- Seguir os padrões do projeto (ler CLAUDE.md e rules)

### 5. Verify — Confirmar que funciona
- Rodar testes existentes
- Testar o cenário específico que estava quebrado
- Verificar que não há regressões
- Rodar type-check se aplicável

### 6. Document — Registrar o que aconteceu
- Adicionar comentário se o bug era não-óbvio
- Atualizar ou criar teste para cobrir o caso
- Resumir a causa raiz e a correção

## Regras

- Nunca corrigir mais do que o bug em si
- Não refatorar durante debugging
- Sempre verificar a correção
- Escrever teste para o bug se possível
- Se o bug persistir após 2 tentativas, parar e escalar pro usuário
