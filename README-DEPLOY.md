# 🚀 Guia de Deploy - Ops Orçamentos e Pedidos

## 📋 Pré-requisitos para Deploy

1. **Conta na Vercel**: [vercel.com](https://vercel.com)
2. **Banco PostgreSQL**: **Recomendamos Neon** (3GB gratuito)
   - Alternativas: Vercel Postgres (256MB) ou Supabase (500MB)
3. **Repositório Git**: GitHub, GitLab ou Bitbucket

> 📘 **Guia Completo do Neon**: Veja [docs/NEON-SETUP.md](./docs/NEON-SETUP.md) para instruções detalhadas

## 🛠️ Configuração do Deploy

### 1. Preparar Banco de Dados

#### Opção A: Neon PostgreSQL ⭐ (RECOMENDADO)
1. Acesse [neon.tech](https://neon.tech) e crie uma conta
2. Crie um novo projeto chamado `ops-orcamentos-pedidos`
3. Copie **DUAS** connection strings:
   - `DATABASE_URL` (Pooled connection)
   - `DIRECT_URL` (Direct connection)
4. **Vantagens**: 3GB gratuito, serverless, branching
5. **📘 [Guia Detalhado do Neon](./docs/NEON-SETUP.md)**

#### Opção B: Vercel Postgres
1. No dashboard da Vercel, acesse "Storage"
2. Crie um novo Postgres database
3. Copie a `DATABASE_URL` fornecida
4. **Limitação**: 256MB no plano gratuito

#### Opção C: Supabase
1. Crie projeto no [supabase.com](https://supabase.com)
2. Vá em Settings > Database
3. Copie a Connection String
4. **Vantagens**: 500MB gratuito, interface visual

### 2. Configurar Variáveis de Ambiente

#### Localmente (arquivo `.env`)

```bash
# Database - Neon PostgreSQL
DATABASE_URL="postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"

# NextAuth.js
NEXTAUTH_SECRET="gere-com: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
```

#### Na Vercel (Production)

No dashboard da Vercel > Settings > Environment Variables, adicione:

| Variável | Valor | Ambiente |
|----------|-------|----------|
| `DATABASE_URL` | Connection string **Pooled** do Neon | Production, Preview, Development |
| `DIRECT_URL` | Connection string **Direct** do Neon | Production, Preview, Development |
| `NEXTAUTH_SECRET` | Chave secreta gerada | Production, Preview, Development |
| `NEXTAUTH_URL` | `https://seu-app.vercel.app` | Production |

### 3. Schema do Banco

✅ **Já configurado!** O projeto já está preparado para PostgreSQL.

O `prisma/schema.prisma` já contém:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

> O `directUrl` é necessário para migrações no Neon (usa conexão direta ao invés de pooled)

### 4. Deploy Steps

#### Primeira vez - Setup Local

```bash
# 1. Instalar dependências
npm install

# 2. Configurar .env com as credenciais do Neon

# 3. Gerar cliente Prisma
npx prisma generate

# 4. Executar migrações
npx prisma migrate deploy

# 5. Popular dados iniciais (opcional)
npx prisma db seed

# 6. Testar localmente
npm run dev
```

#### Deploy na Vercel

```bash
# Opção 1: Deploy via Vercel CLI
npx vercel

# Opção 2: Push para GitHub (deploy automático se conectado)
git add .
git commit -m "Configure PostgreSQL with Neon"
git push origin main
```

#### Pós-Deploy

Após o deploy, execute as migrações no ambiente de produção:

```bash
# Via Vercel CLI
vercel env pull .env.production
npx prisma migrate deploy --schema=./prisma/schema.prisma
```

Ou configure no painel da Vercel um **Build Command** customizado:
```
npm run build && npx prisma migrate deploy
```

## ⚡ Deploy Automático

1. Conecte seu repositório GitHub à Vercel
2. Configure as variáveis de ambiente
3. Todo push na branch main fará deploy automático

## 🔧 Troubleshooting

### Erro de Build
- Verifique se todas as dependências estão no `package.json`
- Confirme que o build local funciona

### Erro de Database
- Verifique se a `DATABASE_URL` está correta
- Execute as migrações com `prisma migrate deploy`

### Erro de Autenticação
- Confirme que `NEXTAUTH_SECRET` e `NEXTAUTH_URL` estão configurados
- Para OAuth, configure os redirect URLs nos providers

## 📊 Monitoramento

- Use Vercel Analytics para métricas
- Configure logs para debugging
- Monitore performance e erros

## 🔒 Segurança em Produção

1. **HTTPS obrigatório** (automático na Vercel)
2. **Variáveis de ambiente** nunca no código
3. **Senhas hasheadas** (implementar bcrypt)
4. **Rate limiting** nas APIs
5. **Validação** de todos os inputs

## 🎯 Próximos Passos Pós-Deploy

1. Configurar domínio customizado
2. Implementar monitoramento de erros (Sentry)
3. Configurar backups do banco
4. Implementar CI/CD completo
5. Adicionar testes E2E

---

**🎉 Sucesso! Seu sistema está em produção!**

