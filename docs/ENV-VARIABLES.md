# 🔐 Variáveis de Ambiente

Este documento lista todas as variáveis de ambiente necessárias para o projeto.

## 📋 Variáveis Obrigatórias

### Database (Neon PostgreSQL)

```bash
# Connection string para queries normais (pooled - mais rápido)
DATABASE_URL="postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require&pgbouncer=true"

# Connection string para migrações (direct - sem pooling)
DIRECT_URL="postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require"
```

**Onde obter:**
1. Acesse [console.neon.tech](https://console.neon.tech)
2. Selecione seu projeto
3. Vá em "Connection Details"
4. Copie ambas as strings (Pooled e Direct)

### NextAuth.js (Autenticação)

```bash
# Chave secreta para encriptar tokens e sessions
NEXTAUTH_SECRET="sua-chave-super-secreta-aqui"

# URL da aplicação
NEXTAUTH_URL="http://localhost:3000"  # Local
# NEXTAUTH_URL="https://seu-app.vercel.app"  # Produção
```

**Como gerar NEXTAUTH_SECRET:**

**Windows (PowerShell):**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

**Linux/Mac:**
```bash
openssl rand -base64 32
```

**Online (alternativa):**
- [Generate Random](https://generate-random.org/api-key-generator)
- Gere uma chave de 32+ caracteres

## 📝 Arquivo .env Local

Crie um arquivo `.env` na raiz do projeto com:

```bash
# Database - Neon PostgreSQL
DATABASE_URL="postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"

# NextAuth.js
NEXTAUTH_SECRET="sua-chave-aqui"
NEXTAUTH_URL="http://localhost:3000"
```

⚠️ **IMPORTANTE**: 
- O arquivo `.env` **NÃO** deve ser commitado no Git
- Já está no `.gitignore` para sua segurança
- Cada desenvolvedor deve ter seu próprio `.env`

## 🌐 Configuração na Vercel

### Via Dashboard

1. Acesse [vercel.com](https://vercel.com)
2. Selecione seu projeto
3. Vá em **Settings** > **Environment Variables**
4. Adicione cada variável:

| Nome | Tipo | Ambientes |
|------|------|-----------|
| `DATABASE_URL` | Plain Text | Production, Preview, Development |
| `DIRECT_URL` | Plain Text | Production, Preview, Development |
| `NEXTAUTH_SECRET` | Secret | Production, Preview, Development |
| `NEXTAUTH_URL` | Plain Text | Production only (use a URL de produção) |

### Via Vercel CLI

```bash
# Adicionar variável de produção
vercel env add DATABASE_URL production

# Adicionar para todos os ambientes
vercel env add NEXTAUTH_SECRET

# Listar variáveis
vercel env ls

# Baixar variáveis (cuidado - sobrescreve .env local)
vercel env pull .env.local
```

## 🔍 Verificar Variáveis

### No código

```typescript
// Verificar se variável está carregada
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Configurada' : '❌ Faltando');
console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? '✅ Configurada' : '❌ Faltando');
```

### Via terminal

```bash
# Listar variáveis de ambiente (Unix/Mac)
printenv | grep DATABASE

# Windows (PowerShell)
Get-ChildItem Env: | Where-Object { $_.Name -like "*DATABASE*" }
```

### Com Prisma

```bash
# Testar conexão com banco
npx prisma db pull

# Se funcionar, DATABASE_URL está correta ✅
```

## 🛡️ Boas Práticas de Segurança

### ✅ FAÇA

- ✅ Use variáveis de ambiente para dados sensíveis
- ✅ Mantenha `.env` fora do Git
- ✅ Use chaves diferentes para dev/staging/prod
- ✅ Gere NEXTAUTH_SECRET forte (32+ chars)
- ✅ Use HTTPS em produção
- ✅ Rotacione chaves periodicamente

### ❌ NÃO FAÇA

- ❌ Commitar `.env` no Git
- ❌ Compartilhar chaves em mensagens/emails
- ❌ Usar mesma NEXTAUTH_SECRET em todos ambientes
- ❌ Expor variáveis no código cliente
- ❌ Usar valores padrão em produção
- ❌ Deixar logs com valores sensíveis

## 🚨 Variáveis Expostas vs Secretas

### Server-side (Seguras)

Estas variáveis são **APENAS** acessíveis no servidor:

```typescript
// ✅ Seguro - só no servidor
const dbUrl = process.env.DATABASE_URL;
const secret = process.env.NEXTAUTH_SECRET;
```

### Client-side (Público)

Para expor variáveis ao cliente, use prefixo `NEXT_PUBLIC_`:

```bash
# Variável pública (acessível no browser)
NEXT_PUBLIC_API_URL="https://api.exemplo.com"
```

```typescript
// ✅ Acessível no cliente
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

⚠️ **NUNCA** use `NEXT_PUBLIC_` para dados sensíveis!

## 📊 Variáveis Opcionais (Futuras)

### Upload de Arquivos (AWS S3)

```bash
AWS_ACCESS_KEY_ID="sua-key-aqui"
AWS_SECRET_ACCESS_KEY="seu-secret-aqui"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="ops-uploads"
```

### Email (SendGrid/Resend)

```bash
EMAIL_SERVER="smtp://user:pass@smtp.sendgrid.net:587"
EMAIL_FROM="noreply@seuapp.com"
```

### Analytics

```bash
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"  # Google Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS="true"
```

### Sentry (Error Tracking)

```bash
SENTRY_DSN="https://xxx@xxx.ingest.sentry.io/xxx"
NEXT_PUBLIC_SENTRY_DSN="https://xxx@xxx.ingest.sentry.io/xxx"
```

## 🔧 Troubleshooting

### Erro: "Environment variable not found: DATABASE_URL"

**Solução:**
1. Verifique se `.env` existe na raiz
2. Confirme que a variável está definida
3. Reinicie o servidor de desenvolvimento
4. Verifique sintaxe (sem espaços ao redor do `=`)

### Erro: "Can't reach database server"

**Solução:**
1. Verifique se `DATABASE_URL` está correta
2. Confirme que Neon project está ativo
3. Teste conexão: `npx prisma db pull`

### Erro: "Invalid NEXTAUTH_SECRET"

**Solução:**
1. Gere nova chave com 32+ caracteres
2. Não use caracteres especiais problemáticos
3. Coloque entre aspas se tiver espaços

### Variáveis não carregam na Vercel

**Solução:**
1. Confirme que estão no ambiente correto (Production/Preview)
2. Faça redeploy após adicionar variáveis
3. Verifique logs do build na Vercel

## 📚 Recursos

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Neon Connection Strings](https://neon.tech/docs/connect/connect-from-any-app)
- [NextAuth.js Configuration](https://next-auth.js.org/configuration/options)

---

**🔒 Mantenha suas variáveis seguras e nunca as compartilhe publicamente!**






