# Ops - Orçamentos e Pedidos

Sistema para gestão operacional de orçamentos e pedidos, desenvolvido com Next.js 15, TypeScript, Tailwind CSS e Shadcn/ui.

## 🚀 Funcionalidades

- ✅ **Dashboard** com métricas e estatísticas
- ✅ **Gestão de Orçamentos**
  - Listagem de orçamentos
  - Criação de novos orçamentos
  - Status de aprovação/rejeição
  - Conversão para pedidos
- ✅ **Gestão de Pedidos**
  - Listagem de pedidos
  - Criação de novos pedidos
  - Acompanhamento de status
  - Controle de entrega
- ✅ **Mock Data** para desenvolvimento rápido
- ✅ **Interface responsiva** e moderna
- ✅ **Segurança** seguindo padrões OWASP Top 10

## 🛠️ Tecnologias

- **Framework**: Next.js 15 com App Router
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS + Shadcn/ui
- **Ícones**: Lucide React
- **Validação**: Zod + React Hook Form
- **Estado**: Context API (expandível para Zustand)

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn

## 🚀 Como executar

1. **Clone o repositório**
```bash
git clone [url-do-repositorio]
cd ops-orcamentos-pedidos
```

2. **Instale as dependências**
```bash
npm install
```

3. **Execute o projeto**
```bash
npm run dev
```

4. **Acesse no navegador**
```
http://localhost:3000
```

## 📱 Páginas Disponíveis

- `/` - Dashboard principal
- `/orcamentos` - Lista de orçamentos
- `/orcamentos/novo` - Criar novo orçamento
- `/pedidos` - Lista de pedidos
- `/pedidos/novo` - Criar novo pedido

## 🏗️ Estrutura do Projeto

```
src/
├── app/                  # Rotas e páginas (App Router)
│   ├── orcamentos/      # Páginas de orçamentos
│   ├── pedidos/         # Páginas de pedidos
│   ├── layout.tsx       # Layout principal
│   └── page.tsx         # Página inicial
├── components/
│   └── ui/              # Componentes Shadcn/ui
├── lib/
│   ├── mock-data/       # Dados mockados
│   └── security/        # Funções de segurança
└── middleware.ts        # Middleware de segurança
```

## 🛡️ Segurança

O projeto implementa as principais práticas de segurança:

- Headers de segurança configurados
- Validação de inputs
- Proteção XSS
- CSP (Content Security Policy)
- Rate limiting preparado
- Sanitização de dados

## 📊 Mock Data

O sistema utiliza dados mockados para demonstração:

- **Usuários**: 3 usuários com diferentes roles
- **Orçamentos**: 2 orçamentos de exemplo
- **Pedidos**: 1 pedido de exemplo
- **Simulação de delay** de rede para realismo

## 🔄 Próximos Passos

- [ ] Implementar autenticação
- [ ] Conectar com banco de dados
- [ ] Adicionar testes unitários
- [ ] Implementar relatórios
- [ ] Adicionar notificações
- [ ] Deploy em produção

## 📝 Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento
npm run build        # Build de produção
npm run start        # Executar build
npm run lint         # Verificar código
npm run type-check   # Verificar TypeScript
```

## 📚 Documentação

- [PRD](./docs/PRD.md) - Documento de Requisitos do Produto
- [Documentação Técnica](./docs/TECHNICAL.md) - Detalhes técnicos
- [Regras para IA](./ai/rules.md) - Regras para assistentes de IA

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

---

**Desenvolvido com ❤️ seguindo as melhores práticas de desenvolvimento web**