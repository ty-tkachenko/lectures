---
layout: practical
title: "RF supply for a 1 W 915 MHz transmitter and its LNA"
description: "Draft design walkthrough: buck, pi filter, and two LDOs from a 3S pack."
series: ee
module: 5
level: intro
status: draft
practical_type: design-walkthrough
reading: /ee/05-power-conversion/
practical_video:
chapters:
  - time: "0:00"
    seconds: 0
    title: "What this supply has to feed"
  - time: "1:00"
    seconds: 60
    title: "Why supply ripple shows up on a transmitter and an LNA"
  - time: "2:30"
    seconds: 150
    title: "Three options, and the heat"
  - time: "5:00"
    seconds: 300
    title: "The chain that was chosen"
  - time: "7:30"
    seconds: 450
    title: "Headroom and dissipation"
  - time: "9:30"
    seconds: 570
    title: "What the schematic and layout still need to show"
  - time: "11:00"
    seconds: 660
    title: "How it will be checked"
  - time: "12:30"
    seconds: 750
    title: "Takeaways"
---

## What you will see

A whiteboard walkthrough of one supply, treated on its own: a 1 W transmitter at 915 MHz, the LNA in front of that radio, and a 3S lithium-ion pack. The draft's pack range is about 9 V at the low end to 12.6 V full. Both rails in the draft are 5 V. The transmitter path is the high-current one. The LNA path is the quiet one.

You will not see a whole vehicle, a power tree, or a finished board. The schematic, the layout, and any bench photo are still empty on purpose.

The chain the draft chose is a buck, then a pi filter, then two linear regulators:

1. A TPS62933F buck makes an intermediate rail at 5.4 V.
2. A pi filter, a ferrite bead plus two 22 µF capacitors, sits on that rail. The draft estimates about 40 dB of attenuation at the switching frequency. That estimate is not a measurement.
3. A TPS7A85A linear regulator makes the 5 V rail for the transmitter.
4. An LT3045 linear regulator makes the 5 V rail for the LNA.

The buck is the forced-continuous-conduction variant (TPS62933F). Texas Instruments' datasheet puts that variant in forced continuous conduction, so it keeps switching at the set frequency instead of skipping pulses when the load is light. The spread-spectrum feature on this family is on the other orderables, not on the F part. The spurs therefore sit at known frequencies. The datasheet input range is 3.8 V to 30 V and the current rating is 3 A, so a 9 V to 12.6 V pack and a load on the order of 1.2 A are inside those ratings. Those ratings are datasheet facts. They are not a test of this board.

## Key numbers and formulas

The reading page defines the symbols. Here they are used with the draft's numbers. Anything marked **derived** was calculated on this page from those numbers. The rounded figures the draft itself uses are marked **draft**.

### Why the ripple matters

A wiggle on the transmitter supply becomes [sidebands]({{ '/glossary/#sideband' | relative_url }}) around the carrier: if the supply moves at frequency $$f_m$$, energy shows up near $$f_c + f_m$$ and $$f_c - f_m$$. That can raise [EVM]({{ '/glossary/#evm' | relative_url }}) and push energy toward a band edge. A wiggle on the LNA supply modulates the amplifier's gain and can worsen [noise figure]({{ '/glossary/#noise-figure' | relative_url }}). The RF series goes further. This page only needs the supply-side reason for keeping those two rails quiet.

### Option: a linear regulator straight from the pack

The draft compares a linear regulator from the nominal pack voltage, 11.1 V, straight to 5 V, at about 1.2 A.

Step 1. Drop:

$$
11.1\,\mathrm{V} - 5\,\mathrm{V} = 6.1\,\mathrm{V}
$$

Step 2. Heat, ignoring quiescent current because it is tiny next to 1.2 A:

$$
P_D = 6.1\,\mathrm{V} \times 1.2\,\mathrm{A} = 7.32\,\mathrm{W}
$$

**Derived:** 7.32 W. **Draft:** about 7 W. That is a heater, not a regulator you want in an airframe.

### Option: a buck straight to the 5 V rail

Efficient. The ripple and the switching spikes remain on the transmitter supply and, if you shared the rail, on the LNA. The draft does not take this option for the sensitive loads.

### Option taken: buck to 5.4 V, filter, then LDOs to 5 V

Headroom of the transmitter regulator:

$$
5.4\,\mathrm{V} - 5.0\,\mathrm{V} = 0.4\,\mathrm{V}
$$

**Draft:** dropout of that regulator is about 150 mV, which is 0.15 V. Margin, **derived**:

$$
0.4\,\mathrm{V} - 0.15\,\mathrm{V} = 0.25\,\mathrm{V}
$$

Heat in the transmitter regulator. The draft uses 1.16 A for this product (and about 1.2 A in the straight-LDO comparison above). Both are kept as written. This page does not invent a story for the 0.04 A difference.

$$
P_D = 0.4\,\mathrm{V} \times 1.16\,\mathrm{A} = 0.464\,\mathrm{W}
$$

**Derived:** 0.464 W. **Draft:** about 0.46 W. Against about 7 W for the straight linear regulator, the pre-regulator is why this chain is possible.

**Draft:** the post-regulator chain costs about an extra 0.5 W from the pack compared with a buck that made 5 V directly. The draft does not spell out the buck efficiency behind that 0.5 W, so this page does not re-derive it. Treat 0.5 W as the draft's figure.

### The filter estimate

**Draft:** the pi filter is estimated at about 40 dB at the switching frequency. **Derived**, the meaning of 40 dB as a voltage ratio:

$$
10^{(40/20)} = 10^{2} = 100
$$

So the draft's estimate is a factor of about 100 in ripple voltage at that frequency. This page does not have a measured ripple to multiply by 100. Forty decibels is not a lab result.

The switching frequency itself is not stated in the notes this page is allowed to use. The TPS62933 family can be set from 200 kHz to 2.2 MHz. That is a datasheet range, not the frequency this design was tuned to.

## What to look for

When the recording exists, watch the whiteboard for the 7.32 W versus 0.46 W comparison, and for the 0.4 V of headroom drawn next to 0.15 V of dropout.

On a future scope test, the plan is a board with a 0 Ω jumper that bypasses the linear regulator. Inject a tone onto the supply and compare the transmitter's sidebands with the regulator fitted and with it bypassed. Look for the tone moving the sidebands, and for those sidebands shrinking when the regulator is in circuit. No such plot exists yet.

<div class="placeholder">
<p><strong>Schematic.</strong> Placeholder. A schematic of this chain (buck, pi filter, transmitter LDO, LNA LDO) goes here after review. Not drawn on this page.</p>
</div>

<div class="placeholder">
<p><strong>Layout.</strong> Placeholder. Part placement, the buck hot loop, and how the filter and the linear regulators are grounded go here. Not drawn on this page.</p>
</div>

<div class="placeholder">
<p><strong>Bench results.</strong> Placeholder. No board has been measured for this page. Do not add numbers here until a real test is done. The verification plan above has not been run.</p>
</div>

## What I would change

The open question in the draft is whether the transmitter's linear regulator could come out later, if the bypass test shows the pi filter alone keeps the sidebands small enough. That is not a decision. It waits on the test.

## Takeaways

- A linear regulator from an 11.1 V pack to 5 V at about 1.2 A is about 7 W of heat. The same current after a 5.4 V pre-regulator is about 0.46 W.
- 0.4 V of headroom against about 0.15 V of dropout is the margin the draft is counting on. It is not a measurement of dropout on a built board.
- Forced continuous conduction, and not using a spread-spectrum variant, keeps the spurs at frequencies you can filter and later measure.
- The filter's 40 dB figure is an estimate in the draft. It means a factor of about 100 in voltage. It is not a scope capture.
- Schematic, layout, and bench results are still empty.
