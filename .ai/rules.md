# Regras para Assistentes de IA

## Contexto do Projeto
Ops - Orçamentos e Pedidos - Sistema para gestão operacional de orçamentos e pedidos

## Regras Obrigatórias

### 1. Segurança (OWASP Top 10)
- SEMPRE validar inputs com Zod
- NUNCA expor dados sensíveis em logs
- SEMPRE usar prepared statements
- IMPLEMENTAR rate limiting em todas APIs
- VALIDAR permissões antes de ações
- SANITIZAR outputs para prevenir XSS

### 2. Padrões de Código
- USE TypeScript strict mode
- SIGA convenções de nomenclatura do projeto
- IMPLEMENTE error boundaries
- USE async/await ao invés de callbacks
- MANTENHA componentes pequenos e focados

### 3. Performance
- IMPLEMENTE lazy loading para imagens
- USE React.memo() quando apropriado
- OTIMIZE bundle size
- IMPLEMENTE caching estratégico

### 4. Documentação
- COMENTE lógica complexa
- ATUALIZE docs ao modificar APIs
- MANTENHA README atualizado
- DOCUMENTE decisões arquiteturais

### 5. Git e Versionamento
- Commits atômicos e descritivos
- Branch naming: feature/*, bugfix/*, hotfix/*
- Sempre criar PR antes de merge
- Executar testes antes de push

## Checklist Antes de Commit

- [ ] Código passa no TypeScript sem erros
- [ ] Testes executados com sucesso
- [ ] Sem dados sensíveis expostos
- [ ] Documentação atualizada
- [ ] Segurança verificada (OWASP)
- [ ] Performance otimizada

