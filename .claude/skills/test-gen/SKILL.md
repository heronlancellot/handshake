---
name: test-gen
description: Generate comprehensive tests for existing code
user-invocable: true
allowed-tools:
  - Read
  - Write
  - Grep
  - Glob
  - Bash
---

# Test Generation Skill

Gera testes abrangentes para código existente.

## Workflow

### 1. Analyze — Entender o código a testar
- Ler a função/componente/módulo completamente
- Identificar inputs, outputs e side effects
- Listar edge cases e condições de erro
- Verificar dependências externas que precisam de mock

### 2. Plan — Desenhar a suíte de testes
- Agrupar testes por comportamento
- Cobrir happy path primeiro
- Depois edge cases
- Depois error cases
- Verificar se já existem testes pra reaproveitar patterns

### 3. Generate — Escrever os testes
- Usar o framework de testes do projeto (ler CLAUDE.md e `.claude/rules/testing.md`)
- Seguir padrões de testes existentes no projeto
- Nomes descritivos para cada teste
- Uma asserção por teste quando possível
- Usar Arrange → Act → Assert

### 4. Verify — Rodar e validar
- Todos os testes passam
- Testes falham quando o código é quebrado (mentalidade de mutation testing)
- Nenhum teste flaky

## Categorias de Teste

- **Unit Tests**: Funções/métodos individuais
- **Integration Tests**: Interações entre componentes
- **Edge Cases**: Condições de contorno, null/undefined, arrays vazios
- **Error Cases**: Inputs inválidos, falhas de rede, timeouts

## Naming Convention

```
describe('[Module/Component]', () => {
  describe('[method/behavior]', () => {
    it('should [expected behavior] when [condition]', () => {
      // Arrange, Act, Assert
    });
  });
});
```

## Regras

- Seguir patterns de teste do projeto (ler rules/testing.md se existir)
- Não testar implementação — testar comportamento
- Não criar mocks desnecessários
- Não deixar testes dependentes de ordem de execução
