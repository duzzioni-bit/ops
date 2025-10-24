# Ops - Orçamentos e Pedidos

Sistema para gestão operacional de orçamentos e pedidos, desenvolvido com Next.js 15, TypeScript, Tailwind CSS e Shadcn/ui.

## 🌐 Deploy e Produção

**Ambiente de Produção**: [https://ops-orcamentos-pedidos.vercel.app](https://ops-orcamentos-pedidos.vercel.app)

> 📝 Para mais detalhes sobre deploy, consulte o [Guia de Deploy](./README-DEPLOY.md)

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

### ⚡ Modo Rápido (10 minutos)

**Windows:**
```powershell
.\scripts\setup-neon.bat
```

**Linux/Mac:**
```bash
chmod +x ./scripts/setup-neon.sh
./scripts/setup-neon.sh
```

📘 **Guia completo**: [Quick Start](./docs/QUICK-START.md)

### 📋 Modo Manual

1. **Clone o repositório**
```bash
git clone [url-do-repositorio]
cd ops-orcamentos-pedidos
```

2. **Configure o banco de dados**
   - Crie conta no [Neon](https://neon.tech)
   - Crie projeto `ops-orcamentos-pedidos`
   - Copie as connection strings

3. **Configure variáveis de ambiente**
```bash
# Copie o template
cp env.template .env

# Edite .env com suas credenciais do Neon
```

4. **Instale e configure**
```bash
npm install
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
```

5. **Execute o projeto**
```bash
npm run dev
```

6. **Acesse no navegador**
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

- [x] ✅ Implementar autenticação (NextAuth.js)
- [x] ✅ Conectar com banco de dados (PostgreSQL + Neon)
- [x] ✅ Deploy em produção (Vercel)
- [ ] Adicionar testes E2E
- [ ] Implementar notificações por email
- [ ] Sistema de permissões granular

## 📝 Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento
npm run build        # Build de produção
npm run start        # Executar build
npm run lint         # Verificar código
npm run type-check   # Verificar TypeScript
```

## 📚 Documentação

### 🚀 Início Rápido
- [⚡ Quick Start](./docs/QUICK-START.md) - **Comece aqui!** Setup em 10 minutos

### 🔧 Configuração
- [Configuração Neon](./docs/NEON-SETUP.md) - Setup detalhado do banco PostgreSQL
- [Variáveis de Ambiente](./docs/ENV-VARIABLES.md) - Todas as variáveis necessárias
- [Guia de Deploy](./README-DEPLOY.md) - Deploy em produção na Vercel

### 📖 Documentação Técnica
- [PRD](./docs/PRD.md) - Documento de Requisitos do Produto
- [Documentação Técnica](./docs/TECHNICAL.md) - Arquitetura e detalhes técnicos

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