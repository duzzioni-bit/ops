@echo off
echo ================================================
echo   SETUP NEON POSTGRESQL - OPS ORCAMENTOS
echo ================================================
echo.

REM Verificar se .env existe
if exist .env (
    echo [AVISO] Arquivo .env ja existe!
    echo.
    set /p OVERWRITE="Deseja sobrescrever? (s/N): "
    if /i not "%OVERWRITE%"=="s" (
        echo Setup cancelado.
        pause
        exit /b
    )
)

echo [1/5] Criando arquivo .env a partir do template...
copy env.template .env >nul
echo [OK] Arquivo .env criado!
echo.

echo [2/5] Gerando NEXTAUTH_SECRET...
powershell -Command "$secret = [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 })); Write-Host 'Chave gerada:' $secret; (Get-Content .env) -replace 'gere-uma-chave-aqui-com-comando-abaixo', $secret | Set-Content .env"
echo [OK] NEXTAUTH_SECRET gerada e inserida!
echo.

echo [3/5] AGORA VOCE PRECISA:
echo.
echo    a) Criar conta no Neon: https://neon.tech
echo    b) Criar projeto: "ops-orcamentos-pedidos"
echo    c) Copiar as connection strings:
echo       - Pooled connection ^(DATABASE_URL^)
echo       - Direct connection ^(DIRECT_URL^)
echo.
echo    d) Editar o arquivo .env e substituir:
echo       DATABASE_URL="postgresql://username:password@..."
echo       DIRECT_URL="postgresql://username:password@..."
echo.
pause

echo.
echo [4/5] Instalando dependencias...
call npm install
echo.

echo [5/5] Deseja executar as migracoes agora? (s/N)
echo (Isso requer que .env esteja configurado com credenciais validas)
set /p RUN_MIGRATIONS="Executar migracoes? "

if /i "%RUN_MIGRATIONS%"=="s" (
    echo.
    echo Gerando Prisma Client...
    call npx prisma generate
    
    echo.
    echo Executando migracoes...
    call npx prisma migrate deploy
    
    echo.
    echo Populando dados iniciais...
    call npx prisma db seed
    
    echo.
    echo [OK] Banco de dados configurado!
) else (
    echo.
    echo [!] Lembre-se de executar depois:
    echo    npx prisma generate
    echo    npx prisma migrate deploy
    echo    npx prisma db seed
)

echo.
echo ================================================
echo   SETUP CONCLUIDO!
echo ================================================
echo.
echo Proximos passos:
echo 1. Edite .env com suas credenciais do Neon
echo 2. Execute: npm run dev
echo 3. Acesse: http://localhost:3000
echo.
echo Documentacao: docs/NEON-SETUP.md
echo.
pause

