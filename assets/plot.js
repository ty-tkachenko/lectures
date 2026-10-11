/* Avionics Notes: small canvas toolkit shared by the interactive widgets.
   Colours come from the CSS tokens, so charts follow the light/dark theme automatically.

   Usage:
     const w = Plot.widget(canvas, draw)          // draw(ctx, W, H) runs on resize/theme change; w.redraw()
     Plot.animate(canvas, (ctx, W, H, t, dt) => …) // runs only while visible; respects reduced motion
     Plot.axes(ctx, box, X, Y, {xt, yt, xl, yl, xf, yf}) */
(function(){
'use strict';
const col = {};
const NAMES = ['bg','panel','sunk','raise','ink','ink2','muted','line','line2','accent','flame','good','bad','warn','violet','c1','c2','c3','c4','c5','c6','accent-soft','flame-soft'];
function readCols(){
  const cs = getComputedStyle(document.documentElement);
  for (const k of NAMES) col[k.replace('-soft','Soft')] = cs.getPropertyValue('--' + k).trim();
}
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const FONT = '12px Inter, system-ui, -apple-system, "Segoe UI", sans-serif';
const MONO = '11.5px "JetBrains Mono", ui-monospace, Consolas, monospace';

function fit(cv){
  const dpr = window.devicePixelRatio || 1, w = cv.clientWidth, h = cv.clientHeight;
  if (cv.width !== Math.round(w*dpr) || cv.height !== Math.round(h*dpr)){ cv.width = Math.round(w*dpr); cv.height = Math.round(h*dpr); }
  const ctx = cv.getContext('2d'); ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,w,h);
  return [ctx, w, h];
}
const statics = [];
function widget(cv, draw){
  const f = () => { const [ctx,w,h] = fit(cv); draw(ctx,w,h); };
  statics.push(f);
  return {redraw: f};
}
const anims = [];
function animate(cv, draw){
  const a = {cv, draw, vis:false, t:0};
  anims.push(a);
  new IntersectionObserver(e => { a.vis = e[0].isIntersecting; }).observe(cv);
  return a;
}
let last = 0;
function loop(ts){
  const dt = Math.min(0.05, (ts - last) / 1000 || 0); last = ts;
  for (const a of anims){
    if (!a.vis) continue;
    if (!reduced) a.t += dt;
    const [ctx,w,h] = fit(a.cv); a.draw(ctx,w,h,a.t,reduced ? 0 : dt);
  }
  requestAnimationFrame(loop);
}
function redrawAll(){ readCols(); statics.forEach(f => f()); }

/* scales */
function lin(d0,d1,r0,r1){ const f = v => r0 + (v-d0)/(d1-d0)*(r1-r0); f.inv = p => d0 + (p-r0)/(r1-r0)*(d1-d0); return f; }
function log(d0,d1,r0,r1){ const a = Math.log10(d0), b = Math.log10(d1); const f = v => r0 + (Math.log10(v)-a)/(b-a)*(r1-r0); f.inv = p => Math.pow(10, a + (p-r0)/(r1-r0)*(b-a)); return f; }
function niceStep(r){ const p = Math.pow(10, Math.floor(Math.log10(r))), m = r/p; return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * p; }
function ticks(a,b,n=5){ const s = niceStep((b-a)/n), t = []; for (let v = Math.ceil(a/s - 1e-9)*s; v <= b + 1e-9; v += s) t.push(+v.toFixed(10)); return t; }
function logTicks(a,b){ const t = []; for (let e = Math.floor(Math.log10(a)); e <= Math.ceil(Math.log10(b)); e++){ const v = Math.pow(10,e); if (v >= a*0.999 && v <= b*1.001) t.push(v); } return t; }

/* drawing */
function axes(ctx, P, X, Y, o){
  ctx.save(); ctx.font = FONT; ctx.lineWidth = 1;
  ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
  for (const t of o.yt || []){
    const y = Math.round(Y(t)) + .5;
    ctx.strokeStyle = col.line; ctx.beginPath(); ctx.moveTo(P.l, y); ctx.lineTo(P.r, y); ctx.stroke();
    ctx.fillStyle = col.muted; ctx.fillText(o.yf ? o.yf(t) : t, P.l - 7, y);
  }
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  for (const t of o.xt || []){
    const x = Math.round(X(t)) + .5;
    if (o.xgrid){ ctx.strokeStyle = col.line; ctx.beginPath(); ctx.moveTo(x, P.t); ctx.lineTo(x, P.b); ctx.stroke(); }
    ctx.fillStyle = col.muted; ctx.fillText(o.xf ? o.xf(t) : t, x, P.b + 7);
  }
  ctx.strokeStyle = col.line2; ctx.beginPath(); ctx.moveTo(P.l, Math.round(P.b)+.5); ctx.lineTo(P.r, Math.round(P.b)+.5); ctx.stroke();
  ctx.fillStyle = col.ink2;
  if (o.xl){ ctx.textAlign = 'center'; ctx.fillText(o.xl, (P.l+P.r)/2, P.b + 24); }
  if (o.yl){ ctx.save(); ctx.translate(13, (P.t+P.b)/2); ctx.rotate(-Math.PI/2); ctx.textBaseline = 'middle'; ctx.textAlign = 'center'; ctx.fillText(o.yl, 0, 0); ctx.restore(); }
  ctx.restore();
}
function clip(ctx, P){ ctx.save(); ctx.beginPath(); ctx.rect(P.l, P.t, P.r-P.l, P.b-P.t); ctx.clip(); }
function line(ctx, pts, color, w=2, dash=[]){
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = w; ctx.setLineDash(dash); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.beginPath(); pts.forEach(([x,y], i) => i ? ctx.lineTo(x,y) : ctx.moveTo(x,y)); ctx.stroke(); ctx.restore();
}
function text(ctx, s, x, y, o={}){
  ctx.save(); ctx.font = (o.bold ? '600 ' : '') + (o.mono ? MONO : FONT);
  ctx.fillStyle = o.color || col.ink; ctx.textAlign = o.align || 'left'; ctx.textBaseline = o.base || 'middle';
  ctx.fillText(s, x, y); ctx.restore();
}
function dot(ctx, x, y, r, color){ ctx.save(); ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x,y,r,0,2*Math.PI); ctx.fill(); ctx.restore(); }
function rrect(ctx, x, y, w, h, r){ ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x,y,w,h,r) : ctx.rect(x,y,w,h); }
function rgba(hex, a){
  if (!hex || hex[0] !== '#') return hex;
  const n = parseInt(hex.slice(1), 16); return `rgba(${n>>16},${(n>>8)&255},${n&255},${a})`;
}

function hex2(n){ return Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2,'0'); }
function mix(a, b, f){
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const c = k => ((pa>>k)&255)*(1-f) + ((pb>>k)&255)*f;
  return '#' + hex2(c(16)) + hex2(c(8)) + hex2(c(0));
}
function isDark(){ const t = document.documentElement.dataset.theme; return t ? t === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches; }

/* number formatting */
function si(v, unit, digits=3){
  const a = Math.abs(v);
  if (a === 0) return '0 ' + unit;
  if (!isFinite(v)) return (v > 0 ? '∞' : '−∞') + ' ' + unit;
  const P = [[1e9,'G'],[1e6,'M'],[1e3,'k'],[1,''],[1e-3,'m'],[1e-6,'µ'],[1e-9,'n'],[1e-12,'p']];
  for (const [m,p] of P) if (a >= m*0.9995) return fmt(v/m, digits) + ' ' + p + unit;
  return v.toExponential(2) + ' ' + unit;
}
function fmt(v, digits=3){
  const s = Number(v).toPrecision(digits);
  return (s.includes('e') ? String(Number(s)) : s.includes('.') ? s.replace(/\.?0+$/, '') : s).replace('-', '−');
}

/* small UI helpers for widget controls */
function seg(el, cb){
  if (typeof el === 'string') el = document.querySelector(el);
  el.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    el.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
    cb && cb(b.dataset.v);
  });
  return () => (el.querySelector('button.on') || el.querySelector('button')).dataset.v;
}
function verdict(el, cls, html){ if (typeof el === 'string') el = document.querySelector(el); el.className = 'verdict ' + cls; el.innerHTML = html; }

const dB = x => 10*Math.log10(x), undB = d => Math.pow(10, d/10);

window.Plot = {col, readCols, fit, widget, animate, redrawAll, lin, log, ticks, logTicks, axes, clip, line, text, dot, rrect, rgba, mix, isDark, si, fmt, dB, undB, seg, verdict, reduced, FONT, MONO};

readCols();
window.addEventListener('themechange', redrawAll);
let rz; window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(redrawAll, 80); });
document.addEventListener('DOMContentLoaded', () => { redrawAll(); requestAnimationFrame(loop); });
if (document.fonts) document.fonts.ready.then(redrawAll);
})();
