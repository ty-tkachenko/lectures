---
layout: practical
title: "RC step, a low-pass, and coil kickback"
description: "What the lab recording will show: a measured time constant, a measured cutoff, and a diode clamp at low voltage."
series: ee
module: 2
type: practical
level: intro
status: draft
practical_type: lab-measurement
reading: /ee/02-capacitors-and-inductors/
practical_video:
chapters:
  - time: "0:00"
    seconds: 0
    title: "Safety and the three checks"
  - time: "1:30"
    seconds: 90
    title: "RC step and the 63 percent point"
  - time: "5:00"
    seconds: 300
    title: "Low-pass, finding minus 3 dB"
  - time: "8:30"
    seconds: 510
    title: "Coil with the diode fitted"
  - time: "11:00"
    seconds: 660
    title: "One look with the diode lifted"
  - time: "13:00"
    seconds: 780
    title: "Takeaways"
---

## What you will see

A function generator, a scope, a resistor, a capacitor, then a small coil and a diode on a current-limited 5 V supply. Not a flight board. Nothing on this page is a measured spike.

First, 10 kΩ in series with 100 nF. A slow square wave, 0 to 5 V. The capacitor voltage curves. The time from the edge to 63% of the step is the time constant. The ideal number is 1.00 ms. Capacitor tolerance can move it. Say the number the cursors read. Do not aim the cursors at 1.00 ms and pretend.

Second, 1.6 kΩ and 100 nF as a low-pass. A sine wave. Find the frequency where the output amplitude is 0.707 times the input. The ideal cutoff is 995 Hz.

Third, a small coil at 5 V and under 100 mA, diode across the coil first. The switch node should sit about one diode drop above the supply while the current decays. Then one shot with the diode lifted, scope range already high, and write down the peak the scope shows. The 200 V figure on the reading page is a 1 mH, 0.2 A, 1 µs model. It is not a prediction for this coil.

## Key numbers and formulas

$$
\tau = R C = 10\,\mathrm{k}\Omega \times 100\,\mathrm{nF} = 1.00\,\mathrm{ms}
$$

Sixty-three percent of a 5 V step is 3.2 V. That is the cursor target for τ, not a measurement.

$$
f_c = \frac{1}{2 \pi \times 1600 \times 100 \times 10^{-9}} = 995\,\mathrm{Hz}
$$

At that frequency the amplitude ratio is $$1/\sqrt{2} = 0.707$$, which is $$-3\,\mathrm{dB}$$.

With the diode, the reading page's model clamp is the supply plus about 0.7 V. Use the diode drop you want to assume, and say that you assumed it. The undioded peak is whatever the screen says during the recording.

## What to look for

**RC edge.** One cursor on the step, one where the capacitor crosses about 3.2 V. If the curve is almost square, the frequency is high or you are probing the generator instead of the capacitor. If it never rises, the ground clip is not on the capacitor's ground.

**Minus 3 dB.** Keep the input amplitude fixed while you sweep. 0.707 times that input is the target, not a fixed number of millivolts from memory. Generator output impedance in series with 1.6 kΩ will shift the cutoff. Say so if the generator is 50 Ω and you did not buffer it.

**Diode polarity.** Cathode toward the supply side of the coil. Backwards, the diode conducts while the switch is on and the supply current-limits. That is a clue, not a clamp.

**Undioded spike.** One shot. Read the peak off the screen. If the scope was on a 5 V range, you did not measure the spike. You measured the fact that the range was too small.

## Takeaways

- τ is the time to 63% of the step. Five time constants is the settle.
- Cutoff is where the output is 0.707 of the input, not where the waveform "looks smaller."
- The diode is across the coil before you go hunting for a spike. The spike you then see is a measurement. The 200 V model is not.
