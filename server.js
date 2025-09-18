import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import db from './db.js';

const app = new Hono();

// Middlewares
app.use('*', logger());

// Schemas de validação
const phaseSchema = z.object({
  phase: z.enum(['closed', 'open', 'results'])
});

const participantSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  bio: z.string().optional().default(''),
  photoUrl: z.string().min(1, 'Foto é obrigatória')
});

const voteSchema = z.object({
  voterId: z.string().min(1),
  targetId: z.string().min(1)
});

// Estado da votação
app.get('/api/state', async (c) => {
  const row = db.query('SELECT value FROM state WHERE key = ?').get('phase');
  return c.json({ phase: row?.value || 'closed' });
});

app.put('/api/state/phase', async (c) => {
  try {
    const body = await c.req.json();
    const { phase } = phaseSchema.parse(body);
    db.query('UPDATE state SET value = ? WHERE key = ?').run(phase, 'phase');
    return c.json({ phase });
  } catch (error) {
    return c.json({ message: 'Fase inválida!' }, 400);
  }
});

// Participantes
app.get('/api/participants', async (c) => {
  const participants = db.query('SELECT * FROM participants').all();
  return c.json(participants);
});

app.post('/api/participants', async (c) => {
  try {
    const body = await c.req.json();
    const { name, bio, photoUrl } = participantSchema.parse(body);
    const id = nanoid();
    const createdAt = new Date().toISOString();
    db.query('INSERT INTO participants (id, name, bio, photoUrl, createdAt) VALUES (?, ?, ?, ?, ?)')
      .run(id, name, bio, photoUrl, createdAt);
    const participant = { id, name, bio, photoUrl, createdAt };
    return c.json(participant, 201);
  } catch (error) {
    return c.json({ message: 'Nome e foto são obrigatórios!' }, 400);
  }
});

// Votos
app.get('/api/votes/check/:voterId', async (c) => {
  const voterId = c.req.param('voterId');
  const vote = db.query('SELECT 1 FROM votes WHERE voterId = ?').get(voterId);
  return c.json({ hasVoted: !!vote });
});

app.post('/api/votes', async (c) => {
  try {
    const body = await c.req.json();
    const { voterId, targetId } = voteSchema.parse(body);
    
    if (voterId === targetId) {
      return c.json({ message: 'Você não pode votar em si mesmo!' }, 400);
    }
    
    const voter = db.query('SELECT 1 FROM participants WHERE id = ?').get(voterId);
    const target = db.query('SELECT 1 FROM participants WHERE id = ?').get(targetId);
    if (!voter || !target) {
      return c.json({ message: 'IDs inválidos!' }, 400);
    }
    
    const alreadyVoted = db.query('SELECT 1 FROM votes WHERE voterId = ?').get(voterId);
    if (alreadyVoted) {
      return c.json({ message: 'Você já votou!' }, 400);
    }
    
    const at = new Date().toISOString();
    db.query('INSERT INTO votes (voterId, targetId, at) VALUES (?, ?, ?)').run(voterId, targetId, at);
    return c.json({ voterId, targetId, at }, 201);
  } catch (error) {
    return c.json({ message: 'IDs obrigatórios!' }, 400);
  }
});

app.get('/api/votes/tally', async (c) => {
  const participants = db.query('SELECT * FROM participants').all();
  const votes = db.query('SELECT targetId, COUNT(*) as votes FROM votes GROUP BY targetId').all();
  const votesMap = Object.fromEntries(votes.map(v => [v.targetId, v.votes]));
  const tally = participants.map(p => ({
    ...p,
    votes: votesMap[p.id] || 0
  })).sort((a, b) => b.votes - a.votes);
  return c.json(tally);
});

app.get('/api/votes/winner', async (c) => {
  const state = db.query('SELECT value FROM state WHERE key = ?').get('phase');
  if (!state || state.value !== 'results') {
    return c.json({ message: 'Resultados ainda não foram liberados' }, 403);
  }
  const participants = db.query('SELECT * FROM participants').all();
  const votes = db.query('SELECT targetId, COUNT(*) as votes FROM votes GROUP BY targetId').all();
  const votesMap = Object.fromEntries(votes.map(v => [v.targetId, v.votes]));
  const tally = participants.map(p => ({
    ...p,
    votes: votesMap[p.id] || 0
  })).sort((a, b) => b.votes - a.votes);
  if (tally.length === 0) return c.json({ message: 'Nenhum participante' }, 404);
  return c.json(tally[0]);
});

app.get('/api/votes/all-voted', async (c) => {
  const participantsCount = db.query('SELECT COUNT(*) as count FROM participants').get().count;
  const votesCount = db.query('SELECT COUNT(*) as count FROM votes').get().count;
  const allVoted = participantsCount > 0 && votesCount === participantsCount;
  return c.json({ allVoted });
});

// 404 para rotas não encontradas
app.notFound((c) => {
  return c.json({ message: 'Recurso não encontrado' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error(err);
  return c.json({ message: 'Erro interno do servidor' }, 500);
});

// Inicia o servidor
export default {
  port: 3001,
  fetch: app.fetch,
};
