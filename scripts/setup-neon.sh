#!/bin/bash

echo "================================================"
echo "  SETUP NEON POSTGRESQL - OPS ORÇAMENTOS"
echo "================================================"
echo ""

# Verificar se .env existe
if [ -f .env ]; then
    echo "[AVISO] Arquivo .env já existe!"
    echo ""
    read -p "Deseja sobrescrever? (s/N): " OVERWRITE
    if [ "$OVERWRITE" != "s" ] && [ "$OVERWRITE" != "S" ]; then
        echo "Setup cancelado."
        exit 0
    fi
fi

echo "[1/5] Criando arquivo .env a partir do template..."
cp env.template .env
echo "[OK] Arquivo .env criado!"
echo ""

echo "[2/5] Gerando NEXTAUTH_SECRET..."
SECRET=$(openssl rand -base64 32)
sed -i "s|gere-uma-chave-aqui-com-comando-abaixo|$SECRET|g" .env
echo "[OK] NEXTAUTH_SECRET gerada e inserida!"
echo "Chave: $SECRET"
echo ""

echo "[3/5] AGORA VOCÊ PRECISA:"
echo ""
echo "   a) Criar conta no Neon: https://neon.tech"
echo "   b) Criar projeto: 'ops-orcamentos-pedidos'"
echo "   c) Copiar as connection strings:"
echo "      - Pooled connection (DATABASE_URL)"
echo "      - Direct connection (DIRECT_URL)"
echo ""
echo "   d) Editar o arquivo .env e substituir:"
echo "      DATABASE_URL=\"postgresql://username:password@...\""
echo "      DIRECT_URL=\"postgresql://username:password@...\""
echo ""
read -p "Pressione Enter para continuar..."

echo ""
echo "[4/5] Instalando dependências..."
npm install
echo ""

echo "[5/5] Deseja executar as migrações agora? (s/N)"
echo "(Isso requer que .env esteja configurado com credenciais válidas)"
read -p "Executar migrações? " RUN_MIGRATIONS

if [ "$RUN_MIGRATIONS" = "s" ] || [ "$RUN_MIGRATIONS" = "S" ]; then
    echo ""
    echo "Gerando Prisma Client..."
    npx prisma generate
    
    echo ""
    echo "Executando migrações..."
    npx prisma migrate deploy
    
    echo ""
    echo "Populando dados iniciais..."
    npx prisma db seed
    
    echo ""
    echo "[OK] Banco de dados configurado!"
else
    echo ""
    echo "[!] Lembre-se de executar depois:"
    echo "   npx prisma generate"
    echo "   npx prisma migrate deploy"
    echo "   npx prisma db seed"
fi

echo ""
echo "================================================"
echo "  SETUP CONCLUÍDO!"
echo "================================================"
echo ""
echo "Próximos passos:"
echo "1. Edite .env com suas credenciais do Neon"
echo "2. Execute: npm run dev"
echo "3. Acesse: http://localhost:3000"
echo ""
echo "Documentação: docs/NEON-SETUP.md"
echo ""

