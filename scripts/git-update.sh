#!/bin/bash

echo "========================================"
echo "    ATUALIZANDO PROJETO OPS NO GIT"
echo "========================================"

echo ""
echo "[1/4] Verificando status do Git..."
git status

echo ""
echo "[2/4] Adicionando todas as alterações..."
git add .

echo ""
echo "[3/4] Fazendo commit das alterações..."
read -p "Digite a mensagem do commit (ou pressione Enter para usar mensagem padrão): " commit_msg

if [ -z "$commit_msg" ]; then
    commit_msg="feat: atualizações automáticas do sistema OPS"
fi

git commit -m "$commit_msg"

echo ""
echo "[4/4] Enviando para o GitHub..."
git push origin main

echo ""
echo "========================================"
echo "    ATUALIZAÇÃO CONCLUÍDA COM SUCESSO!"
echo "========================================"
echo ""
echo "Repositório: https://github.com/duzzioni-bit/ops"
echo ""
