# Comandos de Deploy - Emo Vote API

## 🚀 Deploy Completo

### 1. Primeiro Deploy
```bash
# No servidor Ubuntu
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc
npm install -g pm2

# Clonar projeto
git clone <repositorio>
cd emo-vote-api

# Dar permissão ao script
chmod +x deploy.sh

# Executar deploy
./deploy.sh
```

### 2. Configurar Nginx
```bash
# Copiar configuração
sudo cp nginx.conf /etc/nginx/sites-available/emo-vote-api

# Ativar site
sudo ln -s /etc/nginx/sites-available/emo-vote-api /etc/nginx/sites-enabled/

# Testar e recarregar
sudo nginx -t
sudo systemctl reload nginx
```

### 3. Updates Subsequentes
```bash
# Só rodar o script de deploy
./deploy.sh
```

## 📊 Comandos Úteis

```bash
# Status da aplicação
pm2 status

# Logs em tempo real
pm2 logs emo-vote-api

# Reiniciar se necessário
pm2 restart emo-vote-api

# Parar aplicação
pm2 stop emo-vote-api

# Ver uso de recursos
pm2 monit
```

## 🔧 Troubleshooting

```bash
# Verificar se porta 3001 está livre
netstat -tlnp | grep 3001

# Testar API localmente
curl http://localhost:3001/api/state

# Verificar configuração Nginx
sudo nginx -t

# Logs do Nginx
sudo tail -f /var/log/nginx/error.log
```

## 🌐 Acesso

- **API**: `http://SEU-IP/api/`
- **Health Check**: `http://SEU-IP/health`
- **Teste**: `curl http://SEU-IP/api/state`