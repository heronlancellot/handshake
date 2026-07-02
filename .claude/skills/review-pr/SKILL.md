---
name: review-pr
description: Structured pull request review workflow
user-invocable: true
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
---

# PR Review Skill

Review estruturado de pull requests com severidades e veredicto.

## Workflow

### 1. Context — Entender o PR
- Ler título e descrição do PR
- Entender qual problema resolve
- Checar issue linkada se houver
- Entender o escopo esperado

### 2. Changes — Revisar o diff
- Ler cada arquivo alterado
- Entender as mudanças de lógica
- Verificar completude (falta algo?)
- Checar se há mudanças fora do escopo

### 3. Quality — Aplicar checklist de review
- Correção do código
- Error handling
- Implicações de segurança
- Impacto em performance
- Cobertura de testes
- Atualizações de documentação

### 4. Feedback — Fornecer review estruturado

## Output Format

Para cada issue encontrada:

```
**[SEVERITY]** file:line
Descrição do problema.
Suggested fix: ...
```

Severidades:
- CRITICAL — Must fix. Bugs, falhas de segurança, risco de perda de dados.
- WARNING — Should fix. Performance, padrões ruins, falta de error handling.
- SUGGESTION — Nice to have. Naming, estrutura, melhorias menores.
- NITPICK — Opcional. Preferências de estilo, formatação.

## Summary Format

```
## PR Review: [title]

### Summary
[1-2 frases resumindo as mudanças]

### Findings

#### CRITICAL
- [issue and fix]

#### WARNING
- [issue and suggestion]

#### SUGGESTION
- [improvement idea]

### Good Patterns
- [coisas bem feitas — reconhecer bom trabalho]

### Verdict
**[APPROVE / REQUEST_CHANGES / COMMENT]**
[Justificativa breve]
```

## Regras

- Ser construtivo e específico
- Sempre reconhecer bons patterns
- Não nitpick em excesso — focar no que importa
- Se não entender algo, perguntar em vez de assumir
- Verificar se o PR segue as convenções do projeto (CLAUDE.md)
