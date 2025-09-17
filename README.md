# Emo Awards API

API REST para votação de participantes do Emo Awards.

## Stack
- **Hono** (framework web ultrarrápido para Bun)
- **Zod** (validação de schemas)
- **bun:sqlite** (banco SQLite nativo)
- **nanoid** (geração de IDs únicos)

## Como rodar

1. Instale as dependências:
   ```bash
   bun install
   ```
2. Inicie o servidor:
   ```bash
   bun start        # Produção
   bun dev          # Development com watch
   ```

A API estará disponível em `http://localhost:3001/api`

## Deploy Ubuntu/Nginx

- Suba os arquivos no servidor
- Instale Bun (recomendado v1.2+)
- Rode `bun install` e `bun start` (ou use `pm2` para rodar em background)
- Configure o Nginx para proxy reverso para `localhost:3001`

## Notas
- Persistência em SQLite (`data/emoawards.db`)
- CORS liberado para qualquer origem
- IDs gerados com `nanoid`
- Fotos como DataURL (base64) salvas no banco
- Validação automática com Zod

---

API otimizada para Bun! 🚀
