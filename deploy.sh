#!/bin/bash

# Script de deploy para Ubuntu
echo "🚀 Iniciando deploy da Emo Vote API..."

# Atualizar código
echo "📦 Atualizando código..."
git pull origin main

# Instalar dependências
echo "📦 Instalando dependências..."
bun install

# Reiniciar aplicação com PM2
echo "🔄 Reiniciando aplicação..."
pm2 restart emo-vote-api || pm2 start "bun start" --name "emo-vote-api"

# Salvar configuração PM2
pm2 save

echo "✅ Deploy concluído!"
echo "🌐 API disponível em: http://localhost:3001/api"
echo "📊 Status: pm2 status"
echo "📝 Logs: pm2 logs emo-vote-api"