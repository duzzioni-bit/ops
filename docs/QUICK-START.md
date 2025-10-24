# ⚡ Quick Start - Setup em 10 Minutos

Guia rápido para colocar o projeto rodando localmente com Neon PostgreSQL.

## 🎯 Resumo do Processo

1. ✅ Criar conta no Neon (2 min)
2. ✅ Criar projeto no Neon (1 min)
3. ✅ Executar script de setup (2 min)
4. ✅ Configurar credenciais (3 min)
5. ✅ Rodar migrações (2 min)

**Total: ~10 minutos**

---

## 📋 Passo a Passo

### 1️⃣ Criar Conta no Neon

```
🔗 Acesse: https://neon.tech
👆 Clique em "Sign up"
🔐 Conecte com GitHub (mais rápido) ou use email
```

### 2️⃣ Criar Projeto no Neon

No dashboard do Neon:

1. Clique em **"Create a project"**
2. Preencha:
   - **Project name**: `ops-orcamentos-pedidos`
   - **Database name**: `neondb` (padrão, deixe como está)
   - **Region**: Escolha a mais próxima (ex: US East)
3. Clique em **"Create Project"**

### 3️⃣ Copiar Credenciais

Após criar, você verá a tela de conexão:

#### DATABASE_URL (Pooled):
1. Clique no dropdown onde está escrito **"Connection string"**
2. Selecione **"Pooled connection"**
3. Copie a string completa
4. Exemplo: `postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require&pgbouncer=true`

#### DIRECT_URL (Direct):
1. No mesmo dropdown, selecione **"Direct connection"**
2. Copie a string completa
3. Exemplo: `postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`

📝 **Dica**: Deixe essa aba aberta, você vai precisar dessas strings no próximo passo!

### 4️⃣ Executar Script de Setup

No terminal do projeto, execute:

**Windows:**
```powershell
.\scripts\setup-neon.bat
```

**Linux/Mac:**
```bash
chmod +x ./scripts/setup-neon.sh
./scripts/setup-neon.sh
```

O script vai:
- ✅ Criar arquivo `.env` a partir do template
- ✅ Gerar automaticamente uma `NEXTAUTH_SECRET` segura
- ✅ Instalar dependências
- ✅ (Opcional) Executar migrações

### 5️⃣ Configurar Credenciais no .env

Abra o arquivo `.env` que foi criado na raiz do projeto e substitua:

```bash
# ANTES:
DATABASE_URL="postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require"

# DEPOIS (cole suas strings do Neon):
DATABASE_URL="postgresql://real-user:real-pass@ep-real-id.us-east-1.aws.neon.tech/neondb?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://real-user:real-pass@ep-real-id.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

⚠️ **IMPORTANTE**: A `NEXTAUTH_SECRET` já foi gerada automaticamente, não precisa mexer!

### 6️⃣ Executar Migrações

Se não executou pelo script, rode agora:

```bash
# Gerar Prisma Client
npx prisma generate

# Executar migrações
npx prisma migrate deploy

# Popular dados iniciais
npx prisma db seed
```

### 7️⃣ Iniciar o Projeto

```bash
npm run dev
```

Acesse: **http://localhost:3000**

---

## ✅ Verificar se Funcionou

### Teste 1: Prisma Studio

```bash
npx prisma studio
```

Deve abrir em `http://localhost:5555` mostrando suas tabelas.

### Teste 2: Login no Sistema

1. Acesse: `http://localhost:3000`
2. Faça login com um dos usuários seed:
   - **Admin**: `admin@ops.com` / senha: `admin123`
   - **Gerente**: `gerente@ops.com` / senha: `gerente123`
   - **Vendedor**: `vendedor@ops.com` / senha: `vendedor123`

### Teste 3: Criar Orçamento

1. Vá em "Orçamentos" > "Novo Orçamento"
2. Preencha os dados
3. Salve
4. ✅ Se salvou e apareceu na lista = **funcionando!**

---

## 🚨 Problemas Comuns

### ❌ Erro: "Can't reach database server"

**Causa**: DATABASE_URL incorreta ou Neon offline

**Solução**:
1. Verifique se copiou a string completa (incluindo `?sslmode=require`)
2. Confirme que o projeto Neon está "Active" no dashboard
3. Tente reconectar: `npx prisma db pull`

### ❌ Erro: "Environment variable not found: DATABASE_URL"

**Causa**: Arquivo `.env` não existe ou está vazio

**Solução**:
1. Verifique se `.env` existe na raiz do projeto
2. Confirme que tem as variáveis preenchidas
3. Reinicie o terminal e tente novamente

### ❌ Erro: "Prisma schema loading failed"

**Causa**: Migrações não foram executadas

**Solução**:
```bash
npx prisma migrate deploy
```

### ❌ Erro: "Invalid NEXTAUTH_SECRET"

**Causa**: NEXTAUTH_SECRET muito curta ou inválida

**Solução**:
```powershell
# Gerar nova no PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Copiar resultado para .env
```

---

## 🌐 Próximo Passo: Deploy na Vercel

Após funcionar localmente:

1. Acesse: [vercel.com](https://vercel.com)
2. Conecte seu repositório GitHub
3. Vá em **Settings > Environment Variables**
4. Adicione as mesmas 4 variáveis do `.env`:
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (mude para `https://seu-app.vercel.app`)
5. Faça deploy

📘 **Guia completo**: [README-DEPLOY.md](../README-DEPLOY.md)

---

## 📚 Documentação Completa

Se precisar de mais detalhes:

- 📖 [NEON-SETUP.md](./NEON-SETUP.md) - Setup detalhado do Neon
- 📖 [ENV-VARIABLES.md](./ENV-VARIABLES.md) - Todas as variáveis
- 📖 [README-DEPLOY.md](../README-DEPLOY.md) - Deploy completo

---

## 🎉 Pronto!

Se chegou até aqui, seu sistema está rodando com:
- ✅ PostgreSQL na nuvem (Neon)
- ✅ Dados persistentes (não se perdem)
- ✅ Autenticação funcionando
- ✅ Pronto para desenvolvimento

**Dúvidas?** Consulte a [documentação completa](./NEON-SETUP.md) ou abra uma issue no GitHub!






