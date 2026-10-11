/* Hardware Engineering Fundamentals: site engine.
   Loaded in <head> (not deferred) so the theme applies before first paint.
   Builds the header, module sidebar, resource strip, videos, design-exercise answer checks and the
   prev/next pager from course.js.

   Page contract (module pages):
     <html data-root="../../" data-module="ee01">
     <div class="layout"><aside class="side"></aside><main class="content"> … <nav class="pager"></nav></main></div>
     sections:   <section class="sec" id="…"><h2>Title</h2> …
     see README.md "Writing a module" for videos, exercises and widgets. */
(function(){
'use strict';
const doc = document.documentElement;
const ROOT = doc.dataset.root || './';
const MOD_ID = doc.dataset.module || null;

/* ---------- catalog helpers ---------- */
const C = window.COURSE || {tracks:[], videos:{}};
function findModule(id){
  for (const t of C.tracks){ const i = t.modules.findIndex(m => m.id === id); if (i >= 0) return {track:t, mod:t.modules[i], idx:i}; }
  return null;
}
function videoFor(id, kind){ const v = (C.videos || {})[id]; return v && v[kind] ? v[kind] : ''; }

/* ---------- icons ---------- */
const I = {
  mark:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2c3 2.5 4.5 6 4.5 10.5L14 17h-4l-2.5-4.5C7.5 8 9 4.5 12 2z"/><path d="M10 17l-1.5 4M14 17l1.5 4"/><circle cx="12" cy="10" r="1.6"/></svg>',
  play:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5z"/></svg>',
  lab:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3h6M10 3v6L4.5 19a1.5 1.5 0 0 0 1.3 2h12.4a1.5 1.5 0 0 0 1.3-2L14 9V3"/><path d="M7 15h10"/></svg>',
  target:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r=".8" fill="currentColor"/></svg>',
  sheet:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/></svg>',
  read:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5.5C5.5 4 9 4 12 6c3-2 6.5-2 9-.5V19c-2.5-1.5-6-1.5-9 .5-3-2-6.5-2-9-.5z"/><path d="M12 6v13.5"/></svg>',
  slider:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/></svg>'
};
window.SiteIcons = I;

/* ---------- header: plain title, nav line, and the current track's module strip ---------- */
function buildHeader(){
  const h = document.createElement('header');
  h.className = 'top';
  const here = MOD_ID && findModule(MOD_ID);
  const nav = [`<a href="${ROOT}index.html"${here ? '' : ' class="current"'}>Home</a>`]
    .concat(C.tracks.map(t => `<a href="${ROOT}index.html#${t.id}"${here && here.track === t ? ' class="current"' : ''}>${t.title}</a>`))
    .join(' · ');
  let strip = '';
  if (here){
    strip = `<nav class="module-strip" aria-label="${here.track.title} modules">` + here.track.modules.map(m => {
      const cls = m.id === MOD_ID ? 'current' : (m.status !== 'ready' ? 'soon' : '');
      const tip = m.title + (m.status !== 'ready' ? ' (coming soon)' : '');
      return `<a class="${cls}" href="${ROOT}${m.path}index.html" title="${tip}"${m.id === MOD_ID ? ' aria-current="page"' : ''}>${m.n}</a>`;
    }).join('') + '</nav>';
  }
  h.innerHTML = `<div class="site-title"><a href="${ROOT}index.html">${C.site || 'Hardware Engineering Fundamentals'}</a></div>` +
    `<p class="nav">${nav}</p>${strip}<hr>`;
  document.body.prepend(h);
  const f = document.querySelector('footer.site');
  if (f && !f.previousElementSibling?.matches('hr')) f.insertAdjacentHTML('beforebegin', '<hr class="foot">');
}

/* ---------- videos ---------- */
function parseT(s){ if (!s) return 0; return String(s).split(':').map(Number).reduce((a,v) => a*60 + v, 0); }
function ytId(url){ const m = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/); return m ? m[1] : null; }
const players = {};
function buildVideo(el){
  const kind = el.dataset.video;              // 'lecture' | 'lab'
  const url = MOD_ID ? videoFor(MOD_ID, kind) : '';
  const title = el.dataset.title || (kind === 'lab' ? 'Lab demo' : 'Lecture video');
  const plan = el.querySelector('.plan');
  el.classList.add(kind);
  const chapters = plan ? [...plan.querySelectorAll('li[data-t]')] : [];
  if (!url){
    el.innerHTML = `<div class="placeholder"><div class="vh"><span class="vi">${kind === 'lab' ? I.lab : I.play}</span><b>${title}</b><span class="soon">Coming soon</span></div>${plan ? `<div class="plan">${plan.innerHTML}</div>` : ''}</div>`;
    el.querySelectorAll('li[data-t]').forEach(li => li.insertAdjacentHTML('afterbegin', `<span class="ts">${li.dataset.t}</span>`));
    return;
  }
  const frame = document.createElement('div'); frame.className = 'frame';
  const id = ytId(url);
  let seek;
  if (id){
    const src = s => `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1${s ? `&start=${s}&autoplay=1` : ''}`;
    frame.innerHTML = `<iframe src="${src(0)}" title="${title}" allow="accelerometer; autoplay; encrypted-media; picture-in-picture" allowfullscreen loading="lazy"></iframe>`;
    seek = s => { frame.querySelector('iframe').src = src(s); };
  } else {
    frame.innerHTML = `<video controls preload="metadata" src="${url}"></video>`;
    seek = s => { const v = frame.querySelector('video'); v.currentTime = s; v.play(); };
  }
  players[kind] = seek;
  const wrap = document.createElement('div');
  wrap.appendChild(frame);
  if (chapters.length){
    const ol = document.createElement('ol');
    ol.className = 'chapters';
    chapters.forEach(li => {
      const t = li.dataset.t;
      const item = document.createElement('li');
      item.innerHTML = `<a href="#"><span class="ts">${t}</span>${li.textContent}</a>`;
      item.querySelector('a').onclick = e => { e.preventDefault(); seek(parseT(t)); };
      ol.appendChild(item);
    });
    wrap.appendChild(ol);
  }
  el.innerHTML = ''; el.appendChild(wrap);
  if (kind === 'lecture') document.body.classList.add('has-lecture');
}
function wireJumps(){
  document.querySelectorAll('.vjump').forEach(a => {
    const t = a.dataset.t;
    a.textContent = `[video ${t}]`;
    a.title = 'Watch this part of the lecture video';
    a.href = '#lecture';
    a.addEventListener('click', e => {
      if (!players.lecture) return;
      e.preventDefault();
      document.getElementById('lecture').scrollIntoView({behavior:'smooth', block:'center'});
      players.lecture(parseT(t));
    });
  });
}

/* ---------- answer checks (used inside design exercises) ----------
   <div class="check" data-ans="2.46" data-tol="2%" data-unit="A">
     <p>Question</p>
     <div class="miss" data-val="1.23">Feedback for a common wrong answer</div>
     <div class="hint">…</div>  <div class="solution">…</div>
   </div>                                                                     */
function parseNum(s){
  s = String(s).trim().replace(/\s+/g,'').replace(/[−–]/g,'-').replace(/×10\^?/,'e');
  const m = s.match(/^([-+]?\d*\.?\d+(?:e[-+]?\d+)?)([pnuµmkMG]?)/);
  if (!m) return NaN;
  return parseFloat(m[1]) * {p:1e-12,n:1e-9,u:1e-6,'µ':1e-6,m:1e-3,'':1,k:1e3,M:1e6,G:1e9}[m[2]];
}
function within(v, ans, tol){
  tol = String(tol || '3%');
  if (tol.endsWith('%')) return Math.abs(v - ans) <= Math.abs(ans) * parseFloat(tol) / 100 + 1e-12;
  return Math.abs(v - ans) <= parseFloat(tol);
}
function buildCheck(el){
  const ans = parseFloat(el.dataset.ans), tol = el.dataset.tol, unit = el.dataset.unit || '';
  const misses = [...el.querySelectorAll(':scope > .miss')];
  const hint = el.querySelector(':scope > .hint');
  const sol = el.querySelector(':scope > .solution');
  const row = document.createElement('div'); row.className = 'numrow';
  row.innerHTML = `<input type="text" inputmode="decimal" autocomplete="off" aria-label="Your answer${unit ? ' in ' + unit : ''}" placeholder="your answer">${unit ? `<span class="unit">${unit}</span>` : ''}<button type="button">Check</button>`;
  const inp = row.querySelector('input');
  const fbEl = document.createElement('div'); fbEl.className = 'fb'; fbEl.hidden = true; fbEl.setAttribute('aria-live','polite');
  const say = (cls, html) => { fbEl.hidden = false; fbEl.className = 'fb ' + cls; fbEl.innerHTML = html; };
  let solDet = null;
  const check = () => {
    const v = parseNum(inp.value);
    if (!isFinite(v)){ say('', '<p>Enter a number. Prefixes like <code>4.7k</code> or <code>2.5m</code> work too.</p>'); return; }
    if (within(v, ans, tol)){
      say('ok', `<strong>✓ That’s it.</strong>${sol ? sol.innerHTML : ''}`);
      el.classList.add('solved'); if (solDet) solDet.hidden = true; return;
    }
    for (const m of misses){
      if (within(v, parseFloat(m.dataset.val), m.dataset.tol || tol)){ say('bad', m.innerHTML); return; }
    }
    say('bad', `<p>That’s too ${v > ans ? 'high' : 'low'}.${hint ? ` <b>Hint:</b> ${hint.innerHTML}` : ''}</p>`);
  };
  row.querySelector('button').onclick = check;
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') check(); });
  const p = el.querySelector(':scope > p');
  (p || el.firstElementChild).after(row);
  row.after(fbEl);
  if (sol){
    solDet = document.createElement('details'); solDet.className = 'sol';
    solDet.innerHTML = `<summary>Show the worked solution</summary>${sol.innerHTML}`;
    el.appendChild(solDet);
  }
}

/* ---------- concept questions (multiple choice, used in design exercises) ----------
   <div class="choice">
     <p>Question</p>
     <ol class="opts">
       <li>Option<div class="why">Why it's wrong</div></li>
       <li data-correct>Option<div class="why">Why it's right</div></li>
     </ol>
     <div class="solution"><p>Full explanation, shown once answered</p></div>
   </div>                                                                     */
function buildChoice(el){
  const list = el.querySelector(':scope > ol.opts');
  if (!list) return;
  const opts = [...list.children];
  const sol = el.querySelector(':scope > .solution');
  const fb = document.createElement('div'); fb.className = 'fb'; fb.hidden = true; fb.setAttribute('aria-live', 'polite');
  list.after(fb);
  let solDet = null;
  opts.forEach(li => {
    const why = li.querySelector(':scope > .why');
    const whyHTML = why ? why.innerHTML : '';
    if (why) why.remove();
    const ok = li.hasAttribute('data-correct');
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'opt'; b.innerHTML = li.innerHTML;
    li.innerHTML = ''; li.appendChild(b);
    b.onclick = () => {
      b.classList.add(ok ? 'ok' : 'bad');
      fb.hidden = false; fb.className = 'fb ' + (ok ? 'ok' : 'bad');
      fb.innerHTML = ok ? `<strong>✓ That’s it.</strong>${whyHTML ? `<p>${whyHTML}</p>` : ''}${sol ? sol.innerHTML : ''}`
                        : `<p><b>Not quite.</b> ${whyHTML}</p>`;
      if (ok){ el.classList.add('solved'); if (solDet) solDet.hidden = true; }
    };
  });
  if (sol){
    solDet = document.createElement('details'); solDet.className = 'sol';
    solDet.innerHTML = `<summary>Show the explanation</summary>${sol.innerHTML}`;
    el.appendChild(solDet);
  }
}

/* ---------- sidebar, resource strip, pager ---------- */
function buildSide(){
  const side = document.querySelector('aside.side');
  if (!side) return;
  const secs = [...document.querySelectorAll('section.sec[id]')];
  let n = 0;
  const items = secs.map(s => {
    const h = s.querySelector('h2');
    const num = s.hasAttribute('data-nonum') ? '' : ++n;
    if (num !== '' && h && !h.querySelector('.num')) h.insertAdjacentHTML('afterbegin', `<span class="num">${num}</span>`);
    const label = s.dataset.short || (h ? h.textContent.replace(/^\d+/, '').trim() : s.id);
    return {s, num, label};
  });
  const here = MOD_ID && findModule(MOD_ID);
  // small previous/next arrows beside the module label
  const step = (m, dir) => {
    const lbl = (dir < 0 ? 'Previous' : 'Next') + ' module: ' + m.title + (m.status !== 'ready' ? ' (coming soon)' : '');
    return `<a href="${ROOT}${m.path}index.html" title="${lbl}" aria-label="${lbl}">${dir < 0 ? '←' : '→'}</a>`;
  };
  const arrows = here ? `<span class="side-step">` +
    (here.idx > 0 ? step(here.track.modules[here.idx - 1], -1) : '<span aria-hidden="true">←</span>') +
    (here.idx < here.track.modules.length - 1 ? step(here.track.modules[here.idx + 1], 1) : '<span aria-hidden="true">→</span>') +
    `</span>` : '';
  side.innerHTML = (here ? `<div class="side-mod"><span class="side-row"><span class="eyebrow">${here.track.short} · Module ${here.mod.n}</span>${arrows}</span><b>${here.mod.title}</b></div>` : '') +
    `<h4>On this page</h4><ol class="toc">${items.map(it => `<li><a href="#${it.s.id}"><span class="tn">${it.num === '' ? '' : it.num}</span><span>${it.label}</span></a></li>`).join('')}</ol>`;
  const links = [...side.querySelectorAll('.toc a')];
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      links.forEach((a, k) => a.classList.toggle('active', items[k].s === e.target));
    });
  }, {rootMargin:'-20% 0px -70% 0px'});
  secs.forEach(s => io.observe(s));
}
function buildResources(){
  const el = document.querySelector('.resources[data-auto]');
  if (!el || !MOD_ID) return;
  // One plain sentence: what this module comes with.
  const lec = videoFor(MOD_ID,'lecture'), lab = videoFor(MOD_ID,'lab');
  const nW = [...document.querySelectorAll('.widget')].filter(w => w.querySelector('input, button, select')).length;
  const nC = document.querySelectorAll('.chal, details.exercise').length;
  el.innerHTML = `This module has ${nW} interactive figure${nW === 1 ? '' : 's'}, ` +
    `a <a href="#lecture">lecture video</a>${lec ? '' : ' (coming soon)'}, ` +
    `a <a href="#bench">lab demonstration</a>${lab ? '' : ' (coming soon)'}, ` +
    `and <a href="#exercises">${nC} design exercise${nC === 1 ? '' : 's'}</a>.`;
}
function buildPager(){
  const el = document.querySelector('nav.pager');
  const here = MOD_ID && findModule(MOD_ID);
  if (!el || !here) return;
  const mods = here.track.modules, prev = mods[here.idx - 1], next = mods[here.idx + 1];
  const link = (m, cls, lbl) => `<a class="${cls} ${m.status !== 'ready' ? 'planned' : ''}" href="${ROOT}${m.path}index.html"><small>${lbl}${m.status !== 'ready' ? ' · coming soon' : ''}</small>${m.title}</a>`;
  el.setAttribute('aria-label','Module navigation');
  el.innerHTML = (prev ? link(prev, 'prev', '← Previous') : '') + (next ? link(next, 'next', 'Next →') : '');
}

/* ---------- landing page ---------- */
window.renderHome = function(el){
  el.innerHTML = C.tracks.map(t => {
    const rows = t.modules.map(m => {
      const ready = m.status === 'ready';
      return `<li><a class="${ready ? 'ready' : 'planned'}" href="${m.path}index.html"><span class="mn">${m.n}</span><span class="mt">${m.title}</span>${ready ? '' : '<span class="ms">in preparation</span>'}<span class="mb">${m.blurb}</span></a></li>`;
    }).join('');
    return `<section class="track" id="${t.id}"><h2>${t.title}</h2><p>${t.blurb}</p><ul class="mods">${rows}</ul></section>`;
  }).join('');
};

/* ---------- start each newly opened page at the top ----------
   Some hosts (the claude.ai preview, for one) carry the previous page's scroll position over when a link opens
   the next module. On a fresh navigation without a #section, scroll to the top, and keep doing so for a moment in
   case the host restores its position late, unless the reader has started scrolling. Reloads and back/forward
   keep their usual position. */
function startAtTop(){
  const nav = performance.getEntriesByType ? performance.getEntriesByType('navigation')[0] : null;
  if (location.hash || (nav && nav.type !== 'navigate')) return;
  let stop = false;
  const quit = () => { stop = true; };
  ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach(ev => window.addEventListener(ev, quit, {once: true, passive: true}));
  const top = () => { if (!stop) window.scrollTo(0, 0); };
  top();
  [50, 150, 400, 800].forEach(t => setTimeout(top, t));
}

/* ---------- boot ---------- */
document.addEventListener('DOMContentLoaded', () => {
  if (window.renderMathInElement){
    renderMathInElement(document.body, {delimiters:[{left:'$$',right:'$$',display:true},{left:'\\(',right:'\\)',display:false}], throwOnError:false});
  }
  buildHeader();
  document.querySelectorAll('[data-video]').forEach(buildVideo);
  wireJumps();
  document.querySelectorAll('.check').forEach(buildCheck);
  document.querySelectorAll('.choice').forEach(buildChoice);
  buildSide();
  buildResources();
  buildPager();
  startAtTop();
  // "Go deeper" links into the advanced theory pages: <a data-deep="matching_theory.html#refl">
  document.querySelectorAll('a[data-deep]').forEach(a => { a.href = ROOT + (C.deepBase || '') + a.dataset.deep; });
});
})();
