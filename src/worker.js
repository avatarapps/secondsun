// Second Sun — serves the static site and sends contact requests by e-mail.
const json = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json; charset=utf-8' } });
const clean = (v, max) => String(v == null ? '' : v).replace(/\r/g, '').slice(0, max).trim();

async function handleRequest(request, env) {
  if (request.method !== 'POST') return json({ ok: false, error: 'method' }, 405);
  let data;
  try { data = await request.json(); } catch { return json({ ok: false, error: 'json' }, 400); }
  if (clean(data.website, 200)) return json({ ok: true }); // honeypot: quietly ignore bots
  const email = clean(data.email, 200);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ ok: false, error: 'email' }, 400);
  const name = clean(data.name, 200), phone = clean(data.phone, 60), company = clean(data.company, 200);
  const needs = Array.isArray(data.needs) ? data.needs.slice(0, 10).map((n) => clean(n, 80)).filter(Boolean) : [];
  const fields = Array.isArray(data.fields) ? data.fields.slice(0, 12).map((f) => ({ label: clean(f && f.label, 60), value: clean(f && f.value, 3000) })) : [];
  const missing = fields.filter((f) => !f.value).map((f) => f.label);
  const lines = [
    'Uus päring secondsun.ee kaudu', '',
    'Suund: ' + (needs.join(', ') || '—'), '',
    ...fields.map((f) => f.label + ':\n' + (f.value || '—') + '\n'),
    'Puuduv info: ' + (missing.join(', ') || '—'), '',
    'Kontakt', 'Nimi: ' + (name || '—'), 'E-post: ' + email, 'Telefon: ' + (phone || '—'), 'Ettevõte: ' + (company || '—')
  ];
  try {
    await env.EMAIL.send({
      to: env.TO_ADDRESS,
      from: env.FROM_ADDRESS,
      subject: 'Uus päring: ' + (company || name || email),
      text: lines.join('\n')
    });
  } catch (e) {
    console.error('send failed', e && e.message);
    return json({ ok: false, error: 'send' }, 502);
  }
  return json({ ok: true });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname === 'secondsun.ee') { url.hostname = 'www.secondsun.ee'; return Response.redirect(url.toString(), 301); }
    if (url.pathname === '/api/paring') return handleRequest(request, env);
    const res = await env.ASSETS.fetch(request);
    const out = new Response(res.body, res);
    out.headers.set('x-content-type-options', 'nosniff');
    out.headers.set('referrer-policy', 'strict-origin-when-cross-origin');
    out.headers.set('x-frame-options', 'DENY');
    return out;
  }
};
