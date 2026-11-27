// Homeview open log: which demo was opened, by which device and network, how long it stayed open,
// whether "Vaata oma krundil" (AR) was pressed and whether an inquiry was sent.
// No cookies for visitors and no IP addresses are stored (only a daily salted hash to group visits).
// Eva's own devices are left out: open any page once with ?eva=1 (sets the hv_me cookie).
import { EmailMessage } from 'cloudflare:email';

// Personal links for the general demo: https://homeview.secondsun.ee/?k=<code>
// The code says who opened it; the name itself never appears in the link.
export const HV_CODES = {
  'pnj2': 'Nord Homes',
  '2am7': 'Avrame',
  'huj7': 'Norges Hus Nova',
  'agak': 'Timbeco Living',
  'db84': 'Palmatin',
  'i8r4': 'Kodumo',
  'p0sp': 'Kodasema',
  'zekc': 'Arca Nova',
  'rg1j': 'Valmer Puit',
  'lddn': 'Tehasemajad',
  '85g6': 'Astrolux',
  '5s09': 'Mooduliparadiis',
  'yhb0': 'Indrem',
  'fy6o': 'Cube House',
  '28qs': 'Greencube',
};
// Client folders with their own demo: opening one already says who it is.
const SITES = { demo: 'Üldine demo', soomemaja: 'Soome Maja', finnlog: 'Finnlog' };
const SLUG_SITE = { i0k9g95har: 'soomemaja', v22afzyw8l: 'finnlog' };

const EVENTS = new Set(['open', 'house', 'ar', 'inquiry', 'leave', 'ar_page']);
let ready = false;
async function db(env) {
  if (!env.HVLOG) return null;
  if (!ready) {
    await env.HVLOG.exec('CREATE TABLE IF NOT EXISTS ev (id INTEGER PRIMARY KEY, ts INTEGER, visit TEXT, ev TEXT, site TEXT, k TEXT, house TEXT, dur INTEGER, dev TEXT, os TEXT, country TEXT, city TEXT, org TEXT, ipk TEXT, ref TEXT)');
    await env.HVLOG.exec('CREATE INDEX IF NOT EXISTS ev_ts ON ev(ts)');
    ready = true;
  }
  return env.HVLOG;
}

export const isEva = (request) => /(?:^|;\s*)hv_me=1/.test(request.headers.get('cookie') || '');

export function evaCookie(url) {
  const to = new URL(url); to.searchParams.delete('eva');
  return new Response(null, { status: 302, headers: {
    location: to.toString(),
    'set-cookie': 'hv_me=1; Max-Age=63072000; Path=/; Secure; SameSite=Lax',
    'cache-control': 'no-store',
  } });
}

function device(ua) {
  const os = /iPhone|iPod/.test(ua) ? 'iPhone' : /iPad/.test(ua) ? 'iPad' : /Android/.test(ua) ? 'Android'
    : /Windows/.test(ua) ? 'Windows' : /Mac OS X|Macintosh/.test(ua) ? 'Mac' : /Linux/.test(ua) ? 'Linux' : 'muu';
  const dev = /iPhone|iPod|Android.*Mobile|Mobile/.test(ua) ? 'telefon' : /iPad|Android/.test(ua) ? 'tahvel' : 'arvuti';
  return { os, dev };
}
const BOT = /bot|crawl|spider|headless|preview|scan|python|curl|wget|facebookexternalhit|slurp|lighthouse/i;

async function ipKey(request, env) {
  const ip = request.headers.get('cf-connecting-ip') || '';
  const day = new Date().toISOString().slice(0, 10);
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ip + '|' + day + '|' + (env.HV_LOG_TOKEN || 'hv')));
  return [...new Uint8Array(buf).slice(0, 5)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function store(request, env, e) {
  const ua = request.headers.get('user-agent') || '';
  if (BOT.test(ua) || isEva(request)) return;
  const d = await db(env); if (!d) return;
  const cf = request.cf || {};
  const { os, dev } = device(ua);
  const cut = (s, n) => String(s || '').slice(0, n);
  await d.prepare('INSERT INTO ev (ts, visit, ev, site, k, house, dur, dev, os, country, city, org, ipk, ref) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
    .bind(Date.now(), cut(e.visit, 16), e.ev, cut(e.site, 20), cut(e.k, 12), cut(e.house, 60), Math.max(0, Math.min(86400, e.dur | 0)),
      dev, os, cut(cf.country, 4), cut(cf.city, 60), cut(cf.asOrganization, 80), await ipKey(request, env), cut(e.ref, 200))
    .run();
}

// POST /api/hv-event from the configurator (sendBeacon, text/plain JSON)
export async function handleEvent(request, env, ctx) {
  const cors = { 'access-control-allow-origin': '*', 'cache-control': 'no-store' };
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { ...cors, 'access-control-allow-methods': 'POST', 'access-control-allow-headers': 'content-type' } });
  if (request.method !== 'POST') return new Response('method', { status: 405, headers: cors });
  let e = {};
  try { e = JSON.parse((await request.text()).slice(0, 2000)); } catch { return new Response('bad', { status: 400, headers: cors }); }
  if (!EVENTS.has(e.ev) || !SITES[e.site]) return new Response('bad', { status: 400, headers: cors });
  ctx.waitUntil(store(request, env, e).catch((err) => console.error('hvlog', err && err.message)));
  return new Response(null, { status: 204, headers: cors });
}

// The worker's own /ar/<slug> page (iPhone App Clip fallback): log it as an AR page view.
export function logArPage(request, env, ctx, url) {
  const slug = url.pathname.split('/')[2] || '';
  const site = SLUG_SITE[slug] || 'demo';
  ctx.waitUntil(store(request, env, { ev: 'ar_page', site, visit: 'ar-' + crypto.randomUUID().slice(0, 8), house: url.searchParams.get('n') || '' }).catch(() => {}));
}

// ---- summary ----------------------------------------------------------------------------
const tz = (ms) => new Date(ms).toLocaleString('et-EE', { timeZone: 'Europe/Tallinn', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
const dur = (s) => (s >= 60 ? Math.floor(s / 60) + ' min ' : '') + (s % 60) + ' s';

async function visits(env, sinceMs) {
  const d = await db(env); if (!d) return [];
  const { results } = await d.prepare("SELECT * FROM ev WHERE ts >= ? AND IFNULL(k, '') != 'test' ORDER BY ts").bind(sinceMs).all();
  const by = new Map();
  for (const r of results) {
    const v = by.get(r.visit) || { start: r.ts, site: r.site, k: r.k, dev: r.dev, os: r.os, country: r.country, city: r.city, org: r.org, ipk: r.ipk, ref: r.ref, houses: new Set(), ar: false, inquiry: false, dur: 0, arPage: false };
    if (r.house) v.houses.add(r.house);
    if (r.ev === 'ar') v.ar = true;
    if (r.ev === 'ar_page') v.arPage = true;
    if (r.ev === 'inquiry') v.inquiry = true;
    if (r.dur) v.dur = Math.max(v.dur, r.dur);
    if (r.k && !v.k) v.k = r.k;
    by.set(r.visit, v);
  }
  return [...by.values()];
}

function who(v) {
  if (v.site !== 'demo') return SITES[v.site];
  return v.k ? (HV_CODES[v.k] ? 'Üldine demo – ' + HV_CODES[v.k] : 'Üldine demo (kood ' + v.k + ')') : 'Üldine demo (üldlink)';
}
function line(v) {
  const bits = [tz(v.start), who(v), v.dev + ' (' + v.os + ')', [v.city, v.country].filter(Boolean).join(', '), v.org].filter(Boolean);
  const did = [];
  if (v.dur) did.push('lahti ' + dur(v.dur));
  if (v.houses.size) did.push('majad: ' + [...v.houses].join(', '));
  if (v.ar) did.push('vajutas „Vaata oma krundil“');
  if (v.arPage) did.push('avas AR-lehe');
  if (v.inquiry) did.push('SAATIS PÄRINGU');
  return bits.join(' · ') + (did.length ? '\n    ' + did.join(' · ') : '');
}

export function summaryText(list) {
  if (!list.length) return 'Avamisi ei olnud.';
  const sites = {};
  for (const v of list) { const w = who(v); sites[w] = (sites[w] || 0) + 1; }
  const head = Object.entries(sites).map(([w, n]) => w + ': ' + n).join('\n');
  return head + '\n\n' + list.map(line).join('\n\n');
}

// GET /api/hv-log?t=<token>&d=<days>: the same summary as text, for Claude and Eva.
export async function handleLog(request, env, url) {
  if (!env.HV_LOG_TOKEN || url.searchParams.get('t') !== env.HV_LOG_TOKEN) return new Response('not found', { status: 404 });
  const days = Math.min(90, Math.max(1, +url.searchParams.get('d') || 7));
  const list = await visits(env, Date.now() - days * 86400000);
  return new Response('Homeview avamised, viimased ' + days + ' päeva (Tallinna aeg)\n\n' + summaryText(list) + '\n',
    { headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex' } });
}

// Every morning: last 24 hours to Eva's mailbox, only if something happened.
// Each morning run leaves one row in table mail (ts, n, err) so a missing email can be traced.
async function mailNote(env, n, err) {
  try {
    await env.HVLOG.exec('CREATE TABLE IF NOT EXISTS mail (ts INTEGER, n INTEGER, err TEXT)');
    await env.HVLOG.prepare('INSERT INTO mail (ts, n, err) VALUES (?, ?, ?)').bind(Date.now(), n, err || null).run();
  } catch (e) { console.error('hv mail note', e && e.message); }
}

export async function dailyMail(env, buildMime) {
  let n = 0;
  try { n = await sendDaily(env, buildMime); await mailNote(env, n, null); }
  catch (e) { await mailNote(env, n, String((e && (e.stack || e.message)) || e).slice(0, 500)); throw e; }
}

async function sendDaily(env, buildMime) {
  const list = await visits(env, Date.now() - 86400000);
  if (!list.length) return 0;
  const n = list.length;
  const text = 'Homeview demode avamised viimase 24 tunni jooksul (Tallinna aeg).\n'
    + 'Sinu enda avamisi ei loeta.\n\n' + summaryText(list) + '\n';
  const raw = buildMime({ from: env.FROM_ADDRESS, fromName: 'Homeview', to: env.TO_ADDRESS, replyTo: env.TO_ADDRESS,
    subject: 'Homeview: ' + n + (n === 1 ? ' avamine' : ' avamist') + ' viimase ööpäevaga', text, attachments: [] });
  await env.EMAIL.send(new EmailMessage(env.FROM_ADDRESS, env.TO_ADDRESS, raw));
  return n;
}
