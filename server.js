import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT || 3001);
const DB_FILE = path.join(__dirname, 'mfa-data.json');

app.use(express.json({ limit: '1mb' }));

function loadDb() {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch {
    return { users: [], messages: [] };
  }
}

function saveDb(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

function threadKey(a, b) {
  return [String(a), String(b)].sort().join('__');
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'mfa-vexpex' });
});

app.get('/api/users', (_req, res) => {
  const db = loadDb();
  res.json({ users: db.users });
});

app.post('/api/users', (req, res) => {
  const user = req.body;
  if (!user?.id || !user?.email || !user?.name) {
    return res.status(400).json({ error: 'id, email and name are required' });
  }

  const db = loadDb();
  const normalizedEmail = String(user.email).trim().toLowerCase();
  const existing = db.users.find((u) => String(u.email).toLowerCase() === normalizedEmail);

  if (existing) return res.json({ user: existing });

  const cleanUser = { ...user, email: normalizedEmail };
  db.users.push(cleanUser);
  saveDb(db);
  return res.status(201).json({ user: cleanUser });
});

app.get('/api/messages', (req, res) => {
  const { userId, peerId } = req.query;
  if (!userId || !peerId) return res.status(400).json({ error: 'userId and peerId are required' });

  const db = loadDb();
  const key = threadKey(userId, peerId);
  const messages = db.messages.filter((m) => m.threadKey === key);
  res.json({ messages });
});

app.post('/api/messages', (req, res) => {
  const { senderId, receiverId, text, imageUrl } = req.body;
  if (!senderId || !receiverId || (!String(text || '').trim() && !imageUrl)) {
    return res.status(400).json({ error: 'senderId, receiverId and message content are required' });
  }

  const db = loadDb();
  const message = {
    id: `server_msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    senderId: String(senderId),
    receiverId: String(receiverId),
    text: String(text || '').trim(),
    imageUrl: imageUrl || undefined,
    timestamp: new Date().toISOString(),
    read: false,
    threadKey: threadKey(senderId, receiverId)
  };

  db.messages.push(message);
  saveDb(db);
  res.status(201).json({ message });
});

const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));
}

app.listen(PORT, () => {
  console.log(`MFA-VEXPEX server running on port ${PORT}`);
});
