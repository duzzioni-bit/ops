# 🚀 Guia de Deploy - Ops Orçamentos e Pedidos

## 📋 Pré-requisitos para Deploy

1. **Conta na Vercel**: [vercel.com](https://vercel.com)
2. **Banco PostgreSQL**: Recomendamos Vercel Postgres ou Supabase
3. **Repositório Git**: GitHub, GitLab ou Bitbucket

## 🛠️ Configuração do Deploy

### 1. Preparar Banco de Dados

#### Opção A: Vercel Postgres (Recomendado)
1. No dashboard da Vercel, acesse "Storage"
2. Crie um novo Postgres database
3. Copie a `DATABASE_URL` fornecida

#### Opção B: Supabase
1. Crie projeto no [supabase.com](https://supabase.com)
2. Vá em Settings > Database
3. Copie a Connection String

### 2. Configurar Variáveis de Ambiente

No dashboard da Vercel, adicione:

```bash
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="sua-chave-super-secreta"
NEXTAUTH_URL="https://seu-app.vercel.app"
```

### 3. Ajustar Schema do Banco

Para PostgreSQL, ajuste o schema em `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 4. Deploy Steps

```bash
# 1. Build local
npm run build

# 2. Deploy na Vercel
npx vercel

# 3. Executar migrações
npx prisma migrate deploy

# 4. Popular dados iniciais (opcional)
npx prisma db seed
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

