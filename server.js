import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT || 3001);
const DB_FILE = path.join(__dirname, 'mfa-data.json');
const DB_VERSION = 5;
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const sessions = new Map();
const loginAttempts = new Map();

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  if (!stored || !String(stored).includes(':')) return false;
  const [salt, expectedHex] = String(stored).split(':');
  try {
    const actual = scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
    const expected = Buffer.from(expectedHex, 'hex');
    return expected.length === actual.length && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

function publicUser(user) {
  const { passwordHash, ...safe } = user || {};
  return safe;
}

function setSession(res, userId) {
  const token = randomBytes(32).toString('hex');
  sessions.set(token, { userId: String(userId), expiresAt: Date.now() + SESSION_TTL_MS });
  res.setHeader('Set-Cookie', `__Host-mfa_session=${token}; Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}; Path=/; Secure; HttpOnly; SameSite=None`);
}

function clearSession(res, token) {
  if (token) sessions.delete(token);
  res.setHeader('Set-Cookie', '__Host-mfa_session=; Max-Age=0; Path=/; Secure; HttpOnly; SameSite=None');
}

function getSessionUser(req, db) {
  const cookie = String(req.headers.cookie || '');
  const match = cookie.match(/(?:^|;\\s*)__Host-mfa_session=([^;]+)/);
  if (!match) return null;
  const session = sessions.get(match[1]);
  if (!session || session.expiresAt <= Date.now()) {
    sessions.delete(match[1]);
    return null;
  }
  return db.users.find((u) => String(u.id) === session.userId) || null;
}

function requireAuth(req, res, db) {
  const user = getSessionUser(req, db);
  if (!user) {
    res.status(401).json({ error: 'Authentication required' });
    return null;
  }
  return user;
}

function rateLimitLogin(email) {
  const now = Date.now();
  const record = loginAttempts.get(email) || { count: 0, firstAt: now };
  if (now - record.firstAt > 15 * 60 * 1000) {
    loginAttempts.set(email, { count: 1, firstAt: now });
    return false;
  }
  record.count += 1;
  loginAttempts.set(email, record);
  return record.count > 10;
}
const UPLOAD_DIR = path.join(__dirname, 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Reel videos must live in persistent object storage because Render's normal
// filesystem is ephemeral. Keep the service-role key server-side only.
const CLOUDINARY_CLOUD_NAME = String(process.env.CLOUDINARY_CLOUD_NAME || '').trim();
const CLOUDINARY_UPLOAD_PRESET = String(process.env.CLOUDINARY_UPLOAD_PRESET || '').trim();

app.use((req, res, next) => {
  const allowedOrigin = process.env.FRONTEND_ORIGIN || 'https://stephenkipsang-arch.github.io';
  const requestOrigin = String(req.headers.origin || '');
  const originAllowed = requestOrigin === allowedOrigin || requestOrigin === 'http://localhost:3000';
  if (originAllowed) res.header('Access-Control-Allow-Origin', requestOrigin || allowedOrigin);
  res.header('Vary', 'Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
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
    configured: Boolean(CLOUDINARY_CLOUD_NAME && CLOUDINARY_UPLOAD_PRESET),
    provider: CLOUDINARY_CLOUD_NAME ? 'cloudinary' : 'not-configured',
    preset: CLOUDINARY_UPLOAD_PRESET || null
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

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    return res.status(503).json({
      error: 'Persistent Reel storage is not configured on the server.',
      code: 'REEL_STORAGE_NOT_CONFIGURED'
    });
  }

  try {
    const extension = contentType.includes('webm') ? 'webm' : contentType.includes('quicktime') ? 'mov' : 'mp4';
    const filename = `reel_${Date.now()}_${Math.random().toString(36).slice(2, 10)}.${extension}`;
    const form = new FormData();
    form.append('file', new Blob([body], { type: contentType || 'video/mp4' }), filename);
    form.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    form.append('folder', 'mfa-vexpex/reels');

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${encodeURIComponent(CLOUDINARY_CLOUD_NAME)}/video/upload`,
      { method: 'POST', body: form }
    );
    const result = await response.json().catch(() => ({}));

    if (!response.ok || !result.secure_url) {
      console.error('Cloudinary Reel upload failed:', response.status, result);
      return res.status(502).json({ error: 'Persistent Reel storage rejected the video.', code: 'REEL_STORAGE_UPLOAD_FAILED' });
    }

    res.status(201).json({ url: result.secure_url, persistent: true });
  } catch (error) {
    console.error('Cloudinary Reel upload error:', error);
    return res.status(502).json({ error: 'Persistent Reel storage could not be reached.', code: 'REEL_STORAGE_UNAVAILABLE' });
  }
});

app.use(express.json({ limit: '1mb' }));

function freshDb() {
  return { version: DB_VERSION, users: [], messages: [], lostFound: [], posts: [] };
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
      lostFound: Array.isArray(db.lostFound) ? db.lostFound : [],
      posts: Array.isArray(db.posts) ? db.posts : []
    };
  } catch {
    return freshDb();
  }
}

function saveDb(db) {
  fs.writeFileSync(
    DB_FILE,
    JSON.stringify({ version: DB_VERSION, users: db.users || [], messages: db.messages || [], lostFound: db.lostFound || [], posts: db.posts || [] }, null, 2)
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
  const users = db.users.map(withFreshPresence).map(publicUser);
  res.json({ users });
});

app.post('/api/auth/register', (req, res) => {
  const user = req.body || {};
  const email = String(user.email || '').trim().toLowerCase();
  const password = String(user.password || '');
  if (!user.id || !email || !user.name || password.length < 12) {
    return res.status(400).json({ error: 'Name, Academy email and a password of at least 12 characters are required.' });
  }
  if (!email.endsWith('@mpesafoundationacademy.ac.ke')) {
    return res.status(403).json({ error: 'Academy email required' });
  }

  const db = loadDb();
  const existing = db.users.find((u) => String(u.email || '').trim().toLowerCase() === email);
  if (existing) {
    return res.status(409).json({ error: 'This Academy account already exists. Sign in with its password.' });
  }

  const cleanUser = {
    ...user,
    id: String(user.id),
    email,
    passwordHash: hashPassword(password),
    lastSeen: new Date().toISOString(),
    online: true
  };
  delete cleanUser.password;
  db.users.push(cleanUser);
  saveDb(db);
  setSession(res, cleanUser.id);
  res.status(201).json({ user: publicUser(cleanUser) });
});

app.post('/api/auth/login', (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });
  if (rateLimitLogin(email)) return res.status(429).json({ error: 'Too many login attempts. Please wait 15 minutes and try again.' });

  const db = loadDb();
  const user = db.users.find((u) => String(u.email || '').trim().toLowerCase() === email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid Academy email or password.' });
  }
  if (!user.passwordHash) {
    return res.status(409).json({ error: 'This account was created before secure passwords were added. It must be migrated by the app administrator before it can be used again.' });
  }
  if (!verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid Academy email or password.' });
  }

  user.lastSeen = new Date().toISOString();
  user.online = true;
  saveDb(db);
  setSession(res, user.id);
  res.json({ user: publicUser(user) });
});

app.get('/api/auth/me', (req, res) => {
  const db = loadDb();
  const user = requireAuth(req, res, db);
  if (!user) return;
  res.json({ user: publicUser(withFreshPresence(user)) });
});

app.post('/api/auth/logout', (req, res) => {
  const cookie = String(req.headers.cookie || '');
  const match = cookie.match(/(?:^|;\\s*)__Host-mfa_session=([^;]+)/);
  clearSession(res, match?.[1]);
  res.json({ ok: true });
});

app.post('/api/users', (req, res) => {
  const db = loadDb();
  const current = requireAuth(req, res, db);
  if (!current) return;
  const user = req.body || {};
  if (String(user.id) !== String(current.id)) return res.status(403).json({ error: 'You can only update your own account.' });
  const index = db.users.findIndex((u) => String(u.id) === String(current.id));
  if (index < 0) return res.status(404).json({ error: 'User not found' });
  const clean = { ...db.users[index], ...user, id: db.users[index].id, email: db.users[index].email };
  delete clean.password;
  delete clean.passwordHash;
  db.users[index] = clean;
  saveDb(db);
  res.json({ user: publicUser(withFreshPresence(clean)) });
});

app.patch('/api/users/:userId/presence', (req, res) => {
  const db = loadDb();
  const current = requireAuth(req, res, db);
  if (!current) return;
  if (String(current.id) !== String(req.params.userId)) return res.status(403).json({ error: 'You can only change your own presence.' });
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

app.get('/api/posts', (_req, res) => {
  const db = loadDb();
  res.json({ posts: [...(db.posts || [])].sort((a, b) => {
    const at = Date.parse(String(a.createdAt || a.timestamp || '')) || 0;
    const bt = Date.parse(String(b.createdAt || b.timestamp || '')) || 0;
    return bt - at;
  }) });
});

app.post('/api/posts', (req, res) => {
  const db = loadDb();
  const current = requireAuth(req, res, db);
  if (!current) return;
  const post = req.body;
  if (String(post?.author?.id) !== String(current.id)) return res.status(403).json({ error: 'Author does not match the authenticated account.' });
  if (!post?.id || !post?.author?.id || !String(post.content || '').trim()) {
    return res.status(400).json({ error: 'id, author.id and content are required' });
  }

  db.posts = Array.isArray(db.posts) ? db.posts : [];
  const existing = db.posts.findIndex((item) => String(item.id) === String(post.id));
  const cleanPost = {
    ...post,
    content: String(post.content).trim().slice(0, 5000),
    createdAt: post.createdAt || new Date().toISOString()
  };

  if (existing >= 0) {
    db.posts[existing] = cleanPost;
  } else {
    db.posts.push(cleanPost);
  }
  saveDb(db);
  res.status(existing >= 0 ? 200 : 201).json({ post: cleanPost });
});

app.get('/api/lost-found', (_req, res) => {
  const db = loadDb();
  res.json({ items: [...(db.lostFound || [])].reverse() });
});

app.post('/api/lost-found', (req, res) => {
  const db = loadDb();
  const current = requireAuth(req, res, db);
  if (!current) return;
  const { kind, item, details, location, reporterId, reporterName, reporterAvatar } = req.body || {};
  if (String(reporterId) !== String(current.id)) return res.status(403).json({ error: 'Reporter does not match the authenticated account.' });
  if (!['lost', 'found'].includes(kind) || !String(item || '').trim() || !reporterId || !reporterName) {
    return res.status(400).json({ error: 'kind, item, reporterId and reporterName are required' });
  }

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
  const current = requireAuth(req, res, db);
  if (!current) return;

  const index = (db.lostFound || []).findIndex((item) => item.id === req.params.itemId);
  if (index < 0) return res.status(404).json({ error: 'Lost & found entry not found' });
  if (String(current.id) !== String(db.lostFound[index].reporterId)) {
    return res.status(403).json({ error: 'Only the person who posted this entry can update it' });
  }
  db.lostFound[index] = { ...db.lostFound[index], resolved: Boolean(req.body?.resolved) };
  saveDb(db);
  res.json({ item: db.lostFound[index] });
});

app.get('/api/messages/inbox', (req, res) => {
  const db = loadDb();
  const current = requireAuth(req, res, db);
  if (!current) return;

  const since = req.query.since ? new Date(String(req.query.since)).getTime() : NaN;
  let messages = db.messages.filter((m) =>
    String(m.senderId) === String(current.id) || String(m.receiverId) === String(current.id)
  );
  if (!Number.isNaN(since)) {
    messages = messages.filter((m) => new Date(m.timestamp).getTime() > since);
  }
  messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  res.json({ messages });
});

app.get('/api/messages', (req, res) => {
  const { userId, peerId, since } = req.query;
  if (!userId || !peerId) return res.status(400).json({ error: 'userId and peerId are required' });

  const db = loadDb();
  const current = requireAuth(req, res, db);
  if (!current) return;
  if (String(current.id) !== String(userId)) return res.status(403).json({ error: 'User does not match the authenticated account.' });
  const key = threadKey(userId, peerId);
  let messages = db.messages.filter((m) => m.threadKey === key);
  if (since) {
    const sinceTime = new Date(String(since)).getTime();
    if (!Number.isNaN(sinceTime)) messages = messages.filter((m) => new Date(m.timestamp).getTime() > sinceTime);
  }
  res.json({ messages });
});

app.post('/api/messages', (req, res) => {
  const db = loadDb();
  const current = requireAuth(req, res, db);
  if (!current) return;
  const { senderId, receiverId, text, imageUrl } = req.body;
  if (String(senderId) !== String(current.id)) return res.status(403).json({ error: 'Sender does not match the authenticated account.' });
  if (!senderId || !receiverId || (!String(text || '').trim() && !imageUrl)) {
    return res.status(400).json({ error: 'senderId, receiverId and message content are required' });
  }
  if (String(senderId) === String(receiverId)) {
    return res.status(400).json({ error: 'Cannot message yourself' });
  }

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
  const current = requireAuth(req, res, db);
  if (!current) return;

  const index = db.messages.findIndex((m) => m.id === req.params.messageId);
  if (index < 0) return res.status(404).json({ error: 'Message not found' });

  if (String(db.messages[index].receiverId) !== String(current.id)) return res.status(403).json({ error: 'Only the recipient can mark this message read.' });
  db.messages[index] = { ...db.messages[index], read: true };
  saveDb(db);
  res.json({ message: db.messages[index] });
});

app.patch('/api/messages/read', (req, res) => {
  const { userId, peerId } = req.body || {};
  if (!userId || !peerId) return res.status(400).json({ error: 'userId and peerId are required' });

  const db = loadDb();
  const current = requireAuth(req, res, db);
  if (!current) return;
  if (String(current.id) !== String(userId)) return res.status(403).json({ error: 'User does not match the authenticated account.' });
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
