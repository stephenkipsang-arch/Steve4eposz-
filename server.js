import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT || 3001);
const DB_FILE = path.join(__dirname, 'mfa-data.json');
const DB_VERSION = 2;

app.use((req, res, next) => {
  const allowedOrigin = process.env.FRONTEND_ORIGIN || '*';
  res.header('Access-Control-Allow-Origin', allowedOrigin);
  res.header('Access-Control-Allow-Methods', 'GET,POST,PATCH,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
app.use(express.json({ limit: '1mb' }));

function freshDb() {
  return { version: DB_VERSION, users: [], messages: [], lostFound: [] };
}

function loadDb() {
  try {
    const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    // One-time migration: older deployments contained demo/test accounts and messages.
    if (db?.version !== DB_VERSION) {
      const clean = freshDb();
      saveDb(clean);
      return clean;
    }
    return {
      version: DB_VERSION,
      users: Array.isArray(db.users) ? db.users : [],
      messages: Array.isArray(db.messages) ? db.messages : [],
      lostFound: Array.isArray(db.lostFound) ? db.lostFound : []
    };
  } catch {
    return freshDb();
  }
}

function saveDb(db) {
  fs.writeFileSync(
    DB_FILE,
    JSON.stringify({ version: DB_VERSION, users: db.users || [], messages: db.messages || [], lostFound: db.lostFound || [] }, null, 2)
  );
}

function threadKey(a, b) {
  return [String(a), String(b)].sort().join('__');
}

function withFreshPresence(user) {
  const lastSeen = user.lastSeen ? new Date(user.lastSeen).getTime() : 0;
  const online = Boolean(user.online) && Date.now() - lastSeen < 45000;
  return { ...user, online };
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'mfa-vexpex', time: new Date().toISOString() });
});

app.get('/api/users', (_req, res) => {
  const db = loadDb();
  res.json({ users: db.users.map(withFreshPresence) });
});

app.post('/api/users', (req, res) => {
  const user = req.body;
  if (!user?.id || !user?.email || !user?.name) {
    return res.status(400).json({ error: 'id, email and name are required' });
  }

  const email = String(user.email).trim().toLowerCase();
  if (!email.endsWith('@mpesafoundationacademy.ac.ke')) {
    return res.status(403).json({ error: 'Academy email required' });
  }

  const db = loadDb();
  const existingIndex = db.users.findIndex((u) => String(u.email).toLowerCase() === email);
  const now = new Date().toISOString();
  const cleanUser = { ...user, email, lastSeen: now, online: true };

  if (existingIndex >= 0) {
    db.users[existingIndex] = { ...db.users[existingIndex], ...cleanUser };
    saveDb(db);
    return res.json({ user: withFreshPresence(db.users[existingIndex]) });
  }

  db.users.push(cleanUser);
  saveDb(db);
  return res.status(201).json({ user: cleanUser });
});

app.patch('/api/users/:userId/presence', (req, res) => {
  const db = loadDb();
  const index = db.users.findIndex((u) => String(u.id) === String(req.params.userId));
  if (index < 0) return res.status(404).json({ error: 'User not found' });

  const online = req.body?.online !== false;
  db.users[index] = {
    ...db.users[index],
    online,
    lastSeen: new Date().toISOString()
  };
  saveDb(db);
  res.json({ user: withFreshPresence(db.users[index]) });
});

app.get('/api/lost-found', (_req, res) => {
  const db = loadDb();
  res.json({ items: [...(db.lostFound || [])].reverse() });
});

app.post('/api/lost-found', (req, res) => {
  const { kind, item, details, location, reporterId, reporterName, reporterAvatar } = req.body || {};
  if (!['lost', 'found'].includes(kind) || !String(item || '').trim() || !reporterId || !reporterName) {
    return res.status(400).json({ error: 'kind, item, reporterId and reporterName are required' });
  }

  const db = loadDb();
  db.lostFound = Array.isArray(db.lostFound) ? db.lostFound : [];
  const entry = {
    id: `lost_found_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    kind,
    item: String(item).trim().slice(0, 120),
    details: String(details || '').trim().slice(0, 500),
    location: String(location || '').trim().slice(0, 120),
    reporterId: String(reporterId),
    reporterName: String(reporterName).trim(),
    reporterAvatar: String(reporterAvatar || ''),
    timestamp: new Date().toISOString(),
    resolved: false
  };
  db.lostFound.push(entry);
  saveDb(db);
  res.status(201).json({ item: entry });
});

app.patch('/api/lost-found/:itemId', (req, res) => {
  const db = loadDb();
  const index = (db.lostFound || []).findIndex((item) => item.id === req.params.itemId);
  if (index < 0) return res.status(404).json({ error: 'Lost & found entry not found' });
  if (String(db.lostFound[index].reporterId) !== String(req.body?.reporterId)) {
    return res.status(403).json({ error: 'Only the person who posted this entry can update it' });
  }
  db.lostFound[index] = { ...db.lostFound[index], resolved: Boolean(req.body?.resolved) };
  saveDb(db);
  res.json({ item: db.lostFound[index] });
});

app.get('/api/messages', (req, res) => {
  const { userId, peerId, since } = req.query;
  if (!userId || !peerId) return res.status(400).json({ error: 'userId and peerId are required' });

  const db = loadDb();
  const key = threadKey(userId, peerId);
  let messages = db.messages.filter((m) => m.threadKey === key);
  if (since) {
    const sinceTime = new Date(String(since)).getTime();
    if (!Number.isNaN(sinceTime)) messages = messages.filter((m) => new Date(m.timestamp).getTime() > sinceTime);
  }
  res.json({ messages });
});

app.post('/api/messages', (req, res) => {
  const { senderId, receiverId, text, imageUrl } = req.body;
  if (!senderId || !receiverId || (!String(text || '').trim() && !imageUrl)) {
    return res.status(400).json({ error: 'senderId, receiverId and message content are required' });
  }
  if (String(senderId) === String(receiverId)) {
    return res.status(400).json({ error: 'Cannot message yourself' });
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

app.patch('/api/messages/:messageId/read', (req, res) => {
  const db = loadDb();
  const index = db.messages.findIndex((m) => m.id === req.params.messageId);
  if (index < 0) return res.status(404).json({ error: 'Message not found' });

  db.messages[index] = { ...db.messages[index], read: true };
  saveDb(db);
  res.json({ message: db.messages[index] });
});

app.patch('/api/messages/read', (req, res) => {
  const { userId, peerId } = req.body || {};
  if (!userId || !peerId) return res.status(400).json({ error: 'userId and peerId are required' });

  const db = loadDb();
  const key = threadKey(userId, peerId);
  let changed = 0;
  db.messages = db.messages.map((message) => {
    if (message.threadKey === key && message.receiverId === String(userId) && !message.read) {
      changed += 1;
      return { ...message, read: true };
    }
    return message;
  });
  saveDb(db);
  res.json({ ok: true, changed });
});

const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));
}

app.listen(PORT, () => {
  console.log(`MFA-VEXPEX server running on port ${PORT}`);
});
