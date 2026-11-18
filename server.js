const express = require('express'), { createClient } = require('@libsql/client'), bcrypt = require('bcryptjs'), jwt = require('jsonwebtoken');
const app = express(), SECRET = process.env.JWT_SECRET || 'dev-secret', ADMIN = (process.env.ADMIN_USERNAME || '').toLowerCase();
// محلياً بدون متغيرات: يستخدم ملف local.db. على Render: يستخدم Turso.
const db = createClient({ url: process.env.TURSO_DATABASE_URL || 'file:local.db', authToken: process.env.TURSO_AUTH_TOKEN });
const all = async (sql, args = []) => (await db.execute({ sql, args })).rows.map(r => ({ ...r }));
const run = (sql, args = []) => db.execute({ sql, args });
app.use(express.json()); app.use(express.static('public', { setHeaders: (r, p) => { if (p.endsWith('sw.js')) r.setHeader('Cache-Control', 'no-cache'); } }));

app.use('/api', (q, s, n) => { try { q.u = jwt.verify((q.headers.authorization || '').slice(7), SECRET); } catch {} n(); });
const need = (q, s, n) => q.u ? n() : s.status(401).json({ error: 'سجّل الدخول أولاً' });
const adm = (q, s, n) => q.u && q.u.admin ? n() : s.status(403).json({ error: 'غير مصرح' });
const wrap = f => (q, s) => f(q, s).catch(e => { console.error(e); s.status(500).json({ error: 'خطأ في الخادم' }); });
const isAdmin = r => r.username.toLowerCase() === ADMIN;
const out = r => ({ username: r.username, xp: r.xp, streak: r.streak, admin: isAdmin(r) });
const sess = r => ({ token: jwt.sign({ id: r.id, admin: isAdmin(r) }, SECRET, { expiresIn: '30d' }), user: out(r) });
const shuffle = (a, rnd = Math.random) => a.map(x => [rnd(), x]).sort((p, q) => p[0] - q[0]).map(x => x[1]);
const pub = q => ({ id: q.id, category: q.category, text: q.text, kind: q.kind || 'text', difficulty: q.difficulty || 1, media: q.media || null, options: shuffle(JSON.parse(q.options).map((t, i) => ({ i, t }))) });
const day = (d = 0) => new Date(Date.now() + d * 864e5).toISOString().slice(0, 10);
const seeded = s => { let h = 0; for (const c of s) h = Math.imul(31, h) + c.charCodeAt(0) | 0; return () => { h = h + 0x6D2B79F5 | 0; let t = Math.imul(h ^ h >>> 15, 1 | h); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
const DAILY = "SELECT 1 FROM results WHERE user_id=? AND mode='daily' AND date(created_at)=?";

app.post('/api/register', wrap(async (q, s) => {
  const { username: u, password: p } = q.body;
  if (!/^[\w\u0600-\u06FF]{3,20}$/.test(u || '') || (p || '').length < 6) return s.status(400).json({ error: 'اسم المستخدم من 3 إلى 20 حرفاً وكلمة المرور 6 أحرف على الأقل' });
  try { await run('INSERT INTO users(username,pass) VALUES(?,?)', [u, await bcrypt.hash(p, 10)]); }
  catch { return s.status(400).json({ error: 'اسم المستخدم مستخدم بالفعل' }); }
  s.json(sess((await all('SELECT * FROM users WHERE username=?', [u]))[0]));
}));
app.post('/api/login', wrap(async (q, s) => {
  const [r] = await all('SELECT * FROM users WHERE username=?', [q.body.username || '']);
  if (!r || !(await bcrypt.compare(q.body.password || '', r.pass))) return s.status(400).json({ error: 'بيانات الدخول غير صحيحة' });
  s.json(sess(r));
}));
app.get('/api/me', need, wrap(async (q, s) => {
  const [r] = await all('SELECT * FROM users WHERE id=?', [q.u.id]);
  r ? s.json(out(r)) : s.status(401).json({ error: 'انتهت الجلسة' });
}));

app.get('/api/questions', wrap(async (q, s) => {
  const c = q.query.category || 'all', lv = ['1', '2', '3'].includes(q.query.level) ? +q.query.level : 'all';
  s.json((await all("SELECT * FROM questions WHERE active=1 AND (?='all' OR category=?) AND (?='all' OR difficulty=?) ORDER BY random() LIMIT ?", [c, c, lv, lv, Math.min(+q.query.n || 10, 20)])).map(pub));
}));
app.get('/api/daily', wrap(async (q, s) => {
  if (q.u && (await all(DAILY, [q.u.id, day()])).length) return s.json({ played: true });
  const rows = await all('SELECT * FROM questions WHERE active=1 ORDER BY id');
  s.json({ questions: shuffle(rows, seeded(day())).slice(0, 10).map(pub) });
}));
app.post('/api/answer', wrap(async (q, s) => {
  const [r] = await all('SELECT answer FROM questions WHERE id=?', [+q.body.id]);
  r ? s.json({ correct: r.answer === q.body.choice, answer: r.answer }) : s.status(404).json({ error: 'سؤال غير موجود' });
}));
app.post('/api/finish', need, wrap(async (q, s) => {
  const { mode = 'normal', category = 'all', answers = [] } = q.body, seen = new Set();
  const list = answers.filter(a => !seen.has(a.id) && seen.add(a.id)).slice(0, 20);
  const rows = list.length ? await all(`SELECT id,answer,difficulty FROM questions WHERE id IN (${list.map(() => '?').join(',')})`, list.map(a => +a.id)) : [];
  const key = Object.fromEntries(rows.map(r => [r.id, r]));
  let correct = 0, score = 0;
  for (const a of list) if (key[a.id] && key[a.id].answer === a.choice) { correct++; score += 5 + 5 * (key[a.id].difficulty || 1) + Math.max(0, Math.min(15, +a.left || 0)); }
  const [u] = await all('SELECT * FROM users WHERE id=?', [q.u.id]);
  let streak = u.streak, last = u.last_daily;
  if (mode === 'daily') {
    if ((await all(DAILY, [u.id, day()])).length) return s.status(400).json({ error: 'أنجزت تحدي اليوم بالفعل' });
    streak = u.last_daily === day(-1) ? streak + 1 : 1; last = day(); score *= 2;
  }
  await run('UPDATE users SET xp=xp+?,streak=?,last_daily=? WHERE id=?', [score, streak, last, u.id]);
  await run('INSERT INTO results(user_id,mode,category,score,correct,total) VALUES(?,?,?,?,?,?)', [u.id, mode === 'daily' ? 'daily' : 'normal', category, score, correct, list.length]);
  s.json({ score, correct, total: list.length, xp: u.xp + score, streak });
}));
app.get('/api/leaderboard', wrap(async (q, s) => {
  s.json(await all(q.query.period === 'all'
    ? 'SELECT username,xp AS pts FROM users ORDER BY xp DESC LIMIT 20'
    : "SELECT u.username,SUM(r.score) AS pts FROM results r JOIN users u ON u.id=r.user_id WHERE r.created_at>datetime('now','-7 days') GROUP BY u.username ORDER BY pts DESC LIMIT 20"));
}));

const val = b => Array.isArray(b.options) && b.options.length === 4 && b.options.every(o => String(o).trim()) && b.text && b.text.trim() && b.answer >= 0 && b.answer < 4 && b.category && [1, 2, 3].includes(+b.difficulty || 1) && ['text', 'image', 'audio', 'video'].includes(b.kind || 'text') && ((b.kind || 'text') === 'text' || /^(\/|https:\/\/)/.test(b.media || ''));
const bad = s => s.status(400).json({ error: 'بيانات السؤال غير مكتملة' });
app.get('/api/admin/questions', need, adm, wrap(async (q, s) => s.json((await all('SELECT * FROM questions ORDER BY id DESC')).map(r => ({ ...r, options: JSON.parse(r.options) })))));
app.post('/api/admin/questions', need, adm, wrap(async (q, s) => {
  if (!val(q.body)) return bad(s); const b = q.body;
  await run('INSERT INTO questions(category,text,options,answer,kind,media,difficulty) VALUES(?,?,?,?,?,?,?)', [b.category, b.text, JSON.stringify(b.options), b.answer, b.kind || 'text', b.media || null, +b.difficulty || 1]); s.json({ ok: 1 });
}));
app.put('/api/admin/questions/:id', need, adm, wrap(async (q, s) => {
  if (!val(q.body)) return bad(s); const b = q.body;
  await run('UPDATE questions SET category=?,text=?,options=?,answer=?,kind=?,media=?,difficulty=? WHERE id=?', [b.category, b.text, JSON.stringify(b.options), b.answer, b.kind || 'text', b.media || null, +b.difficulty || 1, +q.params.id]); s.json({ ok: 1 });
}));
app.delete('/api/admin/questions/:id', need, adm, wrap(async (q, s) => { await run('DELETE FROM questions WHERE id=?', [+q.params.id]); s.json({ ok: 1 }); }));

(async () => {
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE NOT NULL, pass TEXT NOT NULL, xp INTEGER DEFAULT 0, streak INTEGER DEFAULT 0, last_daily TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS questions(id INTEGER PRIMARY KEY AUTOINCREMENT, category TEXT NOT NULL, text TEXT NOT NULL, options TEXT NOT NULL, answer INTEGER NOT NULL, active INTEGER DEFAULT 1);
    CREATE TABLE IF NOT EXISTS results(id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER REFERENCES users(id), mode TEXT, category TEXT, score INTEGER, correct INTEGER, total INTEGER, created_at TEXT DEFAULT CURRENT_TIMESTAMP);`);
  for (const m of ["ALTER TABLE questions ADD COLUMN kind TEXT DEFAULT 'text'", 'ALTER TABLE questions ADD COLUMN media TEXT', 'ALTER TABLE questions ADD COLUMN difficulty INTEGER DEFAULT 1']) try { await run(m); } catch {}
  await run('CREATE TABLE IF NOT EXISTS meta(k TEXT PRIMARY KEY, v TEXT)');
  if (((await all("SELECT v FROM meta WHERE k='seed'"))[0] || {}).v !== '3') {
    const have = new Set((await all('SELECT text FROM questions')).map(r => r.text));
    const seeds = [...require('./seed'), ...require('./seed2')], fresh = seeds.filter(x => !have.has(x[1]));
    if (fresh.length) await db.batch(fresh.map(([c, t, o, a, d = 1]) => ({ sql: 'INSERT INTO questions(category,text,options,answer,difficulty) VALUES(?,?,?,?,?)', args: [c, t, JSON.stringify(o), a, d] })), 'write');
    await db.batch(seeds.map(x => ({ sql: 'UPDATE questions SET difficulty=? WHERE text=?', args: [x[4] || 1, x[1]] })), 'write');
    await run("INSERT OR REPLACE INTO meta(k,v) VALUES('seed','3')");
  }
  app.listen(process.env.PORT || 3000, () => console.log('running'));
})();
