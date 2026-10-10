# Recording outlines — regulators

Not published. Jekyll ignores files whose names start with `_`.

Two recordings, each about 8–15 minutes. Say the part numbers and the arithmetic out loud. Do not read a fake measurement. If a board is not built, say so.

## 1. Design walkthrough — RF supply

**Title to say:** a supply for a 1 W, 915 MHz transmitter and its LNA, from a 3S pack.

**Do not say:** project or vehicle names, decision IDs, board or test IDs, other rails, a power tree, total vehicle power, sequencing, or a PA-enable gate.

**Total: 13:00.**

| Time | Duration | Shot / talking point |
| --- | --- | --- |
| 0:00 | 1:00 | On camera, one sentence: 1 W at 915 MHz, an LNA, a 3S pack from about 9 V to 12.6 V, both rails 5 V. No system diagram. |
| 1:00 | 1:30 | Why ripple matters. Transmitter supply wobble becomes sidebands at the carrier ± the wobble, which hurts EVM and the band edge. LNA supply wobble moves gain and noise figure. Stop there. |
| 2:30 | 2:30 | Three options on the whiteboard. Straight LDO: 11.1 − 5 = 6.1 V, times about 1.2 A = 7.32 W, draft says ~7 W. Buck straight to 5 V: efficient, ripple stays on the radio. Buck to 5.4 V then LDOs: the chosen chain. |
| 5:00 | 2:30 | The chain. TPS62933F to 5.4 V. It is the forced-continuous part, not a spread-spectrum orderable, so spurs stay put. Datasheet: 3.8–30 V, 3 A. Then ferrite + 2×22 µF, draft estimate ~40 dB at fsw (say "estimate", and that 40 dB is a factor of 100). TPS7A85A for the transmitter 5 V. LT3045 for the LNA 5 V. |
| 7:30 | 2:00 | Headroom 5.4 − 5.0 = 0.4 V versus ~150 mV dropout, margin 0.25 V. Heat 0.4 × 1.16 A = 0.464 W, draft ~0.46 W. Mention the draft's extra ~0.5 W from the pack and do not invent the efficiency behind it. Mention 1.2 A and 1.16 A are both as written. |
| 9:30 | 1:30 | Schematic and layout are not on the page yet. Talk through what the drawing must show: buck hot loop, input cap, where the filter sits, separate LDOs. Do not hold up a board that is a different project. If you have no drawing, say "not drawn yet". |
| 11:00 | 1:30 | Verification plan only. A test board with a 0 Ω jumper that bypasses the LDO. Inject a tone on the supply. Compare sidebands with the LDO fitted and with it bypassed. Open question: the transmitter LDO might come off later if that test says the filter is enough. Not a decision. |
| 12:30 | 0:30 | Takeaways: ~7 W versus ~0.46 W, predictable spurs, 40 dB is an estimate, no measurements yet. |

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
