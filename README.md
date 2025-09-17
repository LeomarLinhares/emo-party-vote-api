# 🎉 Emo Vote API

API para sistema de votação em tempo real para eventos e festas. Sistema simples e rápido para eleição do "mais emocionante" entre participantes.

## 🚀 Tecnologias

- **[Bun](https://bun.sh/)** - Runtime JavaScript ultra-rápido
- **[Hono](https://hono.dev/)** - Framework web moderno e performático  
- **[Zod](https://zod.dev/)** - Validação de schemas TypeScript-first
- **SQLite** - Banco de dados embutido (via `bun:sqlite`)
- **[nanoid](https://github.com/ai/nanoid)** - Geração de IDs únicos
- **Nginx** - Servidor web para produção

## 📋 Pré-requisitos

- **Bun** v1.0+ ([Instalar](https://bun.sh/docs/installation))
- **Node.js** v18+ (para PM2 em produção)
- **Nginx** (apenas para produção)

## 🛠️ Instalação e Execução

### Desenvolvimento Local

```bash
# Clonar repositório
git clone <seu-repositorio>
cd emo-vote-api

# Instalar dependências
bun install

# Executar em modo desenvolvimento (com watch)
bun run dev

# Ou executar em modo produção
bun start
```

A API estará disponível em `http://localhost:3001/api`

### Produção (Ubuntu + Nginx)

Consulte o arquivo [`DEPLOY.md`](DEPLOY.md) para instruções completas de deploy.

## 🔧 Configuração

### Banco de Dados
- SQLite é criado automaticamente em `data/emoawards.db`
- Tabelas são criadas na primeira execução
- Estado inicial: votação "fechada"

### CORS
- Liberado para qualquer origem
- Configurado para aceitar JSON até 2MB (fotos base64)

## 📡 API Endpoints

### Base URL
```
http://localhost:3001/api
```

---

### 🏛️ Estado da Votação

#### Obter Estado Atual
```http
GET /api/state
```

**Response:**
```json
{
  "phase": "closed" | "open" | "results"
}
```

#### Alterar Fase da Votação
```http
PUT /api/state/phase
```

**Request Body:**
```json
{
  "phase": "closed" | "open" | "results"
}
```

**Response:**
```json
{
  "phase": "closed" | "open" | "results"
}
```

**Validações:**
- `phase` deve ser um dos valores: `"closed"`, `"open"`, `"results"`

---

### 👥 Participantes

#### Listar Participantes
```http
GET /api/participants
```

**Response:**
```json
[
  {
    "id": "yky-xtetDh_t4FKjjhNEZ",
    "name": "João Silva",
    "bio": "Desenvolvedor apaixonado por tecnologia",
    "photoUrl": "data:image/jpeg;base64,/9j/4AAQ...",
    "createdAt": "2025-09-17T10:30:45.123Z"
  }
]
```

#### Registrar Participante
```http
POST /api/participants
```

**Request Body:**
```json
{
  "name": "João Silva",
  "bio": "Desenvolvedor apaixonado por tecnologia",
  "photoUrl": "data:image/jpeg;base64,/9j/4AAQ..."
}
```

**Response:**
```json
{
  "id": "yky-xtetDh_t4FKjjhNEZ",
  "name": "João Silva",
  "bio": "Desenvolvedor apaixonado por tecnologia",
  "photoUrl": "data:image/jpeg;base64,/9j/4AAQ...",
  "createdAt": "2025-09-17T10:30:45.123Z"
}
```

**Validações:**
- `name` é obrigatório (mínimo 1 caractere)
- `photoUrl` é obrigatório (DataURL válida)
- `bio` é opcional (padrão: string vazia)

---

### 🗳️ Votos

#### Verificar se Participante Já Votou
```http
GET /api/votes/check/{voterId}
```

**Response:**
```json
{
  "hasVoted": true
}
```

#### Registrar Voto
```http
POST /api/votes
```

**Request Body:**
```json
{
  "voterId": "yky-xtetDh_t4FKjjhNEZ",
  "targetId": "abc-def123456789"
}
```

**Response:**
```json
{
  "voterId": "yky-xtetDh_t4FKjjhNEZ",
  "targetId": "abc-def123456789",
  "at": "2025-09-17T10:35:20.456Z"
}
```

**Validações:**
- `voterId` e `targetId` são obrigatórios
- `voterId` não pode ser igual a `targetId` (não pode votar em si mesmo)
- Cada participante só pode votar uma vez
- Ambos os IDs devem existir na base de participantes

#### Obter Apuração (Ranking)
```http
GET /api/votes/tally
```

**Response:**
```json
[
  {
    "id": "abc-def123456789",
    "name": "Maria Santos",
    "bio": "Designer criativa",
    "photoUrl": "data:image/jpeg;base64,/9j/4AAQ...",
    "votes": 5,
    "createdAt": "2025-09-17T09:20:10.789Z"
  },
  {
    "id": "yky-xtetDh_t4FKjjhNEZ",
    "name": "João Silva",
    "bio": "Desenvolvedor apaixonado por tecnologia",
    "photoUrl": "data:image/jpeg;base64,/9j/4AAQ...",
    "votes": 3,
    "createdAt": "2025-09-17T10:30:45.123Z"
  }
]
```

*Ordenado por número de votos (decrescente)*

#### Obter Vencedor
```http
GET /api/votes/winner
```

**Response:**
```json
{
  "id": "abc-def123456789",
  "name": "Maria Santos",
  "bio": "Designer criativa",
  "photoUrl": "data:image/jpeg;base64,/9j/4AAQ...",
  "votes": 5,
  "createdAt": "2025-09-17T09:20:10.789Z"
}
```

**Validações:**
- Só retorna dados se `phase === "results"`
- Caso contrário, retorna erro 403

#### Verificar se Todos Votaram
```http
GET /api/votes/all-voted
```

**Response:**
```json
{
  "allVoted": true
}
```

*`allVoted` é `true` quando número de votos === número de participantes (e > 0)*

---

## 📊 Códigos de Status HTTP

| Código | Descrição |
|--------|-----------|
| **200** | Sucesso |
| **201** | Criado com sucesso (POST) |
| **400** | Dados inválidos / Validação falhou |
| **403** | Acesso negado (ex: tentar obter vencedor quando não está em "results") |
| **404** | Recurso não encontrado |
| **500** | Erro interno do servidor |

## ❌ Exemplos de Erro

```json
{
  "message": "Você não pode votar em si mesmo!"
}
```

```json
{
  "message": "Você já votou!"
}
```

```json
{
  "message": "Resultados ainda não foram liberados"
}
```

```json
{
  "message": "Nome e foto são obrigatórios!"
}
```

## 🗄️ Estrutura do Banco

### Tabela `participants`
```sql
CREATE TABLE participants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  bio TEXT,
  photoUrl TEXT NOT NULL,
  createdAt TEXT NOT NULL
);
```

### Tabela `votes`
```sql
CREATE TABLE votes (
  voterId TEXT PRIMARY KEY,
  targetId TEXT NOT NULL,
  at TEXT NOT NULL
);
```

### Tabela `state`
```sql
CREATE TABLE state (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
```

## 🎨 Frontend - Exemplo de Integração

### Converter imagem para base64
```javascript
function convertToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Uso
const file = document.getElementById('photo').files[0];
const photoUrl = await convertToBase64(file);
```

### Registrar participante
```javascript
const response = await fetch('/api/participants', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'João Silva',
    bio: 'Desenvolvedor',
    photoUrl: photoUrl // base64 da imagem
  })
});

const participant = await response.json();
```

### Votar
```javascript
const response = await fetch('/api/votes', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    voterId: 'id-do-votante',
    targetId: 'id-do-candidato'
  })
});
```

## 🔧 Scripts Disponíveis

```bash
bun start          # Executa em produção
bun run dev        # Executa com watch mode
bun run deploy     # Executa script de deploy (deploy.sh)
```

## 📁 Estrutura do Projeto

```
emo-vote-api/
├── data/
│   └── emoawards.db      # Banco SQLite (criado automaticamente)
├── .gitignore            # Arquivos ignorados pelo Git
├── DEPLOY.md             # Guia de deploy completo
├── README.md             # Esta documentação
├── bun.lock              # Lock file do Bun
├── db.js                 # Configuração do banco SQLite
├── deploy.sh             # Script de deploy automático
├── nginx.conf            # Configuração do Nginx
├── package.json          # Dependências e scripts
└── server.js             # Servidor principal (Hono)
```

## 🚀 Performance

- **Framework**: Hono é ~3-5x mais rápido que Express no Bun
- **Database**: SQLite nativo do Bun (sem overhead de bindings)
- **Validação**: Zod com schemas otimizados
- **CORS**: Configurado para máxima compatibilidade

## 🔒 Notas de Segurança

- CORS liberado para qualquer origem (ideal para festas/demos)
- Fotos armazenadas como base64 no banco (sem upload de arquivos)
- Validação rigorosa de entrada com Zod
- Rate limiting pode ser adicionado facilmente se necessário

## 🐛 Troubleshooting

### Erro: "Cannot find package 'better-sqlite3'"
- Certifique-se de estar usando `bun:sqlite` (não `better-sqlite3`)
- Execute `bun install` novamente

### API não responde
```bash
# Verificar se porta está livre
netstat -tlnp | grep 3001

# Testar localmente
curl http://localhost:3001/api/state
```

### Problemas no deploy
- Consulte [`DEPLOY.md`](DEPLOY.md) para troubleshooting detalhado
- Verifique logs: `pm2 logs emo-vote-api`

## 📝 Licença

Este projeto é livre para uso em festas e eventos! 🎉

---

**Desenvolvido com ❤️ para tornar suas festas mais divertidas!**
