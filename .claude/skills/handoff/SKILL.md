---
name: handoff
description: Escreve um documento de handoff para continuar o trabalho em uma nova sessão
user-invocable: true
allowed-tools:
  - Read
  - Write
  - Bash
---

# /handoff

Captura o estado da sessão atual em um arquivo `HANDOFF.md` para que a próxima sessão continue sem perder contexto.

## Quando usar

- Antes de encerrar uma sessão longa onde o trabalho vai continuar
- Quando o contexto está chegando no limite
- Ao transicionar entre fases (pesquisa → implementação)
- Antes de uma troca entre sessões humano/AI

## Processo

### 1. Analisar a sessão atual

Revise tudo que aconteceu nesta conversa:
- Qual era o objetivo original?
- O que foi concluído?
- O que está em andamento ou bloqueado?
- Quais decisões foram tomadas e POR QUÊ?
- Quais arquivos foram lidos, criados ou modificados?
- Quais erros foram encontrados e como foram resolvidos?
- Quais dead ends foram explorados (para a próxima sessão não repetir)?

### 2. Verificar estado atual

```bash
git status
git diff --stat HEAD
git log --oneline -5
git branch --show-current
```

### 3. Escrever o HANDOFF.md

Salvar em: `HANDOFF.md` na raiz do projeto.

**Use exatamente esta estrutura:**

```markdown
# Handoff: [Descrição breve da tarefa]

**Data:** [data atual]
**Branch:** [branch atual]
**Último commit:** [hash + mensagem, ou "mudanças não commitadas"]

## Objetivo

[1-2 frases: o que estamos tentando alcançar. Inclua o pedido original ou referência ao plano.]

## Concluído

- [x] [Tarefa 1 — descrição breve do que foi feito]
- [x] [Tarefa 2 — descrição breve]

## Em andamento / Próximos passos

- [ ] [Tarefa 3 — o que precisa acontecer a seguir, com detalhes suficientes para agir]
- [ ] [Tarefa 4 — inclua caminhos de arquivo e áreas específicas de foco]
- [ ] [Tarefa 5 — itens bloqueados com explicação do bloqueio]

## Decisões-chave

Documente o POR QUÊ das escolhas, não só o que foi escolhido:

- **[Decisão]**: [O que foi escolhido] — [Por que, incluindo alternativas rejeitadas]

## Dead Ends (Não repetir)

- [Abordagem tentada que não funcionou] — [Por que falhou]
- [Caminho de investigação irrelevante] — [O que foi encontrado em vez disso]

## Arquivos Alterados

- `path/to/file.ts` — [o que mudou e por quê, 1 linha]
- `path/to/new-file.ts` — [NOVO: o que este arquivo faz]
- `path/to/deleted-file.ts` — [DELETADO: por que foi removido]

## Estado Atual

- **Type-check:** [limpo / N erros]
- **Lint:** [limpo / N avisos]
- **Testes:** [passando / falhando — quais e por quê]
- **Build:** [funcionando / quebrado]

## Contexto para a Próxima Sessão

[2-4 frases: a coisa MAIS IMPORTANTE que o próximo agente precisa saber. Qual é a situação atual? Qual é o maior risco? O que fazer primeiro?]

**Primeira ação recomendada:** [Comando ou passo exato para executar primeiro]
```

### 4. Confirmar e orientar

Após escrever o handoff:
1. Confirme o caminho completo do arquivo escrito
2. Sugira o comando para a próxima sessão:
   ```
   Leia HANDOFF.md e continue de onde a sessão anterior parou.
   ```
3. Se houver mudanças não commitadas, sugira commitar primeiro

## Critérios de qualidade

Um bom handoff:
- Permite que um agente fresco continue sem fazer perguntas de esclarecimento
- Tem menos de 100 linhas (conciso — referencie arquivos em vez de duplicar conteúdo)
- Inclui contexto "por quê" suficiente para o próximo agente tomar as mesmas decisões
- Lista explicitamente os dead ends para evitar esforço desperdiçado
- Tem uma recomendação concreta de "primeira ação"
