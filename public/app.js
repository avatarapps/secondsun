(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); };
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- Reading machine ---------------- */
  (function readingMachine() {
    var root = $('rm'); if (!root) return;
    var stage = $('rm-stage'), wrap = $('rm-wrap'), labelsEl = $('rm-labels'), beam = $('rm-beam'), frame = $('rm-frame');
    var capEl = $('rm-cap'), qEl = $('rm-q'), aEl = $('rm-a'), srcEl = $('rm-src'), doneEl = $('rm-done'), statEl = $('rm-stat');
    var tabs = Array.prototype.slice.call(root.querySelectorAll('.rm-tab'));
    var rnd = function (i) { var v = Math.sin(i * 12.9898 + 7.7) * 43758.5453; return v - Math.floor(v); };
    var CYCLE = 7200, DONE = 2900, WORK = 700;
    var all = []; for (var n = 0; n < 240; n++) all.push(n);
    var cols = [0, 165, 330, 495];
    var nf = function (v) { return v.toLocaleString('et-EE'); };
    var Q = [
      {
        tag: 'TEHTUD',
        q: 'Kui palju kulutate aega tööle, mida mitte keegi ei peaks enam käsitsi tegema?',
        a: 'Võida poole aasta töötunnid tagasi.',
        src: ['arved → raamatupidamine', 'e-kirjad → CRM', 'näitlik ajavõit ≈ 1 000 h aastas'],
        stat: function (p) { return 'automatiseerin · ' + Math.round(p * 240) + ' / 240 korduvat toimingut · ≈ ' + nf(Math.round(p * 1000)) + ' h aastas'; },
        labels: ['arved', 'e-kirjad', 'tellimused', 'aruanded', 'andmesisestus'].map(function (t, r) { return { x: 0, y: 18 + r * 62, t: t }; }),
        hits: all, beam: 'v',
        pos: function (i) { var r = Math.floor(i / 48), k = i % 48, c = k % 24, l = Math.floor(k / 24), x = 116 + c * 22; return { x: x, y: 12 + r * 62 + l * 20, w: 15, h: 13, bg: ['#C7CDD8', '#8FA3C0', '#E4E7EC', '#8FA3C0', '#C7CDD8'][r], d: 700 + (x / 650) * 1900 }; },
        done: function (i) { var c = (i % 48) % 24; return { x: 116 + c * 3, s: 1, o: 1 }; }
      },
      {
        tag: 'LEITUD',
        q: 'Kui palju olulist jääb sul märkamata, sest sa ei jõua kõigel silma peal hoida?',
        a: 'Sinule olulised uudised ja konkurentide tegemised. Kindlaks ajaks kindlas kohas.',
        src: ['uudis · tarneajad pikenevad', 'konkurent B · hinnaleht muutus', 'iga tööpäev 08:00 · sinu postkastis'],
        stat: function (p) { return 'jälgin ' + Math.round(p * 42) + ' allikat · ' + Math.round(p * 5) + ' olulist muutust'; },
        labels: ['uudisportaalid', 'uudiskirjad', 'LinkedIn', 'konkurent A', 'konkurent B', 'konkurent C'].map(function (t, g) { return { x: g * 108, y: 44, t: t }; }),
        hideLabelsDone: true,
        hits: [7, 52, 95, 141, 166, 203],
        pos: function (i) { var g = Math.floor(i / 40), k = i % 40, c = k % 5, r = Math.floor(k / 5); return { x: g * 108 + c * 15, y: 70 + r * 26, w: 12, h: 17, bg: ['#E4E7EC', '#C7CDD8', '#C7CDD8', '#8FA3C0', '#8FA3C0', '#8FA3C0'][g], d: 700 + g * 300 + r * 22 }; },
        done: function (i, hit, j) { return hit ? { x: 300, y: 8 + j * 50, s: 1.8, o: 1 } : { x: 330, y: 150, s: 0.3, o: 0 }; }
      },
      {
        tag: 'TEHTUD',
        q: 'Kas iga uus klient tähendab rohkem tööd?',
        a: 'Päring saab vastuse. Pakkumine läheb teele. Tellimus jõuab süsteemi. Sa ei pea kõrval seisma.',
        src: ['vastus · 21:14', 'pakkumine · 21:15', 'tellimus → süsteem · 21:16'],
        stages: [700, 1350, 2000, 2650],
        stat: function (p, st) { return ['päring saabus · 21:14', 'vastus saadetud · 21:14', 'pakkumine teel · 21:15', 'tellimus süsteemis · 21:16', 'tellimus süsteemis · 21:16'][st]; },
        labels: ['päring', 'vastus', 'pakkumine', 'tellimus → süsteem'].map(function (t, c) { return { x: cols[c], y: 0, t: t }; }),
        lbl: function (c, st) { return { o: '1', c: c <= Math.min(st, 3) ? '#F5A524' : '#8E98A8' }; },
        flow: function (i, st, done) {
          if (i < 200) {
            var c = Math.floor(i / 50), k = i % 50;
            return { x: cols[c] + 6 + (k % 5) * 29, y: 28 + Math.floor(k / 5) * 28, w: 22, h: 18, bg: '#4E5D78', o: c <= Math.min(st, 3) ? 0.3 : 0.12, z: 1 };
          }
          var kk = i - 200, cc = Math.min(st, 3);
          return { x: cols[cc] + 22 + (kk % 5) * 22, y: 70 + Math.floor(kk / 5) * 24, w: 17, h: 14, bg: done || st >= 3 ? '#F5A524' : (st >= 1 ? '#C7CDD8' : '#E4E7EC'), o: 1, z: 3 };
        }
      },
      {
        tag: 'TEHTUD',
        q: 'Sul on hea äriidee. Miks sa pole seda veel teoks teinud?',
        a: 'Sina tunned oma äri. Meie loome sellest läbimõeldud digitoote üleliigsete sammudeta.',
        src: ['kasutaja põhitegevus', 'esimene versioon', 'üleliigsed sammud eemaldatud'],
        stages: [700, 1500, 2200, 99999],
        stat: function (p, st) { return ['kogun ideed ja vajadused', 'sorteerin: idee · kasutajad · esimene versioon', 'eemaldan üleliigsed sammud · 144 → 0', 'koostan esimese vaate', 'koostan esimese vaate'][st]; },
        labels: ['idee', 'kasutajad', 'esimene versioon', 'üleliigne'].map(function (t, c) { return { x: cols[c], y: 0, t: t }; }),
        lbl: function (c, st, done) { return { o: done || st === 0 ? '0' : (c === 3 && st >= 2 ? '0' : '1'), c: '#8E98A8' }; },
        frameDone: true,
        flow: function (i, st, done) {
          var g = i < 36 ? 0 : i < 72 ? 1 : i < 96 ? 2 : 3, base = [0, 36, 72, 96][g], k = i - base;
          if (st === 0 && !done) return { x: Math.round(rnd(i) * 610), y: 20 + Math.round(rnd(i + 51) * 280), w: 10 + Math.round(rnd(i + 7) * 20), h: 9 + Math.round(rnd(i + 3) * 8), bg: ['#E4E7EC', '#C7CDD8', '#8FA3C0'][Math.floor(rnd(i * 5) * 3)], o: 1, z: 1 };
          var gx = cols[g] + (k % 6) * 24, gy = 26 + Math.floor(k / 6) * 11;
          if (!done) { var gone = g === 3 && st >= 2; return { x: gx, y: gy, w: 18, h: 8, bg: ['#E4E7EC', '#C7CDD8', '#F5A524', '#4E5D78'][g], o: gone ? 0 : 1, s: gone ? 0.3 : 1, z: 1 }; }
          if (g === 3) return { x: gx, y: gy, w: 18, h: 8, bg: '#4E5D78', o: 0, s: 0.3, z: 1 };
          if (g === 0) { if (k >= 12) return { x: 300, y: 150, w: 10, h: 8, bg: '#E4E7EC', o: 0, s: 0.3, z: 1 }; return { x: 240 + (k % 6) * 30, y: 26 + Math.floor(k / 6) * 16, w: 27, h: 13, bg: '#8FA3C0', o: 1, z: 2 }; }
          if (g === 1) { var row = Math.floor(k / 12), r2 = k % 12; return { x: 240 + (r2 % 6) * 30, y: 76 + row * 52 + Math.floor(r2 / 6) * 21, w: 27, h: 18, bg: '#E4E7EC', o: 1, z: 2 }; }
          return { x: 240 + (k % 6) * 30, y: 244 + Math.floor(k / 6) * 12, w: 27, h: 10, bg: '#F5A524', o: 1, z: 3 };
        }
      }
    ];
    var cards = [];
    for (var i = 0; i < 240; i++) { var el = document.createElement('span'); el.className = 'rm-card'; stage.appendChild(el); cards.push(el); }
    var q = 0, t = 0, cyc = 0, hov = false, visible = true, lastKey = '';

    function stageOf(Qd, done) { var st = 0; if (Qd.stages) { Qd.stages.forEach(function (b, k) { if (t >= b) st = k + 1; }); if (done) st = Math.max(st, 3); } return st; }
    function place(done, st, entering) {
      var Qd = Q[q], j = 0, odd = cyc % 2 === 1;
      for (var i = 0; i < 240; i++) {
        var c = cards[i].style, x, y, w, h, s = 1, o = 1, bg, z = 1, r = 2, d = 0;
        if (Qd.flow) { var f = Qd.flow(i, st, done); x = f.x; y = f.y; w = f.w; h = f.h; bg = f.bg; o = f.o; z = f.z || 1; s = f.s === undefined ? 1 : f.s; }
        else {
          var p = Qd.pos(i), hit = Qd.hits.indexOf(i) >= 0;
          x = p.x; y = p.y; w = p.w; h = p.h; r = p.r || 2; bg = p.bg; d = p.d; z = hit ? 3 : 1;
          if (done) { var dd = Qd.done(i, hit, j); if (dd.x !== undefined) x = dd.x; if (dd.y !== undefined) y = dd.y; s = dd.s; o = dd.o; if (hit) bg = '#F5A524'; }
          if (hit) j++;
        }
        c.width = w + 'px'; c.height = h + 'px'; c.borderRadius = r + 'px';
        c.transform = 'translate(' + x + 'px,' + y + 'px) scale(' + s + ')';
        c.backgroundColor = bg; c.opacity = o; c.zIndex = z;
        if (entering) { c.animationName = Qd.flow ? 'none' : (odd ? 'rmfB' : 'rmfA'); c.animationDelay = Math.round(d) + 'ms'; }
      }
      Array.prototype.forEach.call(labelsEl.children, function (l, k) {
        if (Qd.lbl) { var v = Qd.lbl(k, st, done); l.style.opacity = v.o; l.style.color = v.c; }
        else l.style.opacity = done && Qd.hideLabelsDone ? '0' : '1';
      });
      frame.classList.toggle('on', !!Qd.frameDone && done);
    }
    function setQuestion(nq) {
      q = nq; t = 0; cyc++; lastKey = '';
      var Qd = Q[q];
      tabs.forEach(function (b, k) { b.setAttribute('aria-selected', k === q ? 'true' : 'false'); b.querySelector('.bar').style.width = '0%'; });
      qEl.textContent = Qd.q; qEl.classList.remove('fade-in'); void qEl.offsetWidth; qEl.classList.add('fade-in');
      labelsEl.innerHTML = Qd.labels.map(function (l) { return '<span class="rm-lbl" style="left:' + l.x + 'px;top:' + l.y + 'px">' + esc(l.t) + '</span>'; }).join('');
      beam.className = 'rm-beam' + (Qd.beam ? ' ' + Qd.beam : '');
      beam.style.display = Qd.beam && !reduce ? 'block' : 'none';
      beam.style.animationName = Qd.beam ? ('rmb' + Qd.beam + (cyc % 2 ? 'B' : 'A')) : 'none';
      aEl.textContent = Qd.a;
      srcEl.innerHTML = Qd.src.map(function (s, k) { return '<span class="fade-in" style="animation-delay:' + (150 + k * 120) + 'ms"><i></i>' + esc(s) + '</span>'; }).join('');
      tick(true);
    }
    function tick(entering) {
      var Qd = Q[q], done = t >= DONE, st = stageOf(Qd, done);
      var key = (done ? 'd' : 'w') + st;
      if (key !== lastKey || entering) {
        place(done, st, !!entering);
        if (done && lastKey.charAt(0) !== 'd') { aEl.classList.remove('fade-in'); void aEl.offsetWidth; aEl.classList.add('fade-in'); }
        doneEl.hidden = !done; statEl.hidden = done;
        lastKey = key;
      }
      capEl.textContent = done ? Qd.tag : t < WORK ? 'KÜSIMUS ' + (q + 1) + ' / 4' : 'TÖÖTLEN…';
      if (!done) statEl.textContent = Qd.stat(Math.min(1, Math.max(0, (t - WORK) / 2100)), st);
      tabs[q].querySelector('.bar').style.width = (Math.min(1, t / CYCLE) * 100).toFixed(1) + '%';
    }
    tabs.forEach(function (b, k) { b.addEventListener('click', function () { setQuestion(k); }); });
    root.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') hov = true; });
    root.addEventListener('pointerleave', function () { hov = false; });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(root);
    function fit() { var w = wrap.clientWidth, s = Math.min(1, w / 650); stage.style.transform = 'scale(' + s + ')'; wrap.style.height = Math.round(320 * s) + 'px'; }
    fit(); window.addEventListener('resize', fit);
    // Below desktop the panel's height follows its text. Lock it to the tallest question so the page under it never jumps.
    function lockH() {
      root.style.minHeight = '';
      if (window.innerWidth > 1180) return;
      var keep = [qEl.textContent, aEl.textContent, srcEl.innerHTML, doneEl.hidden, statEl.hidden, statEl.textContent], max = 0;
      Q.forEach(function (Qd) {
        qEl.textContent = Qd.q; aEl.textContent = Qd.a;
        srcEl.innerHTML = Qd.src.map(function (s) { return '<span><i></i>' + esc(s) + '</span>'; }).join('');
        doneEl.hidden = false; statEl.hidden = true; max = Math.max(max, root.getBoundingClientRect().height);
        doneEl.hidden = true; statEl.hidden = false;
        for (var s = 0; s < 5; s++) { statEl.textContent = Qd.stat(1, s); max = Math.max(max, root.getBoundingClientRect().height); }
      });
      qEl.textContent = keep[0]; aEl.textContent = keep[1]; srcEl.innerHTML = keep[2]; doneEl.hidden = keep[3]; statEl.hidden = keep[4]; statEl.textContent = keep[5];
      root.style.minHeight = Math.ceil(max) + 'px';
    }
    window.addEventListener('resize', function () { clearTimeout(lockH.t); lockH.t = setTimeout(lockH, 150); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(lockH);
    setQuestion(0);
    lockH();
    setInterval(function () {
      if (!visible || document.hidden) return;
      if (t < DONE) { t += 100; tick(); return; }
      if (hov) { tick(); return; }
      t += 100;
      if (t >= CYCLE) { setQuestion((q + 1) % 4); return; }
      tick();
    }, 100);
  })();

  /* ---------------- 03 kliendid ja müük: question → answer → lead (loops while visible) ---------------- */
  (function salesLead() {
    var root = $('ld'); if (!root) return;
    var steps = root.querySelectorAll('[data-s]'), chip = root.querySelector('.ld-chip[data-s]'), timers = [], seen = false;
    function set(n) {
      Array.prototype.forEach.call(steps, function (el) { el.classList.toggle('wait', +el.getAttribute('data-s') > n); });
      chip.classList.toggle('on', n >= 3);
    }
    function clear() { timers.forEach(clearTimeout); timers = []; }
    function run() {
      clear(); set(0);
      [[1, 500], [2, 1700], [3, 3100], [4, 3900]].forEach(function (p) { timers.push(setTimeout(function () { set(p[0]); }, p[1])); });
      timers.push(setTimeout(function () { if (seen) run(); }, 3900 + 4200));
    }
    if (reduce || !('IntersectionObserver' in window)) { set(4); return; }
    set(0);
    new IntersectionObserver(function (en) {
      var was = seen; seen = en[0].isIntersecting;
      if (seen && !was) run(); else if (!seen) { clear(); set(4); }
    }, { threshold: 0.45 }).observe(root);
  })();

  /* ---------------- 03 portal (runs by itself while visible; a tap still works) ---------------- */
  (function portal() {
    var btn = $('reorder'); if (!btn) return;
    var on = false, timer = 0, seen = false, holdUntil = 0;
    function set(v) {
      on = v;
      $('ph-new').hidden = !on; $('biz-new').hidden = !on;
      btn.textContent = on ? 'Tellitud ✓' : 'Telli uuesti';
      btn.className = on ? 'btn-reset' : 'btn-reorder';
    }
    function loop() {
      clearTimeout(timer); if (!seen) return;
      var wait = Math.max(0, holdUntil - Date.now());
      timer = setTimeout(function () {
        if (!seen) return;
        if (on) { set(false); timer = setTimeout(loop, 1600); return; }
        btn.classList.add('tap');
        setTimeout(function () { btn.classList.remove('tap'); set(true); timer = setTimeout(loop, 3600); }, 260);
      }, wait || 900);
    }
    // Reserve the 'ordered' height so the page below never jumps while the demo loops.
    function lock() {
      var ph = btn.closest('.phone'), bz = document.querySelector('.biz'), was = on;
      ph.style.minHeight = bz.style.minHeight = '';
      set(true); var h1 = ph.offsetHeight, h2 = bz.offsetHeight; set(was);
      ph.style.minHeight = h1 + 'px'; bz.style.minHeight = h2 + 'px';
    }
    lock(); window.addEventListener('resize', function () { clearTimeout(lock.t); lock.t = setTimeout(lock, 150); });
    btn.addEventListener('click', function () { set(!on); holdUntil = Date.now() + 6000; loop(); });
    if (reduce || !('IntersectionObserver' in window)) return;
    new IntersectionObserver(function (en) { seen = en[0].isIntersecting; if (seen) loop(); else clearTimeout(timer); }, { threshold: 0.35 }).observe(btn.closest('.portal'));
  })();

  /* ---------------- Intake ---------------- */
  (function intake() {
    var form = $('in-form'); if (!form) return;
    var stepEl = $('in-step'), footEl = $('in-foot'), scrollEl = $('in-scroll');
    var NEEDS = [
      { id: 'advisor', t: 'AI-tootenõustaja kodulehele' },
      { id: 'auto', t: 'Automatiseerida korduvaid tööülesandeid' },
      { id: 'sys', t: 'Ühendada erinevaid programme ja süsteeme' },
      { id: 'cs', t: 'Lihtsustada klienditeenindust' },
      { id: 'prod', t: 'Luua uus digitoode' },
      { id: 'other', t: 'Midagi muud või pole veel kindel' }
    ];
    var TITLES = { pilot: 'Tootenõustaja näidis', contact: 'Kontaktandmed', needs: 'Mida soovid paremaks muuta või luua?', desc: 'Räägi sellest lähemalt', ai: 'AI täpsustused', frame: 'Projekti raamid', summary: 'Päringu kokkuvõte' };
    // Value first, contact last. A visitor who came from the advisor offer starts with their website.
    var ORDER = ['needs', 'desc', 'ai', 'frame', 'contact', 'summary'];
    var PILOT = ['pilot'];
    var ALLOWED = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'txt', 'ppt', 'pptx', 'png', 'jpg', 'jpeg', 'webp', 'heic'];
    var MAX_FILES = 5, MAX_FILE = 10 * 1024 * 1024, MAX_TOTAL = 15 * 1024 * 1024;
    var DRAFT = 'ss-paring-v1';
    var S, files = [], startedAt = Date.now(), aiSig = '', aiOn = false;
    function fresh() { return { aiOn: aiOn, mode: 'general', site: '', step: 'needs', name: '', company: '', email: '', phone: '', needs: [], desc: '', ai: 'idle', aiQs: [], aiAns: {}, known: {}, dl: '', dlDate: '', bud: '', budget: '', brief: '', briefTouched: false, send: 'idle', sendErr: '', idem: '', tried: false, fileErr: '' }; }
    S = fresh();
    try { var d = JSON.parse(localStorage.getItem(DRAFT) || 'null'); if (d && d.v === 1) { ['name', 'company', 'email', 'phone', 'needs', 'desc', 'dl', 'dlDate', 'bud', 'budget', 'site'].forEach(function (k) { if (d[k] !== undefined) S[k] = d[k]; }); } } catch (e) { /* no storage */ }
    function save() { try { localStorage.setItem(DRAFT, JSON.stringify({ v: 1, name: S.name, company: S.company, email: S.email, phone: S.phone, needs: S.needs, desc: S.desc, site: S.site, dl: S.dl, dlDate: S.dlDate, bud: S.bud, budget: S.budget })); } catch (e) { /* ignore */ } }
    function clearDraft() { try { localStorage.removeItem(DRAFT); } catch (e) { /* ignore */ } }

    var siteOk = function (v) { return /^[^\s]+\.[^\s]{2,}$/.test((v || '').trim()); };
    var emailOk = function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((v || '').trim()); };
    var needLabels = function () { return S.needs.map(function (id) { return (NEEDS.filter(function (n) { return n.id === id; })[0] || { t: id }).t; }); };
    var fmtSize = function (n) { return n < 1024 * 1024 ? Math.max(1, Math.round(n / 1024)) + ' KB' : (n / 1048576).toFixed(1).replace('.', ',') + ' MB'; };
    var ext = function (n) { var m = /\.([a-z0-9]+)$/i.exec(n || ''); return m ? m[1].toLowerCase() : ''; };
    var uuid = function () { return (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : 'id-' + Date.now() + '-' + Math.random().toString(36).slice(2); };

    // which steps the visitor actually sees
    function needAi() { return S.aiOn && S.ai !== 'none' && S.ai !== 'error'; }
    function needFrame() { return !(S.known.deadline && S.known.budget); }
    function visible() { return (S.mode === 'pilot' ? PILOT : ORDER).filter(function (k) { return (k !== 'ai' || needAi()) && (k !== 'frame' || needFrame()); }); }
    function go(step) { S.step = step; S.tried = false; if (step === 'summary' && !S.briefTouched) S.brief = buildBrief(); render(); scrollEl.scrollTop = 0; var top = $('intake').getBoundingClientRect().top; if (top < 0) $('intake').scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' }); }
    function nextFrom(step) { var v = visible(), i = v.indexOf(step); return v[Math.min(v.length - 1, i + 1)]; }
    function prevFrom(step) { var v = visible(), i = v.indexOf(step); return v[Math.max(0, i - 1)]; }

    function dlText() {
      if (S.known.deadline) return S.known.deadline;
      if (S.dl === 'date') return S.dlDate ? 'kindel tähtaeg ' + S.dlDate.split('-').reverse().join('.') : 'kindel tähtaeg, kuupäev märkimata';
      return S.dl === 'asap' ? 'võimalikult kiiresti' : S.dl === 'flex' ? 'paindlik' : '';
    }
    function budText() {
      if (S.known.budget) return S.known.budget;
      if (S.bud === 'sum') return S.budget.trim() ? S.budget.trim().replace(/\s*€$/, '') + ' €' : '';
      return S.bud === 'unknown' ? 'ei tea veel' : '';
    }
    function buildBrief() {
      var L = [], unknown = [];
      L.push('LÄHTEÜLESANNE', '');
      L.push('Kontakt: ' + [S.name.trim(), S.company.trim(), S.email.trim(), S.phone.trim()].filter(Boolean).join(' · '));
      if (!S.company.trim()) unknown.push('ettevõte');
      if (S.site.trim()) L.push('Koduleht: ' + S.site.trim());
      L.push('Soov: ' + (needLabels().join('; ') || '—'), '');
      L.push('Kirjeldus:', S.desc.trim() || '—');
      if (!S.desc.trim()) unknown.push('kirjeldus');
      if (S.ai === 'ok' && S.aiQs.length) {
        L.push('', 'Täpsustused:');
        S.aiQs.forEach(function (qq, i) { var a = (S.aiAns[i] || '').trim(); L.push('– ' + qq, '  ' + (a || 'vastamata')); if (!a) unknown.push('vastus: „' + qq + '“'); });
      }
      var dl = dlText(), bd = budText();
      if (!dl) unknown.push('tähtaeg');
      if (!bd || bd === 'ei tea veel') unknown.push('eelarve');
      L.push('', 'Tähtaeg: ' + (dl || '—'), 'Eelarve: ' + (bd || '—'));
      L.push('Lisamaterjalid: ' + (files.length ? files.map(function (f) { return f.name; }).join(', ') : '—'));
      L.push('', 'Teadmata: ' + (unknown.length ? unknown.join('; ') : '—'));
      return L.join('\n');
    }

    function askAi() {
      var sig = JSON.stringify([S.needs, S.desc.trim(), S.company.trim()]);
      if (sig === aiSig && (S.ai === 'ok' || S.ai === 'none')) return Promise.resolve();
      aiSig = sig; S.ai = 'loading'; S.aiQs = []; S.aiAns = {}; S.known = {};
      return fetch('/api/tapsustused', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ needs: needLabels(), description: S.desc.trim(), company: S.company.trim(), startedAt: startedAt }) })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok || !j.ok) throw new Error(j.error || 'ai'); return j; }); })
        .then(function (j) {
          S.aiQs = (j.questions || []).slice(0, 3);
          S.known = j.known || {};
          S.ai = S.aiQs.length ? 'ok' : 'none';
        })
        .catch(function () { S.ai = 'error'; aiSig = ''; });
    }

    function validateContact() { return emailOk(S.email); }
    function next() {
      var s = S.step;
      if (s === 'contact' && !validateContact()) { S.tried = true; render(); var m = $('i-mail'); if (m) m.focus(); return; }
      if (s === 'needs' && !S.needs.length) { S.tried = true; render(); return; }
      save();
      if (s === 'desc' && S.aiOn && S.mode !== 'pilot') {
        S.step = 'ai'; render();
        askAi().then(function () { if (S.step !== 'ai') return; if (S.ai === 'ok') render(); else go(nextFrom('desc')); });
        return;
      }
      go(nextFrom(s));
    }

    function addFiles(list) {
      S.fileErr = '';
      var errs = [];
      Array.prototype.forEach.call(list, function (f) {
        var total = files.reduce(function (a, x) { return a + x.size; }, 0);
        if (files.length >= MAX_FILES) { errs.push('Korraga saab lisada kuni ' + MAX_FILES + ' faili.'); return; }
        if (ALLOWED.indexOf(ext(f.name)) < 0) { errs.push('„' + f.name + '“: seda failitüüpi ei saa lisada.'); return; }
        if (f.size > MAX_FILE) { errs.push('„' + f.name + '“ on suurem kui 10 MB.'); return; }
        if (f.size === 0) { errs.push('„' + f.name + '“ on tühi fail.'); return; }
        if (total + f.size > MAX_TOTAL) { errs.push('Failide kogumaht võib olla kuni 15 MB.'); return; }
        if (files.some(function (x) { return x.name === f.name && x.size === f.size; })) return;
        files.push(f);
      });
      S.fileErr = errs.filter(function (e, i) { return errs.indexOf(e) === i; }).join(' ');
      render();
    }

    function send() {
      if (S.send === 'sending') return;
      if (S.mode === 'pilot') {
        if (!siteOk(S.site) || !emailOk(S.email)) { S.tried = true; render(); return; }
        S.brief = 'TOOTENÕUSTAJA NÄIDIS\n\nKoduleht: ' + S.site.trim() + '\nE-post: ' + S.email.trim() + '\n\nSoov: näidis, kuidas AI-tootenõustaja selle lehel töötaks.';
      } else if (!emailOk(S.email)) { go('contact'); S.tried = true; render(); return; }
      if (!S.idem) S.idem = uuid();
      S.send = 'sending'; S.sendErr = ''; render();
      var fd = new FormData();
      fd.append('meta', JSON.stringify({ name: S.name.trim(), company: (S.company.trim() || (S.mode === 'pilot' ? S.site.trim() : '')), email: S.email.trim(), phone: S.phone.trim(), needs: needLabels(), brief: S.brief, website: $('in-hp').value, startedAt: startedAt, idem: S.idem }));
      files.forEach(function (f) { fd.append('files', f, f.name); });
      var ctl = window.AbortController ? new AbortController() : null;
      var to = setTimeout(function () { if (ctl) ctl.abort(); }, 60000);
      fetch('/api/paring', { method: 'POST', body: fd, signal: ctl ? ctl.signal : undefined })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok || !j.ok) { var e = new Error(j.error || 'send'); e.msg = j.message; throw e; } }); })
        .then(function () { clearTimeout(to); S.send = 'sent'; clearDraft(); render(); })
        .catch(function (e) {
          clearTimeout(to);
          S.send = 'error';
          S.sendErr = e && e.msg ? e.msg : (e && e.name === 'AbortError' ? 'Ühendus katkes enne kinnitust.' : 'Server ei kinnitanud saatmist.');
          render();
        });
    }

    var opt = function (t, on, act) { return '<button type="button" class="opt" aria-pressed="' + on + '" data-act="' + act + '"><span class="box" aria-hidden="true">' + (on ? '✓' : '') + '</span>' + esc(t) + '</button>'; };
    var radio = function (t, on, act) { return '<button type="button" class="chip" role="radio" aria-checked="' + on + '" data-act="' + act + '">' + esc(t) + '</button>'; };
    var dateChip = function () {
      var on = S.dl === 'date' && !!S.dlDate;
      return '<label class="chip chip-date" role="radio" aria-checked="' + on + '"><span>' + (on ? esc(S.dlDate.split('-').reverse().join('.')) : 'Vali kuupäev') + '</span><input type="date" data-in="dlDate" aria-label="Tähtaja kuupäev" value="' + esc(S.dlDate) + '"></label>';
    };

    function render() {
      var sent = S.send === 'sent', v = visible(), idx = v.indexOf(S.step);
      // The step's own heading says what it asks; the bar shows only where you are.
      $('in-title').textContent = sent ? 'Saadetud' : S.mode === 'pilot' ? TITLES.pilot : (idx + 1) + ' / ' + v.length;
      $('in-count').textContent = '';
      $('in-fill').style.width = (sent ? 100 : (idx / v.length) * 100).toFixed(1) + '%';
      var h = '', f = '';
      if (sent) {
        h = '<div class="in-pad pop-in" style="padding-top:40px"><span class="sent-mark" aria-hidden="true">✓</span><p class="in-title" role="status">' + (S.mode === 'pilot' ? 'Aitäh!' : 'Päring saadetud!') + '</p><p style="margin:0;font-size:17px;color:#344054">' + (S.mode === 'pilot' ? 'Saadame näidise lingi lähipäevil.' : 'Võtame sinuga ühendust.') + '</p></div>';
      } else if (S.step === 'pilot') {
        var badS = S.tried && !siteOk(S.site), badE = S.tried && !emailOk(S.email);
        h = '<div class="in-pad"><p class="in-title">Vaata, kuidas tootenõustaja sinu lehel töötaks</p>' +
          '<div class="field"><label for="i-site">Kodulehe aadress</label><input id="i-site" data-in="site" type="text" inputmode="url" autocomplete="url" maxlength="200" placeholder="sinufirma.ee" aria-invalid="' + badS + '" value="' + esc(S.site) + '"></div>' +
          '<div class="field"><label for="i-mail">E-post</label><input id="i-mail" data-in="email" type="email" inputmode="email" autocomplete="email" maxlength="200" aria-invalid="' + badE + '" value="' + esc(S.email) + '"></div>' +
          (badS || badE ? '<p class="f-err">' + (badS ? 'Sisesta kodulehe aadress. ' : '') + (badE ? 'Sisesta e-posti aadress.' : '') + '</p>' : '') +
          '<p class="in-sub">Ehitame sinu lehe põhjal näidise ja saadame lingi lähipäevil.</p>' +
          (S.send === 'error' ? '<div class="err" role="alert"><b>Ei õnnestunud saata.</b><span>' + esc(S.sendErr) + ' Proovi uuesti või kirjuta info@secondsun.ee.</span></div>' : '') + '</div>';
      } else if (S.step === 'contact') {
        var bad = S.tried && !emailOk(S.email);
        h = '<div class="in-pad"><p class="in-title">Kontaktandmed</p><div class="two">' +
          '<div class="field"><label for="i-name">Nimi</label><input id="i-name" data-in="name" type="text" autocomplete="name" maxlength="200" value="' + esc(S.name) + '"></div>' +
          '<div class="field"><label for="i-org">Ettevõte</label><input id="i-org" data-in="company" type="text" autocomplete="organization" maxlength="200" value="' + esc(S.company) + '"></div>' +
          '<div class="field"><label for="i-mail">E-post *</label><input id="i-mail" data-in="email" type="email" inputmode="email" autocomplete="email" maxlength="200" required aria-invalid="' + bad + '"' + (bad ? ' aria-describedby="i-mail-err"' : '') + ' value="' + esc(S.email) + '"></div>' +
          '<div class="field"><label for="i-tel">Telefon</label><input id="i-tel" data-in="phone" type="tel" inputmode="tel" autocomplete="tel" maxlength="60" value="' + esc(S.phone) + '"></div>' +
          '</div>' + (bad ? '<p class="f-err" id="i-mail-err">Sisesta e-posti aadress, et saaksime vastata.</p>' : '') + '</div>';
      } else if (S.step === 'needs') {
        h = '<div class="in-pad"><div style="display:flex;flex-direction:column;gap:6px"><p class="in-title">Mida soovid paremaks muuta või luua?</p><p class="in-sub">Vali üks või mitu.</p></div><div class="opts" role="group" aria-label="Soov">' +
          NEEDS.map(function (n) { return opt(n.t, S.needs.indexOf(n.id) >= 0, 'need:' + n.id); }).join('') + '</div>' +
          (S.tried && !S.needs.length ? '<p class="f-err">Vali vähemalt üks.</p>' : '') + '</div>';
      } else if (S.step === 'desc') {
        h = '<div class="in-pad"><label for="i-desc" class="in-title">' + (S.mode === 'pilot' ? 'Mida kliendid sinult kõige sagedamini küsivad?' : 'Räägi sellest lähemalt.') + '</label>' +
          '<div class="field"><textarea id="i-desc" data-in="desc" rows="8" maxlength="5000" style="min-height:220px">' + esc(S.desc) + '</textarea></div>' +
          '<div class="grp"><span class="lbl" style="font-size:15px;font-weight:600">Lisamaterjalid</span>' +
          '<label class="drop" id="i-drop"><b>Lisa failid</b><small>PDF, Word, Excel, PowerPoint, CSV, TXT, pildid · kuni 5 faili, igaüks kuni 10 MB</small><input id="i-files" type="file" multiple accept=".' + ALLOWED.join(',.') + '"></label>' +
          (S.fileErr ? '<p class="f-err" role="alert">' + esc(S.fileErr) + '</p>' : '') +
          (files.length ? '<div class="files">' + files.map(function (x, i) { return '<div class="file"><span>' + esc(x.name) + '</span><span>' + fmtSize(x.size) + '<button type="button" data-act="rm:' + i + '" aria-label="Eemalda ' + esc(x.name) + '">×</button></span></div>'; }).join('') + '</div>' : '') +
          '</div></div>';
      } else if (S.step === 'ai') {
        h = '<div class="in-pad"><p class="in-title">Täpsustused</p>';
        if (S.ai === 'loading' || S.ai === 'idle') h += '<div class="typing" role="status" aria-label="Täpsustused laadivad"><i></i><i></i><i></i></div>';
        else if (S.ai === 'error') h += '<div class="notice" role="status"><b>Täpsustusi ei õnnestunud praegu laadida.</b><span>Võid jätkata ilma nendeta või proovida uuesti.</span><button type="button" class="ghost" style="align-self:flex-start;padding:0" data-act="aiRetry">Proovi uuesti</button></div>';
        else S.aiQs.forEach(function (qq, i) { h += '<div class="field"><label for="i-ai-' + i + '" class="b-q">' + esc(qq) + '</label><textarea id="i-ai-' + i + '" data-in="ai:' + i + '" rows="2" maxlength="2000">' + esc(S.aiAns[i] || '') + '</textarea></div>'; });
        h += '</div>';
      } else if (S.step === 'frame') {
        h = '<div class="in-pad" style="gap:26px"><p class="in-title">Projekti raamid</p>';
        if (!S.known.deadline) h += '<div class="grp" role="radiogroup" aria-labelledby="i-dl-l"><span class="lbl" id="i-dl-l">Kas sul on kindel tähtaeg?</span><div class="chips">' + dateChip() + radio('Võimalikult kiiresti', S.dl === 'asap', 'dl:asap') + radio('Paindlik', S.dl === 'flex', 'dl:flex') + '</div></div>';
        if (!S.known.budget) h += '<div class="grp" role="radiogroup" aria-labelledby="i-bd-l"><span class="lbl" id="i-bd-l">Projekti eelarve</span><div class="chips">' + '<input class="chip chip-in" type="text" inputmode="numeric" maxlength="40" placeholder="Summa €" aria-label="Eelarve summa eurodes" data-in="budget" value="' + esc(S.bud === 'sum' ? S.budget : '') + '">' + radio('Ei tea veel', S.bud === 'unknown', 'bud:unknown') + '</div></div>';
        h += '</div>';
      } else if (S.step === 'summary') {
        h = '<div class="in-pad" style="gap:14px"><div style="display:flex;flex-direction:column;gap:6px"><p class="in-title">Päringu kokkuvõte</p><p class="in-sub">Kontrolli üle. Teksti saab muuta.</p></div>' +
          '<div class="field"><label for="i-brief" class="sr-only">Lähteülesanne</label><textarea id="i-brief" class="brief" data-in="brief" rows="16" maxlength="12000">' + esc(S.brief) + '</textarea></div>' +
          (S.send === 'error' ? '<div class="err" role="alert"><b>Päringut ei saadetud.</b><span>' + esc(S.sendErr) + ' Sinu sisestatud andmed on alles — proovi uuesti või kirjuta otse info@secondsun.ee või helista +372 5664 1159.</span></div>' : '') + '</div>';
      }
      if (!sent) {
        var first = idx === 0, last = S.step === 'summary';
        f = (first ? '<span></span>' : '<button type="button" class="ghost" data-act="back">← Tagasi</button>');
        if (S.mode === 'pilot') f = '<button type="button" class="btn btn-gold" data-act="send"' + (S.send === 'sending' ? ' disabled aria-busy="true"' : '') + '>' + (S.send === 'sending' ? 'Saadan…' : 'Saada mulle näidis →') + '</button><button type="button" class="ghost" data-act="general">Muu päring</button>';
        else if (last) f += '<button type="button" class="btn btn-gold" data-act="send"' + (S.send === 'sending' ? ' disabled aria-busy="true"' : '') + '>' + (S.send === 'sending' ? 'Saadan…' : 'Saada päring →') + '</button>';
        else f += '<button type="button" class="btn btn-dark" data-act="next"' + (S.step === 'ai' && (S.ai === 'loading' || S.ai === 'idle') ? ' disabled' : '') + '>' + (S.step === 'ai' && S.ai === 'error' ? 'Jätka ilma täpsustusteta →' : 'Edasi →') + '</button>';
      }
      stepEl.innerHTML = h; footEl.innerHTML = f; footEl.hidden = sent;
    }

    // "Proovi 2–4 nädalat tasuta" opens the advisor path: website first, contact last.
    document.addEventListener('click', function (e) {
      var t = e.target.closest('[data-intake="pilot"]'); if (!t || S.send === 'sent') return;
      S.mode = 'pilot'; if (S.needs.indexOf('advisor') < 0) S.needs = ['advisor'].concat(S.needs);
      S.step = 'pilot'; S.tried = false; S.send = 'idle'; render();
    });
    form.addEventListener('submit', function (e) { e.preventDefault(); });
    form.addEventListener('click', function (e) {
      var b = e.target.closest('[data-act]'); if (!b || b.disabled) return;
      var a = b.getAttribute('data-act');
      if (a === 'next') return next();
      if (a === 'back') return go(prevFrom(S.step));
      if (a === 'send') return send();
      if (a === 'general') { S.mode = 'general'; S.needs = S.needs.filter(function (n) { return n !== 'advisor'; }); S.send = 'idle'; return go('needs'); }
      if (a === 'aiRetry') { aiSig = ''; askAi().then(function () { if (S.step !== 'ai') return; if (S.ai === 'none') go(nextFrom('desc')); else render(); }); render(); return; }
      if (a.indexOf('need:') === 0) { var id = a.slice(5), i = S.needs.indexOf(id); if (i >= 0) S.needs.splice(i, 1); else S.needs.push(id); save(); render(); return; }
      if (a.indexOf('dl:') === 0) { S.dl = a.slice(3); S.dlDate = ''; save(); render(); return; }
      if (a.indexOf('bud:') === 0) { S.bud = a.slice(4); S.budget = ''; save(); render(); return; }
      if (a.indexOf('rm:') === 0) { files.splice(+a.slice(3), 1); S.fileErr = ''; render(); return; }
    });
    form.addEventListener('input', function (e) {
      var k = e.target.getAttribute('data-in'); if (!k) return;
      if (k.indexOf('ai:') === 0) S.aiAns[+k.slice(3)] = e.target.value;
      else { S[k] = e.target.value; if (k === 'brief') S.briefTouched = true; }
      if (k === 'budget') { S.bud = S.budget.trim() ? 'sum' : ''; var u = form.querySelector('[data-act="bud:unknown"]'); if (u) u.setAttribute('aria-checked', 'false'); }
      if (S.mode === 'pilot' && S.tried && (k === 'site' || k === 'email')) {
        var okS = siteOk(S.site), okE = emailOk(S.email), fe = form.querySelector('.f-err');
        if ($('i-site')) $('i-site').setAttribute('aria-invalid', String(!okS));
        if ($('i-mail')) $('i-mail').setAttribute('aria-invalid', String(!okE));
        if (fe) { if (okS && okE) fe.remove(); else fe.textContent = (okS ? '' : 'Sisesta kodulehe aadress. ') + (okE ? '' : 'Sisesta e-posti aadress.'); }
      }
      if (k === 'email' && S.tried && emailOk(S.email)) { e.target.setAttribute('aria-invalid', 'false'); var er = $('i-mail-err'); if (er) er.remove(); }
      save();
    });
    form.addEventListener('change', function (e) {
      if (e.target.id === 'i-files') { addFiles(e.target.files); e.target.value = ''; }
      if (e.target.getAttribute('data-in') === 'dlDate') { S.dlDate = e.target.value; S.dl = S.dlDate ? 'date' : ''; save(); render(); }
    });
    form.addEventListener('click', function (e) {
      var c = e.target.closest('.chip-date'); if (!c) return;
      var inp = c.querySelector('input'); if (inp && inp.showPicker) { e.preventDefault(); try { inp.showPicker(); } catch (x) { inp.focus(); } }
    });
    form.addEventListener('keydown', function (e) { if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.type !== 'file') { e.preventDefault(); if (S.mode === 'pilot') send(); else next(); } });
    form.addEventListener('dragover', function (e) { var d = $('i-drop'); if (d && d.contains(e.target)) { e.preventDefault(); d.classList.add('over'); } });
    form.addEventListener('dragleave', function () { var d = $('i-drop'); if (d) d.classList.remove('over'); });
    form.addEventListener('drop', function (e) { var d = $('i-drop'); if (d && d.contains(e.target)) { e.preventDefault(); d.classList.remove('over'); addFiles(e.dataTransfer.files); } });
    render();
    fetch('/api/config').then(function (r) { return r.json(); }).then(function (c) { aiOn = !!(c && c.ai); S.aiOn = aiOn; render(); }).catch(function () { /* AI stays off */ });
  })();
})();
