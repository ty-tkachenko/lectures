# Recording outlines — power conversion

Not published. Jekyll ignores files whose names start with `_`.

Two recordings, each about 8–15 minutes. Say the part numbers and the arithmetic out loud. Do not read a fake measurement. If a board is not built, say so.

## 1. Design walkthrough — 1 W PA and LNA from a 3S pack

**Title to say:** Feeding a 1 W PA and a low-noise LNA from a 3S pack. Decision D-38 on the Vehicle Camera Unit (project HORUS/EYE). The note is v0.6, 2026-10-06. This is PDR. Schematic, layout, and bench results come after the coupon build.

**Say the names.** VSYS, RF_PRE, PA_5V, LNA_5V, D-38, C1, C1-12, and the PA enable gate are the point of this recording. Do not tour the rest of the power tree, the other rails, or the vehicle bus. Do not invent a switching frequency, a ripple amplitude, or a measured sideband.

**Total: 13:30.**

| Time | Duration | Shot / talking point |
| --- | --- | --- |
| 0:00 | 1:00 | On camera: EYE / HORUS, D-38, a 1 W PA (+30 dBm cruise in the note) and a SKY67150 LNA, VSYS 9.0–12.6 V from a 3S1P pack. PDR. No measurements yet. |
| 1:00 | 1:30 | Why ripple matters. PA drain ripple becomes sidebands at the carrier ± the switching frequency, and at harmonics, which raises EVM and the band edge. LNA supply ripple modulates gain and noise figure. |
| 2:30 | 2:30 | Three options. Buck straight to the PA: the old scheme the note removed; ripple stays on the drain; do not invent its heat. Straight LDO: 11.1 − 5.0 = 6.1 V, times the note's 1.16 A = 7.076 W, derived, about 7 W. The note does not print 7 W. Chosen: buck to 5.4 V, π-filter, then LDOs, about 0.46 W in the PA LDO. |
| 5:00 | 2:30 | The chain. TPS62933F, FCCM, fixed frequency, spread spectrum off, 3 A, EN = PGOOD_ALL, efficiency estimate 0.90. Ferrite + 2×22 µF, note's estimate ~40 dB at fsw. Say "estimate", and that 40 dB is a factor of 100. Do not name an fsw. TPS7A85A to PA_5V. LT3045 to LNA_5V. |
| 7:30 | 2:00 | Headroom 5.4 − 5.0 = 0.4 V. Dropout in the note is 150 mV typical at 4 A, not at 1.16 A. Derived margin 0.25 V. Heat 0.4 × 1.16 = 0.464 W; the note says ≈ 0.46 W. LNA ~0.03 W; derived 0.4 × 0.08 = 0.032 W. Loading 54%, 38%, 20% of rating at the maximum currents. Cost in the summary ≈ +0.5 W at VSYS. Mention the note's 18.1 → 18.7 W sentence and do not reconcile it with +0.5 W. |
| 9:30 | 1:00 | Design detail, as an aside: PA_5V enable is FW_PA_EN AND PGOOD_ALL. LNA enable is LNA_EN. PA_5V stays up in flight; the turnaround gates bias, not this regulator. |
| 10:30 | 1:00 | Schematic and layout are coming after the coupon build. Say "not drawn yet". Talk through what the drawing must show: hot loop, input cap, where the filter sits, copper for about half a watt. Do not hold up a different board. |
| 11:30 | 1:30 | Verification plan only. C1 keeps a 0 Ω bypass across the PA LDO. C1-12 injects a tone on PA_5V from 100 kHz to 2.2 MHz and compares sidebands, EVM, and band edge at +30 dBm, LDO fitted versus bypassed. Open question: the PA LDO might come off later if that test says the filter is enough. Not a decision. |
| 13:00 | 0:30 | Takeaways: about 7 W versus about 0.46 W, predictable spurs, 40 dB is an estimate, nothing measured yet. |

## 2. Lab session — heat, then the scope ground

**Total: 14:00.**

Use whatever LDO and buck are actually on the bench. Say the part numbers. Write down the numbers you measure. Do not aim at a scripted temperature or a scripted millivolt.

| Time | Duration | Shot / talking point |
| --- | --- | --- |
| 0:00 | 1:00 | Two measurements: LDO case temperature versus load, then buck output ripple with two probe grounds. Current limit on the supply. Both the regulator and the resistor will get hot. |
| 1:00 | 2:00 | Show the supply, the LDO, the resistor, the thermocouple or thermal camera. Set Vin a couple of volts above Vout for the first point. State the resistor value and the expected current Vout/R before enabling the output. |
| 3:00 | 3:30 | Step the load. Each step: Vin, Vout (still in regulation?), current, air temperature, case temperature. Leave time for the camera or the couple to settle. If Vout sags, stop and say dropout or current limit. |
| 6:30 | 1:30 | Point at the package, not the resistor, as the regulator's heat. Say the camera or the couple reads the case, and the widget's TJ is the junction. Put the same numbers in the LDO widget. Compare direction, not a fake match. If the board is hotter than the prediction, say θJA is worse than the number you typed. |
| 8:00 | 1:30 | Move to a buck board. Probe the output capacitor with the long ground lead. Show the spike at the switching edge. Do not quote a number you did not just read off the screen. |
| 9:30 | 2:00 | Same node, short ground spring, same scope bandwidth. Show the spike shrink. |
| 11:30 | 1:30 | Explain the loop: the long lead circles area next to a fast switch node and adds a magnetic kick. The spring is the measurement. The long lead is the mistake. Ground at the capacitor, not at a far screw. |
| 13:00 | 1:00 | Takeaways, and point students at the hands-on table on the reading page for the LDO part they can do without this recording. |
