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
        stroke: index === 0 ? "#111" : "#0000cc",
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
    specs.forEach(function (spec) {
      fields[spec[0]] = mountSlider(root, {
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
    var live = el("div", { class: "widget-readout", "aria-live": "polite" });
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
    specs.forEach(function (spec) {
      fields[spec[0]] = mountSlider(root, {
        label: spec[1], min: spec[2], max: spec[3], step: spec[4], value: spec[5],
        format: spec[6], onInput: redraw
      });
    });
    var plotHost = el("div", null);
    root.appendChild(plotHost);
    var live = el("div", { class: "widget-readout", "aria-live": "polite" });
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
      svg.appendChild(svgEl("path", { d: dI, fill: "none", stroke: "#0000cc", "stroke-width": "2.5" }));
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
      var cap2 = svgEl("text", { x: String(pad.l), y: "168", "font-size": "13", fill: "#0000cc" });
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
    specs.forEach(function (spec) {
      fields[spec[0]] = mountSlider(root, {
        label: spec[1], min: spec[2], max: spec[3], step: spec[4], value: spec[5],
        format: spec[6], onInput: redraw
      });
    });
    var host = el("div", null);
    root.appendChild(host);
    var live = el("div", { class: "widget-readout", "aria-live": "polite" });
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
      buckPower: buckPower
    }
  };
});
