# 🤖 Sistema de Atualização Automática do Git

Este documento explica como usar o sistema automatizado para fazer push das alterações para o repositório GitHub.

## 🚀 Comandos Disponíveis

### 1. Atualização Automática (Recomendado)
```bash
npm run git:update
```
- Adiciona todas as alterações
- Faz commit com mensagem padrão
- Envia para o GitHub automaticamente

### 2. Atualização com Mensagem Personalizada
```bash
npm run git:update-custom "sua mensagem aqui"
```
- Adiciona todas as alterações
- Faz commit com sua mensagem personalizada
- Envia para o GitHub

### 3. Verificar Status
```bash
npm run git:status
```
- Mostra o status atual do Git
- Lista arquivos modificados

## 📁 Scripts Manuais

### Windows (PowerShell/CMD)
```bash
scripts/git-update.bat
```

### Linux/Mac (Bash)
```bash
./scripts/git-update.sh
```

## 🔄 Fluxo de Trabalho Recomendado

1. **Faça suas alterações** no código
2. **Execute o comando de atualização**:
   ```bash
   npm run git:update
   ```
3. **Pronto!** Suas alterações foram enviadas para o GitHub

## 📝 Exemplos de Uso

### Atualização Simples
```bash
npm run git:update
```

### Atualização com Descrição Específica
```bash
npm run git:update-custom "fix: corrigido bug na validação de CPF"
```

### Verificar o que foi alterado
```bash
npm run git:status
```

## 🎯 Benefícios

- ✅ **Automatização completa** do processo Git
- ✅ **Mensagens padronizadas** para commits
- ✅ **Menos erros** manuais
- ✅ **Fluxo mais rápido** de desenvolvimento
- ✅ **Sempre atualizado** no GitHub

## 🔗 Repositório

- **GitHub**: https://github.com/duzzioni-bit/ops
- **Branch Principal**: `main`

## ⚠️ Importante

- Sempre verifique se não há conflitos antes de fazer push
- Use mensagens descritivas para commits importantes
- O sistema adiciona TODOS os arquivos modificados automaticamente
