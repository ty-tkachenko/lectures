---
layout: practical
title: "Multimeter, a divider, and loading"
description: "What the lab recording will show: voltage in parallel, then a divider with and without a heavy load."
series: ee
module: 1
type: practical
level: intro
status: draft
practical_type: lab-measurement
reading: /ee/01-circuit-fundamentals/
practical_video:
chapters:
  - time: "0:00"
    seconds: 0
    title: "What not to do with the current jacks"
  - time: "1:30"
    seconds: 90
    title: "Voltage, current, and resistance, said out loud"
  - time: "4:00"
    seconds: 240
    title: "The unloaded divider"
  - time: "7:00"
    seconds: 420
    title: "The same node with a 10 kilohm load"
  - time: "10:00"
    seconds: 600
    title: "Why a 10 megohm meter barely moved it"
  - time: "12:00"
    seconds: 720
    title: "Takeaways"
---

## What you will see

A bench supply, three 10 kΩ resistors, and a handheld meter. Not a flight board, and not a scripted reading.

First, the three jobs of the meter, with the leads in the right holes. Voltage across a part. Current only in a gap you opened on purpose, and not in this circuit. Resistance only with the supply off.

Then the divider. Two 10 kΩ resistors from 5.0 V to 0 V. The middle node is predicted at 2.50 V. The meter is the only load, and it should not move the node by a millivolt you can see.

Then a third 10 kΩ from the middle node to 0 V. The prediction becomes 1.667 V. The picture on the meter should drop. That drop is the load, not a bad battery.

## Key numbers and formulas

Unloaded:

$$
V_{\mathrm{out}} = 5.0 \times \frac{10\,\mathrm{k}\Omega}{20\,\mathrm{k}\Omega} = 2.50\,\mathrm{V}
$$

With a 10 kΩ load, the bottom resistor becomes 5.0 kΩ:

$$
V_{\mathrm{out}} = 5.0 \times \frac{5}{15} = 1.667\,\mathrm{V}
$$

A meter at about 10 MΩ on the unloaded divider predicts 2.499 V. The 1.25 mV sag is the arithmetic. Most displays will still say 2.50 V. Say "about 10 MΩ" only if that is what the meter's manual says. If the manual says something else, use that number.

No measured voltage is quoted here, because this page is the companion to a recording that has not been made.

## What to look for

**Current jacks.** They stay empty for this recording. Say why: on a current range the meter is nearly a short, and across the supply the fuse opens.

**Unloaded node.** It should agree with 2.50 V to the resolution of the meter. If it does not, check that the supply is actually 5.0 V and that both resistors are about 10 kΩ with the supply off.

**Loaded node.** It should fall to about 1.67 V. If it stays at 2.5 V, the third resistor is not connected. If it falls much further, one resistor is the wrong value.

**Supply current.** Two 10 kΩ in series on 5 V draw 0.25 mA. With the load fitted, the top resistor has 5.0 − 1.667 = 3.333 V across it, so the supply current is 0.333 mA. The current limit can sit far above that. It is there so a short cannot cook a part.

## Takeaways

- Voltage leads go across the part. Current leads go in series, in a gap. Resistance waits until the supply is off.
- The divider formula without a load is 2.50 V here. With an equal load it is 1.667 V.
- A high-resistance meter is a gentle load. A resistor the size of R2 is not.
