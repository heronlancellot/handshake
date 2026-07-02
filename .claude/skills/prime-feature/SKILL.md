---
name: prime-feature
description: Orienta o agente com contexto focado em uma feature module específica
user-invocable: true
argument-hint: feature-name
allowed-tools:
  - Read
  - Glob
  - Grep
  - Bash
---

# /prime-feature $ARGUMENTS

Carrega contexto focado da feature `$ARGUMENTS` antes de trabalhar nela. Em vez de explorar o projeto inteiro, carrega apenas o necessário para a feature em questão.

## Processo

### 1. Verificar se a feature existe

```bash
ls src/feature/$ARGUMENTS/
```

Se não existir, liste as features disponíveis:
```bash
ls src/feature/
```
E informe o usuário para confirmar o nome correto.

### 2. Ler as convenções relevantes

Leia `.claude/rules/feature-module.md` — convenções do padrão de feature module.

Se a feature tiver API calls, leia `.claude/rules/api.md`.
Se a feature tiver hooks, leia `.claude/rules/hooks.md`.

### 3. Mapear a estrutura da feature

Leia os seguintes arquivos em paralelo:

- `src/feature/$ARGUMENTS/_types/index.ts` — tipos e interfaces do domínio
- `src/feature/$ARGUMENTS/_hooks/index.ts` — hooks disponíveis
- `src/feature/$ARGUMENTS/_api/` — liste os arquivos de API

### 4. Entender os tipos em profundidade

Leia todos os arquivos em `src/feature/$ARGUMENTS/_types/` para entender o modelo de dados completo.

### 5. Mapear as screens

```bash
ls src/feature/$ARGUMENTS/screens/
```

Para cada screen, leia apenas o `index.tsx` para entender a estrutura sem entrar nos `_components/`.

### 6. Verificar dependências externas

Verifique se a feature importa de `src/types/` ou `src/components/` (dependências compartilhadas):

```bash
grep -r "from '@/types" src/feature/$ARGUMENTS/ --include="*.ts" --include="*.tsx" -l
grep -r "from '@/components" src/feature/$ARGUMENTS/ --include="*.tsx" -l
```

### 7. Verificar histórico recente

```bash
git log --oneline -8 -- src/feature/$ARGUMENTS/
```

## Relatório de saída

Forneça um resumo conciso (menos de 150 palavras) cobrindo:

### Domínio
- O que esta feature representa e qual problema resolve
- Entidades principais e seus campos-chave

### Estrutura atual
- Sub-pastas presentes e o que cada uma contém
- Hooks disponíveis (lista com propósito de cada um)
- Endpoints de API mapeados

### Screens
- Lista de screens e quando cada uma é usada

### Dependências
- Tipos compartilhados importados de `src/types/`
- Componentes compartilhados de `src/components/`

### Mudanças recentes
- Últimos commits na feature

### O que falta / Próximos passos
- Sub-pastas ausentes em relação ao padrão esperado
- Qualquer inconsistência com as convenções

**Seja direto — bullets, não prosa.**
