/* EE widgets drawn to the RF demo anatomy: h3, legend, .row sliders,
   preset buttons, .readout tiles, a 760px canvas, a color key, a verdict,
   and a .try callout. Math matches the lecture pages. */
(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (typeof document !== "undefined" && document.body) api.mount(document);
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  var E12 = [1, 1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 3.9, 4.7, 5.6, 6.8, 8.2];
  var E24 = [1, 1.1, 1.2, 1.3, 1.5, 1.6, 1.8, 2, 2.2, 2.4, 2.7, 3, 3.3, 3.6, 3.9, 4.3, 4.7, 5.1, 5.6, 6.2, 6.8, 7.5, 8.2, 9.1];

  function finite(n) { return typeof n === "number" && isFinite(n); }
  function sig(n, d) {
    if (!finite(n)) return "—";
    var p = Number(n.toPrecision(d));
    return String(p);
  }
  function fixed(n, d) { return finite(n) ? n.toFixed(d) : "—"; }
  function fmtOhms(r) {
    if (!(r > 0) || !finite(r)) return "—";
    if (r >= 1e6) return sig(r / 1e6, 3) + " MΩ";
    if (r >= 1e3) return sig(r / 1e3, 3) + " kΩ";
    return sig(r, 3) + " Ω";
  }
  function logPos(x, min, max) {
    return 1000 * Math.log(x / min) / Math.log(max / min);
  }
  function logVal(pos, min, max) {
    return min * Math.pow(max / min, pos / 1000);
  }

  function ldoCalc(vin, vout, iout, iq) {
    var pd = (vin - vout) * iout + vin * iq;
    var pin = vin * (iout + iq);
    var pout = vout * iout;
    return { pd: pd, pin: pin, pout: pout, eta: pin > 0 ? pout / pin : NaN };
  }
  function junction(pd, theta, ta) { return ta + pd * theta; }
  function buckCcm(vin, vout, iout, L, fsw) {
    var D = vout / vin;
    var dIL = (vin - vout) * D / (L * fsw);
    var valley = iout - dIL / 2;
    return { D: D, dIL: dIL, peak: iout + dIL / 2, valley: valley, ccm: valley >= -1e-6 };
  }
  function buckDcm(vin, vout, iout, L, fsw) {
    if (!(iout > 0)) return { Don: 0, Doff: 0, peak: 0 };
    var ton = Math.sqrt((2 * L * iout * vout) / (fsw * vin * (vin - vout)));
    var toff = ton * (vin - vout) / vout;
    return { Don: ton * fsw, Doff: toff * fsw, peak: (vin - vout) * ton / L };
  }
  function ripple(dIL, fsw, cout, esr) {
    var dVc = dIL / (8 * fsw * cout);
    var dVr = dIL * esr;
    return { dV: dVc + dVr, dVc: dVc, dVr: dVr };
  }
  function buckPower(vout, iout, eta) {
    var pout = vout * iout;
    var pin = eta > 0 ? pout / eta : NaN;
    return { pout: pout, pin: pin, pdiss: pin - pout };
  }
  function parallelPair(a, b) {
    if (!(a > 0) || !(b > 0)) return NaN;
    return (a * b) / (a + b);
  }
  function dividerLoaded(vin, r1, r2, rl) {
    var unloaded = (r1 + r2) > 0 ? vin * r2 / (r1 + r2) : NaN;
    if (!(rl > 0) || !finite(rl)) return { unloaded: unloaded, loaded: unloaded, sag: 0, rpar: r2 };
    var rpar = parallelPair(r2, rl);
    var loaded = (r1 + rpar) > 0 ? vin * rpar / (r1 + rpar) : NaN;
    return { unloaded: unloaded, loaded: loaded, sag: unloaded - loaded, rpar: rpar };
  }
  function preferredResistor(rIdeal, series) {
    if (!(rIdeal > 0) || !finite(rIdeal)) return { nearest: NaN, nextUp: NaN };
    var exp = Math.floor(Math.log10(rIdeal));
    var candidates = [];
    var e, i, c, d, best, nearest, nextUp;
    for (e = exp - 2; e <= exp + 2; e++) {
      for (i = 0; i < series.length; i++) candidates.push(Number((series[i] * Math.pow(10, e)).toPrecision(8)));
    }
    nearest = candidates[0];
    best = Infinity;
    for (i = 0; i < candidates.length; i++) {
      c = candidates[i];
      d = Math.abs(Math.log(c / rIdeal));
      if (d < best - 1e-9 || (Math.abs(d - best) <= 1e-9 && c > nearest)) { best = d; nearest = c; }
    }
    nextUp = NaN;
    for (i = 0; i < candidates.length; i++) {
      c = candidates[i];
      if (c + rIdeal * 1e-9 >= rIdeal && (!(nextUp > 0) || c < nextUp)) nextUp = c;
    }
    return { nearest: nearest, nextUp: nextUp };
  }
  function ledLimit(vs, vf, iTarget) {
    if (!(iTarget > 0) || !(vs > vf)) return { r: NaN, p: NaN };
    var r = (vs - vf) / iTarget;
    return { r: r, p: (vs - vf) * iTarget };
  }
  function twoNode(vin, r1, r2, r3, r4) {
    if (!(r1 > 0 && r2 > 0 && r3 > 0 && r4 > 0)) return { error: "Every resistor has to be greater than 0." };
    var g1 = 1 / r1, g2 = 1 / r2, g3 = 1 / r3, g4 = 1 / r4;
    var coeff = g1 + g2 + g3 - (g2 * g2) / (g2 + g4);
    if (!(coeff > 0)) return { error: "The node equations did not have a solution." };
    var va = (g1 * vin) / coeff;
    var vb = (g2 * va) / (g2 + g4);
    return {
      error: "", va: va, vb: vb,
      i1: (vin - va) / r1, i2: (va - vb) / r2, i3: va / r3, i4: vb / r4
    };
  }
  function rcSquare(vHigh, vLow, freq, tau) {
    if (!(freq > 0) || !(tau > 0)) return { error: "bad" };
    var half = 1 / (2 * freq);
    var a = Math.exp(-half / tau);
    var vl, vh;
    if (a > 0.999999) { vl = vh = (vHigh + vLow) / 2; }
    else {
      vl = (vLow * (1 - a) + vHigh * a * (1 - a)) / (1 - a * a);
      vh = vHigh + (vl - vHigh) * a;
    }
    return { half: half, vStart: vl, vPeak: vh };
  }
  function rcSample(state, t, vHigh, vLow, tau) {
    var period = state.half * 2;
    var phase = t - Math.floor(t / period) * period;
    if (phase < state.half) return vHigh + (state.vStart - vHigh) * Math.exp(-phase / tau);
    return vLow + (state.vPeak - vLow) * Math.exp(-(phase - state.half) / tau);
  }
  function fcRc(r, c) { return (r > 0 && c > 0) ? 1 / (2 * Math.PI * r * c) : NaN; }
  function lpMag(freq, fc) { var x = freq / fc; return 1 / Math.sqrt(1 + x * x); }
  function hpMag(freq, fc) { var x = freq / fc; return x / Math.sqrt(1 + x * x); }
  function xcOf(f, c) { return 1 / (2 * Math.PI * f * c); }
  function xlOf(f, l) { return 2 * Math.PI * f * l; }

  function q(doc, id) { return doc.getElementById(id); }
  function num(el) { return el ? Number(el.value) : NaN; }
  function setText(el, s) { if (el) el.textContent = s; }
  function verdict(el, ok, msg) {
    if (!el) return;
    el.textContent = msg;
    el.style.color = ok ? "#15803d" : "#b91c1c";
  }
  function onInputs(doc, ids, fn) {
    ids.forEach(function (id) {
      var el = q(doc, id);
      if (el) el.addEventListener("input", fn);
    });
  }
  function onPresets(doc, rootId, fn) {
    var root = q(doc, rootId);
    if (!root) return;
    root.querySelectorAll("button[data-p]").forEach(function (b) {
      b.addEventListener("click", function () { fn(b.getAttribute("data-p").split(",")); });
    });
  }
  function dragPlot(canvas, hit, fn) {
    if (!canvas) return;
    var drag = false;
    function at(e) {
      var r = canvas.getBoundingClientRect();
      var px = (e.clientX - r.left) * canvas.width / r.width;
      var py = (e.clientY - r.top) * canvas.height / r.height;
      if (px < hit.L || px > hit.R) return;
      var t = (px - hit.L) / (hit.R - hit.L);
      fn(Math.min(1, Math.max(0, t)), px, py);
    }
    canvas.addEventListener("pointerdown", function (e) {
      drag = true;
      try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
      at(e);
    });
    canvas.addEventListener("pointermove", function (e) { if (drag) at(e); });
    canvas.addEventListener("pointerup", function () { drag = false; });
    canvas.addEventListener("pointercancel", function () { drag = false; });
  }
  function ctx(cv) {
    var x = cv.getContext("2d");
    x.clearRect(0, 0, cv.width, cv.height);
    x.lineJoin = "round";
    x.lineCap = "round";
    return x;
  }
  function label(x, px, py, s, opt) {
    opt = opt || {};
    x.fillStyle = opt.color || "#555";
    x.font = opt.font || "12px Inter,sans-serif";
    x.textAlign = opt.align || "left";
    x.textBaseline = "alphabetic";
    x.fillText(s, px, py);
  }
  function axes(x, L, T, R, B) {
    x.strokeStyle = "#e5e5e5";
    x.lineWidth = 1;
    x.strokeRect(L, T, R - L, B - T);
    x.strokeStyle = "#111";
    x.lineWidth = 1.25;
    x.beginPath();
    x.moveTo(L, T);
    x.lineTo(L, B);
    x.lineTo(R, B);
    x.stroke();
  }
  function poly(x, pts, color, dash) {
    if (!pts.length) return;
    x.beginPath();
    pts.forEach(function (p, i) { i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1]); });
    x.strokeStyle = color;
    x.lineWidth = 2.25;
    x.setLineDash(dash || []);
    x.stroke();
    x.setLineDash([]);
  }
  function dot(x, px, py, color) {
    x.fillStyle = color;
    x.beginPath();
    x.arc(px, py, 6, 0, 2 * Math.PI);
    x.fill();
  }

  function mountOhm(doc) {
    var cv = q(doc, "op-c");
    if (!cv) return;
    var hit = { L: 58, R: 740 };
    function draw() {
      var v = num(q(doc, "op-v"));
      var r = num(q(doc, "op-r"));
      var rating = num(q(doc, "op-rate"));
      var i = r > 0 ? v / r : NaN;
      var p = v * i;
      setText(q(doc, "op-vv"), fixed(v, 1) + " V");
      setText(q(doc, "op-rv"), fmtOhms(r));
      setText(q(doc, "op-i"), sig(i * 1000, 4) + " mA");
      setText(q(doc, "op-p"), sig(p, 3) + " W");
      setText(q(doc, "op-ratev"), sig(rating, 3) + " W");
      setText(q(doc, "op-frac"), finite(p) && rating > 0 ? fixed(100 * p / rating, 0) + "%" : "—");
      setText(q(doc, "op-imax"), r > 0 ? sig(Math.sqrt(rating / r) * 1000, 3) + " mA" : "—");
      setText(q(doc, "op-margin"), finite(p) ? sig(rating - p, 3) + " W" : "—");
      var hot = p > rating + 1e-9;
      verdict(q(doc, "op-verdict"), !hot, hot
        ? "Over the rating. The body is being asked for more heat than it was built to shed."
        : "Inside the rating. Power is V²/R, and this part can shed it.");
      var x = ctx(cv), W = cv.width, H = cv.height;
      var L = 58, R = W - 20, T = 28, B = H - 36;
      var rMin = 10, rMax = 10000;
      var pMax = Math.max(rating * 1.4, (v * v) / rMin, 0.05);
      function X(rr) { return L + (R - L) * (Math.log(rr / rMin) / Math.log(rMax / rMin)); }
      function Y(pp) { return B - (B - T) * (pp / pMax); }
      axes(x, L, T, R, B);
      x.strokeStyle = "#f59e0b";
      x.setLineDash([6, 4]);
      x.beginPath();
      x.moveTo(L, Y(rating));
      x.lineTo(R, Y(rating));
      x.stroke();
      x.setLineDash([]);
      var pts = [];
      for (var k = 0; k <= 80; k++) {
        var rr = rMin * Math.pow(rMax / rMin, k / 80);
        pts.push([X(rr), Y(Math.min(pMax, (v * v) / rr))]);
      }
      poly(x, pts, "#111");
      dot(x, X(r), Y(Math.min(pMax, p)), "#ef4444");
      label(x, L, 16, "Power versus resistance. Drag the dot.", { color: "#2b2b2b" });
      label(x, L, H - 14, "10 Ω");
      label(x, R, H - 14, "10 kΩ", { align: "right" });
      label(x, 8, Y(pMax) + 4, sig(pMax, 2) + " W");
      label(x, 8, Y(0) + 4, "0");
    }
    onInputs(doc, ["op-v", "op-r", "op-rate"], draw);
    onPresets(doc, "op", function (p) {
      q(doc, "op-v").value = p[0];
      q(doc, "op-r").value = p[1];
      q(doc, "op-rate").value = p[2];
      draw();
    });
    dragPlot(cv, hit, function (t) {
      q(doc, "op-r").value = String(Math.round(10 * Math.pow(1000, t)));
      draw();
    });
    draw();
  }

  function mountDivider(doc) {
    var cv = q(doc, "vd-c");
    if (!cv) return;
    var hit = { L: 64, R: 740 };
    function rlOf() { return logVal(num(q(doc, "vd-rl")), 100, 1e7); }
    function draw() {
      var vin = num(q(doc, "vd-vin")), r1 = num(q(doc, "vd-r1")), r2 = num(q(doc, "vd-r2")), rl = rlOf();
      var d = dividerLoaded(vin, r1, r2, rl);
      setText(q(doc, "vd-vinv"), fixed(vin, 2) + " V");
      setText(q(doc, "vd-r1v"), fmtOhms(r1));
      setText(q(doc, "vd-r2v"), fmtOhms(r2));
      setText(q(doc, "vd-rlv"), fmtOhms(rl));
      setText(q(doc, "vd-un"), fixed(d.unloaded, 3) + " V");
      setText(q(doc, "vd-ld"), fixed(d.loaded, 3) + " V");
      setText(q(doc, "vd-sag"), fixed(d.sag, 3) + " V");
      setText(q(doc, "vd-par"), fmtOhms(d.rpar));
      var ratio = d.unloaded > 0 ? d.sag / d.unloaded : 0;
      setText(q(doc, "vd-pct"), fixed(100 * ratio, 1) + "%");
      setText(q(doc, "vd-rth"), fmtOhms(parallelPair(r1, r2)));
      var ok = ratio < 0.05;
      verdict(q(doc, "vd-verdict"), ok, ok
        ? "The load is light next to R2. The unloaded formula is close."
        : "The load is heavy. Rload sits in parallel with R2, and the unloaded formula overstates the voltage.");
      var x = ctx(cv), W = cv.width, H = cv.height;
      var L = 64, R = W - 20, T = 28, B = H - 36;
      var yMax = Math.max(vin, 0.1);
      function X(rr) { return L + (R - L) * (Math.log(rr / 100) / Math.log(1e7 / 100)); }
      function Y(vv) { return B - (B - T) * (vv / yMax); }
      axes(x, L, T, R, B);
      x.strokeStyle = "#94a3b8";
      x.setLineDash([6, 4]);
      x.beginPath();
      x.moveTo(L, Y(d.unloaded));
      x.lineTo(R, Y(d.unloaded));
      x.stroke();
      x.setLineDash([]);
      var pts = [];
      for (var k = 0; k <= 80; k++) {
        var rr = 100 * Math.pow(1e7 / 100, k / 80);
        pts.push([X(rr), Y(dividerLoaded(vin, r1, r2, rr).loaded)]);
      }
      poly(x, pts, "#1d4ed8");
      dot(x, X(rl), Y(d.loaded), "#ef4444");
      label(x, L, 16, "Loaded output versus load resistance. Drag the dot.", { color: "#2b2b2b" });
      label(x, L, H - 14, "100 Ω");
      label(x, R, H - 14, "10 MΩ", { align: "right" });
    }
    onInputs(doc, ["vd-vin", "vd-r1", "vd-r2", "vd-rl"], draw);
    onPresets(doc, "vd", function (p) {
      q(doc, "vd-vin").value = p[0];
      q(doc, "vd-r1").value = p[1];
      q(doc, "vd-r2").value = p[2];
      q(doc, "vd-rl").value = String(logPos(Number(p[3]), 100, 1e7));
      draw();
    });
    dragPlot(cv, hit, function (t) {
      q(doc, "vd-rl").value = String(1000 * t);
      draw();
    });
    draw();
  }

  function mountLed(doc) {
    var cv = q(doc, "led-c");
    if (!cv) return;
    var hit = { L: 64, R: 740 };
    function draw() {
      var vs = num(q(doc, "led-vs")), vf = num(q(doc, "led-vf")), iT = num(q(doc, "led-i")) / 1000;
      var lim = ledLimit(vs, vf, iT);
      var e24 = preferredResistor(lim.r, E24), e12 = preferredResistor(lim.r, E12);
      var i24 = e24.nextUp > 0 ? (vs - vf) / e24.nextUp : NaN;
      var i12 = e12.nearest > 0 ? (vs - vf) / e12.nearest : NaN;
      var p24 = finite(i24) ? (vs - vf) * i24 : NaN;
      setText(q(doc, "led-vsv"), fixed(vs, 2) + " V");
      setText(q(doc, "led-vfv"), fixed(vf, 2) + " V");
      setText(q(doc, "led-iv"), fixed(num(q(doc, "led-i")), 1) + " mA");
      setText(q(doc, "led-r"), fmtOhms(lim.r));
      setText(q(doc, "led-e24"), fmtOhms(e24.nextUp));
      setText(q(doc, "led-i24"), finite(i24) ? sig(i24 * 1000, 3) + " mA" : "—");
      setText(q(doc, "led-e12"), fmtOhms(e12.nearest));
      setText(q(doc, "led-i12"), finite(i12) ? sig(i12 * 1000, 3) + " mA" : "—");
      setText(q(doc, "led-p"), finite(p24) ? sig(p24, 3) + " W" : "—");
      var badHead = !(vs > vf);
      var overE12 = i12 > iT * 1.02;
      var hot = p24 > 0.125;
      var ok = !badHead && !hot;
      verdict(q(doc, "led-verdict"), ok, badHead
        ? "Vs is not above Vf, so this resistor formula does not set a current."
        : (hot ? "The E24 resistor is over a 1/8 W rating. " : "E24 next-up stays at or under the target. ")
          + (overE12 ? "The nearest E12 value lets the current go over the target." : "Check the E12 current before you use that coarser series."));
      var x = ctx(cv), W = cv.width, H = cv.height;
      var L = 64, R = W - 20, T = 28, B = H - 36;
      if (!(lim.r > 0)) { label(x, 24, 40, "Set Vs above Vf."); return; }
      var rMin = lim.r / 8, rMax = lim.r * 8;
      var iMax = (vs - vf) / rMin;
      function X(rr) { return L + (R - L) * (Math.log(rr / rMin) / Math.log(rMax / rMin)); }
      function Y(ii) { return B - (B - T) * (ii / iMax); }
      axes(x, L, T, R, B);
      x.strokeStyle = "#f59e0b";
      x.setLineDash([6, 4]);
      x.beginPath();
      x.moveTo(L, Y(iT));
      x.lineTo(R, Y(iT));
      x.stroke();
      x.setLineDash([]);
      var pts = [];
      for (var k = 0; k <= 60; k++) {
        var rr = rMin * Math.pow(rMax / rMin, k / 60);
        pts.push([X(rr), Y((vs - vf) / rr)]);
      }
      poly(x, pts, "#111");
      if (e24.nextUp > rMin && e24.nextUp < rMax) dot(x, X(e24.nextUp), Y(i24), "#1d4ed8");
      if (e12.nearest > rMin && e12.nearest < rMax) dot(x, X(e12.nearest), Y(i12), "#16a34a");
      dot(x, X(lim.r), Y(iT), "#ef4444");
      label(x, L, 16, "Current versus resistance. Red is the ideal value.", { color: "#2b2b2b" });
    }
    onInputs(doc, ["led-vs", "led-vf", "led-i"], draw);
    onPresets(doc, "led", function (p) {
      q(doc, "led-vs").value = p[0];
      q(doc, "led-vf").value = p[1];
      q(doc, "led-i").value = p[2];
      draw();
    });
    dragPlot(cv, hit, function (t) {
      var vs = num(q(doc, "led-vs")), vf = num(q(doc, "led-vf")), iT = num(q(doc, "led-i")) / 1000;
      var lim = ledLimit(vs, vf, iT);
      if (!(lim.r > 0)) return;
      var rr = (lim.r / 8) * Math.pow(64, t);
      var i = (vs - vf) / rr;
      q(doc, "led-i").value = String(Math.min(50, Math.max(1, i * 1000)));
      draw();
    });
    draw();
  }

  function mountNodes(doc) {
    var cv = q(doc, "nv-c");
    if (!cv) return;
    function draw() {
      var vin = num(q(doc, "nv-vin"));
      var r1 = num(q(doc, "nv-r1")), r2 = num(q(doc, "nv-r2")), r3 = num(q(doc, "nv-r3")), r4 = num(q(doc, "nv-r4"));
      setText(q(doc, "nv-vinv"), fixed(vin, 2) + " V");
      setText(q(doc, "nv-r1v"), fmtOhms(r1));
      setText(q(doc, "nv-r2v"), fmtOhms(r2));
      setText(q(doc, "nv-r3v"), fmtOhms(r3));
      setText(q(doc, "nv-r4v"), fmtOhms(r4));
      var n = twoNode(vin, r1, r2, r3, r4);
      var x = ctx(cv);
      if (n.error) {
        verdict(q(doc, "nv-verdict"), false, n.error);
        return;
      }
      setText(q(doc, "nv-va"), fixed(n.va, 3) + " V");
      setText(q(doc, "nv-vb"), fixed(n.vb, 3) + " V");
      setText(q(doc, "nv-i1"), sig(n.i1 * 1000, 3) + " mA");
      setText(q(doc, "nv-i2"), sig(n.i2 * 1000, 3) + " mA");
      setText(q(doc, "nv-i3"), sig(n.i3 * 1000, 3) + " mA");
      setText(q(doc, "nv-i4"), sig(n.i4 * 1000, 3) + " mA");
      var kclA = Math.abs(n.i1 - n.i2 - n.i3);
      var kclB = Math.abs(n.i2 - n.i4);
      var ok = kclA < 1e-6 && kclB < 1e-6;
      verdict(q(doc, "nv-verdict"), ok, ok
        ? "KCL holds: current into node A equals current out, and the same at node B. KVL around the left loop is Vin = I1·R1 + Va."
        : "The branch currents do not balance. Check the resistor values.");
      var W = cv.width, H = cv.height;
      x.strokeStyle = "#111";
      x.lineWidth = 2;
      x.strokeRect(70, 70, 70, 50);
      label(x, 78, 100, fixed(vin, 1) + " V", { color: "#111", font: "13px Inter,sans-serif" });
      x.beginPath();
      x.moveTo(140, 95); x.lineTo(230, 95);
      x.moveTo(310, 95); x.lineTo(430, 95);
      x.moveTo(510, 95); x.lineTo(600, 95);
      x.moveTo(270, 95); x.lineTo(270, 150);
      x.moveTo(270, 210); x.lineTo(270, 250); x.lineTo(600, 250); x.lineTo(600, 210);
      x.moveTo(560, 95); x.lineTo(560, 150);
      x.stroke();
      function res(px, py, w, h, name) {
        x.fillStyle = "#fff";
        x.strokeStyle = "#111";
        x.lineWidth = 2;
        x.fillRect(px, py, w, h);
        x.strokeRect(px, py, w, h);
        label(x, px + 6, py + h / 2 + 4, name, { color: "#111" });
      }
      res(230, 78, 80, 34, "R1");
      res(430, 78, 80, 34, "R2");
      res(253, 150, 34, 60, "R3");
      res(543, 150, 34, 60, "R4");
      label(x, 248, 70, "A  " + fixed(n.va, 2) + " V", { color: "#1d4ed8", font: "600 13px Inter,sans-serif" });
      label(x, 530, 70, "B  " + fixed(n.vb, 2) + " V", { color: "#1d4ed8", font: "600 13px Inter,sans-serif" });
      label(x, 160, 86, sig(n.i1 * 1000, 2) + " mA", { color: "#b45309" });
      label(x, 360, 86, sig(n.i2 * 1000, 2) + " mA", { color: "#b45309" });
      label(x, 292, 180, sig(n.i3 * 1000, 2) + " mA", { color: "#b45309" });
      label(x, 582, 180, sig(n.i4 * 1000, 2) + " mA", { color: "#b45309" });
      label(x, 70, H - 18, "Ground is the bottom rail, called 0 V.", { color: "#555" });
    }
    onInputs(doc, ["nv-vin", "nv-r1", "nv-r2", "nv-r3", "nv-r4"], draw);
    onPresets(doc, "nv", function (p) {
      ["nv-vin", "nv-r1", "nv-r2", "nv-r3", "nv-r4"].forEach(function (id, i) { q(doc, id).value = p[i]; });
      draw();
    });
    draw();
  }

  function mountRc(doc) {
    var cv = q(doc, "rc-c");
    if (!cv) return;
    var hit = { L: 58, R: 740 };
    function draw() {
      var r = logVal(num(q(doc, "rc-r")), 100, 1e6);
      var c = num(q(doc, "rc-cval")) * 1e-9;
      var f = logVal(num(q(doc, "rc-f")), 1, 20000);
      var vH = num(q(doc, "rc-vh")), vL = 0;
      var tau = r * c;
      var st = rcSquare(vH, vL, f, tau);
      setText(q(doc, "rc-rv"), fmtOhms(r));
      setText(q(doc, "rc-cv"), sig(c * 1e9, 3) + " nF");
      setText(q(doc, "rc-fv"), sig(f, 3) + " Hz");
      setText(q(doc, "rc-vhv"), fixed(vH, 1) + " V");
      setText(q(doc, "rc-high"), fixed(vH, 1) + " V");
      setText(q(doc, "rc-tau"), sig(tau * 1000, 3) + " ms");
      setText(q(doc, "rc-half"), sig(st.half * 1000, 3) + " ms");
      setText(q(doc, "rc-63"), fixed(vL + 0.632 * (vH - vL), 2) + " V");
      var reaches = st.half > 5 * tau;
      var stalls = st.half < tau;
      setText(q(doc, "rc-rail"), reaches ? "yes" : "no");
      setText(q(doc, "rc-peak"), fixed(st.vPeak, 2) + " V");
      verdict(q(doc, "rc-verdict"), !stalls, stalls
        ? "Half a period is shorter than τ. The capacitor stops reaching the rails."
        : (reaches ? "Five time constants fit in a half-period. The capacitor reaches the rails."
          : "It gets part of the way. One time constant is about 63% of a step."));
      var x = ctx(cv), W = cv.width, H = cv.height;
      var L = 58, R = W - 16, T = 24, B = H - 32;
      var tMax = 3 / f;
      var yMax = Math.max(vH, 0.1);
      function X(t) { return L + (R - L) * (t / tMax); }
      function Y(v) { return B - (B - T) * (v / yMax); }
      axes(x, L, T, R, B);
      var sq = [], cap = [];
      for (var k = 0; k <= 360; k++) {
        var t = tMax * k / 360;
        var phase = t * f - Math.floor(t * f);
        sq.push([X(t), Y(phase < 0.5 ? vH : vL)]);
        cap.push([X(t), Y(rcSample(st, t, vH, vL, tau))]);
      }
      poly(x, sq, "#94a3b8", [5, 4]);
      poly(x, cap, "#111");
      label(x, L, 16, "Three cycles. Drag left or right to change frequency.", { color: "#2b2b2b" });
    }
    onInputs(doc, ["rc-r", "rc-cval", "rc-f", "rc-vh"], draw);
    onPresets(doc, "rc", function (p) {
      q(doc, "rc-r").value = String(logPos(Number(p[0]), 100, 1e6));
      q(doc, "rc-cval").value = p[1];
      q(doc, "rc-f").value = String(logPos(Number(p[2]), 1, 20000));
      q(doc, "rc-vh").value = p[3];
      draw();
    });
    dragPlot(cv, hit, function (t) {
      q(doc, "rc-f").value = String(1000 * t);
      draw();
    });
    draw();
  }

  function mountKick(doc) {
    var cv = q(doc, "kick-c");
    if (!cv) return;
    var hit = { L: 58, R: 740 };
    function draw() {
      var Lh = num(q(doc, "kick-l")) * 1e-3;
      var i = num(q(doc, "kick-i")) / 1000;
      var dt = logVal(num(q(doc, "kick-dt")), 0.1e-6, 100e-6);
      var vs = num(q(doc, "kick-vs"));
      var vf = num(q(doc, "kick-vf"));
      var diode = q(doc, "kick-diode").checked;
      var vSpike = Lh * i / dt;
      var vDiode = vs + vf;
      var decay = vf > 0 ? i * Lh / vf : NaN;
      setText(q(doc, "kick-lv"), sig(Lh * 1e3, 3) + " mH");
      setText(q(doc, "kick-iv"), sig(i * 1000, 3) + " mA");
      setText(q(doc, "kick-dtv"), sig(dt * 1e6, 3) + " µs");
      setText(q(doc, "kick-vsv"), fixed(vs, 1) + " V");
      setText(q(doc, "kick-vfv"), fixed(vf, 2) + " V");
      setText(q(doc, "kick-vsv2"), fixed(vs, 1) + " V");
      setText(q(doc, "kick-e"), sig(0.5 * Lh * i * i * 1e6, 3) + " µJ");
      setText(q(doc, "kick-spike"), sig(vSpike, 3) + " V");
      setText(q(doc, "kick-clamp"), fixed(vDiode, 2) + " V");
      setText(q(doc, "kick-decay"), sig(decay * 1e6, 3) + " µs");
      setText(q(doc, "kick-mode"), diode ? "diode on" : "diode off");
      verdict(q(doc, "kick-verdict"), diode, diode
        ? "The diode is on. The switch node only rises by about one forward drop above the supply."
        : "The diode is off. The model spike is L·ΔI/Δt. A real switch avalanches or fails before that if the number is huge.");
      var x = ctx(cv), W = cv.width, H = cv.height;
      var L = 58, R = W - 16, T = 24, B = H - 32;
      var tEnd = Math.max(5 * dt, diode ? decay * 1.4 : 4 * dt, 1e-6);
      var yMax = Math.max(diode ? vDiode : Math.min(vSpike, 400), vs, 1) * 1.15;
      function X(t) { return L + (R - L) * (t / tEnd); }
      function Y(v) { return B - (B - T) * (v / yMax); }
      axes(x, L, T, R, B);
      var pts = [];
      for (var k = 0; k <= 200; k++) {
        var t = tEnd * k / 200;
        var v;
        if (t < dt * 0.15) v = 0.2;
        else if (!diode) v = (t < dt * 1.15) ? vSpike : 0.2;
        else v = (t < decay) ? vDiode : 0.2;
        pts.push([X(t), Y(Math.min(v, yMax))]);
      }
      poly(x, pts, diode ? "#1d4ed8" : "#ef4444");
      label(x, L, 16, diode ? "Switch-node voltage with the diode." : "Switch-node voltage, diode removed. Drag to change turn-off time.", { color: "#2b2b2b" });
    }
    onInputs(doc, ["kick-l", "kick-i", "kick-dt", "kick-vs", "kick-vf", "kick-diode"], draw);
    onPresets(doc, "kick", function (p) {
      q(doc, "kick-l").value = p[0];
      q(doc, "kick-i").value = p[1];
      q(doc, "kick-dt").value = String(logPos(Number(p[2]) * 1e-6, 0.1e-6, 100e-6));
      q(doc, "kick-vs").value = p[3];
      q(doc, "kick-diode").checked = p[4] === "1";
      draw();
    });
    dragPlot(cv, hit, function (t) {
      q(doc, "kick-dt").value = String(1000 * (1 - t));
      draw();
    });
    draw();
  }

  function mountFilter(doc) {
    var cv = q(doc, "flt-c");
    if (!cv) return;
    var hit = { L: 64, R: 740 };
    function draw() {
      var r = num(q(doc, "flt-r"));
      var c = num(q(doc, "flt-cval")) * 1e-9;
      var fc = fcRc(r, c);
      var f = logVal(num(q(doc, "flt-f")), fc / 100, fc * 100);
      var hp = q(doc, "flt-mode").value === "hp";
      var mag = hp ? hpMag(f, fc) : lpMag(f, fc);
      var db = 20 * Math.log10(Math.max(mag, 1e-6));
      var phase = hp ? (Math.PI / 2 - Math.atan(f / fc)) : -Math.atan(f / fc);
      setText(q(doc, "flt-rv"), fmtOhms(r));
      setText(q(doc, "flt-cv"), sig(c * 1e9, 3) + " nF");
      setText(q(doc, "flt-fv"), sig(f, 4) + " Hz");
      setText(q(doc, "flt-fout"), sig(f, 4) + " Hz");
      setText(q(doc, "flt-fc"), sig(fc, 4) + " Hz");
      setText(q(doc, "flt-mag"), fixed(mag, 3));
      setText(q(doc, "flt-db"), fixed(db, 1) + " dB");
      setText(q(doc, "flt-ph"), fixed(phase * 180 / Math.PI, 0) + "°");
      setText(q(doc, "flt-tau"), sig(r * c * 1000, 3) + " ms");
      var near = Math.abs(Math.log(f / fc)) < Math.log(1.15);
      verdict(q(doc, "flt-verdict"), true, near
        ? "You are on the cutoff. Magnitude is about 0.707, which is −3 dB."
        : (hp ? "High-pass: the fast part of the input gets through, and the slow part does not."
          : "Low-pass: a decade above cutoff the magnitude is about 0.1, which is −20 dB."));
      var x = ctx(cv), W = cv.width, H = cv.height;
      var L = 64, R = W - 16, mid = 210, T = 22, B = H - 28;
      var f0 = fc / 100, f1 = fc * 100;
      function X(ff) { return L + (R - L) * (Math.log(ff / f0) / Math.log(f1 / f0)); }
      function Ydb(d) { return 36 + (mid - 48) * (5 - d) / 45; }
      axes(x, L, 28, R, mid);
      x.strokeStyle = "#f59e0b";
      x.setLineDash([5, 4]);
      x.beginPath();
      x.moveTo(L, Ydb(-3));
      x.lineTo(R, Ydb(-3));
      x.moveTo(X(fc), 28);
      x.lineTo(X(fc), mid);
      x.stroke();
      x.setLineDash([]);
      var bode = [];
      for (var k = 0; k <= 80; k++) {
        var ff = f0 * Math.pow(f1 / f0, k / 80);
        var m = hp ? hpMag(ff, fc) : lpMag(ff, fc);
        bode.push([X(ff), Ydb(Math.max(-40, 20 * Math.log10(m)))]);
      }
      poly(x, bode, "#1d4ed8");
      dot(x, X(f), Ydb(Math.max(-40, db)), "#ef4444");
      label(x, L, 16, hp ? "High-pass magnitude. Drag the marker." : "Low-pass magnitude. Drag the marker.", { color: "#2b2b2b" });
      var T2 = mid + 28, B2 = B;
      axes(x, L, T2, R, B2);
      var cycles = 4, tMax = cycles / f;
      var waveIn = [], waveOut = [];
      for (k = 0; k <= 240; k++) {
        var t = tMax * k / 240;
        var xx = L + (R - L) * (t / tMax);
        var s = Math.sin(2 * Math.PI * f * t);
        waveIn.push([xx, B2 - (B2 - T2) * (s + 1) / 2]);
        waveOut.push([xx, B2 - (B2 - T2) * (mag * Math.sin(2 * Math.PI * f * t + phase) + 1) / 2]);
      }
      poly(x, waveIn, "#94a3b8", [4, 3]);
      poly(x, waveOut, "#111");
      label(x, L, mid + 18, "Time at the marker: dashed input, solid output.", { color: "#555" });
    }
    onInputs(doc, ["flt-r", "flt-cval", "flt-f", "flt-mode"], draw);
    onPresets(doc, "flt", function (p) {
      q(doc, "flt-r").value = p[0];
      q(doc, "flt-cval").value = p[1];
      q(doc, "flt-mode").value = p[2];
      var fc = fcRc(Number(p[0]), Number(p[1]) * 1e-9);
      q(doc, "flt-f").value = String(logPos(Number(p[3]) * fc, fc / 100, fc * 100));
      draw();
    });
    dragPlot(cv, hit, function (t) {
      q(doc, "flt-f").value = String(1000 * t);
      draw();
    });
    draw();
  }

  function mountZ(doc) {
    var cv = q(doc, "z-c");
    if (!cv) return;
    var hit = { L: 64, R: 740 };
    function draw() {
      var r = num(q(doc, "z-r"));
      var c = num(q(doc, "z-cval")) * 1e-9;
      var l = num(q(doc, "z-l")) * 1e-6;
      var f = logVal(num(q(doc, "z-f")), 10, 1e6);
      var xc = xcOf(f, c), xl = xlOf(f, l);
      var fc = fcRc(r, c);
      setText(q(doc, "z-rv"), fmtOhms(r));
      setText(q(doc, "z-rout"), fmtOhms(r));
      setText(q(doc, "z-cv"), sig(c * 1e9, 3) + " nF");
      setText(q(doc, "z-lv"), sig(l * 1e6, 3) + " µH");
      setText(q(doc, "z-fv"), sig(f, 4) + " Hz");
      setText(q(doc, "z-fout"), sig(f, 4) + " Hz");
      setText(q(doc, "z-xc"), fmtOhms(xc));
      setText(q(doc, "z-xl"), fmtOhms(xl));
      setText(q(doc, "z-fc"), sig(fc, 4) + " Hz");
      setText(q(doc, "z-cross"), "Xc = R");
      verdict(q(doc, "z-verdict"), true, "Where the capacitor curve crosses the flat resistor line is the cutoff of an RC low-pass made from this R and C.");
      var x = ctx(cv), W = cv.width, H = cv.height;
      var L = 64, R = W - 16, T = 28, B = H - 34;
      var zMin = 1, zMax = 1e6, f0 = 10, f1 = 1e6;
      function X(ff) { return L + (R - L) * (Math.log(ff / f0) / Math.log(f1 / f0)); }
      function Y(z) { return B - (B - T) * (Math.log(Math.min(zMax, Math.max(zMin, z)) / zMin) / Math.log(zMax / zMin)); }
      axes(x, L, T, R, B);
      var pr = [], pc = [], pl = [];
      for (var k = 0; k <= 100; k++) {
        var ff = f0 * Math.pow(f1 / f0, k / 100);
        pr.push([X(ff), Y(r)]);
        pc.push([X(ff), Y(xcOf(ff, c))]);
        pl.push([X(ff), Y(xlOf(ff, l))]);
      }
      poly(x, pr, "#111");
      poly(x, pc, "#1d4ed8", [6, 4]);
      poly(x, pl, "#16a34a", [2, 3]);
      dot(x, X(f), Y(r), "#ef4444");
      label(x, L, 16, "Impedance versus frequency. Drag the marker.", { color: "#2b2b2b" });
      label(x, L, H - 12, "10 Hz");
      label(x, R, H - 12, "1 MHz", { align: "right" });
    }
    onInputs(doc, ["z-r", "z-cval", "z-l", "z-f"], draw);
    onPresets(doc, "z", function (p) {
      q(doc, "z-r").value = p[0];
      q(doc, "z-cval").value = p[1];
      q(doc, "z-l").value = p[2];
      q(doc, "z-f").value = String(logPos(Number(p[3]), 10, 1e6));
      draw();
    });
    dragPlot(cv, hit, function (t) {
      q(doc, "z-f").value = String(1000 * t);
      draw();
    });
    draw();
  }

  function mountLdo(doc) {
    var cv = q(doc, "ldo-c");
    if (!cv) return;
    var hit = { L: 58, R: 500 };
    function read() {
      return {
        vin: num(q(doc, "ldo-vin")), vout: num(q(doc, "ldo-vout")),
        iout: num(q(doc, "ldo-i")) / 1000, iq: num(q(doc, "ldo-iq")) / 1000,
        theta: num(q(doc, "ldo-th")), ta: num(q(doc, "ldo-ta")),
        vdo: num(q(doc, "ldo-vdo")), tjmax: num(q(doc, "ldo-tj"))
      };
    }
    function draw() {
      var s = read();
      var p = ldoCalc(s.vin, s.vout, s.iout, s.iq);
      var tj = junction(p.pd, s.theta, s.ta);
      var head = s.vin - s.vout;
      var drop = head < s.vdo;
      var hot = tj > s.tjmax;
      setText(q(doc, "ldo-vinv"), fixed(s.vin, 2) + " V");
      setText(q(doc, "ldo-voutv"), fixed(s.vout, 2) + " V");
      setText(q(doc, "ldo-iv"), sig(s.iout * 1000, 3) + " mA");
      setText(q(doc, "ldo-iqv"), sig(s.iq * 1000, 3) + " mA");
      setText(q(doc, "ldo-thv"), fixed(s.theta, 0) + " °C/W");
      setText(q(doc, "ldo-tav"), fixed(s.ta, 0) + " °C");
      setText(q(doc, "ldo-vdov"), fixed(s.vdo, 2) + " V");
      setText(q(doc, "ldo-tjv"), fixed(s.tjmax, 0) + " °C");
      setText(q(doc, "ldo-pd"), sig(p.pd, 3) + " W");
      setText(q(doc, "ldo-eta"), finite(p.eta) ? fixed(100 * p.eta, 1) + "%" : "—");
      setText(q(doc, "ldo-tjout"), fixed(tj, 1) + " °C");
      setText(q(doc, "ldo-head"), fixed(head, 2) + " V");
      setText(q(doc, "ldo-pout"), sig(p.pout, 3) + " W");
      setText(q(doc, "ldo-pin"), sig(p.pin, 3) + " W");
      var ok = !hot && !drop && head > 0;
      verdict(q(doc, "ldo-verdict"), ok, ! (head > 0)
        ? "Vin is not above Vout, so this part cannot regulate."
        : drop ? "Dropout: Vin − Vout is under the dropout voltage. The output will sag."
        : hot ? "Above the junction limit. The package cannot shed this heat at this θJA."
        : "Inside the junction limit, and above dropout.");
      var x = ctx(cv), W = cv.width, H = cv.height;
      var L = 58, R = 500, T = 28, B = H - 36;
      var vin0 = Math.max(0, s.vout - 1), vin1 = 16;
      var pMax = 0.2;
      for (var k = 0; k <= 40; k++) {
        var vv = vin0 + (vin1 - vin0) * k / 40;
        pMax = Math.max(pMax, ldoCalc(vv, s.vout, s.iout, s.iq).pd);
      }
      function X(v) { return L + (R - L) * ((v - vin0) / (vin1 - vin0)); }
      function Y(pp) { return B - (B - T) * (pp / pMax); }
      var edge = s.vout + s.vdo;
      x.fillStyle = "rgba(180, 83, 9, 0.13)";
      x.fillRect(X(vin0), T, Math.max(0, X(edge) - X(vin0)), B - T);
      axes(x, L, T, R, B);
      var heat = [], load = [];
      for (k = 0; k <= 50; k++) {
        vv = vin0 + (vin1 - vin0) * k / 50;
        var pk = ldoCalc(vv, s.vout, s.iout, s.iq);
        heat.push([X(vv), Y(Math.max(0, pk.pd))]);
        load.push([X(vv), Y(Math.max(0, pk.pout))]);
      }
      poly(x, load, "#1d4ed8", [6, 4]);
      poly(x, heat, "#b45309");
      dot(x, X(s.vin), Y(Math.max(0, p.pd)), "#ef4444");
      label(x, L, 16, "Heat versus Vin. Hatched band is dropout. Drag the dot.", { color: "#2b2b2b" });
      label(x, 520, 80, "TJ " + fixed(tj, 0) + " °C", { color: hot ? "#b91c1c" : "#15803d", font: "600 16px Inter,sans-serif" });
      label(x, 520, 108, "limit " + fixed(s.tjmax, 0) + " °C", { color: "#555" });
      label(x, 520, 140, "load " + sig(p.pout, 3) + " W", { color: "#1d4ed8" });
      label(x, 520, 164, "heat " + sig(p.pd, 3) + " W", { color: "#b45309" });
    }
    onInputs(doc, ["ldo-vin", "ldo-vout", "ldo-i", "ldo-iq", "ldo-th", "ldo-ta", "ldo-vdo", "ldo-tj"], draw);
    onPresets(doc, "ldo", function (p) {
      q(doc, "ldo-vin").value = p[0];
      q(doc, "ldo-vout").value = p[1];
      q(doc, "ldo-i").value = p[2];
      draw();
    });
    dragPlot(cv, hit, function (t) {
      var vout = num(q(doc, "ldo-vout"));
      var vin = Math.max(0, vout - 1) + t * (16 - Math.max(0, vout - 1));
      q(doc, "ldo-vin").value = String(Math.min(16, Math.max(3, vin)));
      draw();
    });
    draw();
  }

  function mountBuck(doc) {
    var cv = q(doc, "buck-c");
    if (!cv) return;
    var hit = { L: 58, R: 740 };
    function sample(s, t) {
      var phase = t - Math.floor(t);
      if (!(s.vin > s.vout)) return { sw: 0, i: 0, bad: true };
      var Lh = s.L * 1e-6, fsw = s.f * 1e3, iout = s.iout / 1000;
      var ccm = buckCcm(s.vin, s.vout, iout, Lh, fsw);
      if (ccm.ccm) {
        if (phase < ccm.D) {
          var u = ccm.D === 0 ? 0 : phase / ccm.D;
          return { sw: s.vin, i: ccm.valley + (ccm.peak - ccm.valley) * u, ccm: ccm };
        }
        var v = (1 - ccm.D) === 0 ? 1 : (phase - ccm.D) / (1 - ccm.D);
        return { sw: 0, i: ccm.peak - (ccm.peak - ccm.valley) * v, ccm: ccm };
      }
      var dcm = buckDcm(s.vin, s.vout, iout, Lh, fsw);
      if (phase < dcm.Don) return { sw: s.vin, i: dcm.peak * (phase / Math.max(dcm.Don, 1e-6)), ccm: ccm, dcm: dcm };
      if (phase < dcm.Don + dcm.Doff) {
        var b = (phase - dcm.Don) / Math.max(dcm.Doff, 1e-6);
        return { sw: 0, i: dcm.peak * (1 - b), ccm: ccm, dcm: dcm };
      }
      return { sw: s.vout, i: 0, ccm: ccm, dcm: dcm };
    }
    function draw() {
      var s = {
        vin: num(q(doc, "buck-vin")), vout: num(q(doc, "buck-vout")),
        L: num(q(doc, "buck-l")), f: num(q(doc, "buck-f")),
        iout: num(q(doc, "buck-i")), cout: num(q(doc, "buck-cout")), esr: num(q(doc, "buck-esr"))
      };
      setText(q(doc, "buck-vinv"), fixed(s.vin, 2) + " V");
      setText(q(doc, "buck-voutv"), fixed(s.vout, 2) + " V");
      setText(q(doc, "buck-lv"), fixed(s.L, 2) + " µH");
      setText(q(doc, "buck-fv"), fixed(s.f, 0) + " kHz");
      setText(q(doc, "buck-iv"), fixed(s.iout, 0) + " mA");
      var bad = !(s.vin > s.vout && s.L > 0 && s.f > 0);
      var one = sample(s, 0);
      var ccm = one.ccm || { D: NaN, dIL: NaN, ccm: false };
      var rip = ripple(Math.abs(ccm.dIL), s.f * 1e3, s.cout * 1e-6, s.esr * 1e-3);
      setText(q(doc, "buck-dil"), bad ? "—" : sig(ccm.dIL, 3) + " A");
      setText(q(doc, "buck-dv"), bad || !ccm.ccm ? "—" : sig(rip.dV * 1000, 3) + " mV");
      setText(q(doc, "buck-d"), bad ? "—" : fixed(100 * (ccm.ccm ? ccm.D : (one.dcm ? one.dcm.Don : NaN)), 1) + "%");
      setText(q(doc, "buck-mode"), bad ? "—" : (ccm.ccm ? "CCM" : "DCM"));
      setText(q(doc, "buck-peak"), bad ? "—" : sig((ccm.ccm ? ccm.peak : (one.dcm ? one.dcm.peak : NaN)), 3) + " A");
      setText(q(doc, "buck-valley"), bad ? "—" : (ccm.ccm ? sig(ccm.valley, 3) + " A" : "0 A"));
      verdict(q(doc, "buck-verdict"), !bad && ccm.ccm, bad
        ? "Vin has to be above Vout."
        : ccm.ccm ? "Continuous conduction. The current triangle stays above zero."
        : "Discontinuous conduction. The current returns to zero, and the continuous-conduction ripple formula no longer draws the shape.");
      var x = ctx(cv), W = cv.width, H = cv.height;
      var L = 58, R = W - 16, T = 36, B = H - 32, mid = (T + B) / 2;
      axes(x, L, T, R, B);
      var sw = [], cur = [], iMax = 0.05;
      var k;
      for (k = 0; k <= 240; k++) {
        var sm = sample(s, 3 * k / 240);
        if (sm.i > iMax) iMax = sm.i;
      }
      iMax *= 1.15;
      var vMax = Math.max(s.vin, 1);
      for (k = 0; k <= 240; k++) {
        var t = 3 * k / 240;
        sm = sample(s, t);
        var xx = L + (R - L) * (t / 3);
        sw.push([xx, mid - 8 - (mid - T - 16) * (sm.sw / vMax)]);
        cur.push([xx, B - (B - mid - 8) * (Math.max(0, sm.i) / iMax)]);
      }
      poly(x, sw, "#111");
      poly(x, cur, "#1d4ed8");
      label(x, L, 16, "Three cycles, slowed down. Drag to change the inductance.", { color: "#2b2b2b" });
      label(x, L, T + 14, "switch node", { color: "#111" });
      label(x, L, mid + 16, "inductor current", { color: "#1d4ed8" });
    }
    onInputs(doc, ["buck-vin", "buck-vout", "buck-l", "buck-f", "buck-i", "buck-cout", "buck-esr"], draw);
    onPresets(doc, "buck", function (p) {
      ["buck-vin", "buck-vout", "buck-l", "buck-f", "buck-i"].forEach(function (id, i) { q(doc, id).value = p[i]; });
      draw();
    });
    dragPlot(cv, hit, function (t) {
      q(doc, "buck-l").value = String(1 + t * 46);
      draw();
    });
    draw();
  }

  function mountCompare(doc) {
    var cv = q(doc, "cmp-c");
    if (!cv) return;
    var hit = { L: 58, R: 740 };
    function draw() {
      var vin = num(q(doc, "cmp-vin")), vout = num(q(doc, "cmp-vout"));
      var iout = num(q(doc, "cmp-i")) / 1000, iq = num(q(doc, "cmp-iq")) / 1000, eta = num(q(doc, "cmp-eta")) / 100;
      var lin = ldoCalc(vin, vout, iout, iq);
      var buck = buckPower(vout, iout, eta);
      setText(q(doc, "cmp-vinv"), fixed(vin, 2) + " V");
      setText(q(doc, "cmp-voutv"), fixed(vout, 2) + " V");
      setText(q(doc, "cmp-ivv"), sig(iout * 1000, 3) + " mA");
      setText(q(doc, "cmp-iqv"), sig(iq * 1000, 3) + " mA");
      setText(q(doc, "cmp-iout"), sig(iout * 1000, 3) + " mA");
      setText(q(doc, "cmp-lin"), sig(Math.max(0, lin.pd), 3) + " W");
      setText(q(doc, "cmp-lineta"), finite(lin.eta) ? fixed(100 * lin.eta, 1) + "%" : "—");
      setText(q(doc, "cmp-buck"), sig(buck.pdiss, 3) + " W");
      setText(q(doc, "cmp-pin"), sig(buck.pin, 3) + " W");
      var ratio = buck.pdiss > 0 ? lin.pd / buck.pdiss : NaN;
      setText(q(doc, "cmp-ratio"), finite(ratio) ? sig(ratio, 3) + "×" : "—");
      var heavy = lin.pd > 0.5;
      verdict(q(doc, "cmp-verdict"), !heavy, heavy
        ? "The linear regulator is making more than half a watt of heat. A buck, or a buck then an LDO, is the usual pick on a 2S or 3S pack."
        : "The drop is small enough that the linear regulator's heat is modest.");
      var x = ctx(cv), W = cv.width, H = cv.height;
      var L = 58, R = W - 16, T = 28, B = H - 36;
      var vin0 = Math.max(vout, 1), vin1 = 16, pMax = 0.2, k, vv;
      for (k = 0; k <= 40; k++) {
        vv = vin0 + (vin1 - vin0) * k / 40;
        pMax = Math.max(pMax, ldoCalc(vv, vout, iout, iq).pd, buck.pdiss);
      }
      function X(v) { return L + (R - L) * ((v - vin0) / (vin1 - vin0)); }
      function Y(pp) { return B - (B - T) * (Math.max(0, pp) / pMax); }
      axes(x, L, T, R, B);
      var heat = [];
      for (k = 0; k <= 50; k++) {
        vv = vin0 + (vin1 - vin0) * k / 50;
        heat.push([X(vv), Y(ldoCalc(vv, vout, iout, iq).pd)]);
      }
      poly(x, heat, "#111");
      x.strokeStyle = "#1d4ed8";
      x.setLineDash([6, 4]);
      x.beginPath();
      x.moveTo(L, Y(buck.pdiss));
      x.lineTo(R, Y(buck.pdiss));
      x.stroke();
      x.setLineDash([]);
      dot(x, X(Math.max(vin0, Math.min(vin1, vin))), Y(Math.max(0, lin.pd)), "#ef4444");
      label(x, L, 16, "Heat versus input voltage. Drag the dot.", { color: "#2b2b2b" });
    }
    onInputs(doc, ["cmp-vin", "cmp-vout", "cmp-i", "cmp-iq", "cmp-eta"], draw);
    onPresets(doc, "cmp", function (p) {
      q(doc, "cmp-vin").value = p[0];
      q(doc, "cmp-vout").value = p[1];
      q(doc, "cmp-i").value = p[2];
      draw();
    });
    dragPlot(cv, hit, function (t) {
      var vout = num(q(doc, "cmp-vout"));
      var vin0 = Math.max(vout, 1);
      q(doc, "cmp-vin").value = String(Math.min(16, Math.max(3, vin0 + t * (16 - vin0))));
      draw();
    });
    draw();
  }

  function mount(doc) {
    mountOhm(doc);
    mountDivider(doc);
    mountLed(doc);
    mountNodes(doc);
    mountRc(doc);
    mountKick(doc);
    mountFilter(doc);
    mountZ(doc);
    mountLdo(doc);
    mountBuck(doc);
    mountCompare(doc);
  }

  return {
    mount: mount,
    ldoCalc: ldoCalc,
    junction: junction,
    buckCcm: buckCcm,
    buckDcm: buckDcm,
    ripple: ripple,
    dividerLoaded: dividerLoaded,
    ledLimit: ledLimit,
    preferredResistor: preferredResistor,
    twoNode: twoNode,
    fcRc: fcRc,
    lpMag: lpMag,
    E12: E12,
    E24: E24
  };
});
