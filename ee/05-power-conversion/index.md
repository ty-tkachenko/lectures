---
layout: module
title: "Power Conversion: Linear vs Switching"
short_title: Power
description: "Why a rocket regulates its battery, how an LDO turns spare volts into heat, and how a buck avoids that heat."
series: ee
module: 5
type: module
level: intro
question: "Why does a 3.3 V flight computer get hot when it runs from a higher pack voltage, and when should the regulator switch instead of throwing the spare volts away as heat?"
prereqs:
  - text: "Voltage, current, and Ohm's law (V = IR)"
    url: "https://www.allaboutcircuits.com/textbook/direct-current/chpt-2/voltage-current-resistance-relate/"
  - text: "Electric power, P = V times I"
    url: "https://www.allaboutcircuits.com/textbook/direct-current/chpt-2/calculating-electric-power/"
  - text: "What a 2S or 3S pack voltage means"
    url: "/glossary/#series-pack"
  - text: "The idea of an inductor and a capacitor (what they store, not the differential equations)"
    url: "https://www.allaboutcircuits.com/textbook/direct-current/chpt-15/magnetic-fields-and-inductance/"
widgets:
  - ldo-dissipation
  - buck-converter
  - ldo-vs-buck
practicals:
  - title: "Feeding a 1 W PA and a low-noise LNA from a 3S pack"
    practical_type: design-walkthrough
    url: /ee/05-power-conversion/practical-rf-supply.html
  - title: "Measuring LDO heat and buck ripple"
    practical_type: lab-measurement
    url: /ee/05-power-conversion/practical-lab.html
---

A [voltage regulator]({{ '/glossary/#voltage-regulator' | relative_url }}) holds one rail of a rocket at a steady voltage while the pack sags and the load wakes up. This module is about the two common ways to do that, and about the heat you get if you pick the wrong one.

## 1. Why a rocket bothers to regulate

### The idea

A lithium-ion pack is not a fixed supply. A [series pack]({{ '/glossary/#series-pack' | relative_url }}) of two cells (2S) is about 8.4 V when full and about 7.4 V at the usual nominal point. Three cells (3S) are about 12.6 V full and 11.1 V nominal. A flight computer, a sensor, or a radio often wants 3.3 V or 5 V and will misbehave if the rail wanders.

The regulator's job is to stand between the pack and that circuit. Two families do it. A [linear regulator]({{ '/glossary/#linear-regulator' | relative_url }}) throws the spare voltage away as heat. A [buck converter]({{ '/glossary/#buck-converter' | relative_url }}) chops the input and averages it, so most of the pack's power reaches the load.

### The math

There is no single formula yet. The picture to keep is [power]({{ '/glossary/#power' | relative_url }}):

$$
P = V I
$$

$$P$$ is power in watts (W), $$V$$ is voltage in volts (V), and $$I$$ is current in amperes (A). Every heat number later in this module is this product, applied to the part that is dropping voltage.

Worked check. A 3.3 V computer drawing 0.20 A takes

$$
P = 3.3\,\mathrm{V} \times 0.20\,\mathrm{A} = 0.66\,\mathrm{W}
$$

from the rail. That 0.66 W is what the load wants. A linear regulator fed from a higher pack voltage will pull *more* than 0.66 W from the pack. The difference is heat.

## 2. Linear regulators and LDOs

### The idea

A linear regulator is a controlled resistor in series with the load. The series transistor is the [pass element]({{ '/glossary/#pass-element' | relative_url }}). A feedback divider watches the output and the chip drives the pass element until the output sits at the set voltage.

An [LDO]({{ '/glossary/#ldo' | relative_url }}), a low-dropout regulator, is a linear regulator that can still do this when the input is only a little above the output. That "little" is the [dropout voltage]({{ '/glossary/#dropout' | relative_url }}). If the pack falls closer than that, the output sags and the part is no longer regulating.

![Diagram of a linear regulator. A pass element sits between Vin and Vout. An error amplifier compares a feedback divider with a reference and drives the pass element. The load returns to 0 V. Heat is the voltage dropped in the pass element times the load current.](img/ldo-pass.svg){: .figure}

*The pass element is in series with the load. Feedback tells it how hard to conduct. Whatever voltage it drops, at the load current, becomes heat in the package.*

Dropout is why a single cell is a bad way to make 3.3 V with an ordinary LDO, and why a 2S pack usually is not. Suppose the dropout at this current is 1.0 V, a round number for an older 1117-style part. Read the real number from the datasheet. The input must stay at or above

$$
V_{\mathrm{out}} + V_{\mathrm{dropout}} = 3.3\,\mathrm{V} + 1.0\,\mathrm{V} = 4.3\,\mathrm{V}
$$

A single cell from 4.2 V full down toward 3.6 V is already under 4.3 V for much of the flight, so a 3.3 V LDO drops out. A 2S pack, even near empty around 6 V, still has $$6.0 - 3.3 = 2.7\,\mathrm{V}$$ of headroom, which is more than 1.0 V. Dropout is not the 2S problem. Heat is.

### The math

The [dissipation]({{ '/glossary/#dissipation' | relative_url }}), the heat in the regulator, is

$$
P_D = (V_{\mathrm{in}} - V_{\mathrm{out}}) I_{\mathrm{out}} + V_{\mathrm{in}} I_q
$$

- $$P_D$$ is heat in the regulator, in watts (W).
- $$V_{\mathrm{in}}$$ is the voltage at the regulator input, in volts (V).
- $$V_{\mathrm{out}}$$ is the regulated output, in volts (V).
- $$I_{\mathrm{out}}$$ is the load current, in amperes (A).
- $$I_q$$ is the [quiescent current]({{ '/glossary/#quiescent-current' | relative_url }}), the current the chip uses for itself, in amperes (A). It is drawn from the input and does not go to the load.

The first term is the pass element. The second term is the chip's own draw, also turned into heat.

[Efficiency]({{ '/glossary/#efficiency' | relative_url }}) is what the load gets, divided by what the pack supplies:

$$
\eta = \frac{V_{\mathrm{out}} I_{\mathrm{out}}}{V_{\mathrm{in}}(I_{\mathrm{out}} + I_q)}
$$

When $$I_q$$ is much smaller than $$I_{\mathrm{out}}$$, this is close to the quick estimate $$\eta \approx V_{\mathrm{out}} / V_{\mathrm{in}}$$.

Worked example, stated as an assumption for a small flight computer, not a measurement. $$V_{\mathrm{out}} = 3.3\,\mathrm{V}$$, $$I_{\mathrm{out}} = 0.20\,\mathrm{A}$$, $$I_q = 0.005\,\mathrm{A}$$ (5 mA, a hungry older regulator), pack at a 2S full-charge $$V_{\mathrm{in}} = 8.4\,\mathrm{V}$$.

Step 1. Voltage across the pass element:

$$
V_{\mathrm{in}} - V_{\mathrm{out}} = 8.4 - 3.3 = 5.1\,\mathrm{V}
$$

Step 2. Heat from the load current:

$$
5.1\,\mathrm{V} \times 0.20\,\mathrm{A} = 1.020\,\mathrm{W}
$$

Step 3. Heat from quiescent current:

$$
8.4\,\mathrm{V} \times 0.005\,\mathrm{A} = 0.042\,\mathrm{W}
$$

Step 4. Total heat:

$$
P_D = 1.020 + 0.042 = 1.062\,\mathrm{W}
$$

Step 5. Powers and efficiency. Output power is $$3.3 \times 0.20 = 0.660\,\mathrm{W}$$. Input power is $$8.4 \times (0.20 + 0.005) = 1.722\,\mathrm{W}$$.

$$
\eta = 0.660 / 1.722 = 0.383 = 38.3\%
$$

The quick estimate is $$3.3 / 8.4 = 0.393 = 39.3\%$$. Close, because 5 mA is small next to 200 mA.

Same computer on a 3S pack at full charge, $$V_{\mathrm{in}} = 12.6\,\mathrm{V}$$:

$$
(12.6 - 3.3) \times 0.20 = 1.860\,\mathrm{W}
$$

$$
12.6 \times 0.005 = 0.063\,\mathrm{W}
$$

$$
P_D = 1.923\,\mathrm{W}, \qquad \eta = 0.660 / 2.583 = 25.6\%
$$

The load did not change. The pack being fuller, or having another cell, made the regulator hotter.

{% include widget.html widget="ldo-dissipation" height=1520 title="LDO heat and junction temperature" %}

{% capture deeper_iq %}
Change only $$I_q$$, from 5 mA to 0.05 mA, a modern LDO. The quiescent heat at 8.4 V becomes $$8.4 \times 0.00005 = 0.0004\,\mathrm{W}$$. Total heat falls from 1.062 W to 1.020 W. At a 200 mA load you cannot save the board by shopping for a lower $$I_q$$. $$I_q$$ matters when the rocket is asleep and the load is microamps, because then the quiescent current *is* the battery drain.
{% endcapture %}
{% include go-deeper.html title="When quiescent current actually matters" body=deeper_iq %}

## 3. Junction temperature

### The idea

The heat has to leave the silicon and reach the air. The [junction temperature]({{ '/glossary/#junction-temperature' | relative_url }}) $$T_J$$ is the die temperature. The datasheet limit (often 125 °C or 150 °C) is a junction limit. A finger on the package, or a thermal camera, reads something cooler than $$T_J$$.

### The math

$$
T_J = T_A + P_D \, \theta_{JA}
$$

- $$T_J$$ is the junction temperature, in °C.
- $$T_A$$ is the [ambient temperature]({{ '/glossary/#ambient-temperature' | relative_url }}), the air around the board, in °C.
- $$P_D$$ is the heat from the previous section, in W.
- $$\theta_{JA}$$ is the [thermal resistance]({{ '/glossary/#thermal-resistance' | relative_url }}) from junction to ambient, in °C/W.

Worked example. Take the 1.062 W from the 2S case, $$T_A = 25\,\mathrm{°C}$$, and suppose the datasheet lists $$\theta_{JA} = 50\,\mathrm{°C/W}$$ on its standard test board. That 50 is an example number for the arithmetic, not a claim about a particular part.

$$
T_J = 25 + 1.062 \times 50 = 25 + 53.1 = 78.1\,\mathrm{°C}
$$

Under 125 °C, with margin. Now suppose this small rocket board behaves more like $$100\,\mathrm{°C/W}$$, because it has less copper than the datasheet board:

$$
T_J = 25 + 1.062 \times 100 = 131\,\mathrm{°C}
$$

That is over a 125 °C limit. Same chip, same load, hotter board.

The 3S case at 1.923 W and 50 °C/W gives $$T_J = 25 + 96.2 = 121\,\mathrm{°C}$$, already against a 125 °C limit on a *good* board. At 100 °C/W it is $$25 + 192 = 217\,\mathrm{°C}$$, which is a part that will shut down or die.

{% capture deeper_theta %}
Datasheet $$\theta_{JA}$$ is measured on a specified board, often a large JEDEC test board with a stated copper area, sometimes with forced air. Heat leaves through the metal tab, the leads, and the copper pours those leads connect to. A round rocket PCB has little copper, little airflow, and a warm interior, so the real rise is steeper. More copper under the tab, and thermal vias into a plane, are how you earn a lower $$\theta_{JA}$$. The number in the widget is an input you choose, not a promise.
{% endcapture %}
{% include go-deeper.html title="Why the datasheet θJA is optimistic on a rocket board" body=deeper_theta %}

## 4. Buck converters

### The idea

A buck does not drop the spare volts in a transistor that stays partly on. A switch connects the inductor to the pack for part of each cycle, then lets the inductor finish the cycle through a diode or a second transistor. The inductor current rises, then falls. The output [capacitor]({{ '/glossary/#capacitor' | relative_url }}) averages that into a steady voltage. The [duty cycle]({{ '/glossary/#duty-cycle' | relative_url }}) $$D$$ is the fraction of the cycle the high-side switch is on.

![Two panels of a buck converter. Left, switch closed: current flows from Vin through the inductor to the output capacitor and the inductor current rises. Right, switch open: the low side conducts, the inductor current falls, and the capacitor holds the output.](img/buck-cycle.svg){: .figure}

*Left: switch closed, inductor current rising, input feeding the output. Right: switch open, inductor current still flowing through the low side and falling. The capacitor is what the load actually drinks from.*

### The math

For an ideal buck in [continuous conduction]({{ '/glossary/#ccm' | relative_url }}), the output is the input times the duty cycle:

$$
D = \frac{V_{\mathrm{out}}}{V_{\mathrm{in}}}
$$

$$D$$ has no units. It is a fraction between 0 and 1. $$V_{\mathrm{out}}$$ and $$V_{\mathrm{in}}$$ are in volts.

Worked example. $$V_{\mathrm{in}} = 8.4\,\mathrm{V}$$, $$V_{\mathrm{out}} = 3.3\,\mathrm{V}$$:

$$
D = 3.3 / 8.4 = 0.393
$$

The switch is closed about 39% of each cycle. On a 3S full pack, $$D = 3.3 / 12.6 = 0.262$$.

While the switch is closed, the voltage across the [inductor]({{ '/glossary/#inductor' | relative_url }}) is $$V_{\mathrm{in}} - V_{\mathrm{out}}$$, so the current ramps up. The peak-to-peak [current ripple]({{ '/glossary/#current-ripple' | relative_url }}) is

$$
\Delta I_L = \frac{(V_{\mathrm{in}} - V_{\mathrm{out}}) D}{L \, f_{\mathrm{sw}}}
$$

- $$\Delta I_L$$ is the peak-to-peak inductor current ripple, in amperes (A).
- $$L$$ is the inductance, in henries (H).
- $$f_{\mathrm{sw}}$$ is the [switching frequency]({{ '/glossary/#switching-frequency' | relative_url }}), in hertz (Hz).

Worked example. Keep 8.4 V to 3.3 V so $$D = 0.393$$. Choose $$L = 10\,\mu\mathrm{H} = 10 \times 10^{-6}\,\mathrm{H}$$ and $$f_{\mathrm{sw}} = 1\,\mathrm{MHz} = 1 \times 10^{6}\,\mathrm{Hz}$$.

Step 1. Numerator: $$(8.4 - 3.3) \times 0.393 = 5.1 \times 0.393 = 2.004\,\mathrm{V}$$.

Step 2. Denominator: $$L f_{\mathrm{sw}} = 10 \times 10^{-6} \times 1 \times 10^{6} = 10$$.

Step 3.

$$
\Delta I_L = 2.004 / 10 = 0.200\,\mathrm{A}
$$

The load is 0.20 A. In continuous conduction the peak and valley sit half a ripple either side of the load:

$$
I_{\mathrm{peak}} = I_{\mathrm{out}} + \Delta I_L / 2 = 0.20 + 0.10 = 0.30\,\mathrm{A}
$$

$$
I_{\mathrm{valley}} = 0.20 - 0.10 = 0.10\,\mathrm{A}
$$

The valley is still positive, so the assumption holds.

![Three aligned traces. The switch node is a square wave. The inductor current is a triangle labeled delta I from valley to peak. The output voltage shows a much smaller ripple. A note says a long scope ground lead can fake a bigger spike, and that a valley of zero means discontinuous conduction.](img/ripple-wave.svg){: .figure}

*Switch node, inductor current, and the much smaller output ripple, drawn for continuous conduction. Delta I is the height of the current triangle.*

If the valley would have to go negative, the current hits zero and waits. That is [discontinuous conduction]({{ '/glossary/#dcm' | relative_url }}). The triangle formula still tells you that you have left continuous conduction. It does not draw the real shape anymore. The widget switches to the discontinuous shape when $$\Delta I_L / 2 > I_{\mathrm{out}}$$.

Output [voltage ripple]({{ '/glossary/#voltage-ripple' | relative_url }}), continuous conduction only, is two pieces added as a conservative estimate:

$$
\Delta V_C \approx \frac{\Delta I_L}{8 f_{\mathrm{sw}} C_{\mathrm{out}}}, \qquad \Delta V_{\mathrm{ESR}} = \Delta I_L \times \mathrm{ESR}
$$

- $$\Delta V_C$$ is the ripple from the capacitor's capacitance, in volts.
- $$C_{\mathrm{out}}$$ is the capacitance, in farads (F). Use the capacitance you actually have at the DC voltage, not always the number printed on the part.
- $$\mathrm{ESR}$$ is the [equivalent series resistance]({{ '/glossary/#esr' | relative_url }}), in ohms.
- $$\Delta V_{\mathrm{ESR}}$$ is the ripple from that resistance, in volts.

Worked example. $$\Delta I_L = 0.200\,\mathrm{A}$$, $$f_{\mathrm{sw}} = 1\,\mathrm{MHz}$$, $$C_{\mathrm{out}} = 22\,\mu\mathrm{F} = 22 \times 10^{-6}\,\mathrm{F}$$, $$\mathrm{ESR} = 20\,\mathrm{m}\Omega = 0.020\,\Omega$$.

$$
\Delta V_C = 0.200 / (8 \times 10^{6} \times 22 \times 10^{-6}) = 0.200 / 176 = 0.00114\,\mathrm{V} = 1.1\,\mathrm{mV}
$$

$$
\Delta V_{\mathrm{ESR}} = 0.200 \times 0.020 = 0.0040\,\mathrm{V} = 4.0\,\mathrm{mV}
$$

$$
\Delta V_{\mathrm{out}} \approx 1.1 + 4.0 = 5.1\,\mathrm{mV}
$$

That estimate ignores capacitor inductance and assumes continuous conduction. It is a starting number, not a scope capture.

The heat in the buck is what does not reach the load. With an estimated efficiency $$\eta$$:

$$
P_{\mathrm{out}} = V_{\mathrm{out}} I_{\mathrm{out}}, \qquad P_{\mathrm{in}} = P_{\mathrm{out}} / \eta, \qquad P_{\mathrm{diss}} = P_{\mathrm{in}} - P_{\mathrm{out}}
$$

Worked example. $$P_{\mathrm{out}} = 0.660\,\mathrm{W}$$ and a stated guess $$\eta = 0.85$$ (85%). This 85% is an assumption so the arithmetic has a number. It is not a measured efficiency.

$$
P_{\mathrm{in}} = 0.660 / 0.85 = 0.776\,\mathrm{W}
$$

$$
P_{\mathrm{diss}} = 0.776 - 0.660 = 0.116\,\mathrm{W}
$$

Compare with the linear regulator on the same 2S pack: 1.062 W of heat versus 0.116 W. $$1.062 / 0.116 \approx 9$$. About nine times less heat in the converter, at this guess of efficiency. On the 3S pack the linear regulator was at 1.923 W and this buck estimate is still 0.116 W, because the estimate depends on efficiency and output power, not on how large $$V_{\mathrm{in}}$$ is.

{% include widget.html widget="buck-converter" height=1540 title="Buck switch node and inductor current" %}

{% capture deeper_dcm %}
Volt-second balance is why $$D = V_{\mathrm{out}}/V_{\mathrm{in}}$$ in continuous conduction. Over one cycle the inductor current has to end where it started, so the up-ramp and the down-ramp cancel. Up-ramp: $$(V_{\mathrm{in}}-V_{\mathrm{out}}) D / f_{\mathrm{sw}}$$. Down-ramp: $$V_{\mathrm{out}}(1-D)/f_{\mathrm{sw}}$$. Set them equal and $$D$$ falls out as $$V_{\mathrm{out}}/V_{\mathrm{in}}$$. Losses make the real duty a bit higher. A rough correction is $$D \approx V_{\mathrm{out}}/(\eta V_{\mathrm{in}})$$. The ripple formula on this page keeps the ideal $$D$$, so the up-ramp and down-ramp still match.

In discontinuous conduction the current sits at zero for part of the cycle, and the on-time is shorter than the continuous formula says. The widget draws that shape from the ideal discontinuous equations. It does not draw the ringing on the switch node during the idle time.
{% endcapture %}
{% include go-deeper.html title="Why the duty cycle is Vout over Vin" body=deeper_dcm %}

{% capture deeper_mlcc %}
A 22 µF ceramic capacitor at a few volts of DC bias is often well under 22 µF. The capacitive piece of the ripple then grows in proportion. If the real capacitance is half, $$\Delta V_C$$ doubles. Check the manufacturer's DC-bias curve before trusting the label in the ripple formula.
{% endcapture %}
{% include go-deeper.html title="The capacitor on the board is smaller than the label" body=deeper_mlcc %}

## 5. Which one to pick

### The idea

Use a linear regulator when the drop is small or the current is small, so the heat $$P_D \approx (V_{\mathrm{in}}-V_{\mathrm{out}})I_{\mathrm{out}}$$ is a fraction of a watt, and you want a quiet rail with almost no parts. Use a buck when the pack is a 2S or 3S and the load is more than a few tens of milliamps. Use a buck *and then* an LDO when something on the rail hates ripple.

| Situation | Pick | Why |
| --- | --- | --- |
| 5 V down to 3.3 V at a few tens of mA | LDO | Heat is a small fraction of a watt. The rail is quiet. |
| 2S or 3S down to 3.3 V at 200 mA | Buck | The LDO numbers above are 1 W to 2 W of heat. |
| A radio, LNA, or ADC that hates ripple | Buck, then LDO | The buck does the big drop. The LDO drops a little and cleans up. |
| Load current that sometimes almost disappears | Check continuous vs discontinuous | A small inductor can make the current hit zero. Ripple and noise change. |

{% include widget.html widget="ldo-vs-buck" height=1390 title="LDO versus buck: heat as input voltage changes" %}

## 6. A buck followed by an LDO

### The idea

[Post-regulation]({{ '/glossary/#post-regulation' | relative_url }}) means the buck makes a voltage a little above the final rail, and an LDO finishes the job. The LDO's [PSRR]({{ '/glossary/#psrr' | relative_url }}) knocks down ripple that is not too fast. A [pi filter]({{ '/glossary/#pi-filter' | relative_url }}) (capacitor, series [ferrite bead]({{ '/glossary/#ferrite-bead' | relative_url }} or inductor, capacitor) can knock the switching frequency down before the LDO, because PSRR is weaker at high frequency.

### The math

Same heat formula, with a small drop. Illustration only, not a board from the shop: buck to 3.8 V, LDO to 3.3 V, load 0.050 A, ignore $$I_q$$.

$$
P_D \approx (3.8 - 3.3) \times 0.050 = 0.025\,\mathrm{W}
$$

A quarter of a tenth of a watt. The buck already spent the hard drop from the pack. This is why a quiet analog or RF load can afford an LDO after a buck when it could not afford an LDO straight from 3S.

{% capture deeper_psrr %}
PSRR in decibels converts to a voltage ratio by $$10^{(\mathrm{PSRR}/20)}$$. A datasheet figure of 60 dB at 1 kHz means the ripple is divided by $$10^{3} = 1000$$. A 100 mV wiggle at the LDO input would be about 0.1 mV at the output, at that frequency. At the buck's switching frequency, PSRR is often much worse, which is why the filter and the layout still matter. 60 dB and 100 mV here are a definition example, not a measurement of a part on this page.
{% endcapture %}
{% include go-deeper.html title="What a PSRR number actually does to ripple" body=deeper_psrr %}

A real supply of this shape, a 1 W PA and a low-noise LNA from a 3S pack, is the [design-walkthrough practical](practical-rf-supply.html). The numbers there are from the camera-unit power note. They are not this illustration.

## 7. Layout

### The idea

For an LDO, the heat needs copper. Pour copper on the tab pin, and stitch it with vias to a plane if you have one. Put the input and output capacitors on the pins the datasheet shows, close, with short [ground]({{ '/glossary/#ground' | relative_url }}) returns. Some older LDOs (the 1117 family is the usual example) need the output capacitor's ESR inside a window. A ceramic can be too good, and the output oscillates. Read the stability curve.

For a buck, the [hot loop]({{ '/glossary/#hot-loop' | relative_url }}) is the loop through the input capacitor and the two switches. That current is chopped every cycle. Keep the loop tiny: input capacitor against the IC's input and ground pins. Route the [feedback divider]({{ '/glossary/#feedback-divider' | relative_url }}) away from the inductor and the switch node, and sense the output at the capacitor the load uses.

### The math

There is no new formula. The layout either lets the $$P_D$$ and $$\Delta V$$ numbers above happen, or it adds oscillation and extra spikes the formulas do not include.

## 8. Mistakes that show up on rocket boards

- Sizing the LDO at the 3.7 V-per-cell nominal voltage and forgetting full charge is 4.2 V per cell. Heat is worst at full charge. Use 8.4 V and 12.6 V in the check.
- No input capacitor, or the capacitor is a centimeter away. Linear parts and bucks both oscillate or ring.
- A ceramic on an old LDO that needed ESR.
- Feedback routed next to the inductor, so the regulator "regulates" the noise.
- A buck hot loop that tours the board.
- An inductor so small that a quiet moment (sensors asleep) pushes the converter into discontinuous conduction, and the radio hears it.
- One switching rail shared with a receiver or an LNA.

## 9. Worked example: a 3.3 V computer from 2S and from 3S

Assumptions, all stated, none of them a flight measurement:

- The computer wants 3.3 V at 0.20 A. Radio not included.
- The LDO's $$I_q$$ is 5 mA.
- Lab air is 25 °C.
- Datasheet-style $$\theta_{JA}$$ example: 50 °C/W. Small-board example: 100 °C/W.
- Buck efficiency guess: 85%.

| Pack, at full charge | LDO heat | LDO efficiency | LDO $$T_J$$ at 50 °C/W | LDO $$T_J$$ at 100 °C/W | Buck heat at 85% |
| --- | --- | --- | --- | --- | --- |
| 2S, 8.4 V | 1.062 W | 38% | 78 °C | 131 °C | 0.116 W |
| 3S, 12.6 V | 1.923 W | 26% | 121 °C | 217 °C | 0.116 W |

The buck column does not get worse as the pack voltage rises, at this fixed efficiency guess. The LDO column does. Dropout is fine for both packs into 3.3 V if dropout is about 1 V. The reason to pick the buck is heat, not dropout.

On a 2S pack at the nominal 7.4 V, LDO heat is $$(7.4-3.3)\times 0.20 + 7.4\times 0.005 = 0.857\,\mathrm{W}$$ and $$T_J$$ at 50 °C/W is $$25 + 42.9 = 68\,\mathrm{°C}$$. Full charge is the case to design for. Nominal is the case you will see on the bench if the pack is not freshly charged.

## Check yourself

{% include check-yourself.html
   question="In one sentence, what problem does a regulator solve on a rocket?"
   answer="The pack voltage moves (state of charge, and how many cells are in series) and the circuits want a steady rail. The regulator stands between those two." %}

{% include check-yourself.html
   question="Where does the power that does not reach the load go, in a linear regulator?"
   answer="It becomes heat in the pass element, plus a smaller share in the chip from the quiescent current. It does not disappear into ground." %}

{% include check-yourself.html
   question="$$V_{\mathrm{in}} = 8.4\,\mathrm{V}$$, $$V_{\mathrm{out}} = 3.3\,\mathrm{V}$$, $$I_{\mathrm{out}} = 0.20\,\mathrm{A}$$, $$I_q = 0.005\,\mathrm{A}$$. Find $$P_D$$."
   answer="Drop = 8.4 − 3.3 = 5.1 V. Load term = 5.1 × 0.20 = 1.020 W. Quiescent term = 8.4 × 0.005 = 0.042 W. $$P_D$$ = 1.062 W." %}

{% include check-yourself.html
   question="Using those same numbers, what is the efficiency, and what is the quick estimate $$V_{\mathrm{out}}/V_{\mathrm{in}}$$?"
   answer="$$P_{\mathrm{out}} = 0.660\,\mathrm{W}$$, $$P_{\mathrm{in}} = 1.722\,\mathrm{W}$$, so $$\eta = 38.3\%$$. The quick estimate is $$3.3/8.4 = 39.3\%$$." %}

{% include check-yourself.html
   question="The datasheet $$\theta_{JA}$$ was measured on a large copper board. Your board is a small rocket PCB. Will the real junction be hotter or cooler than $$T_A + P_D \theta_{JA,\mathrm{datasheet}}$$, and why?"
   answer="Hotter. Less copper and less airflow mean a higher thermal resistance than the datasheet board, so the same heat makes a larger temperature rise." %}

{% include check-yourself.html
   question="A 3.3 V LDO has 1.0 V of dropout. The only source is one cell sitting at 3.6 V. Does it regulate?"
   answer="Headroom is 3.6 − 3.3 = 0.3 V, which is less than 1.0 V, so no. The output will not hold 3.3 V." %}

{% include check-yourself.html
   question="A buck has inductor ripple $$\Delta I_L = 0.60\,\mathrm{A}$$ and the load is 0.20 A. Are you in continuous conduction? What is the valley the continuous formula would predict?"
   answer="Half the ripple is 0.30 A. Valley = 0.20 − 0.30 = −0.10 A. Current cannot sit at a negative value in this converter, so the valley hits zero and you are in discontinuous conduction. The continuous triangle is the wrong picture." %}

{% include check-yourself.html
   question="Design problem. A 3.3 V flight computer draws 0.20 A from a 3S pack. Use 12.6 V for the full pack. The LDO on this board has $$\theta_{JA} = 100\,\mathrm{°C/W}$$, the limit is 125 °C, and the air inside the airframe is 40 °C. $$I_q = 5\,\mathrm{mA}$$. Does the LDO stay legal? What would you power the computer with instead?"
   answer="Drop term = (12.6 − 3.3) × 0.20 = 1.860 W. Quiescent term = 12.6 × 0.005 = 0.063 W. $$P_D$$ = 1.923 W. Rise = 1.923 × 100 = 192 °C. $$T_J$$ = 40 + 192 = 232 °C, far above 125 °C. Use a buck. At a guessed 85% efficiency the buck heat is only about 0.12 W, the same estimate as in the worked example, because output power and efficiency did not change." %}

{% capture take %}
- A regulator exists because the pack moves and the circuit does not want to.
- Linear heat is $$(V_{\mathrm{in}}-V_{\mathrm{out}})I_{\mathrm{out}}$$ plus $$V_{\mathrm{in}} I_q$$. Efficiency is near $$V_{\mathrm{out}}/V_{\mathrm{in}}$$ only when $$I_q$$ is small.
- $$T_J = T_A + P_D \theta_{JA}$$. The datasheet $$\theta_{JA}$$ is for the datasheet's board.
- A buck's ideal duty is $$V_{\mathrm{out}}/V_{\mathrm{in}}$$. Ripple $$\Delta I_L = (V_{\mathrm{in}}-V_{\mathrm{out}})D/(L f_{\mathrm{sw}})$$. If half of that exceeds the load, conduction is discontinuous.
- 2S or 3S down to 3.3 V at a few hundred milliamps is a buck problem. A small drop into a noise-sensitive load is a buck plus an LDO.
- Full-charge pack voltage is the heat case. Nominal voltage is the optimistic one.
{% endcapture %}
{% include takeaways.html body=take %}

## Hands-on exercise

This one is yours to do. It is not a result from a flight, and it is not the recording above. The recording is Tymur measuring. This is the version with a bench supply, a resistor, and a thermometer.

**Safety.** Use a current-limited bench supply, not a battery, for the first try. Set the current limit near 300 mA so a short cannot cook the part. The regulator and the resistor both get hot. If you cannot hold a hand near the package, turn the load down. Do not cover the package. Pick currents whose predicted junction temperature stays under about 100 °C before you start.

**What you need.** An LDO on a board or a breadboard adapter, its datasheet (dropout, $$\theta_{JA}$$, output capacitor rules), a bench supply, one power resistor, and a thermocouple or an infrared thermometer. A plastic package reads more honestly on an IR thermometer than a shiny metal tab. Tape on a shiny tab helps. The thermometer reads the case, not the junction.

**A safe first point, calculated before you turn the supply up.** $$V_{\mathrm{out}} = 3.3\,\mathrm{V}$$, $$V_{\mathrm{in}} = 5.0\,\mathrm{V}$$, load resistor $$33\,\Omega$$.

$$
I = 3.3 / 33 = 0.10\,\mathrm{A}
$$

Resistor heat: $$3.3 \times 0.10 = 0.33\,\mathrm{W}$$. Use a resistor rated at least 1 W. With $$I_q = 5\,\mathrm{mA}$$ and $$\theta_{JA} = 50\,\mathrm{°C/W}$$ and $$T_A = 25\,\mathrm{°C}$$:

$$
P_D = (5.0 - 3.3)\times 0.10 + 5.0\times 0.005 = 0.170 + 0.025 = 0.195\,\mathrm{W}
$$

$$
T_J = 25 + 0.195 \times 50 = 35\,\mathrm{°C}
$$

Mild. Good first point. Then step the load if the part and the resistor allow it. Record each row. Leave the predicted columns for the [LDO widget]({{ '/ee/05-power-conversion/' | relative_url }}#content) using the same Vin, Vout, and current.

| Trial | Vin (V) | Vout (V) | I (A) | Room or board air (°C) | Case (°C) | $$P_D$$ from the widget (W) | Predicted $$T_J$$ (°C) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 |  |  |  |  |  |  |  |
| 2 |  |  |  |  |  |  |  |
| 3 |  |  |  |  |  |  |  |

If $$V_{\mathrm{out}}$$ sags, you are in dropout or current limit. Stop and write that down. Do not expect the case temperature to equal $$T_J$$. Check whether the case gets warmer as the current rises, in the same direction as the prediction.

The buck scope comparison, short ground spring against a long ground lead, is in the [lab practical](practical-lab.html). Do that one if you have a scope. It is not required to finish this table.

## Design challenges

Each widget ends with a design card. The numbers below are the targets. The check, and a reference preset, live in the widget.

- [LDO heat]({{ '/ee/05-power-conversion/widgets/demo.html?w=ldo-dissipation' | relative_url }}). 3.3 V at 150 mA from a 3S pack, 40 °C/W, 40 °C ambient, junction limit 110 °C. Stay under that limit at 12.6 V.
- [Buck ripple]({{ '/ee/05-power-conversion/widgets/demo.html?w=buck-converter' | relative_url }}). 12.6 V to 3.3 V at 300 mA, continuous conduction, ΔIL under 0.20 A, and ΔVout under 20 mV.
- [LDO versus buck]({{ '/ee/05-power-conversion/widgets/demo.html?w=ldo-vs-buck' | relative_url }}). At 200 mA and 85% buck efficiency, pick the regulator whose heat stays under 0.5 W from 12.6 V down to 9.0 V.
