import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT || 3001);
const DB_FILE = path.join(__dirname, 'mfa-data.json');
const DB_VERSION = 2;
const UPLOAD_DIR = path.join(__dirname, 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Reel videos must live in persistent object storage because Render's normal
// filesystem is ephemeral. Keep the service-role key server-side only.
const SUPABASE_URL = String(process.env.SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_SERVICE_ROLE_KEY = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '');
const SUPABASE_REEL_BUCKET = String(process.env.SUPABASE_REEL_BUCKET || 'mfa-reels');

app.use((req, res, next) => {
  const allowedOrigin = process.env.FRONTEND_ORIGIN || '*';
  res.header('Access-Control-Allow-Origin', allowedOrigin);
  res.header('Access-Control-Allow-Methods', 'GET,POST,PATCH,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
app.use('/uploads', express.static(UPLOAD_DIR));

async function ensureReelBucket() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return false;
  const headers = {
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json'
  };
  const response = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ id: SUPABASE_REEL_BUCKET, name: SUPABASE_REEL_BUCKET, public: true })
  });
  if (response.ok || response.status === 409) return true;
  const detail = await response.text().catch(() => '');
  console.error('Could not ensure Reel storage bucket:', response.status, detail);
  return false;
}

app.get('/api/reels/storage-status', (_req, res) => {
  res.json({
    configured: Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY),
    provider: SUPABASE_URL ? 'supabase' : 'not-configured',
    bucket: SUPABASE_REEL_BUCKET
  });
});

app.post('/api/reels/upload', express.raw({ type: ['video/*', 'application/octet-stream'], limit: '50mb' }), async (req, res) => {
  const contentType = String(req.headers['content-type'] || '');
  if (!contentType.startsWith('video/') && contentType !== 'application/octet-stream') {
    return res.status(415).json({ error: 'Send a video file' });
  }

  const body = req.body;
  if (!Buffer.isBuffer(body) || body.length === 0) {
    return res.status(400).json({ error: 'Empty video upload' });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(503).json({
      error: 'Persistent Reel storage is not configured on the server.',
      code: 'REEL_STORAGE_NOT_CONFIGURED'
    });
  }

  const extension = contentType.includes('webm') ? 'webm' : contentType.includes('quicktime') ? 'mov' : 'mp4';
  const filename = `reel_${Date.now()}_${Math.random().toString(36).slice(2, 10)}.${extension}`;
  const ready = await ensureReelBucket();
  if (!ready) {
    return res.status(502).json({ error: 'Persistent Reel storage could not be prepared.', code: 'REEL_STORAGE_UNAVAILABLE' });
  }

  const objectPath = `grade10/${filename}`;
  const response = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${encodeURIComponent(SUPABASE_REEL_BUCKET)}/${objectPath}`,
    {
      method: 'POST',
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': contentType || 'video/mp4',
        'x-upsert': 'false',
        'cache-control': '31536000'
      },
      body
    }
  );

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    console.error('Supabase Reel upload failed:', response.status, detail);
    return res.status(502).json({ error: 'Persistent Reel storage rejected the video.', code: 'REEL_STORAGE_UPLOAD_FAILED' });
  }

  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_REEL_BUCKET}/${objectPath}`;
  res.status(201).json({ url: publicUrl, persistent: true });
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
