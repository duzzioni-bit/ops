# 🐘 Configuração do Neon PostgreSQL

Este guia mostra como configurar o banco de dados PostgreSQL usando Neon para o projeto Ops - Orçamentos e Pedidos.

## 📋 Por que usar Neon?

- ✅ **3GB gratuito** (vs 256MB do Vercel Postgres)
- ✅ **Serverless PostgreSQL** - escala automaticamente
- ✅ **Branching** - crie cópias do banco para desenvolvimento
- ✅ **Conexão rápida** com pooling nativo
- ✅ **Backups automáticos**

## 🚀 Passo a Passo

### 1. Criar Conta no Neon

1. Acesse [neon.tech](https://neon.tech)
2. Clique em **"Sign up"**
3. Conecte com GitHub (recomendado) ou use email

### 2. Criar Novo Projeto

1. No dashboard do Neon, clique em **"Create a project"**
2. Configure:
   - **Project name**: `ops-orcamentos-pedidos`
   - **Database name**: `neondb` (padrão)
   - **Region**: Escolha a mais próxima (ex: `US East (Ohio)` ou `Europe (Frankfurt)`)
3. Clique em **"Create Project"**

### 3. Copiar String de Conexão

Após criar o projeto, você verá a tela de conexão:

1. Copie a **Connection String** (formato completo)
   ```
   postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```

2. Você precisará de **DUAS** URLs:
   - `DATABASE_URL` - para conexões pooled (mais rápido)
   - `DIRECT_URL` - para migrações

#### Como obter ambas as URLs:

**DATABASE_URL (Pooled Connection):**
- No Neon dashboard, vá em **Connection Details**
- Selecione **"Pooled connection"**
- Copie a string

**DIRECT_URL (Direct Connection):**
- No mesmo lugar, selecione **"Direct connection"**
- Copie a string

### 4. Configurar Variáveis de Ambiente Localmente

Crie um arquivo `.env` na raiz do projeto:

```bash
# Database - Neon PostgreSQL
DATABASE_URL="postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"

# NextAuth.js
NEXTAUTH_SECRET="gere-uma-chave-secreta-aqui"
NEXTAUTH_URL="http://localhost:3000"
```

#### Como gerar NEXTAUTH_SECRET:

**No Windows (PowerShell):**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

**No Linux/Mac:**
```bash
openssl rand -base64 32
```

### 5. Executar Migrações

Com as variáveis configuradas, execute:

```bash
# Instalar dependências (se ainda não fez)
npm install

# Gerar cliente Prisma
npx prisma generate

# Executar migrações
npx prisma migrate deploy

# (Opcional) Popular dados iniciais
npx prisma db seed
```

### 6. Testar Conexão

```bash
# Abrir Prisma Studio para visualizar o banco
npx prisma studio
```

Isso abrirá uma interface visual em `http://localhost:5555` onde você pode ver suas tabelas.

## 🌐 Configurar na Vercel (Produção)

### 1. Acessar Dashboard da Vercel

1. Entre em [vercel.com](https://vercel.com)
2. Selecione seu projeto `ops-orcamentos-pedidos`
3. Vá em **Settings** > **Environment Variables**

### 2. Adicionar Variáveis de Ambiente

Adicione as seguintes variáveis:

| Nome | Valor |
|------|-------|
| `DATABASE_URL` | String de conexão **Pooled** do Neon |
| `DIRECT_URL` | String de conexão **Direct** do Neon |
| `NEXTAUTH_SECRET` | Mesma chave gerada anteriormente |
| `NEXTAUTH_URL` | `https://seu-app.vercel.app` |

⚠️ **IMPORTANTE**: Marque todas como disponíveis para **Production**, **Preview** e **Development**

### 3. Redeploy

Após adicionar as variáveis:

1. Vá em **Deployments**
2. Clique nos três pontos do último deploy
3. Selecione **"Redeploy"**
4. Marque **"Use existing Build Cache"** (opcional, para ser mais rápido)
5. Clique em **"Redeploy"**

## 🔧 Comandos Úteis

```bash
# Ver status do banco
npx prisma migrate status

# Resetar banco (CUIDADO - apaga todos os dados!)
npx prisma migrate reset

# Criar nova migração
npx prisma migrate dev --name nome_da_migracao

# Abrir Prisma Studio
npx prisma studio

# Formatar schema
npx prisma format
```

## 🎯 Branching no Neon (Recursos Avançados)

O Neon permite criar "branches" do banco de dados:

```bash
# Criar branch de desenvolvimento
# (Faça pelo dashboard do Neon)
```

Isso é útil para:
- Testar migrações sem afetar produção
- Ter ambientes de staging/preview
- Desenvolvimento em equipe

## 🐛 Troubleshooting

### Erro: "Can't reach database server"
- ✅ Verifique se a string de conexão está correta
- ✅ Confirme que o projeto Neon está ativo
- ✅ Verifique conexão com internet

### Erro: "SSL connection required"
- ✅ Certifique-se que a URL contém `?sslmode=require`

### Migrações não aplicam
- ✅ Use `DIRECT_URL` para migrações (não a pooled)
- ✅ Execute `npx prisma migrate deploy` com DIRECT_URL configurada

### Dados não persistem na Vercel
- ✅ Confirme que as variáveis de ambiente estão configuradas
- ✅ Verifique logs do deploy na Vercel
- ✅ Use `DATABASE_URL` pooled para melhor performance

## 📊 Monitoramento

No dashboard do Neon você pode:
- Ver métricas de uso (queries, storage, compute)
- Monitorar conexões ativas
- Ver logs de queries lentas
- Gerenciar backups

## 💰 Limites do Plano Free

- **Storage**: 3GB
- **Compute**: 191.9 horas/mês
- **Branches**: 10
- **Databases**: 10

Para a maioria dos projetos SMB, isso é mais que suficiente! 🎉

## 🔗 Links Úteis

- [Neon Dashboard](https://console.neon.tech)
- [Neon Docs](https://neon.tech/docs)
- [Prisma + Neon Guide](https://neon.tech/docs/guides/prisma)
- [Vercel + Neon Integration](https://vercel.com/integrations/neon)

---

**✅ Pronto! Seu banco de dados está configurado e pronto para produção!**






