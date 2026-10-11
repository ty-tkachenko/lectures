/* Plain-JS widgets for the lecture pages. No frameworks.
   Public API is LectureWidgets (also module.exports for local checks). */
(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.LectureWidgets = api;
  if (typeof document !== "undefined") {
    var boot = function () { api.mountAll(document); };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
    else boot();
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  var SVGNS = "http://www.w3.org/2000/svg";
  var uid = 0;
  var registry = {};

  function nextId() {
    uid += 1;
    return "lw" + uid;
  }

  function clamp(n, lo, hi) {
    return Math.min(hi, Math.max(lo, n));
  }

  function finite(n) {
    return typeof n === "number" && isFinite(n);
  }

  function sig(n, figs) {
    if (!finite(n)) return "—";
    if (n === 0) return "0";
    var s = Number(n).toPrecision(figs);
    return String(Number(s));
  }

  function fixed(n, digits) {
    if (!finite(n)) return "—";
    return n.toFixed(digits);
  }

  function el(tag, attrs, text) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        node.setAttribute(key, attrs[key]);
      });
    }
    if (text != null) node.textContent = text;
    return node;
  }

  function svgEl(tag, attrs) {
    var node = document.createElementNS(SVGNS, tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        node.setAttribute(key, attrs[key]);
      });
    }
    return node;
  }

  function linearScale(d0, d1, r0, r1) {
    var span = d1 - d0;
    if (span === 0) span = 1;
    var m = (r1 - r0) / span;
    return function (v) { return r0 + (v - d0) * m; };
  }

  function polar(cx, cy, radius, angleRad) {
    return {
      x: cx + radius * Math.cos(angleRad),
      y: cy + radius * Math.sin(angleRad)
    };
  }

  function prefersReducedMotion() {
    return typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function mountSlider(parent, spec) {
    var inputId = nextId();
    var row = el("div", { class: "slider-row" });
    var label = el("label", { for: inputId }, spec.label);
    var value = el("output", { for: inputId, class: "slider-value" });
    var input = el("input", {
      id: inputId,
      type: "range",
      min: String(spec.min),
      max: String(spec.max),
      step: String(spec.step),
      value: String(spec.value)
    });
    function read() { return Number(input.value); }
    function paint() {
      var n = read();
      input.setAttribute("aria-valuenow", String(n));
      input.setAttribute("aria-valuemin", String(spec.min));
      input.setAttribute("aria-valuemax", String(spec.max));
      input.setAttribute("aria-valuetext", spec.format ? spec.format(n) : String(n));
      value.textContent = spec.format ? spec.format(n) : String(n);
    }
    input.addEventListener("input", function () {
      paint();
      if (spec.onInput) spec.onInput();
    });
    row.appendChild(label);
    row.appendChild(value);
    row.appendChild(input);
    parent.appendChild(row);
    paint();
    return { read: read };
  }

  function emptyHost(host) {
    while (host.firstChild) host.removeChild(host.firstChild);
  }

  function createSvg(host, w, h, label) {
    emptyHost(host);
    var svg = svgEl("svg", {
      viewBox: "0 0 " + w + " " + h,
      role: "img",
      "aria-label": label || ""
    });
    host.appendChild(svg);
    return svg;
  }

  function hatch(svg) {
    var hid = nextId() + "-hatch";
    var defs = svgEl("defs");
    var pat = svgEl("pattern", {
      id: hid,
      width: "8",
      height: "8",
      patternUnits: "userSpaceOnUse"
    });
    pat.appendChild(svgEl("path", {
      d: "M0 8 L8 0",
      stroke: "#333",
      "stroke-width": "1"
    }));
    defs.appendChild(pat);
    svg.appendChild(defs);
    return hid;
  }

  function lineChart(host, opts) {
    var w = 640;
    var h = 280;
    var pad = { l: 58, r: 12, t: 16, b: 36 };
    var svg = createSvg(host, w, h, opts.ariaLabel || "Chart");
    var hid = hatch(svg);
    var x0 = opts.xDomain[0];
    var x1 = opts.xDomain[1];
    var y0 = opts.yDomain[0];
    var y1 = opts.yDomain[1];
    if (y1 === y0) y1 = y0 + 1;
    var sx = linearScale(x0, x1, pad.l, w - pad.r);
    var sy = linearScale(y0, y1, h - pad.b, pad.t);

    (opts.regions || []).forEach(function (region) {
      var xa = sx(clamp(region.x0, x0, x1));
      var xb = sx(clamp(region.x1, x0, x1));
      var rect = svgEl("rect", {
        x: String(Math.min(xa, xb)),
        y: String(pad.t),
        width: String(Math.abs(xb - xa)),
        height: String(h - pad.b - pad.t),
        fill: "url(#" + hid + ")",
        opacity: "0.85"
      });
      svg.appendChild(rect);
      if (region.label) {
        svg.appendChild(svgEl("text", {
          x: String((xa + xb) / 2),
          y: String(pad.t + 16),
          "text-anchor": "middle",
          "font-size": "14",
          fill: "#111"
        }));
        svg.lastChild.textContent = region.label;
      }
    });

    svg.appendChild(svgEl("line", {
      x1: String(pad.l), y1: String(h - pad.b),
      x2: String(w - pad.r), y2: String(h - pad.b),
      stroke: "#111", "stroke-width": "1.5"
    }));
    svg.appendChild(svgEl("line", {
      x1: String(pad.l), y1: String(pad.t),
      x2: String(pad.l), y2: String(h - pad.b),
      stroke: "#111", "stroke-width": "1.5"
    }));

    function tickText(x, y, str, anchor) {
      var t = svgEl("text", {
        x: String(x), y: String(y),
        "text-anchor": anchor || "middle",
        "font-size": "13",
        fill: "#111"
      });
      t.textContent = str;
      svg.appendChild(t);
    }
    tickText(pad.l, h - 20, sig(x0, 3), "start");
    tickText(w - pad.r, h - 20, sig(x1, 3), "end");
    tickText(pad.l - 6, h - pad.b, sig(y0, 3), "end");
    tickText(pad.l - 6, pad.t + 10, sig(y1, 3), "end");
    if (opts.xLabel) tickText((pad.l + w - pad.r) / 2, h - 4, opts.xLabel, "middle");

    (opts.hLines || []).forEach(function (line) {
      var y = sy(line.y);
      svg.appendChild(svgEl("line", {
        x1: String(pad.l), y1: String(y),
        x2: String(w - pad.r), y2: String(y),
        stroke: "#111", "stroke-width": "1.5",
        "stroke-dasharray": "6 4"
      }));
      if (line.label) tickText(w - pad.r, y - 4, line.label, "end");
    });

    (opts.series || []).forEach(function (series, index) {
      var d = "";
      (series.points || []).forEach(function (pt, i) {
        if (!finite(pt[0]) || !finite(pt[1])) return;
        var cmd = i === 0 ? "M" : "L";
        d += cmd + sx(pt[0]) + " " + sy(pt[1]) + " ";
      });
      if (!d) return;
      svg.appendChild(svgEl("path", {
        d: d,
        fill: "none",
        stroke: index === 0 ? "#111" : "#1d4ed8",
        "stroke-width": "2.5",
        "stroke-dasharray": series.dash || index === 1 ? "7 4" : "none"
      }));
    });

    (opts.vLines || []).forEach(function (line) {
      var x = sx(line.x);
      svg.appendChild(svgEl("line", {
        x1: String(x), y1: String(pad.t),
        x2: String(x), y2: String(h - pad.b),
        stroke: "#000", "stroke-width": "1.5"
      }));
    });

    (opts.markers || []).forEach(function (marker) {
      svg.appendChild(svgEl("circle", {
        cx: String(sx(marker.x)),
        cy: String(sy(marker.y)),
        r: "5",
        fill: "#000"
      }));
    });
    return svg;
  }

  function stackedBar(host, opts) {
    var w = 640;
    var h = 92;
    var svg = createSvg(host, w, h, opts.ariaLabel || "Bar");
    var total = 0;
    (opts.segments || []).forEach(function (seg) { total += Math.max(0, seg.value); });
    if (total <= 0) {
      var empty = svgEl("text", { x: "8", y: "40", "font-size": "16", fill: "#111" });
      empty.textContent = "No power yet.";
      svg.appendChild(empty);
      return svg;
    }
    var x = 8;
    var inner = w - 16;
    (opts.segments || []).forEach(function (seg, index) {
      var frac = Math.max(0, seg.value) / total;
      var bw = Math.max(0, frac * inner);
      var rect = svgEl("rect", {
        x: String(x),
        y: "16",
        width: String(bw),
        height: "36",
        fill: index === 0 ? "#fff" : "#222",
        stroke: "#111",
        "stroke-width": "1.5"
      });
      svg.appendChild(rect);
      if (bw > 70) {
        var label = svgEl("text", {
          x: String(x + bw / 2),
          y: "39",
          "text-anchor": "middle",
          "font-size": "14",
          fill: index === 0 ? "#111" : "#fff"
        });
        label.textContent = seg.label;
        svg.appendChild(label);
      }
      x += bw;
    });
    var caption = svgEl("text", { x: "8", y: "78", "font-size": "14", fill: "#111" });
    caption.textContent = (opts.caption || "");
    svg.appendChild(caption);
    return svg;
  }

  function ldoCalc(vin, vout, iout, iq) {
    var pd = (vin - vout) * iout + vin * iq;
    var pin = vin * (iout + iq);
    var pout = vout * iout;
    return {
      pd: pd,
      pin: pin,
      pout: pout,
      eta: pin > 0 ? pout / pin : NaN,
      etaApprox: vin > 0 ? vout / vin : NaN
    };
  }

  function junction(pd, theta, ta) {
    return ta + pd * theta;
  }

  function buckCcm(vin, vout, iout, L, fsw) {
    var D = vout / vin;
    var dIL = (vin - vout) * D / (L * fsw);
    var valley = iout - dIL / 2;
    return {
      D: D,
      dIL: dIL,
      peak: iout + dIL / 2,
      valley: valley,
      ccm: valley >= -1e-6
    };
  }

  function buckDcm(vin, vout, iout, L, fsw) {
    if (iout <= 0) {
      return { Don: 0, Doff: 0, peak: 0 };
    }
    var ton = Math.sqrt((2 * L * iout * vout) / (fsw * vin * (vin - vout)));
    var toff = ton * (vin - vout) / vout;
    return {
      Don: ton * fsw,
      Doff: toff * fsw,
      peak: (vin - vout) * ton / L
    };
  }

  function ripple(dIL, fsw, cout, esr) {
    var dVc = dIL / (8 * fsw * cout);
    var dVr = dIL * esr;
    return { dVc: dVc, dVr: dVr, dV: dVc + dVr };
  }

  function buckPower(vout, iout, eta) {
    var pout = vout * iout;
    var pin = eta > 0 ? pout / eta : NaN;
    return { pout: pout, pin: pin, pdiss: pin - pout };
  }

  var E12 = [1, 1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 3.9, 4.7, 5.6, 6.8, 8.2];
  var E24 = [1, 1.1, 1.2, 1.3, 1.5, 1.6, 1.8, 2, 2.2, 2.4, 2.7, 3, 3.3, 3.6, 3.9, 4.3, 4.7, 5.1, 5.6, 6.2, 6.8, 7.5, 8.2, 9.1];

  function ohmsPower(v, r) {
    if (!(r > 0)) return { i: NaN, p: NaN };
    var i = v / r;
    return { i: i, p: v * i };
  }

  function parallelPair(r1, r2) {
    if (!(r1 > 0) || !(r2 > 0)) return NaN;
    return (r1 * r2) / (r1 + r2);
  }

  function dividerLoaded(vin, r1, r2, rl) {
    var unloaded = (r1 + r2) > 0 ? vin * r2 / (r1 + r2) : NaN;
    var rth = parallelPair(r1, r2);
    if (!(rl > 0)) {
      return { unloaded: unloaded, loaded: unloaded, error: 0, rth: rth, rpar: r2 };
    }
    var rpar = parallelPair(r2, rl);
    var loaded = (r1 + rpar) > 0 ? vin * rpar / (r1 + rpar) : NaN;
    return { unloaded: unloaded, loaded: loaded, error: unloaded - loaded, rth: rth, rpar: rpar };
  }

  function preferredResistor(rIdeal, series) {
    if (!(rIdeal > 0) || !isFinite(rIdeal)) return { nearest: NaN, nextUp: NaN };
    var exp = Math.floor(Math.log10(rIdeal));
    var candidates = [];
    var e, i, c, d, best, nearest;
    for (e = exp - 2; e <= exp + 2; e++) {
      for (i = 0; i < series.length; i++) {
        candidates.push(Number((series[i] * Math.pow(10, e)).toPrecision(8)));
      }
    }
    nearest = candidates[0];
    best = Infinity;
    for (i = 0; i < candidates.length; i++) {
      c = candidates[i];
      d = Math.abs(Math.log(c / rIdeal));
      if (d < best - 1e-9) {
        best = d;
        nearest = c;
      } else if (Math.abs(d - best) <= 1e-9 && c > nearest) {
        nearest = c;
      }
    }
    var nextUp = NaN;
    for (i = 0; i < candidates.length; i++) {
      c = candidates[i];
      if (c + rIdeal * 1e-9 >= rIdeal && (!(nextUp > 0) || c < nextUp)) nextUp = c;
    }
    return { nearest: nearest, nextUp: nextUp };
  }

  function ledLimit(vs, vf, iTarget) {
    if (!(iTarget > 0) || !(vs > vf)) {
      return { r: NaN, p: NaN, e12: { nearest: NaN, nextUp: NaN }, e24: { nearest: NaN, nextUp: NaN } };
    }
    var r = (vs - vf) / iTarget;
    return {
      r: r,
      p: (vs - vf) * iTarget,
      e12: preferredResistor(r, E12),
      e24: preferredResistor(r, E24)
    };
  }

  function resistorResult(vs, vf, r) {
    if (!(r > 0) || !(vs > vf)) return { i: NaN, p: NaN };
    var i = (vs - vf) / r;
    return { i: i, p: (vs - vf) * i };
  }

  function twoNode(vin, r1, r2, r3, r4) {
    if (!(r1 > 0 && r2 > 0 && r3 > 0 && r4 > 0)) {
      return { error: "Every resistor has to be greater than 0." };
    }
    var g1 = 1 / r1;
    var g2 = 1 / r2;
    var g3 = 1 / r3;
    var g4 = 1 / r4;
    var coeff = g1 + g2 + g3 - (g2 * g2) / (g2 + g4);
    if (!(coeff > 0)) return { error: "The node equations did not have a solution." };
    var va = (g1 * vin) / coeff;
    var vb = (g2 * va) / (g2 + g4);
    var i1 = (vin - va) / r1;
    var i2 = (va - vb) / r2;
    var i3 = va / r3;
    var i4 = vb / r4;
    return { error: "", va: va, vb: vb, i1: i1, i2: i2, i3: i3, i4: i4 };
  }

  function rcSquare(vHigh, vLow, freq, tau) {
    if (!(freq > 0) || !(tau > 0)) return { error: "Frequency and τ have to be positive." };
    var half = 1 / (2 * freq);
    var a = Math.exp(-half / tau);
    var vl, vh;
    if (a > 0.999999) {
      var mid = (vHigh + vLow) / 2;
      vl = mid;
      vh = mid;
    } else {
      vl = (vLow * (1 - a) + vHigh * a * (1 - a)) / (1 - a * a);
      vh = vHigh + (vl - vHigh) * a;
    }
    return { error: "", half: half, vStart: vl, vPeak: vh, a: a };
  }

  function rcSample(state, t, vHigh, vLow, tau) {
    var period = state.half * 2;
    var phase = t - Math.floor(t / period) * period;
    if (phase < state.half) {
      return vHigh + (state.vStart - vHigh) * Math.exp(-phase / tau);
    }
    return vLow + (state.vPeak - vLow) * Math.exp(-(phase - state.half) / tau);
  }

  function xcOf(freq, c) {
    if (!(freq > 0) || !(c > 0)) return NaN;
    return 1 / (2 * Math.PI * freq * c);
  }

  function xlOf(freq, l) {
    if (!(freq > 0) || !(l > 0)) return NaN;
    return 2 * Math.PI * freq * l;
  }

  function fcRc(r, c) {
    if (!(r > 0) || !(c > 0)) return NaN;
    return 1 / (2 * Math.PI * r * c);
  }

  function lpMag(freq, fc) {
    if (!(fc > 0) || !(freq >= 0)) return NaN;
    var x = freq / fc;
    return 1 / Math.sqrt(1 + x * x);
  }

  function hpMag(freq, fc) {
    if (!(fc > 0) || !(freq >= 0)) return NaN;
    var x = freq / fc;
    return x / Math.sqrt(1 + x * x);
  }

  function dbOf(mag) {
    if (!(mag > 0)) return NaN;
    return 20 * Math.log10(mag);
  }

  function kickVoltage(l, i, dt) {
    if (!(l > 0) || !(dt > 0)) return NaN;
    return l * Math.abs(i) / dt;
  }

  function diodeDecay(l, i, vf) {
    if (!(l > 0) || !(vf > 0)) return NaN;
    return Math.abs(i) * l / vf;
  }

  function sampleWave(state, t) {
    var tt = t - Math.floor(t);
    if (state.mode === "ccm") {
      if (tt < state.D) {
        var u = state.D === 0 ? 0 : tt / state.D;
        return { sw: state.vin, i: state.valley + (state.peak - state.valley) * u };
      }
      var u2 = (1 - state.D) === 0 ? 0 : (tt - state.D) / (1 - state.D);
      return { sw: 0, i: state.peak - (state.peak - state.valley) * u2 };
    }
    if (tt < state.Don) {
      var a = state.Don === 0 ? 0 : tt / state.Don;
      return { sw: state.vin, i: state.peak * a };
    }
    if (tt < state.Don + state.Doff) {
      var b = state.Doff === 0 ? 0 : (tt - state.Don) / state.Doff;
      return { sw: 0, i: state.peak * (1 - b) };
    }
    return { sw: state.vout, i: 0, idle: true };
  }

  function mountLdo(root) {
    root.appendChild(el("h3", null, "LDO heat and junction temperature"));
    var prompt = root.getAttribute("data-prompt") ||
      "Raise the input to 12 V and watch the heat take over the bar. Then drag the input down toward the output until the shaded dropout region covers the operating point.";
    root.appendChild(el("p", { class: "try" }, prompt));
    var fields = {};
    var specs = [
      ["vin", "Input voltage Vin", 3, 16, 0.1, 8.4, function (n) { return fixed(n, 1) + " V"; }],
      ["vout", "Output voltage Vout", 1, 12, 0.1, 3.3, function (n) { return fixed(n, 1) + " V"; }],
      ["iout", "Load current", 0, 1000, 10, 200, function (n) { return fixed(n, 0) + " mA"; }],
      ["theta", "Thermal resistance θJA", 20, 200, 5, 50, function (n) { return fixed(n, 0) + " °C/W"; }],
      ["ta", "Ambient temperature", -20, 85, 1, 25, function (n) { return fixed(n, 0) + " °C"; }],
      ["iq", "Quiescent current Iq", 0, 20, 0.1, 5, function (n) { return fixed(n, 1) + " mA"; }],
      ["vdo", "Dropout voltage", 0.05, 2, 0.05, 1, function (n) { return fixed(n, 2) + " V"; }],
      ["tjmax", "Junction limit", 60, 175, 5, 125, function (n) { return fixed(n, 0) + " °C"; }]
    ];
    function redraw() { paint(); }
    var controls = el("div", { class: "row controls" });
    root.appendChild(controls);
    specs.forEach(function (spec) {
      fields[spec[0]] = mountSlider(controls, {
        label: spec[1], min: spec[2], max: spec[3], step: spec[4], value: spec[5],
        format: spec[6], onInput: redraw
      });
    });
    var barHost = el("div", null);
    var tjHost = el("div", null);
    var vinHost = el("div", null);
    root.appendChild(el("p", { class: "widget-plot-label" }, "Where the input power goes"));
    root.appendChild(barHost);
    root.appendChild(el("p", { class: "widget-plot-label" }, "Junction temperature versus load current"));
    root.appendChild(tjHost);
    root.appendChild(el("p", { class: "widget-plot-label" }, "Dropout region on the input voltage"));
    root.appendChild(vinHost);
    var live = el("div", { class: "readout", "aria-live": "polite" });
    root.appendChild(live);
    root.appendChild(el("p", { class: "noscript-note" }, "White is power delivered to the load. Black is heat in the regulator. The hatched band is dropout: the input is too close to the output for the part to regulate. The dashed line is your junction-temperature limit."));

    function paint() {
      var vin = fields.vin.read();
      var vout = fields.vout.read();
      var iout = fields.iout.read() / 1000;
      var theta = fields.theta.read();
      var ta = fields.ta.read();
      var iq = fields.iq.read() / 1000;
      var vdo = fields.vdo.read();
      var tjmax = fields.tjmax.read();
      var warn = [];
      if (!(vin > vout)) warn.push("Vin is not above Vout, so this part cannot regulate. The heat formula assumes it is still dropping Vin − Vout.");
      var headroom = vin - vout;
      var inDropout = headroom < vdo;
      if (inDropout) warn.push("Dropout: Vin − Vout is " + fixed(headroom, 2) + " V, less than the " + fixed(vdo, 2) + " V dropout. The output will sag.");
      var p = ldoCalc(vin, vout, iout, iq);
      var tj = junction(p.pd, theta, ta);
      if (tj > tjmax) warn.push("Junction estimate " + fixed(tj, 1) + " °C is above the " + fixed(tjmax, 0) + " °C limit.");

      stackedBar(barHost, {
        ariaLabel: "Input power " + sig(p.pin, 3) + " watts. Load " + sig(p.pout, 3) + " watts. Heat " + sig(p.pd, 3) + " watts.",
        caption: "Load " + sig(p.pout, 3) + " W · heat " + sig(p.pd, 3) + " W · in " + sig(p.pin, 3) + " W",
        segments: [
          { label: "load", value: Math.max(0, p.pout) },
          { label: "heat", value: Math.max(0, p.pd) }
        ]
      });

      var iMax = Math.max(1, iout * 1.8);
      var pts = [];
      var yMax = tjmax;
      for (var k = 0; k <= 40; k++) {
        var i = (iMax * k) / 40;
        var pk = ldoCalc(vin, vout, i, iq);
        var tk = junction(pk.pd, theta, ta);
        pts.push([i, tk]);
        if (tk > yMax) yMax = tk;
      }
      lineChart(tjHost, {
        ariaLabel: "Junction temperature versus load. At " + fixed(iout * 1000, 0) + " milliamps, TJ is " + fixed(tj, 1) + " degrees.",
        xDomain: [0, iMax],
        yDomain: [Math.min(ta, 0), yMax * 1.05],
        xLabel: "Load current (A)",
        series: [{ name: "TJ", points: pts }],
        hLines: [{ y: tjmax, label: "limit " + fixed(tjmax, 0) + " °C" }],
        markers: [{ x: iout, y: tj }],
        vLines: [{ x: iout }]
      });

      var vinMax = 16;
      var edge = vout + vdo;
      lineChart(vinHost, {
        ariaLabel: inDropout
          ? "Input is inside the dropout region."
          : "Input is above the dropout region, which ends at " + fixed(edge, 2) + " volts.",
        xDomain: [0, vinMax],
        yDomain: [0, 1],
        xLabel: "Vin (V). Hatched = dropout, up to Vout + dropout",
        regions: [{ x0: 0, x1: edge, label: "dropout" }],
        vLines: [{ x: vin }],
        markers: [{ x: vin, y: 0.5 }],
        series: [{ name: "marker", points: [] }]
      });

      var html = "";
      html += "<div>Headroom Vin − Vout = " + fixed(headroom, 2) + " V.</div>";
      html += "<div>P<sub>D</sub> = (" + fixed(vin, 2) + " − " + fixed(vout, 2) + ") × " + sig(iout, 3) + " + " + fixed(vin, 2) + " × " + sig(iq, 3) + " = <strong>" + sig(p.pd, 3) + " W</strong>.</div>";
      html += "<div>Efficiency = " + sig(p.pout, 3) + " / " + sig(p.pin, 3) + " = <strong>" + fixed(p.eta * 100, 1) + "%</strong>. The quick estimate Vout/Vin is " + fixed(p.etaApprox * 100, 1) + "%.</div>";
      html += "<div>T<sub>J</sub> = " + fixed(ta, 0) + " + " + sig(p.pd, 3) + " × " + fixed(theta, 0) + " = <strong>" + fixed(tj, 1) + " °C</strong>.</div>";
      warn.forEach(function (msg) {
        html += "<div class=\"widget-warn\">" + msg + "</div>";
      });
      live.innerHTML = html;
    }
    paint();
  }

  function mountBuck(root) {
    root.appendChild(el("h3", null, "Buck switch node and inductor current"));
    var prompt = root.getAttribute("data-prompt") ||
      "Shrink the inductor or the switching frequency and watch the current triangle grow. Keep going until the hint says the current falls back to zero. That is discontinuous conduction.";
    root.appendChild(el("p", { class: "try" }, prompt));
    var fields = {};
    var specs = [
      ["vin", "Input voltage Vin", 4, 16, 0.1, 8.4, function (n) { return fixed(n, 1) + " V"; }],
      ["vout", "Output voltage Vout", 1, 12, 0.1, 3.3, function (n) { return fixed(n, 1) + " V"; }],
      ["L", "Inductance L", 1, 47, 0.5, 15, function (n) { return fixed(n, 1) + " µH"; }],
      ["fsw", "Switching frequency", 100, 2000, 50, 500, function (n) { return fixed(n, 0) + " kHz"; }],
      ["iout", "Load current", 10, 1000, 10, 200, function (n) { return fixed(n, 0) + " mA"; }],
      ["cout", "Output capacitance", 1, 100, 1, 22, function (n) { return fixed(n, 0) + " µF"; }],
      ["esr", "Capacitor ESR", 1, 100, 1, 20, function (n) { return fixed(n, 0) + " mΩ"; }],
      ["eta", "Estimated efficiency", 50, 98, 1, 85, function (n) { return fixed(n, 0) + "%"; }]
    ];
    var state = { phase: 0 };
    function redraw() { paint(false); }
    var controls = el("div", { class: "row controls" });
    root.appendChild(controls);
    specs.forEach(function (spec) {
      fields[spec[0]] = mountSlider(controls, {
        label: spec[1], min: spec[2], max: spec[3], step: spec[4], value: spec[5],
        format: spec[6], onInput: redraw
      });
    });
    var plotHost = el("div", null);
    root.appendChild(plotHost);
    var live = el("div", { class: "readout", "aria-live": "polite" });
    root.appendChild(live);
    root.appendChild(el("p", { class: "noscript-note" }, "The drawing is slowed down. A real cycle lasts 1/fsw. Solid square: switch node. Triangle: inductor current. The time axis covers three cycles."));

    function readState() {
      var vin = fields.vin.read();
      var vout = fields.vout.read();
      var L = fields.L.read() * 1e-6;
      var fsw = fields.fsw.read() * 1e3;
      var iout = fields.iout.read() / 1000;
      var cout = fields.cout.read() * 1e-6;
      var esr = fields.esr.read() * 1e-3;
      var eta = fields.eta.read() / 100;
      if (!(vin > vout && L > 0 && fsw > 0)) {
        return { error: "Vin has to be above Vout, and L and fsw have to be positive." };
      }
      var ccm = buckCcm(vin, vout, iout, L, fsw);
      var mode = ccm.ccm ? "ccm" : "dcm";
      var dcm = mode === "dcm" ? buckDcm(vin, vout, iout, L, fsw) : null;
      var rip = cout > 0 ? ripple(ccm.dIL, fsw, cout, esr) : null;
      var pwr = buckPower(vout, iout, eta);
      return {
        error: "",
        mode: mode,
        vin: vin,
        vout: vout,
        D: ccm.D,
        dIL: ccm.dIL,
        peak: mode === "ccm" ? ccm.peak : dcm.peak,
        valley: mode === "ccm" ? Math.max(0, ccm.valley) : 0,
        Don: dcm ? dcm.Don : ccm.D,
        Doff: dcm ? dcm.Doff : (1 - ccm.D),
        rip: rip,
        pwr: pwr,
        eta: eta,
        iout: iout
      };
    }

    function draw(s) {
      var w = 640;
      var h = 320;
      var svg = createSvg(plotHost, w, h, s.mode === "dcm"
        ? "Discontinuous conduction. Inductor current returns to zero."
        : "Continuous conduction. Switch node square wave and inductor current triangle. Ripple " + sig(s.dIL, 3) + " amps.");
      var pad = { l: 36, r: 12, t: 18, b: 28 };
      var cycles = 3;
      var sx = linearScale(0, cycles, pad.l, w - pad.r);
      var iMax = Math.max(s.peak * 1.25, s.iout * 1.2, 0.05);
      var sySw = linearScale(0, Math.max(s.vin, 0.1), 150, pad.t);
      var syI = linearScale(0, iMax, h - pad.b, 170);
      var dSw = "";
      var dI = "";
      var steps = 180;
      for (var n = 0; n <= steps; n++) {
        var tAbs = (n / steps) * cycles + s.phase;
        var sample = sampleWave(s, tAbs);
        var x = sx(n / steps * cycles);
        dSw += (n === 0 ? "M" : "L") + x + " " + sySw(sample.sw) + " ";
        dI += (n === 0 ? "M" : "L") + x + " " + syI(sample.i) + " ";
      }
      svg.appendChild(svgEl("path", { d: dSw, fill: "none", stroke: "#111", "stroke-width": "2" }));
      svg.appendChild(svgEl("path", { d: dI, fill: "none", stroke: "#1d4ed8", "stroke-width": "2.5" }));
      var yPeak = syI(s.peak);
      var yVal = syI(s.valley);
      var xAnn = sx(0.15);
      svg.appendChild(svgEl("line", {
        x1: String(xAnn), y1: String(yPeak),
        x2: String(xAnn), y2: String(yVal),
        stroke: "#111", "stroke-width": "1.5"
      }));
      var ann = svgEl("text", { x: String(xAnn + 6), y: String((yPeak + yVal) / 2), "font-size": "14", fill: "#111" });
      ann.textContent = "ΔI";
      svg.appendChild(ann);
      var cap1 = svgEl("text", { x: String(pad.l), y: "14", "font-size": "13", fill: "#111" });
      cap1.textContent = "Switch node (black)";
      svg.appendChild(cap1);
      var cap2 = svgEl("text", { x: String(pad.l), y: "168", "font-size": "13", fill: "#1d4ed8" });
      cap2.textContent = "Inductor current (blue)";
      svg.appendChild(cap2);
    }

    function paint() {
      var s = readState();
      s.phase = state.phase || 0;
      state.latest = s;
      if (s.error) {
        emptyHost(plotHost);
        live.textContent = s.error;
        return;
      }
      draw(s);
      var lines = [];
      lines.push("Ideal duty D = Vout/Vin = " + fixed(s.vout, 2) + "/" + fixed(s.vin, 2) + " = " + fixed(s.D, 3) + ".");
      lines.push("CCM ripple formula ΔI = (Vin − Vout) D / (L fsw) = " + sig(s.dIL, 3) + " A.");
      if (s.mode === "ccm") {
        lines.push("Continuous conduction. Peak " + sig(s.peak, 3) + " A, valley " + sig(s.valley, 3) + " A.");
        if (s.rip) {
          lines.push("Output ripple estimate " + sig(s.rip.dVc * 1000, 3) + " mV from the capacitor + " + sig(s.rip.dVr * 1000, 3) + " mV from ESR ≈ " + sig(s.rip.dV * 1000, 3) + " mV. This CCM estimate is not used in discontinuous mode.");
        }
      } else {
        lines.push("Discontinuous conduction: half of that CCM ripple is larger than the load, so the current reaches zero and waits. Peak current in DCM is " + sig(s.peak, 3) + " A. On-time fraction " + fixed(s.Don, 3) + ".");
      }
      lines.push("Pout = " + sig(s.pwr.pout, 3) + " W. At " + fixed(s.eta * 100, 0) + "% efficiency, Pin = " + sig(s.pwr.pin, 3) + " W and the converter dissipates " + sig(s.pwr.pdiss, 3) + " W.");
      live.innerHTML = lines.map(function (line) { return "<div>" + line + "</div>"; }).join("");
    }

    paint();
    if (!prefersReducedMotion() && typeof requestAnimationFrame === "function") {
      var last = 0;
      function frame(now) {
        if (!state.latest || state.latest.error) {
          requestAnimationFrame(frame);
          return;
        }
        if (!last) last = now;
        var dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        state.latest.phase = (state.phase || 0) + dt * 0.35;
        state.phase = state.latest.phase;
        draw(state.latest);
        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }
  }

  function mountCompare(root) {
    root.appendChild(el("h3", null, "LDO versus buck: heat as input voltage changes"));
    var prompt = root.getAttribute("data-prompt") ||
      "Sweep the input from 12 V down toward the output. The linear regulator's heat falls as the drop shrinks. The buck's heat stays nearly flat, because that estimate depends on efficiency, not on how many volts are dropped.";
    root.appendChild(el("p", { class: "try" }, prompt));
    var fields = {};
    var specs = [
      ["vin", "Input voltage", 3, 16, 0.1, 12.6, function (n) { return fixed(n, 1) + " V"; }],
      ["vout", "Output voltage", 1, 12, 0.1, 3.3, function (n) { return fixed(n, 1) + " V"; }],
      ["iout", "Load current", 10, 1000, 10, 200, function (n) { return fixed(n, 0) + " mA"; }],
      ["iq", "LDO quiescent current", 0, 20, 0.1, 5, function (n) { return fixed(n, 1) + " mA"; }],
      ["eta", "Buck efficiency estimate", 50, 98, 1, 85, function (n) { return fixed(n, 0) + "%"; }]
    ];
    function redraw() { paint(); }
    var controls = el("div", { class: "row controls" });
    root.appendChild(controls);
    specs.forEach(function (spec) {
      fields[spec[0]] = mountSlider(controls, {
        label: spec[1], min: spec[2], max: spec[3], step: spec[4], value: spec[5],
        format: spec[6], onInput: redraw
      });
    });
    var host = el("div", null);
    root.appendChild(host);
    var live = el("div", { class: "readout", "aria-live": "polite" });
    root.appendChild(live);
    root.appendChild(el("p", { class: "noscript-note" }, "Solid black: linear regulator heat. Dashed blue: buck heat at the efficiency you set, drawn flat because this estimate does not change with input voltage. Hatched: input below the output, where neither a buck nor an LDO can make that rail."));

    function paint() {
      var vin = fields.vin.read();
      var vout = fields.vout.read();
      var iout = fields.iout.read() / 1000;
      var iq = fields.iq.read() / 1000;
      var eta = fields.eta.read() / 100;
      var ldoPts = [];
      var buckPts = [];
      var yMax = 0.1;
      for (var k = 0; k <= 48; k++) {
        var v = 3 + (13 * k) / 48;
        if (v <= vout) continue;
        var heat = (v - vout) * iout + v * iq;
        ldoPts.push([v, Math.max(0, heat)]);
        var bp = buckPower(vout, iout, eta).pdiss;
        buckPts.push([v, Math.max(0, bp)]);
        if (heat > yMax) yMax = heat;
        if (bp > yMax) yMax = bp;
      }
      var ldoNow = vin > vout ? ldoCalc(vin, vout, iout, iq).pd : NaN;
      var buckNow = vin > vout ? buckPower(vout, iout, eta).pdiss : NaN;
      lineChart(host, {
        ariaLabel: "Heat versus input voltage. LDO " + sig(ldoNow, 3) + " watts. Buck " + sig(buckNow, 3) + " watts.",
        xDomain: [3, 16],
        yDomain: [0, yMax * 1.1],
        xLabel: "Vin (V)",
        regions: [{ x0: 3, x1: Math.max(3, vout), label: "below Vout" }],
        series: [
          { name: "LDO", points: ldoPts },
          { name: "buck", dash: "7 4", points: buckPts }
        ],
        vLines: [{ x: vin }],
        markers: [
          { x: vin, y: finite(ldoNow) ? ldoNow : 0 },
          { x: vin, y: finite(buckNow) ? buckNow : 0 }
        ]
      });
      var text = "";
      if (!(vin > vout)) {
        text = "<div class=\"widget-warn\">Input is not above the output. Neither part can hold this rail.</div>";
      } else {
        text = "<div>At Vin = " + fixed(vin, 1) + " V and " + fixed(iout * 1000, 0) + " mA: LDO heat <strong>" + sig(ldoNow, 3) + " W</strong>, buck heat <strong>" + sig(buckNow, 3) + " W</strong>.</div>";
        text += "<div>LDO heat uses P<sub>D</sub> = (Vin − Vout) Iout + Vin Iq. Buck heat uses Pout (1/η − 1), with η = " + fixed(eta * 100, 0) + "%.</div>";
      }
      live.innerHTML = text;
    }
    paint();
  }

  function formatOhms(r) {
    if (!finite(r)) return "—";
    var abs = Math.abs(r);
    if (abs >= 1e6) return sig(r / 1e6, 4) + " MΩ";
    if (abs >= 1e3) return sig(r / 1e3, 4) + " kΩ";
    return sig(r, 4) + " Ω";
  }

  function formatAmps(i) {
    if (!finite(i)) return "—";
    var abs = Math.abs(i);
    if (abs >= 1) return sig(i, 4) + " A";
    if (abs >= 1e-3) return sig(i * 1e3, 4) + " mA";
    return sig(i * 1e6, 4) + " µA";
  }

  function formatTime(t) {
    if (!finite(t)) return "—";
    var abs = Math.abs(t);
    if (abs >= 1) return sig(t, 4) + " s";
    if (abs >= 1e-3) return sig(t * 1e3, 4) + " ms";
    if (abs >= 1e-6) return sig(t * 1e6, 4) + " µs";
    return sig(t * 1e9, 4) + " ns";
  }

  function svgText(svg, x, y, str, extra) {
    var attrs = {
      x: String(x),
      y: String(y),
      "font-size": "14",
      fill: "#111"
    };
    if (extra) {
      Object.keys(extra).forEach(function (key) { attrs[key] = String(extra[key]); });
    }
    var node = svgEl("text", attrs);
    node.textContent = str;
    svg.appendChild(node);
    return node;
  }

  var RATINGS = [0.125, 0.25, 0.5, 1, 2];

  function addSliders(root, specs, onInput) {
    var box = el("div", { class: "row controls" });
    root.appendChild(box);
    var fields = {};
    specs.forEach(function (spec) {
      fields[spec.key] = mountSlider(box, {
        label: spec.label,
        min: spec.min,
        max: spec.max,
        step: spec.step,
        value: spec.value,
        format: spec.format,
        onInput: onInput
      });
    });
    return fields;
  }

  function logChart(host, opts) {
    var w = 640;
    var h = 300;
    var pad = { l: 68, r: 16, t: 18, b: 42 };
    var svg = createSvg(host, w, h, opts.ariaLabel || "Chart");
    var x0 = opts.xDomain[0];
    var x1 = opts.xDomain[1];
    var y0 = opts.yDomain[0];
    var y1 = opts.yDomain[1];
    if (y1 <= y0) y1 = y0 + 1;
    var sx = linearScale(x0, x1, pad.l, w - pad.r);
    var sy = linearScale(y0, y1, h - pad.b, pad.t);
    svg.appendChild(svgEl("line", {
      x1: String(pad.l), y1: String(h - pad.b),
      x2: String(w - pad.r), y2: String(h - pad.b),
      stroke: "#111", "stroke-width": "1.5"
    }));
    svg.appendChild(svgEl("line", {
      x1: String(pad.l), y1: String(pad.t),
      x2: String(pad.l), y2: String(h - pad.b),
      stroke: "#111", "stroke-width": "1.5"
    }));
    (opts.xTicks || []).forEach(function (tick) {
      var x = sx(tick.at);
      svg.appendChild(svgEl("line", {
        x1: String(x), y1: String(h - pad.b),
        x2: String(x), y2: String(h - pad.b + 5),
        stroke: "#111"
      }));
      svgText(svg, x, h - 24, tick.label, { "text-anchor": "middle", "font-size": "12" });
    });
    (opts.yTicks || []).forEach(function (tick) {
      svgText(svg, pad.l - 8, sy(tick.at) + 4, tick.label, { "text-anchor": "end", "font-size": "12" });
    });
    if (opts.xLabel) {
      svgText(svg, (pad.l + w - pad.r) / 2, h - 6, opts.xLabel, { "text-anchor": "middle", "font-size": "13" });
    }
    (opts.hLines || []).forEach(function (line) {
      var y = sy(line.y);
      svg.appendChild(svgEl("line", {
        x1: String(pad.l), y1: String(y),
        x2: String(w - pad.r), y2: String(y),
        stroke: "#111", "stroke-width": "1.2", "stroke-dasharray": "6 4"
      }));
      if (line.label) svgText(svg, w - pad.r - 4, y - 4, line.label, { "text-anchor": "end", "font-size": "12" });
    });
    (opts.vLines || []).forEach(function (line) {
      var x = sx(line.x);
      svg.appendChild(svgEl("line", {
        x1: String(x), y1: String(pad.t),
        x2: String(x), y2: String(h - pad.b),
        stroke: "#111", "stroke-width": "1.2", "stroke-dasharray": "4 3"
      }));
    });
    (opts.series || []).forEach(function (series, index) {
      var d = "";
      (series.points || []).forEach(function (pt) {
        if (!finite(pt[0]) || !finite(pt[1])) return;
        var yy = sy(clamp(pt[1], y0, y1));
        d += (d ? "L" : "M") + sx(pt[0]) + " " + yy + " ";
      });
      if (!d) return;
      var dashes = ["none", "7 4", "2 3"];
      var colors = ["#111", "#1d4ed8", "#111"];
      svg.appendChild(svgEl("path", {
        d: d,
        fill: "none",
        stroke: series.stroke || colors[index] || "#111",
        "stroke-width": "2.4",
        "stroke-dasharray": series.dash || dashes[index] || "none"
      }));
    });
    (opts.markers || []).forEach(function (marker) {
      if (!finite(marker.x) || !finite(marker.y)) return;
      svg.appendChild(svgEl("circle", {
        cx: String(sx(marker.x)),
        cy: String(sy(clamp(marker.y, y0, y1))),
        r: "5",
        fill: "#000"
      }));
    });
    return svg;
  }

  function mountOhms(root) {
    root.appendChild(el("h3", null, "Ohm's law and resistor heat"));
    root.appendChild(el("p", { class: "try" }, root.getAttribute("data-prompt") ||
      "Lower the resistance or raise the voltage until the body goes black and the warning appears. That is the rating, not a suggestion."));
    var fields = {};
    function redraw() { paint(); }
    fields = addSliders(root, [
      { key: "v", label: "Voltage across the resistor", min: 0.5, max: 24, step: 0.1, value: 5, format: function (n) { return fixed(n, 1) + " V"; } },
      { key: "r", label: "Resistance", min: 10, max: 10000, step: 10, value: 100, format: function (n) { return formatOhms(n); } },
      { key: "rate", label: "Power rating (0 = 1/8 W … 4 = 2 W)", min: 0, max: 4, step: 1, value: 1, format: function (n) { return sig(RATINGS[n], 3) + " W"; } }
    ], redraw);
    var body = el("div", null);
    var plot = el("div", null);
    root.appendChild(el("p", { class: "widget-plot-label" }, "Resistor body. Darker means closer to the rating."));
    root.appendChild(body);
    root.appendChild(el("p", { class: "widget-plot-label" }, "Power versus resistance. The dashed line is the rating."));
    root.appendChild(plot);
    var live = el("div", { class: "readout", "aria-live": "polite" });
    root.appendChild(live);

    function paint() {
      var v = fields.v.read();
      var r = fields.r.read();
      var rating = RATINGS[fields.rate.read()];
      var p = ohmsPower(v, r);
      var ratio = rating > 0 ? p.p / rating : Infinity;
      var svg = createSvg(body, 640, 110, ratio > 1 ? "Resistor is above its power rating." : "Resistor power is " + fixed(ratio, 2) + " of its rating.");
      var heat = clamp(ratio, 0, 1);
      var gray = Math.round(255 - heat * 230);
      svg.appendChild(svgEl("line", { x1: "30", y1: "54", x2: "170", y2: "54", stroke: "#111", "stroke-width": "3" }));
      svg.appendChild(svgEl("line", { x1: "470", y1: "54", x2: "610", y2: "54", stroke: "#111", "stroke-width": "3" }));
      svg.appendChild(svgEl("rect", {
        x: "170", y: "28", width: "300", height: "52",
        fill: "rgb(" + gray + "," + gray + "," + gray + ")",
        stroke: "#111", "stroke-width": "3"
      }));
      if (ratio > 1) {
        var hid = hatch(svg);
        svg.appendChild(svgEl("rect", {
          x: "170", y: "28", width: "300", height: "52",
          fill: "url(#" + hid + ")", stroke: "none"
        }));
      }
      svgText(svg, 320, 60, ratio > 1 ? "above rating" : "P / rating = " + fixed(ratio, 2), {
        "text-anchor": "middle",
        fill: heat > 0.72 || ratio > 1 ? "#fff" : "#111",
        "font-size": "16"
      });

      var pts = [];
      var yMax = rating;
      for (var k = 0; k <= 60; k++) {
        var rk = Math.pow(10, 1 + (3 * k) / 60);
        var pk = ohmsPower(v, rk).p;
        pts.push([Math.log10(rk), pk]);
        if (pk > yMax) yMax = pk;
      }
      logChart(plot, {
        ariaLabel: "Power " + sig(p.p, 3) + " watts at " + formatOhms(r) + ". Rating " + sig(rating, 3) + " watts.",
        xDomain: [1, 4],
        yDomain: [0, yMax * 1.1],
        xLabel: "Resistance",
        xTicks: [
          { at: 1, label: "10 Ω" },
          { at: 2, label: "100 Ω" },
          { at: 3, label: "1 kΩ" },
          { at: 4, label: "10 kΩ" }
        ],
        yTicks: [
          { at: 0, label: "0" },
          { at: rating, label: sig(rating, 3) + " W" }
        ],
        hLines: [{ y: rating, label: "rating" }],
        series: [{ points: pts }],
        markers: [{ x: Math.log10(r), y: p.p }],
        vLines: [{ x: Math.log10(r) }]
      });

      var html = "";
      html += "<div>I = V / R = " + fixed(v, 2) + " / " + formatOhms(r) + " = <strong>" + formatAmps(p.i) + "</strong>.</div>";
      html += "<div>P = V I = " + fixed(v, 2) + " × " + sig(p.i, 4) + " = <strong>" + sig(p.p, 3) + " W</strong>. I²R and V²/R give the same number.</div>";
      if (ratio > 1) {
        html += "<div class=\"widget-warn\">" + sig(p.p, 3) + " W is above the " + sig(rating, 3) + " W rating. The part runs past the power it was built to shed as heat.</div>";
      } else if (ratio > 0.5) {
        html += "<div>Power is " + fixed(ratio * 100, 0) + "% of the rating. Many designs stay near half the rating so the part runs cooler. That is a practice, not a law.</div>";
      } else {
        html += "<div>Power is " + fixed(ratio * 100, 0) + "% of the " + sig(rating, 3) + " W rating.</div>";
      }
      live.innerHTML = html;
    }
    paint();
  }

  function mountDivider(root) {
    root.appendChild(el("h3", null, "Voltage divider and the load that sags it"));
    root.appendChild(el("p", { class: "try" }, root.getAttribute("data-prompt") ||
      "Start with the load at 10 kΩ, equal to the bottom resistor, and read the sag. Then raise the load toward 10 MΩ, a typical voltmeter, and watch the error shrink."));
    var fields = {};
    function redraw() { paint(); }
    fields = addSliders(root, [
      { key: "vin", label: "Input voltage", min: 1, max: 12, step: 0.1, value: 5, format: function (n) { return fixed(n, 1) + " V"; } },
      { key: "r1", label: "Top resistor R1", min: 100, max: 100000, step: 100, value: 10000, format: function (n) { return formatOhms(n); } },
      { key: "r2", label: "Bottom resistor R2", min: 100, max: 100000, step: 100, value: 10000, format: function (n) { return formatOhms(n); } },
      { key: "logrl", label: "Load (log). 4 = 10 kΩ, 7 = 10 MΩ", min: 2, max: 7, step: 0.05, value: 4, format: function (n) { return formatOhms(Math.pow(10, n)); } }
    ], redraw);
    var plot = el("div", null);
    root.appendChild(plot);
    var live = el("div", { class: "readout", "aria-live": "polite" });
    root.appendChild(live);
    root.appendChild(el("p", { class: "noscript-note" }, "The curve is loaded output versus load resistance. The dashed line is the unloaded divider. A 10 MΩ meter barely leaves that line. A load near R2 does not."));

    function paint() {
      var vin = fields.vin.read();
      var r1 = fields.r1.read();
      var r2 = fields.r2.read();
      var rl = Math.pow(10, fields.logrl.read());
      var now = dividerLoaded(vin, r1, r2, rl);
      var pts = [];
      for (var k = 0; k <= 50; k++) {
        var x = 2 + (5 * k) / 50;
        var row = dividerLoaded(vin, r1, r2, Math.pow(10, x));
        pts.push([x, row.loaded]);
      }
      logChart(plot, {
        ariaLabel: "Loaded output " + fixed(now.loaded, 3) + " volts. Unloaded " + fixed(now.unloaded, 3) + " volts.",
        xDomain: [2, 7],
        yDomain: [0, Math.max(vin, 0.1)],
        xLabel: "Load resistance",
        xTicks: [
          { at: 2, label: "100 Ω" },
          { at: 3, label: "1 kΩ" },
          { at: 4, label: "10 kΩ" },
          { at: 5, label: "100 kΩ" },
          { at: 6, label: "1 MΩ" },
          { at: 7, label: "10 MΩ" }
        ],
        yTicks: [
          { at: 0, label: "0" },
          { at: now.unloaded, label: fixed(now.unloaded, 2) + " V" }
        ],
        hLines: [{ y: now.unloaded, label: "no load" }],
        series: [{ points: pts }],
        markers: [{ x: Math.log10(rl), y: now.loaded }],
        vLines: [{ x: Math.log10(rl) }]
      });
      var pct = now.unloaded !== 0 ? (now.error / now.unloaded) * 100 : 0;
      var html = "";
      html += "<div>Unloaded Vout = Vin × R2 / (R1 + R2) = <strong>" + fixed(now.unloaded, 3) + " V</strong>.</div>";
      html += "<div>R2 in parallel with the load is " + formatOhms(now.rpar) + ". Loaded Vout = <strong>" + fixed(now.loaded, 3) + " V</strong>.</div>";
      html += "<div>Thevenin resistance seen by the load is R1 || R2 = " + formatOhms(now.rth) + ". Sag = <strong>" + fixed(now.error, 3) + " V</strong> (" + fixed(pct, 1) + "% of the unloaded voltage).</div>";
      if (rl >= 5e6) {
        html += "<div>This load is in the range of a digital multimeter's voltage input (often about 10 MΩ). The sag is small.</div>";
      } else if (rl < 3 * r2) {
        html += "<div class=\"widget-warn\">The load is not much larger than R2, so the divider equation without the load is the wrong answer.</div>";
      }
      live.innerHTML = html;
    }
    paint();
  }

  function mountLed(root) {
    root.appendChild(el("h3", null, "LED current-limit resistor"));
    root.appendChild(el("p", { class: "try" }, root.getAttribute("data-prompt") ||
      "Set a 9 V supply, a 2.0 V forward drop, and 20 mA. Read the ideal resistor, then the next E24 value at or above it. That higher value keeps the current at or under the target."));
    var fields = {};
    function redraw() { paint(); }
    fields = addSliders(root, [
      { key: "vs", label: "Supply voltage", min: 3, max: 24, step: 0.1, value: 9, format: function (n) { return fixed(n, 1) + " V"; } },
      { key: "vf", label: "LED forward voltage Vf", min: 0.5, max: 5, step: 0.1, value: 2, format: function (n) { return fixed(n, 1) + " V"; } },
      { key: "ifm", label: "Target LED current", min: 1, max: 40, step: 1, value: 20, format: function (n) { return fixed(n, 0) + " mA"; } },
      { key: "rate", label: "Resistor rating (0 = 1/8 W … 4 = 2 W)", min: 0, max: 4, step: 1, value: 0, format: function (n) { return sig(RATINGS[n], 3) + " W"; } }
    ], redraw);
    var live = el("div", { class: "readout", "aria-live": "polite" });
    root.appendChild(live);
    root.appendChild(el("p", { class: "noscript-note" }, "Vf and the target current are inputs you type from a datasheet. The widget does not know your LED. Nearest is the closest E-series value. Next up is the smallest standard value at or above the ideal resistance, so the LED current does not exceed the target."));

    function row(label, r, vs, vf, rating) {
      var got = resistorResult(vs, vf, r);
      var overI = got.i > (fields.ifm.read() / 1000) * 1.001;
      var overP = got.p > rating * 1.001;
      return "<div>" + label + " " + formatOhms(r) + " → I = <strong>" + formatAmps(got.i) + "</strong>, P = <strong>" + sig(got.p, 3) + " W</strong>" +
        (overI ? " (above the target current)" : "") +
        (overP ? " (above the resistor rating)" : "") + ".</div>";
    }

    function paint() {
      var vs = fields.vs.read();
      var vf = fields.vf.read();
      var iTarget = fields.ifm.read() / 1000;
      var rating = RATINGS[fields.rate.read()];
      var html = "";
      if (!(vs > vf)) {
        live.innerHTML = "<div class=\"widget-warn\">The supply is not above Vf, so this LED does not light in the usual direction. Check the polarity and the supply.</div>";
        return;
      }
      var design = ledLimit(vs, vf, iTarget);
      html += "<div>Ideal R = (Vs − Vf) / If = (" + fixed(vs, 2) + " − " + fixed(vf, 2) + ") / " + sig(iTarget, 3) + " = <strong>" + formatOhms(design.r) + "</strong>.</div>";
      html += "<div>Ideal resistor power = (Vs − Vf) × If = <strong>" + sig(design.p, 3) + " W</strong>.</div>";
      html += row("E24 nearest:", design.e24.nearest, vs, vf, rating);
      html += row("E24 next up (use this):", design.e24.nextUp, vs, vf, rating);
      html += row("E12 nearest:", design.e12.nearest, vs, vf, rating);
      html += row("E12 next up:", design.e12.nextUp, vs, vf, rating);
      var used = resistorResult(vs, vf, design.e24.nextUp);
      if (used.p > rating) {
        html += "<div class=\"widget-warn\">The E24 next-up resistor dissipates " + sig(used.p, 3) + " W, above the " + sig(rating, 3) + " W rating. Pick a larger rating.</div>";
      }
      live.innerHTML = html;
    }
    paint();
  }

  function mountKvl(root) {
    root.appendChild(el("h3", null, "Two nodes: KCL and KVL"));
    root.appendChild(el("p", { class: "try" }, root.getAttribute("data-prompt") ||
      "Change only R3 and watch both node voltages and every branch current move. The current into each node still matches the current out."));
    var fields = {};
    function redraw() { paint(); }
    fields = addSliders(root, [
      { key: "vin", label: "Source voltage", min: 1, max: 24, step: 0.1, value: 12, format: function (n) { return fixed(n, 1) + " V"; } },
      { key: "r1", label: "R1, source to node A", min: 100, max: 20000, step: 100, value: 1000, format: function (n) { return formatOhms(n); } },
      { key: "r2", label: "R2, node A to node B", min: 100, max: 20000, step: 100, value: 2000, format: function (n) { return formatOhms(n); } },
      { key: "r3", label: "R3, node A to 0 V", min: 100, max: 20000, step: 100, value: 2000, format: function (n) { return formatOhms(n); } },
      { key: "r4", label: "R4, node B to 0 V", min: 100, max: 20000, step: 100, value: 2000, format: function (n) { return formatOhms(n); } }
    ], redraw);
    var plot = el("div", null);
    root.appendChild(plot);
    var live = el("div", { class: "readout", "aria-live": "polite" });
    root.appendChild(live);

    function paint() {
      var s = twoNode(fields.vin.read(), fields.r1.read(), fields.r2.read(), fields.r3.read(), fields.r4.read());
      var svg = createSvg(plot, 640, 280, "Node A " + fixed(s.va, 2) + " volts, node B " + fixed(s.vb, 2) + " volts.");
      svg.appendChild(svgEl("rect", { x: "24", y: "70", width: "36", height: "70", fill: "#fff", stroke: "#111", "stroke-width": "2" }));
      svgText(svg, 42, 108, "V", { "text-anchor": "middle" });
      svg.appendChild(svgEl("line", { x1: "60", y1: "88", x2: "120", y2: "88", stroke: "#111", "stroke-width": "2" }));
      svg.appendChild(svgEl("rect", { x: "120", y: "70", width: "80", height: "36", fill: "#fff", stroke: "#111", "stroke-width": "2" }));
      svgText(svg, 160, 94, "R1", { "text-anchor": "middle" });
      svg.appendChild(svgEl("line", { x1: "200", y1: "88", x2: "280", y2: "88", stroke: "#111", "stroke-width": "2" }));
      svg.appendChild(svgEl("circle", { cx: "280", cy: "88", r: "5", fill: "#111" }));
      svgText(svg, 280, 58, "A  " + fixed(s.va, 2) + " V", { "text-anchor": "middle", "font-size": "15" });
      svg.appendChild(svgEl("line", { x1: "280", y1: "88", x2: "280", y2: "150", stroke: "#111", "stroke-width": "2" }));
      svg.appendChild(svgEl("rect", { x: "262", y: "150", width: "36", height: "50", fill: "#fff", stroke: "#111", "stroke-width": "2" }));
      svgText(svg, 280, 180, "R3", { "text-anchor": "middle" });
      svg.appendChild(svgEl("line", { x1: "280", y1: "200", x2: "280", y2: "240", stroke: "#111", "stroke-width": "2" }));
      svg.appendChild(svgEl("line", { x1: "250", y1: "240", x2: "520", y2: "240", stroke: "#111", "stroke-width": "2" }));
      svgText(svg, 400, 262, "0 V", { "text-anchor": "middle" });
      svg.appendChild(svgEl("line", { x1: "42", y1: "140", x2: "42", y2: "240", stroke: "#111", "stroke-width": "2" }));
      svg.appendChild(svgEl("line", { x1: "42", y1: "240", x2: "250", y2: "240", stroke: "#111", "stroke-width": "2" }));
      svg.appendChild(svgEl("line", { x1: "280", y1: "88", x2: "390", y2: "88", stroke: "#111", "stroke-width": "2" }));
      svg.appendChild(svgEl("rect", { x: "390", y: "70", width: "80", height: "36", fill: "#fff", stroke: "#111", "stroke-width": "2" }));
      svgText(svg, 430, 94, "R2", { "text-anchor": "middle" });
      svg.appendChild(svgEl("line", { x1: "470", y1: "88", x2: "540", y2: "88", stroke: "#111", "stroke-width": "2" }));
      svg.appendChild(svgEl("circle", { cx: "540", cy: "88", r: "5", fill: "#111" }));
      svgText(svg, 560, 58, "B  " + fixed(s.vb, 2) + " V", { "text-anchor": "start", "font-size": "15" });
      svg.appendChild(svgEl("line", { x1: "540", y1: "88", x2: "540", y2: "150", stroke: "#111", "stroke-width": "2" }));
      svg.appendChild(svgEl("rect", { x: "522", y: "150", width: "36", height: "50", fill: "#fff", stroke: "#111", "stroke-width": "2" }));
      svgText(svg, 540, 180, "R4", { "text-anchor": "middle" });
      svg.appendChild(svgEl("line", { x1: "540", y1: "200", x2: "540", y2: "240", stroke: "#111", "stroke-width": "2" }));
      svgText(svg, 160, 124, formatAmps(s.i1), { "text-anchor": "middle", "font-size": "13" });
      svgText(svg, 250, 168, formatAmps(s.i3), { "text-anchor": "end", "font-size": "13" });
      svgText(svg, 430, 124, formatAmps(s.i2), { "text-anchor": "middle", "font-size": "13" });
      svgText(svg, 570, 168, formatAmps(s.i4), { "text-anchor": "start", "font-size": "13" });

      var kclA = s.i1 - s.i3 - s.i2;
      var kclB = s.i2 - s.i4;
      var html = "";
      html += "<div>I1 through R1 = " + formatAmps(s.i1) + ". I3 through R3 = " + formatAmps(s.i3) + ". I2 through R2 = " + formatAmps(s.i2) + ". I4 through R4 = " + formatAmps(s.i4) + ".</div>";
      html += "<div>KCL at A: I1 − I3 − I2 = " + sig(kclA * 1e6, 3) + " µA (numerical leftover, ideally 0).</div>";
      html += "<div>KCL at B: I2 − I4 = " + sig(kclB * 1e6, 3) + " µA.</div>";
      html += "<div>KVL from the source, through R1, to node A and back through the 0 V rail: " + fixed(fields.vin.read(), 2) + " V = " + fixed(s.i1 * fields.r1.read(), 2) + " V on R1 + " + fixed(s.va, 2) + " V at A.</div>";
      live.innerHTML = html;
    }
    paint();
  }

  function mountRcScope(root) {
    root.appendChild(el("h3", null, "RC charge and discharge on a square wave"));
    root.appendChild(el("p", { class: "try" }, root.getAttribute("data-prompt") ||
      "Raise the square-wave frequency until half a period is shorter than τ. The capacitor voltage stops reaching the rails. That rounding is the circuit refusing to jump."));
    var fields = {};
    function redraw() { paint(); }
    fields = addSliders(root, [
      { key: "v", label: "Square-wave high level (low is 0 V)", min: 1, max: 12, step: 0.1, value: 5, format: function (n) { return fixed(n, 1) + " V"; } },
      { key: "r", label: "Resistance R", min: 100, max: 100000, step: 100, value: 10000, format: function (n) { return formatOhms(n); } },
      { key: "c", label: "Capacitance C", min: 1, max: 1000, step: 1, value: 100, format: function (n) { return fixed(n, 0) + " nF"; } },
      { key: "f", label: "Square-wave frequency", min: 1, max: 5000, step: 1, value: 100, format: function (n) { return fixed(n, 0) + " Hz"; } }
    ], redraw);
    var plot = el("div", null);
    root.appendChild(plot);
    var live = el("div", { class: "readout", "aria-live": "polite" });
    root.appendChild(live);
    root.appendChild(el("p", { class: "noscript-note" }, "Ideal R and C. The plot is the whole waveform, so it does not animate. A black trace is the capacitor. A dashed trace is the square wave."));

    function paint() {
      var v = fields.v.read();
      var r = fields.r.read();
      var c = fields.c.read() * 1e-9;
      var f = fields.f.read();
      var tau = r * c;
      var state = rcSquare(v, 0, f, tau);
      var span = 3 / f;
      var capPts = [];
      var sqPts = [];
      var steps = 240;
      for (var n = 0; n <= steps; n++) {
        var t = span * n / steps;
        capPts.push([t * 1000, rcSample(state, t, v, 0, tau)]);
        var phase = t - Math.floor(t * f) / f;
        sqPts.push([t * 1000, phase < state.half ? v : 0]);
      }
      var atTau = v * (1 - Math.exp(-1));
      lineChart(plot, {
        ariaLabel: "Capacitor voltage over three periods. Time constant " + formatTime(tau) + ".",
        xDomain: [0, span * 1000],
        yDomain: [-0.2, v * 1.15],
        xLabel: "Time (ms)",
        series: [
          { name: "capacitor", points: capPts },
          { name: "square", dash: "7 4", points: sqPts }
        ],
        hLines: [{ y: atTau, label: "63% of the step" }]
      });
      var half = state.half;
      var html = "";
      html += "<div>τ = R C = " + formatOhms(r) + " × " + sig(c * 1e9, 4) + " nF = <strong>" + formatTime(tau) + "</strong>.</div>";
      html += "<div>One time constant reaches " + fixed(atTau, 3) + " V, which is 63.2% of " + fixed(v, 1) + " V, on a step from 0. Five time constants (" + formatTime(5 * tau) + ") reach about 99.3%.</div>";
      html += "<div>Half a period is " + formatTime(half) + ". The capacitor swings between " + fixed(state.vStart, 3) + " V and " + fixed(state.vPeak, 3) + " V once the square wave has been running.</div>";
      if (half < tau) {
        html += "<div class=\"widget-warn\">Half a period is shorter than τ, so the voltage never settles. The corners round off and the rails are missed.</div>";
      } else if (half < 5 * tau) {
        html += "<div>Half a period is only a few time constants, so the waveform is still curved when it turns around.</div>";
      } else {
        html += "<div>Half a period is many time constants, so each edge almost finishes before the next one.</div>";
      }
      live.innerHTML = html;
    }
    paint();
  }

  function mountKick(root) {
    root.appendChild(el("h3", null, "Inductive kickback, with and without a diode"));
    root.appendChild(el("p", { class: "try" }, root.getAttribute("data-prompt") ||
      "Turn the diode off and read the voltage the switch would need in order to stop the current in the time you set. Turn the diode on and the same current decays at about one diode drop."));
    var fields = {};
    function redraw() { paint(); }
    fields = addSliders(root, [
      { key: "l", label: "Inductance", min: 0.1, max: 20, step: 0.1, value: 1, format: function (n) { return fixed(n, 1) + " mH"; } },
      { key: "i", label: "Current before the switch opens", min: 10, max: 500, step: 10, value: 200, format: function (n) { return fixed(n, 0) + " mA"; } },
      { key: "vs", label: "Supply voltage", min: 3, max: 24, step: 0.1, value: 5, format: function (n) { return fixed(n, 1) + " V"; } },
      { key: "vf", label: "Diode forward drop (a round number)", min: 0.3, max: 1.2, step: 0.05, value: 0.7, format: function (n) { return fixed(n, 2) + " V"; } },
      { key: "dt", label: "Forced turn-off time, no diode (a model)", min: 0.2, max: 20, step: 0.2, value: 1, format: function (n) { return fixed(n, 1) + " µs"; } },
      { key: "diode", label: "Flyback diode (0 off, 1 on)", min: 0, max: 1, step: 1, value: 1, format: function (n) { return n >= 1 ? "on" : "off"; } }
    ], redraw);
    var plot = el("div", null);
    root.appendChild(plot);
    var live = el("div", { class: "readout", "aria-live": "polite" });
    root.appendChild(live);
    root.appendChild(el("p", { class: "noscript-note" }, "The no-diode spike uses V = L ΔI / Δt with the turn-off time you set. That time is a teaching model, not a measured edge. With the diode, the coil voltage is the diode drop and the current falls in a straight line. Coil resistance is left out."));

    function paint() {
      var l = fields.l.read() * 1e-3;
      var i0 = fields.i.read() / 1000;
      var vs = fields.vs.read();
      var vf = fields.vf.read();
      var dt = fields.dt.read() * 1e-6;
      var diodeOn = fields.diode.read() >= 1;
      var vkick = kickVoltage(l, i0, dt);
      var tDiode = diodeDecay(l, i0, vf);
      var vClamp = vs + vf;
      var tEnd = (diodeOn ? tDiode : dt) * 1.35;
      var vPts = [];
      var steps = 200;
      for (var n = 0; n <= steps; n++) {
        var t = tEnd * n / steps;
        var vsw;
        if (diodeOn) vsw = t < tDiode ? vClamp : 0;
        else vsw = t < dt ? vkick : 0;
        vPts.push([t * 1e6, vsw]);
      }
      var vMax = (diodeOn ? Math.max(vClamp, vs) : Math.max(vkick, vClamp)) * 1.15;
      logChart(plot, {
        ariaLabel: diodeOn
          ? "Diode clamps the switch node near " + fixed(vClamp, 2) + " volts."
          : "Without a diode the model spike is " + sig(vkick, 3) + " volts.",
        xDomain: [0, tEnd * 1e6],
        yDomain: [0, vMax],
        xLabel: "Time after the switch opens (µs)",
        xTicks: [
          { at: 0, label: "0" },
          { at: tEnd * 1e6, label: sig(tEnd * 1e6, 3) }
        ],
        yTicks: [
          { at: 0, label: "0" },
          { at: vClamp, label: fixed(vClamp, 1) + " V" }
        ],
        hLines: [{ y: vClamp, label: "supply + Vf" }],
        series: [{ name: "switch node", points: vPts }],
        markers: []
      });
      var html = "";
      html += "<div>No-diode model: V = L I / Δt = " + sig(l * 1e3, 3) + " mH × " + formatAmps(i0) + " / " + formatTime(dt) + " = <strong>" + sig(vkick, 4) + " V</strong>. The switch has to stand that if the current really stops that fast.</div>";
      html += "<div>Diode on: the switch node sits near Vs + Vf = " + fixed(vs, 2) + " + " + fixed(vf, 2) + " = <strong>" + fixed(vClamp, 2) + " V</strong>. Current falls to zero in L I / Vf = <strong>" + formatTime(tDiode) + "</strong>.</div>";
      if (!diodeOn) {
        html += "<div class=\"widget-warn\">The diode is off, so the plot is the tall model spike, not the clamp. A real switch breaks down somewhere before an infinite voltage. This page does not invent that breakdown voltage.</div>";
      } else {
        html += "<div>The plot is the clamp. The tall number above is what the same current would demand without the diode.</div>";
      }
      html += "<div>Current starts at " + formatAmps(i0) + " and falls in a straight line while the coil voltage is constant. Energy in the coil was ½ L I² = " + sig(0.5 * l * i0 * i0 * 1e6, 4) + " µJ.</div>";
      live.innerHTML = html;
    }
    paint();
  }

  function mountFilter(root) {
    root.appendChild(el("h3", null, "RC low-pass and high-pass"));
    root.appendChild(el("p", { class: "try" }, root.getAttribute("data-prompt") ||
      "Find the −3 dB point, then switch from low-pass to high-pass. The time plot shows a slow sine plus a faster one, and what each filter keeps."));
    var fields = {};
    function redraw() { paint(); }
    fields = addSliders(root, [
      { key: "r", label: "Resistance R", min: 100, max: 100000, step: 100, value: 1600, format: function (n) { return formatOhms(n); } },
      { key: "c", label: "Capacitance C", min: 1, max: 1000, step: 1, value: 100, format: function (n) { return fixed(n, 0) + " nF"; } },
      { key: "mode", label: "Filter (0 low-pass, 1 high-pass)", min: 0, max: 1, step: 1, value: 0, format: function (n) { return n >= 1 ? "high-pass" : "low-pass"; } }
    ], redraw);
    var bode = el("div", null);
    var time = el("div", null);
    root.appendChild(el("p", { class: "widget-plot-label" }, "Magnitude. Frequency is on a log axis."));
    root.appendChild(bode);
    root.appendChild(el("p", { class: "widget-plot-label" }, "Time plot. Dashed input, solid output."));
    root.appendChild(time);
    var live = el("div", { class: "readout", "aria-live": "polite" });
    root.appendChild(live);

    function paint() {
      var r = fields.r.read();
      var c = fields.c.read() * 1e-9;
      var high = fields.mode.read() >= 1;
      var fc = fcRc(r, c);
      var magFn = high ? hpMag : lpMag;
      var pts = [];
      var k;
      for (k = 0; k <= 80; k++) {
        var logf = 1 + (5 * k) / 80;
        var f = Math.pow(10, logf);
        pts.push([logf, dbOf(magFn(f, fc))]);
      }
      logChart(bode, {
        ariaLabel: (high ? "High-pass" : "Low-pass") + " cutoff " + sig(fc, 4) + " hertz.",
        xDomain: [1, 6],
        yDomain: [-40, 5],
        xLabel: "Frequency",
        xTicks: [
          { at: 1, label: "10 Hz" },
          { at: 2, label: "100" },
          { at: 3, label: "1 kHz" },
          { at: 4, label: "10 k" },
          { at: 5, label: "100 k" },
          { at: 6, label: "1 MHz" }
        ],
        yTicks: [
          { at: 0, label: "0 dB" },
          { at: -3, label: "−3" },
          { at: -20, label: "−20" },
          { at: -40, label: "−40" }
        ],
        hLines: [{ y: -3.0103, label: "−3 dB" }],
        vLines: [{ x: Math.log10(fc) }],
        series: [{ points: pts }]
      });

      var fSlow = fc / 10;
      var fFast = fc * 10;
      var span = 2 / fSlow;
      var inPts = [];
      var outPts = [];
      for (k = 0; k <= 240; k++) {
        var t = span * k / 240;
        var aSlow = 1;
        var aFast = 0.45;
        var inV = aSlow * Math.sin(2 * Math.PI * fSlow * t) + aFast * Math.sin(2 * Math.PI * fFast * t);
        var mSlow = magFn(fSlow, fc);
        var mFast = magFn(fFast, fc);
        var pSlow = high ? (Math.PI / 2 - Math.atan(fSlow / fc)) : -Math.atan(fSlow / fc);
        var pFast = high ? (Math.PI / 2 - Math.atan(fFast / fc)) : -Math.atan(fFast / fc);
        var outV = aSlow * mSlow * Math.sin(2 * Math.PI * fSlow * t + pSlow) + aFast * mFast * Math.sin(2 * Math.PI * fFast * t + pFast);
        inPts.push([t * 1000, inV]);
        outPts.push([t * 1000, outV]);
      }
      lineChart(time, {
        ariaLabel: "Filtered waveform. Slow tone at one tenth of the cutoff, fast tone at ten times the cutoff.",
        xDomain: [0, span * 1000],
        yDomain: [-1.8, 1.8],
        xLabel: "Time (ms)",
        series: [
          { name: "output", points: outPts },
          { name: "input", dash: "7 4", points: inPts }
        ]
      });
      var atFast = magFn(fFast, fc);
      var html = "";
      html += "<div>f<sub>c</sub> = 1 / (2π R C) = <strong>" + sig(fc, 4) + " Hz</strong>. At f<sub>c</sub> the magnitude is 1/√2 = 0.707, which is " + fixed(dbOf(1 / Math.sqrt(2)), 2) + " dB.</div>";
      html += "<div>The time plot adds a sine at f<sub>c</sub>/10 and a smaller one at 10 f<sub>c</sub>. " + (high ? "High-pass" : "Low-pass") + " gain at 10 f<sub>c</sub> is " + fixed(atFast, 3) + " (" + fixed(dbOf(atFast), 1) + " dB).</div>";
      live.innerHTML = html;
    }
    paint();
  }

  function mountImpedance(root) {
    root.appendChild(el("h3", null, "Impedance of R, C, and L versus frequency"));
    root.appendChild(el("p", { class: "try" }, root.getAttribute("data-prompt") ||
      "Watch the capacitor fall and the inductor rise. Resistance stays flat. Where a capacitor's curve crosses the resistor is near the cutoff of an RC filter built from those two parts."));
    var fields = {};
    function redraw() { paint(); }
    fields = addSliders(root, [
      { key: "r", label: "Resistance R", min: 10, max: 100000, step: 10, value: 1000, format: function (n) { return formatOhms(n); } },
      { key: "c", label: "Capacitance C", min: 1, max: 1000, step: 1, value: 100, format: function (n) { return fixed(n, 0) + " nF"; } },
      { key: "l", label: "Inductance L", min: 0.1, max: 100, step: 0.1, value: 10, format: function (n) { return fixed(n, 1) + " mH"; } }
    ], redraw);
    var plot = el("div", null);
    root.appendChild(plot);
    var live = el("div", { class: "readout", "aria-live": "polite" });
    root.appendChild(live);
    root.appendChild(el("p", { class: "noscript-note" }, "Solid black is R. Dashed blue is Xc = 1/(2πfC). Dotted black is XL = 2πfL. Both axes are logarithmic. Ideal parts: no ESR, no winding resistance."));

    function paint() {
      var r = fields.r.read();
      var c = fields.c.read() * 1e-9;
      var l = fields.l.read() * 1e-3;
      var rPts = [];
      var cPts = [];
      var lPts = [];
      var fMark = 1000;
      var yLo = Infinity;
      var yHi = -Infinity;
      for (var k = 0; k <= 80; k++) {
        var logf = 1 + (5 * k) / 80;
        var f = Math.pow(10, logf);
        var yr = Math.log10(r);
        var yc = Math.log10(xcOf(f, c));
        var yl = Math.log10(xlOf(f, l));
        rPts.push([logf, yr]);
        cPts.push([logf, yc]);
        lPts.push([logf, yl]);
        [yr, yc, yl].forEach(function (y) {
          if (y < yLo) yLo = y;
          if (y > yHi) yHi = y;
        });
      }
      yLo = Math.floor(yLo);
      yHi = Math.ceil(yHi);
      var yTicks = [];
      for (var e = yLo; e <= yHi; e++) {
        var label = e === 0 ? "1 Ω" : (e > 0 ? "10^" + e : "10^" + e);
        if (e === 3) label = "1 kΩ";
        if (e === 6) label = "1 MΩ";
        yTicks.push({ at: e, label: label });
      }
      logChart(plot, {
        ariaLabel: "At 1 kilohertz, R is " + formatOhms(r) + ", capacitive reactance " + formatOhms(xcOf(fMark, c)) + ", inductive reactance " + formatOhms(xlOf(fMark, l)) + ".",
        xDomain: [1, 6],
        yDomain: [yLo, yHi],
        xLabel: "Frequency",
        xTicks: [
          { at: 1, label: "10 Hz" },
          { at: 2, label: "100" },
          { at: 3, label: "1 kHz" },
          { at: 4, label: "10 k" },
          { at: 5, label: "100 k" },
          { at: 6, label: "1 MHz" }
        ],
        yTicks: yTicks,
        vLines: [{ x: 3 }],
        series: [
          { name: "R", points: rPts, dash: "none" },
          { name: "C", points: cPts, dash: "7 4", stroke: "#1d4ed8" },
          { name: "L", points: lPts, dash: "2 3" }
        ]
      });
      var html = "";
      html += "<div>At 1 kHz: R = " + formatOhms(r) + ", Xc = <strong>" + formatOhms(xcOf(fMark, c)) + "</strong>, XL = <strong>" + formatOhms(xlOf(fMark, l)) + "</strong>.</div>";
      html += "<div>An RC low-pass made from this R and C has f<sub>c</sub> = 1/(2πRC) = " + sig(fcRc(r, c), 4) + " Hz. On this plot that is where Xc crosses R.</div>";
      live.innerHTML = html;
    }
    paint();
  }

  registry["ohms-power"] = mountOhms;
  registry["voltage-divider"] = mountDivider;
  registry["led-limit"] = mountLed;
  registry["kvl-kcl"] = mountKvl;
  registry["rc-scope"] = mountRcScope;
  registry["rl-kickback"] = mountKick;
  registry["rc-filter"] = mountFilter;
  registry["impedance-plot"] = mountImpedance;


  registry["ldo-dissipation"] = mountLdo;
  registry["buck-converter"] = mountBuck;
  registry["ldo-vs-buck"] = mountCompare;

  function mountAll(scope) {
    var nodes = scope.querySelectorAll(".widget[data-widget]");
    Array.prototype.forEach.call(nodes, function (node) {
      if (node.getAttribute("data-mounted") === "true") return;
      var name = node.getAttribute("data-widget");
      if (!registry[name]) return;
      node.setAttribute("data-mounted", "true");
      registry[name](node);
    });
  }

  return {
    clamp: clamp,
    sig: sig,
    fixed: fixed,
    linearScale: linearScale,
    polar: polar,
    el: el,
    svgEl: svgEl,
    mountSlider: mountSlider,
    lineChart: lineChart,
    stackedBar: stackedBar,
    register: function (name, fn) { registry[name] = fn; },
    mountAll: mountAll,
    calc: {
      ldo: ldoCalc,
      junction: junction,
      buckCcm: buckCcm,
      buckDcm: buckDcm,
      ripple: ripple,
      buckPower: buckPower,
      ohmsPower: ohmsPower,
      parallelPair: parallelPair,
      dividerLoaded: dividerLoaded,
      preferredResistor: preferredResistor,
      ledLimit: ledLimit,
      resistorResult: resistorResult,
      twoNode: twoNode,
      rcSquare: rcSquare,
      rcSample: rcSample,
      xcOf: xcOf,
      xlOf: xlOf,
      fcRc: fcRc,
      lpMag: lpMag,
      hpMag: hpMag,
      dbOf: dbOf,
      kickVoltage: kickVoltage,
      diodeDecay: diodeDecay,
      E12: E12,
      E24: E24
    }
  };
});
