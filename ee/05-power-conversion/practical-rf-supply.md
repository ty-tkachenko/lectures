---
layout: practical
title: "Feeding a 1 W PA and a low-noise LNA from a 3S pack"
description: "Draft PDR walkthrough of decision D-38: the EYE RF supply, buck plus pi filter plus two LDOs."
series: ee
module: 5
type: practical
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
    title: "Why ripple shows up on a PA and an LNA"
  - time: "2:30"
    seconds: 150
    title: "Three options, and the heat"
  - time: "5:00"
    seconds: 300
    title: "The chain D-38 chose"
  - time: "7:30"
    seconds: 450
    title: "Headroom, dissipation, loading, and the half watt"
  - time: "9:30"
    seconds: 570
    title: "Design detail: the PA enable gate"
  - time: "10:30"
    seconds: 630
    title: "Schematic and layout, after the coupon"
  - time: "11:30"
    seconds: 690
    title: "How C1-12 will check it"
  - time: "13:00"
    seconds: 780
    title: "Takeaways and the open question"
---

## What you will see

A whiteboard walkthrough of one decision, D-38, from the EYE power architecture (project HORUS, the Vehicle Camera Unit). The note this page follows is revision v0.6, dated 2026-10-06. This is a PDR-stage design. The topology is the baseline in that note. The schematic, the layout, and the bench results come after the coupon build. No number below is a measurement of a built board.

The job is to feed a 1 W power amplifier and a low-noise LNA from a 3S pack. In the note, cruise transmit is +30 dBm. One watt is +30 dBm by definition ($$10\log_{10}(1/0.001) = 30$$). The pack node is VSYS, 9.0–12.6 V, from a 3S1P 18650. The roll-up in the note uses 11.1 V when it turns watts at VSYS into amperes.

## Requirements

The PA and the LNA must not be fed straight from a buck. That is the requirement Tymur raised, and D-38 is the baseline that closes it (the note marks the earlier open item closed on 2026-10-02).

Why the PA cares: ripple on the PA drain becomes AM/PM [sidebands]({{ '/glossary/#sideband' | relative_url }}) at the carrier plus and minus the switching frequency, and at the harmonics of that switching frequency. Those sidebands raise [EVM]({{ '/glossary/#evm' | relative_url }}) and the band-edge spectrum.

Why the LNA cares: ripple on the LNA supply modulates its gain and its [noise figure]({{ '/glossary/#noise-figure' | relative_url }}), and that shows up on the receive path.

The two loads are not the same current. The note's PA rail consumers are two TQP7M9106 devices (quiescent 455 mA each, marked datasheet; about 0.52 A each at +31.4 dBm; about 0.7 A each near P1dB) plus a SKY65017 driver at 0.12 A (datasheet). The LNA is a SKY67150, 70–95 mA (datasheet).

## Options considered

Three ways to make 5 V for those loads. Only the third is D-38.

### Buck straight to the PA

The note's old scheme was a TPS62933F straight onto the gated PA rail, and a second TPS62933F for a shared 5 V rail. D-38 removes that scheme. A buck is efficient, and the ripple and the switching spurs stay on the PA drain. That fails the requirement above. The note does not give a separate heat number for this rejected option. This page does not invent one.

### LDO straight from VSYS

A linear regulator from the pack to 5 V spends the whole drop in the package. The note's flight roll-up uses 11.1 V at VSYS, and the PA rail's typical current in the same note is 1.16 A. That 1.16 A is about 1.2 A. The arithmetic, **derived** on this page:

$$
11.1\,\mathrm{V} - 5.0\,\mathrm{V} = 6.1\,\mathrm{V}
$$

$$
P_D = 6.1\,\mathrm{V} \times 1.16\,\mathrm{A} = 7.076\,\mathrm{W}
$$

**Derived:** 7.076 W, about 7 W. The note does not print this product. It is the comparison that makes the pre-regulator worth doing. About 7 W in one package is a heater, not a regulator you want in an airframe.

### Buck, then a filter, then LDOs

This is D-38. A buck makes a 5.4 V intermediate, a filter knocks the switching ripple down, and a low-dropout regulator on each sensitive rail spends only the last 0.4 V. The note's figure for the PA regulator is about 0.46 W, worked below, against the derived 7.076 W for the straight linear regulator.

## Topology and part selection

```
VSYS 9.0–12.6 V
  → TPS62933F buck → RF_PRE 5.4 V
  → LC π-filter (ferrite bead + 2×22 µF)
  → TPS7A85A LDO → PA_5V 5.0 V
  → LT3045 LDO  → LNA_5V 5.0 V
```

The buck is the TPS62933F, set for forced continuous conduction (FCCM in the note: fixed frequency, forced PWM). Spread spectrum is off, so the spurs sit at predictable frequencies and a filter can be aimed at them. The note rates this part at 3 A. Enable is PGOOD_ALL, the supervisor's "all rails in tolerance" signal.

RF_PRE is 5.4 V ±3%. Its only loads are the two LDOs. Typical / maximum current in the note: 1.24 A / 1.62 A. The roll-up estimates efficiency at 0.90. That 0.90 is an estimate in the note, not a measurement of this converter.

The π-filter is a ferrite bead plus two 22 µF capacitors. The note estimates about 40 dB at the switching frequency. That is an estimate in the note. It is not a spectrum plot. The switching frequency this design is tuned to is not stated in the note, so this page does not pick one.

PA_5V is 5.0 V ±3% from a TPS7A85A. The note's datasheet column for that part: 4 A, 150 mV typical dropout at 4 A, 40 dB [PSRR]({{ '/glossary/#psrr' | relative_url }}) at 500 kHz, 6.5 V maximum input. Typical / maximum current: 1.16 A / 1.52 A. The 5.4 V intermediate is under the 6.5 V maximum input. That maximum is not the dropout number. Dropout is the 150 mV figure, and the note quotes it at 4 A, not at 1.16 A.

LNA_5V is 5.0 V ±3% from an LT3045. The note's datasheet column: 500 mA, 0.8 µVrms, 76 dB PSRR at 1 MHz, 20 V maximum input. Typical / maximum current: 0.08 A / 0.10 A. Enable is LNA_EN, and that pin replaces a load switch on the LNA.

The note says the π-filter's attenuation and the LDO PSRR add. It lists them at different frequencies (the filter at the switching frequency, the TPS7A85A at 500 kHz, the LT3045 at 1 MHz). This page does not add those decibel figures into one number.

## Key calculations

Anything marked **derived** was calculated on this page from numbers printed in the note. The note's own rounded figures are marked **note**.

### Headroom against dropout

$$
5.4\,\mathrm{V} - 5.0\,\mathrm{V} = 0.4\,\mathrm{V}
$$

The note uses this 0.4 V as the drop in the dissipation product below. Dropout, from the note's datasheet column, is 150 mV typical at 4 A, which is 0.15 V. Margin, **derived**, using that 4 A figure even though the rail's typical current is 1.16 A:

$$
0.4\,\mathrm{V} - 0.15\,\mathrm{V} = 0.25\,\mathrm{V}
$$

**Derived:** 0.25 V of margin if dropout really is 150 mV at this current. The note does not print 0.25 V, and it does not give dropout at 1.16 A.

### Dissipation

The note prints the PA product itself:

$$
P_D \approx 0.4\,\mathrm{V} \times 1.16\,\mathrm{A} \approx 0.46\,\mathrm{W}
$$

**Derived**, the same product without the rounding: $$0.4 \times 1.16 = 0.464\,\mathrm{W}$$. **Note:** ≈ 0.46 W.

The LNA regulator, **note:** about 0.03 W. **Derived** from the same 0.4 V drop and the note's typical LNA current:

$$
0.4\,\mathrm{V} \times 0.08\,\mathrm{A} = 0.032\,\mathrm{W}
$$

**Derived sum** of the two dissipation lines: $$0.46 + 0.03 = 0.49\,\mathrm{W}$$, using the note's rounded 0.46 W and 0.03 W. That is the half-watt class of the cost below.

### Where 1.16 A comes from

**Derived** check against the consumer currents in the note, at the +31.4 dBm operating point the note quotes (not a new measurement):

$$
2 \times 0.52\,\mathrm{A} + 0.12\,\mathrm{A} = 1.16\,\mathrm{A}
$$

That matches the typical PA_5V current. The same check at the note's "near P1dB" currents:

$$
2 \times 0.7\,\mathrm{A} + 0.12\,\mathrm{A} = 1.52\,\mathrm{A}
$$

That matches the maximum PA_5V current. The note also says typical cruise is +30 dBm. It does not print a separate current at +30 dBm. This page keeps both sentences and does not invent the missing one.

### Rail loading

The note's "max load" column is the maximum current divided by the regulator rating.

$$
1.62\,\mathrm{A} / 3\,\mathrm{A} = 0.54 = 54\%
$$

$$
1.52\,\mathrm{A} / 4\,\mathrm{A} = 0.38 = 38\%
$$

$$
0.10\,\mathrm{A} / 0.5\,\mathrm{A} = 0.20 = 20\%
$$

**Note:** RF_PRE 54%, PA_5V 38%, LNA_5V 20%. The divisions above are **derived** and match those three figures.

### What the filter estimate means

**Note:** about 40 dB at the switching frequency. **Derived**, 40 dB as a voltage ratio:

$$
10^{(40/20)} = 100
$$

So the estimate is a factor of about 100 in ripple voltage at that frequency. The note does not give a ripple amplitude to multiply by 100. Forty decibels is not a lab result.

### Cost at VSYS

**Note**, in the summary of D-38: the chain costs about +0.5 W at VSYS. **Note**, in the D-38 section: LDO dissipation ≈ 0.46 W on the PA plus about 0.03 W on the LNA, and the flight total moves from 18.1 W to 18.7 W at VSYS (27.6 W to 27.8 W in the all-maximum column). The same summary's flight roll-up is 18.1 W typical, and it says the workbook still uses 18.7 W. The **derived** sum 0.49 W sits next to the summary's +0.5 W. The 18.1-to-18.7 sentence is a 0.6 W move. This page does not invent a reconciliation. Both sentences stay as written. The note also says the bill of materials is +$9 net. That dollar figure is the note's, not a sum done here.

The roll-up table estimates the RF_PRE branch, LDOs included, at 6.70 W / 8.75 W out and 7.44 W / 9.72 W in, at the 0.90 efficiency estimate. **Derived** check: $$6.70 / 0.90 = 7.44$$ and $$8.75 / 0.90 = 9.72$$, matching the table. Those watts are the whole RF branch in the flight roll-up, not the 0.46 W of LDO heat.

## Design detail: the PA enable

Aside from the converter math. The TPS7A85A enable is a hardware AND gate:

$$
\mathrm{EN} = \mathrm{FW\_PA\_EN} \;\mathrm{AND}\; \mathrm{PGOOD\_ALL}
$$

FW_PA_EN is a processor GPIO with a pull-down. Firmware sets it after boot. PGOOD_ALL is the supervisor. The regulator's power-good output is available to firmware. The LNA regulator is separate: its enable is LNA_EN. The buck's enable is PGOOD_ALL, so the 5.4 V rail comes up with the rest of the "rails good" signal, and the PA rail waits for firmware as well.

The note's bias sequence says PA_5V itself stays up during flight. What the transmit/receive turnaround gates is PA bias, not this regulator's enable.

## Schematic

<div class="placeholder">
<p><strong>Coming after the coupon build.</strong> No schematic is on this page. The drawing that belongs here is the D-38 chain only: TPS62933F from VSYS to RF_PRE, the ferrite and the two 22 µF capacitors, the TPS7A85A to PA_5V, the LT3045 to LNA_5V, and the enable pins named above. Not drawn yet.</p>
</div>

## Layout

<div class="placeholder">
<p><strong>Coming after the coupon build.</strong> No layout is on this page. The drawing that belongs here is the buck hot loop and its input capacitor, where the π-filter sits relative to the two LDOs, and the copper under the TPS7A85A that has to carry about half a watt. Not drawn yet.</p>
</div>

## Bench results

<div class="placeholder">
<p><strong>Coming after the coupon build.</strong> There are no measured sidebands, no measured EVM, no measured ripple, and no thermal photo on this page. Do not add numbers here until the coupon test has been run.</p>
</div>

The planned check is already named. The C1 coupon keeps a 0 Ω bypass across the PA LDO. Test C1-12, supply pushing, injects a tone on PA_5V from 100 kHz to 2.2 MHz and measures sideband level, EVM, and band edge at +30 dBm, with the LDO fitted and with the LDO bypassed. That test verifies the D-38 baseline. It also produces the data for the open question below. It has not been run for this page.

## What I'd change

Only what the note itself leaves open.

The flight PA LDO could be removed later if C1-12 shows the π-filter alone keeps the sidebands, EVM, and band edge acceptable. The note says the test gives that data. It is not a decision. D-38, with the LDO fitted, is the baseline.

The flight-power figures this chain sits inside, 18.1 W typical and the 18.7 W still used in the workbook, are planning estimates. The note says an XPE run and the C1/C2 coupon data replace them. This page does not treat 18.1 W or +0.5 W as a measured vehicle power.

## Takeaways

- Ripple on the PA drain becomes sidebands at the carrier ± the switching frequency and raises EVM and the band edge. Ripple on the LNA supply modulates gain and noise figure.
- A linear regulator from 11.1 V to 5 V at the note's 1.16 A is 7.076 W, derived, about 7 W. The same current after the 5.4 V pre-regulator is the note's ≈ 0.46 W.
- Headroom is 0.4 V. The datasheet dropout quoted in the note is 150 mV typical at 4 A. The 0.25 V margin is derived, and it is not a dropout measured at 1.16 A.
- FCCM with spread spectrum off keeps the spurs at predictable frequencies. The π-filter's ~40 dB at the switching frequency is an estimate: a factor of 100 in voltage, derived, with no ripple amplitude in the note to multiply.
- Max loading in the note is 54% on the 3 A buck, 38% on the 4 A PA LDO, and 20% on the 0.5 A LNA LDO. The cost the summary states is about +0.5 W at VSYS.
- PA_5V enable is FW_PA_EN AND PGOOD_ALL. Schematic, layout, and bench results come after the coupon build. Whether the PA LDO can come off later waits on C1-12.
