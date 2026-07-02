---
name: refactor
description: Safe refactoring workflow that preserves behavior while improving code quality
user-invocable: true
allowed-tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
  - Bash
---

# Refactor Skill

Workflow seguro para refatoração. Preserva comportamento, melhora qualidade.

## Pré-condições

- Todos os testes passam ANTES de começar
- Entendimento claro do que precisa mudar
- NUNCA misturar refatoração com mudança de feature

## Workflow

### 1. Assess — Entender o que precisa de refatoração
- Ler o código completamente
- Identificar o code smell ou problema
- Definir o estado final desejado
- Listar TODOS os arquivos que serão afetados

### 2. Plan — Planejar a abordagem
- Listar mudanças em ordem
- Identificar passos arriscados
- Decidir se é melhor fazer incremental ou de uma vez
- Apresentar o plano pro usuário se a mudança for grande

### 3. Test — Garantir cobertura de testes
- Rodar testes existentes
- Adicionar testes se a cobertura for insuficiente
- Testes DEVEM passar antes de qualquer mudança

### 4. Execute — Fazer mudanças incrementais
- Uma mudança pequena por vez
- Rodar testes após cada mudança
- Manter mudanças reversíveis
- Se testes quebrarem, reverter e tentar abordagem diferente

### 5. Verify — Confirmar que nada quebrou
- Todos os testes passam
- Comportamento preservado
- Código está mais limpo/organizado
- Type-check passa

## Regras

- NUNCA misturar refatoração com mudanças de feature
- Testes devem passar em CADA passo
- Se testes quebrarem, reverter e tentar diferente
- Não over-abstract — simplicidade primeiro
- Seguir padrões do projeto (CLAUDE.md e rules)
