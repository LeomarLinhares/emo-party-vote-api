// ...nenhuma linha...
import { Database } from 'bun:sqlite';
import path from 'path';

const db = new Database(path.resolve('data', 'emoawards.db'));

// Tabela de participantes
db.run(`CREATE TABLE IF NOT EXISTS participants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  bio TEXT,
  photoUrl TEXT NOT NULL,
  createdAt TEXT NOT NULL
)`);

// Tabela de votos
db.run(`CREATE TABLE IF NOT EXISTS votes (
  voterId TEXT PRIMARY KEY,
  targetId TEXT NOT NULL,
  at TEXT NOT NULL
)`);

// Tabela de estado
db.run(`CREATE TABLE IF NOT EXISTS state (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
)`);

// Inicializa estado se não existir
const stateRow = db.query('SELECT value FROM state WHERE key = ?').get('phase');
if (!stateRow) {
  db.query('INSERT INTO state (key, value) VALUES (?, ?)').run('phase', 'closed');
}

export default db;
