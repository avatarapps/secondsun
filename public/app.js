(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); };
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- Reading machine ---------------- */
  (function readingMachine() {
    var root = $('rm'); if (!root) return;
    var stage = $('rm-stage'), wrap = $('rm-wrap'), labelsEl = $('rm-labels'), beam = $('rm-beam');
    var capEl = $('rm-cap'), qEl = $('rm-q'), aEl = $('rm-a'), srcEl = $('rm-src'), doneEl = $('rm-done'), statEl = $('rm-stat');
    var tabs = Array.prototype.slice.call(root.querySelectorAll('.rm-tab'));
    var rnd = function (i) { var v = Math.sin(i * 12.9898 + 7.7) * 43758.5453; return v - Math.floor(v); };
    var CYCLE = 8200, DONE = 2900, WORK = 700;
    var Q = [
      {
        q: 'Mitmest erinevast kohast sa iga päev uudiseid loed?',
        a: 'Üks kokkuvõte hommikul: viis uudist, mis puudutavad just sinu ettevõtet.',
        src: ['uudisportaal · tarneajad pikenevad', 'valdkonna uudiskiri · uus nõue', 'LinkedIn · konkurent värbab müüjaid'],
        stat: function (p) { return 'loen ' + Math.round(p * 38) + ' allikast · ' + Math.round(p * 412) + ' artiklit'; },
        labels: ['uudisportaalid', 'uudiskirjad', 'LinkedIn', 'valdkond', 'pressiteated', 'foorumid'].map(function (t, g) { return { x: g * 108, y: 44, t: t }; }),
        hideLabelsDone: true,
        hits: [7, 52, 95, 141, 203],
        pos: function (i) { var g = Math.floor(i / 40), k = i % 40, c = k % 5, r = Math.floor(k / 5); return { x: g * 108 + c * 15, y: 70 + r * 26, w: 12, h: 17, bg: ['#E4E7EC', '#C7CDD8', '#8FA3C0', '#E4E7EC', '#C7CDD8', '#8FA3C0'][g], d: 700 + g * 300 + r * 22 }; },
        done: function (i, hit, j) { return hit ? { x: 300, y: 20 + j * 58, s: 1.9, o: 1 } : { x: 330, y: 150, s: 0.3, o: 0 }; }
      },
      {
        q: 'Kui konkurent homme midagi olulist muudab, millal sina sellest teada saad?',
        a: 'Näide: konkurent B muutis hinnalehte, põhipakett on nüüd 12% odavam.',
        src: ['konkurent B · hinnaleht · muutus 07:40', 'konkurent B · uus pakett', 'konkurent D · 2 uut töökuulutust'],
        stat: function (p) { return 'võrdlen ' + Math.round(p * 24) + ' / 24 lehte eilsega'; },
        labels: ['Konkurent A', 'Konkurent B', 'Konkurent C', 'Konkurent D'].map(function (t, b) { return { x: b * 176, y: 32, t: t }; }).concat([{ x: 0, y: 290, t: 'veeb · hinnad · töökuulutused' }]),
        hits: [79, 80, 81, 82, 85, 86, 87, 88],
        pos: function (i) { var b = Math.floor(i / 60), k = i % 60, c = k % 6, r = Math.floor(k / 6); return { x: b * 176 + c * 16, y: 58 + r * 22, w: 13, h: 13, bg: r < 2 ? '#8FA3C0' : '#4E5D78', d: 700 + b * 480 + r * 30 }; },
        done: function (i, hit) { return hit ? { s: 1.25, o: 1 } : { s: 1, o: Math.floor(i / 60) === 1 ? 0.6 : 0.28 }; }
      },
      {
        q: 'Kui palju aega kulub sul vajaliku info otsimisele?',
        a: 'Leitud: lepingu tingimus, viimane hinnapakkumine ja kliendi kiri.',
        src: ['Leping_tarnija.pdf · p 7.3', 'Pakkumine_1184.docx', 'e-kiri · 12.09'],
        stat: function (p) { return 'otsin ' + Math.round(p * 9860).toLocaleString('et-EE') + ' failist'; },
        labels: [],
        hits: [37, 118, 203],
        pos: function (i) { var c = i % 24, r = Math.floor(i / 24); return { x: c * 26 + Math.round((rnd(i) - 0.5) * 8), y: 8 + r * 32 + Math.round((rnd(i + 99) - 0.5) * 8), w: 13, h: 17, bg: ['#E4E7EC', '#8FA3C0', '#4E5D78'][Math.floor(rnd(i * 3) * 3)], d: 700 + (c / 24) * 1800 }; },
        done: function (i, hit) { return hit ? { s: 2.2, o: 1 } : { s: 1, o: 0.18 }; }, beam: 'v'
      },
      {
        q: 'Kui palju maksab sinu ettevõttele see, mida sa veel ei tea?',
        a: 'Näide: sama mure kordub eri kanalites — tellimuse kinnituskiri jõuab klientidel rämpsposti.',
        src: ['arvustus · „kinnitust ei tulnud“', 'e-kiri · „kas tellimus läks läbi?“', 'vestlus · „kirja pole siiani“'],
        stat: function (p) { return 'loen klienditagasisidet · ' + Math.round(p * 240) + ' / 240 kirjet'; },
        labels: ['arvustused', 'e-kirjad', 'vestlused'].map(function (t, g) { return { x: g * 214, y: 22, t: t }; }),
        hits: [12, 27, 45, 61, 73, 94, 108, 117, 139, 150, 171, 186, 202, 229],
        pos: function (i) { var g = Math.floor(i / 80), k = i % 80, c = k % 8, r = Math.floor(k / 8); return { x: g * 214 + c * 24, y: 48 + r * 26, w: 19, h: 12, r: 6, bg: ['#8FA3C0', '#C7CDD8', '#4E5D78'][g], d: 700 + (r / 10) * 1800 }; },
        done: function (i, hit) { return hit ? { s: 1.2, o: 1 } : { s: 1, o: 0.2 }; }, beam: 'h'
      }
    ];
    var cards = [];
    for (var i = 0; i < 240; i++) { var el = document.createElement('span'); el.className = 'rm-card'; stage.appendChild(el); cards.push(el); }
    var q = 0, t = 0, cyc = 0, hov = false, visible = true, phase = -1;

    function place(done) {
      var Qd = Q[q], j = 0, odd = cyc % 2 === 1;
      for (var i = 0; i < 240; i++) {
        var p = Qd.pos(i), hit = Qd.hits.indexOf(i) >= 0, x = p.x, y = p.y, s = 1, o = 1;
        if (done) { var d = Qd.done(i, hit, j); if (d.x !== undefined) { x = d.x; y = d.y; } s = d.s; o = d.o; }
        if (hit) j++;
        var st = cards[i].style;
        st.width = p.w + 'px'; st.height = p.h + 'px'; st.borderRadius = (p.r || 2) + 'px';
        st.transform = 'translate(' + x + 'px,' + y + 'px) scale(' + s + ')';
        st.backgroundColor = done && hit ? '#F5A524' : p.bg;
        st.opacity = o; st.zIndex = hit ? 3 : 1;
        if (!done) { st.animationName = odd ? 'rmfB' : 'rmfA'; st.animationDelay = Math.round(p.d) + 'ms'; }
      }
      Array.prototype.forEach.call(labelsEl.children, function (l) { l.style.opacity = done && Qd.hideLabelsDone ? '0' : '1'; });
    }
    function setQuestion(n) {
      q = n; t = 0; cyc++; phase = -1;
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
    function tick(force) {
      var Qd = Q[q];
      var ph = t >= DONE ? 2 : t >= WORK ? 1 : 0;
      if (ph !== phase || force) {
        if (phase === -1 || (ph === 0)) place(false);
        if (ph === 2) { place(true); aEl.classList.remove('fade-in'); void aEl.offsetWidth; aEl.classList.add('fade-in'); }
        doneEl.hidden = ph !== 2; statEl.hidden = ph === 2;
        phase = ph;
      }
      capEl.textContent = ph === 2 ? 'VASTUS · näidisstsenaarium' : ph === 0 ? 'KÜSIMUS ' + (q + 1) + ' / 4' : 'TÖÖTLEN…';
      if (ph < 2) statEl.textContent = Qd.stat(Math.min(1, Math.max(0, (t - WORK) / 2100)));
      var bar = tabs[q].querySelector('.bar'); bar.style.width = (Math.min(1, t / CYCLE) * 100).toFixed(1) + '%';
    }
    tabs.forEach(function (b, k) { b.addEventListener('click', function () { setQuestion(k); }); });
    root.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') hov = true; });
    root.addEventListener('pointerleave', function () { hov = false; });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(root);
    function fit() {
      var w = wrap.clientWidth, s = Math.min(1, w / 644);
      stage.style.transform = 'scale(' + s + ')';
      wrap.style.height = Math.round(320 * s) + 'px';
    }
    fit(); window.addEventListener('resize', fit);
    setQuestion(0);
    setInterval(function () {
      if (!visible || document.hidden) return;
      if (t < DONE) { t += 100; tick(); return; }
      if (hov) { tick(); return; }
      t += 100;
      if (t >= CYCLE) { setQuestion((q + 1) % 4); return; }
      tick();
    }, 100);
  })();

  /* ---------------- 01 hours ---------------- */
  (function hours() {
    var box = $('hours'); if (!box) return;
    var H = [
      { t: '08:10', kind: 'Tellimus', inDay: true },
      { t: '13:40', kind: 'Pakkumine', inDay: true },
      { t: '19:25', kind: 'Broneering', inDay: false },
      { t: '23:15', kind: 'Tellimus', inDay: false },
      { t: '03:40', kind: 'Broneering', inDay: false }
    ];
    var cur = 3, card = $('hour-card');
    box.innerHTML = H.map(function (h, i) { return '<button type="button" role="tab" data-h="' + i + '">' + h.t + '</button>'; }).join('');
    function show() {
      var h = H[cur];
      Array.prototype.forEach.call(box.children, function (b, i) { b.setAttribute('aria-selected', i === cur ? 'true' : 'false'); });
      $('hour-big').textContent = h.t; $('hour-kind').textContent = h.kind;
      $('hour-day').textContent = 'tööpäev ' + (h.inDay ? 'käib' : 'läbi');
      $('hour-dot').style.background = h.inDay ? '#4ADE80' : '#98A2B3';
      card.classList.remove('pop-in'); void card.offsetWidth; card.classList.add('pop-in');
    }
    box.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; cur = +b.getAttribute('data-h'); show(); });
    show();
  })();

  /* ---------------- 02 automate ---------------- */
  (function automate() {
    var btn = $('auto-btn'); if (!btn) return;
    var states = document.querySelectorAll('.task-state'), on = false;
    btn.addEventListener('click', function () {
      on = !on;
      btn.textContent = on ? 'Näita uuesti' : 'Automatiseeri';
      btn.className = on ? 'btn-undo' : 'btn-auto';
      Array.prototype.forEach.call(states, function (s, i) {
        s.style.transitionDelay = on ? (i * 0.12) + 's' : '0s';
        s.textContent = on ? '✓ automaatne' : 'käsitsi';
        s.classList.toggle('on', on);
      });
    });
  })();

  /* ---------------- 03 portal ---------------- */
  (function portal() {
    var btn = $('reorder'); if (!btn) return;
    var on = false;
    btn.addEventListener('click', function () {
      on = !on;
      $('ph-new').hidden = !on; $('biz-new').hidden = !on; $('biz-hint').hidden = on;
      btn.textContent = on ? 'Tellitud ✓ · alusta uuesti' : 'Telli uuesti';
      btn.className = on ? 'btn-reset' : 'btn-reorder';
    });
  })();

  /* ---------------- Intake ---------------- */
  (function intake() {
    var body = $('in-body'); if (!body) return;
    var NEEDS = [
      { id: 'toode', t: 'Uus digitoode' }, { id: 'ai', t: 'AI kasutamine' }, { id: 'auto', t: 'Automatiseerimine' },
      { id: 'sys', t: 'Süsteemide ühendamine' }, { id: 'web', t: 'Veebilahendus' }, { id: 'muu', t: 'Muu' }
    ];
    var B = {
      goal: { id: 'goal', type: 'text', q: 'Mis peaks muutuma, kui lahendus on olemas?', ph: 'Näiteks: kliendid saavad ise aja broneerida', field: 'Eesmärk' },
      users: { id: 'users', type: 'multi', q: 'Kes seda kasutama hakkaks?', opts: ['Meie kliendid', 'Meie töötajad', 'Partnerid', 'Pole veel kindel'], field: 'Kasutajad' },
      stage: { id: 'stage', type: 'single', q: 'Kui kaugel idee praegu on?', opts: ['Ainult mõte', 'Kirja pandud', 'Prototüüp olemas', 'Töötab, vajab edasiarendust'], field: 'Praegune olukord' },
      work: { id: 'work', type: 'multi', q: 'Millist tööd see praegu puudutab?', opts: ['Dokumendid ja pakkumised', 'Kliendipäringud', 'Andmete sisestamine', 'Aruandlus', 'Muu'], field: 'Praegune töö' },
      systems: { id: 'systems', type: 'text', q: 'Milliseid süsteeme või tööriistu te praegu kasutate?', ph: 'Näiteks: Excel, raamatupidamistarkvara, CRM', field: 'Olemasolevad süsteemid' },
      freq: { id: 'freq', type: 'single', q: 'Kui tihti seda tööd tehakse?', opts: ['Mitu korda päevas', 'Iga päev', 'Iga nädal', 'Harvem'], field: 'Sagedus' },
      time: { id: 'time', type: 'single', q: 'Kas sul on ajakava silmas?', opts: ['Mida varem, seda parem', 'Järgmise 3 kuu jooksul', 'Pole kiire', 'Ei tea veel'], field: 'Ajakava' },
      budget: { id: 'budget', type: 'single', q: 'Kas eelarve on juba paigas?', opts: ['Jah', 'Umbes teada', 'Veel mitte', 'Ei soovi praegu öelda'], field: 'Eelarve' }
    };
    var S;
    function init() { S = { phase: 'start', needs: [], desc: '', queue: [], qi: 0, answers: {}, skipped: {}, curText: '', curMulti: [], typing: false, edits: {}, name: '', email: '', phone: '', company: '', showInternal: false, sending: false, error: '' }; }
    init();
    var timer;
    var needLabels = function (ids) { return ids.map(function (id) { var n = NEEDS.filter(function (x) { return x.id === id; })[0]; return n ? n.t : id; }); };
    var fmt = function (v) { return Array.isArray(v) ? v.join(', ') : (v || ''); };
    var recap = function () { return [needLabels(S.needs).join(', '), (S.desc || '').trim()].filter(Boolean).join('\n'); };
    function buildQueue(needs) {
      var has = function (ids) { return ids.some(function (i) { return needs.indexOf(i) >= 0; }); };
      var mid = [];
      if (has(['toode', 'web', 'ai'])) mid.push('users');
      if (has(['toode', 'web'])) mid.push('stage');
      if (has(['ai', 'auto'])) mid.push('work');
      if (has(['sys', 'auto'])) mid.push('systems');
      if (has(['auto'])) mid.push('freq');
      return ['goal'].concat(mid.slice(0, 3), ['time', 'budget']);
    }
    function fields() { return [{ k: 'soov', label: 'Soov' }].concat(S.queue.map(function (id) { return { k: id, label: B[id].field }; })); }
    function later() { clearTimeout(timer); timer = setTimeout(function () { S.typing = false; render(); }, 700); }
    function next() {
      var nq = S.qi + 1;
      if (nq >= S.queue.length) { toSummary(); return; }
      S.qi = nq; S.curText = ''; S.curMulti = []; S.typing = true; render(); later();
    }
    function answer(v) { S.answers[S.queue[S.qi]] = v; next(); }
    function skip() { S.skipped[S.queue[S.qi]] = true; next(); }
    function toSummary() {
      clearTimeout(timer);
      S.edits = { soov: recap() };
      S.queue.forEach(function (id) { S.edits[id] = S.skipped[id] ? '' : fmt(S.answers[id]); });
      S.phase = 'summary'; S.typing = false; render();
    }
    var val = function (k) { return (S.edits[k] || '').trim(); };
    function send() {
      if (S.email.indexOf('@') < 1 || S.sending) return;
      S.sending = true; S.error = ''; render();
      var payload = {
        needs: needLabels(S.needs), fields: fields().map(function (f) { return { label: f.label, value: val(f.k) }; }),
        name: S.name.trim(), email: S.email.trim(), phone: S.phone.trim(), company: S.company.trim(), website: (document.getElementById('in-hp') || {}).value || ''
      };
      fetch('/api/paring', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok || !j.ok) throw new Error(j.error || 'send'); }); })
        .then(function () { S.sending = false; S.phase = 'sent'; render(); })
        .catch(function () { S.sending = false; S.error = 'Päringut ei õnnestunud saata. Proovi uuesti või kirjuta otse eva@secondsun.ee või helista +372 5664 1159.'; render(); });
    }

    var chip = function (t, on, act, cls) { return '<button type="button" class="chip' + (cls ? ' ' + cls : '') + '" aria-pressed="' + on + '" data-act="' + act + '">' + (on ? '✓ ' : '') + esc(t) + '</button>'; };
    function render() {
      var total = S.queue.length;
      var fill = S.phase === 'start' ? 0 : S.phase === 'q' ? (S.qi / (total + 1)) * 100 : S.phase === 'summary' ? 85 : S.phase === 'contact' ? 94 : 100;
      $('in-fill').style.width = fill.toFixed(1) + '%';
      $('in-right').textContent = S.phase === 'q' ? 'küsimus ' + (S.qi + 1) + ' / ' + total : S.phase === 'summary' ? 'kokkuvõte' : S.phase === 'contact' ? 'kontakt' : S.phase === 'sent' ? 'saadetud' : '';
      var h = '';
      if (S.phase === 'start') {
        var dis = !S.needs.length && !S.desc.trim();
        h = '<div class="in-scroll"><div class="in-pad" style="min-height:100%">' +
          '<div style="display:flex;flex-direction:column;gap:6px"><span class="in-title">Millega saame aidata?</span><span class="in-sub">Vali üks või mitu.</span></div>' +
          '<div class="chips" role="group" aria-label="Vajadused">' + NEEDS.map(function (n) { return chip(n.t, S.needs.indexOf(n.id) >= 0, 'need:' + n.id); }).join('') + '</div>' +
          '<div class="field" style="flex:1"><label for="in-desc">Kirjelda oma soovi oma sõnadega</label><textarea id="in-desc" data-in="desc" placeholder="Paar lauset piisab." style="flex:1;min-height:160px">' + esc(S.desc) + '</textarea></div>' +
          '</div></div>' +
          '<div class="in-foot plain"><small>Assistent esitab paar täpsustavat küsimust. Lahendused ja hinnad tulevad Second Sunilt.</small><button type="button" class="btn btn-gold" data-act="start" id="in-start"' + (dis ? ' disabled style="background:#F3E3BF"' : '') + '>Vastan →</button></div>';
      } else if (S.phase === 'q') {
        var cur = B[S.queue[S.qi]];
        var past = S.queue.slice(0, S.qi).map(function (id) {
          var q = B[id], a = fmt(S.answers[id]), sk = !!S.skipped[id] || !a;
          return '<div class="b-bot">' + esc(q.q) + '</div>' + (sk ? '<div class="b-skip">vahele jäetud</div>' : '<div class="b-me">' + esc(a) + '</div>');
        }).join('');
        var curH = '';
        if (S.typing) curH = '<div class="typing" aria-label="Assistent kirjutab"><i></i><i></i><i></i></div>';
        else {
          curH = '<div class="cur-wrap pop-in"><div class="b-cur">' + esc(cur.q) + '</div>';
          if (cur.type === 'single') curH += '<div class="chips" style="gap:8px">' + cur.opts.map(function (o, k) { return '<button type="button" class="chip sm" data-act="single:' + k + '">' + esc(o) + '</button>'; }).join('') + '</div>';
          if (cur.type === 'multi') curH += '<span class="in-sub" style="font-size:13px;margin-top:-6px">Vali üks või mitu.</span><div class="chips" style="gap:8px">' + cur.opts.map(function (o, k) { return chip(o, S.curMulti.indexOf(o) >= 0, 'multi:' + k, 'sm'); }).join('') + '</div><button type="button" class="btn btn-dark btn-sm" style="align-self:flex-start" data-act="multiNext">Edasi →</button>';
          if (cur.type === 'text') curH += '<label for="in-cur" class="sr-only">Vastus</label><textarea id="in-cur" data-in="curText" rows="3" placeholder="' + esc(cur.ph || '') + '">' + esc(S.curText) + '</textarea><button type="button" class="btn btn-dark btn-sm" style="align-self:flex-start" data-act="textNext">Edasi →</button>';
          curH += '</div>';
        }
        h = '<div class="in-scroll" id="in-chat"><div class="chat"><div class="b-me">' + esc(recap()) + '</div>' + past + curH + '</div></div>' +
          '<div class="in-foot"><button type="button" class="ghost" data-act="skip">Jäta vahele</button><button type="button" class="btn-out" data-act="finish">Lõpeta ja vaata kokkuvõtet</button></div>';
      } else if (S.phase === 'summary') {
        h = '<div class="in-scroll"><div class="in-pad pop-in" style="padding-bottom:8px;gap:18px"><div style="display:flex;flex-direction:column;gap:6px"><span class="in-title" style="font-size:28px">Päringu kokkuvõte</span><span class="in-sub">Kontrolli üle. Kõiki välju saab muuta.</span></div>' +
          fields().map(function (f) { return '<div class="sum-field"><label for="in-f-' + f.k + '">' + esc(f.label) + '</label><textarea id="in-f-' + f.k + '" data-in="edit:' + f.k + '" rows="2" placeholder="Pole täpsustatud">' + esc(S.edits[f.k] || '') + '</textarea></div>'; }).join('') +
          '</div></div><div class="in-foot"><button type="button" class="ghost" data-act="reset">Alusta uuesti</button><button type="button" class="btn btn-dark" style="min-height:52px;font-size:16px" data-act="toContact">Edasi →</button></div>';
      } else if (S.phase === 'contact') {
        var sd = S.email.indexOf('@') < 1 || S.sending;
        h = '<div class="in-scroll"><div class="in-pad pop-in" style="padding-bottom:8px;gap:18px"><div style="display:flex;flex-direction:column;gap:6px"><span class="in-title" style="font-size:28px">Kuhu vastata?</span><span class="in-sub">E-post on vajalik, ülejäänu soovi korral.</span></div>' +
          '<div class="field"><label for="in-name">Nimi</label><input id="in-name" type="text" autocomplete="name" data-in="name" value="' + esc(S.name) + '"></div>' +
          '<div class="field"><label for="in-mail">E-post *</label><input id="in-mail" type="email" autocomplete="email" data-in="email" value="' + esc(S.email) + '"></div>' +
          '<div class="two"><div class="field"><label for="in-tel">Telefon</label><input id="in-tel" type="tel" autocomplete="tel" data-in="phone" value="' + esc(S.phone) + '"></div><div class="field"><label for="in-org">Ettevõte</label><input id="in-org" type="text" autocomplete="organization" data-in="company" value="' + esc(S.company) + '"></div></div>' +
          '<div class="sr-only" aria-hidden="true"><label for="in-hp">Veebileht</label><input id="in-hp" type="text" tabindex="-1" autocomplete="off"></div>' +
          (S.error ? '<div class="err" role="alert">' + esc(S.error) + '</div>' : '') +
          '</div></div><div class="in-foot"><button type="button" class="ghost" data-act="toSummary">← Kokkuvõte</button><button type="button" class="btn btn-gold" style="min-height:52px;font-size:17px" data-act="send" id="in-send"' + (sd ? ' disabled style="min-height:52px;font-size:17px;background:#F3E3BF"' : '') + '>' + (S.sending ? 'Saadan…' : 'Saada päring') + '</button></div>';
      } else if (S.phase === 'sent') {
        var first = (S.name || '').trim().split(' ')[0];
        var fl = fields(), missing = fl.filter(function (f) { return !val(f.k); }).map(function (f) { return f.label; });
        h = '<div class="in-scroll"><div class="in-pad pop-in" style="padding-top:32px;padding-bottom:8px;gap:20px"><span class="sent-mark" aria-hidden="true">✓</span><span class="in-title" style="font-size:32px">Päring on saadetud' + esc(first ? '. Aitäh, ' + first + '!' : '.') + '</span><span class="in-sub" style="font-size:16px;color:#475467">Vastame sulle e-posti teel.</span>' +
          (S.showInternal ? '<div class="internal pop-in"><span>UUS PÄRING · STRUKTUREERITUD</span><div class="kv"><span>Suund</span><span>' + esc(needLabels(S.needs).join(', ') || '—') + '</span></div>' +
            fl.map(function (f) { return '<div class="kv"><span>' + esc(f.label) + '</span><span style="color:' + (val(f.k) ? '#FFFFFF' : '#7D8797') + '">' + esc(val(f.k) || 'puudub') + '</span></div>'; }).join('') +
            '<div class="kv sep"><span>Puuduv info</span><span style="color:#F5C46A">' + esc(missing.length ? missing.join(', ') : '—') + '</span></div><div class="kv"><span>Kontakt</span><span>' + esc([S.name, S.email, S.phone, S.company].map(function (x) { return x.trim(); }).filter(Boolean).join(' · ')) + '</span></div></div>'
            : '<button type="button" class="ghost mono" style="align-self:flex-start;padding:0;font-size:13px" data-act="internal">Näita, mis jõuab Second Sunile →</button>') +
          '</div></div><div class="in-foot" style="justify-content:flex-end"><button type="button" class="ghost" data-act="reset">Alusta uuesti</button></div>';
      }
      body.innerHTML = h;
      var chat = $('in-chat'); if (chat) chat.scrollTop = chat.scrollHeight;
    }
    body.addEventListener('click', function (e) {
      var b = e.target.closest('[data-act]'); if (!b || b.disabled) return;
      var a = b.getAttribute('data-act'), cur = S.queue[S.qi] ? B[S.queue[S.qi]] : null;
      if (a.indexOf('need:') === 0) { var id = a.slice(5), i = S.needs.indexOf(id); if (i >= 0) S.needs.splice(i, 1); else S.needs.push(id); render(); return; }
      if (a === 'start') { if (!S.needs.length && !S.desc.trim()) return; S.phase = 'q'; S.queue = buildQueue(S.needs); S.qi = 0; S.answers = {}; S.skipped = {}; S.curText = ''; S.curMulti = []; S.typing = true; render(); later(); return; }
      if (a.indexOf('single:') === 0) { answer(cur.opts[+a.slice(7)]); return; }
      if (a.indexOf('multi:') === 0) { var o = cur.opts[+a.slice(6)], k = S.curMulti.indexOf(o); if (k >= 0) S.curMulti.splice(k, 1); else S.curMulti.push(o); render(); return; }
      if (a === 'multiNext') { if (!S.curMulti.length) skip(); else answer(S.curMulti.slice()); return; }
      if (a === 'textNext') { var v = S.curText.trim(); if (!v) skip(); else answer(v); return; }
      if (a === 'skip') { skip(); return; }
      if (a === 'finish') { toSummary(); return; }
      if (a === 'toContact') { S.phase = 'contact'; render(); return; }
      if (a === 'toSummary') { S.phase = 'summary'; render(); return; }
      if (a === 'send') { send(); return; }
      if (a === 'internal') { S.showInternal = true; render(); return; }
      if (a === 'reset') { clearTimeout(timer); init(); render(); }
    });
    body.addEventListener('input', function (e) {
      var k = e.target.getAttribute('data-in'); if (!k) return;
      if (k.indexOf('edit:') === 0) S.edits[k.slice(5)] = e.target.value; else S[k] = e.target.value;
      if (k === 'desc') { var s = $('in-start'); var dis = !S.needs.length && !S.desc.trim(); s.disabled = dis; s.style.background = dis ? '#F3E3BF' : ''; }
      if (k === 'email') { var b = $('in-send'); var d = S.email.indexOf('@') < 1; b.disabled = d; b.style.background = d ? '#F3E3BF' : ''; }
    });
    render();
  })();
})();
