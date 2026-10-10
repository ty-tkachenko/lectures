---
layout: practical
title: "Measuring LDO heat and buck ripple"
description: "What the lab recording will show: temperature versus load, then a scope ground-lead comparison."
series: ee
module: 5
type: practical
level: intro
status: draft
practical_type: lab-measurement
reading: /ee/05-power-conversion/
practical_video:
chapters:
  - time: "0:00"
    seconds: 0
    title: "Safety and the two measurements"
  - time: "1:00"
    seconds: 60
    title: "Bench setup"
  - time: "3:00"
    seconds: 180
    title: "LDO temperature versus load"
  - time: "6:30"
    seconds: 390
    title: "Camera, thermocouple, and the calculator"
  - time: "8:00"
    seconds: 480
    title: "Buck ripple with a long ground lead"
  - time: "9:30"
    seconds: 570
    title: "The same node with a ground spring"
  - time: "11:30"
    seconds: 690
    title: "Which spike is real"
  - time: "13:00"
    seconds: 780
    title: "Takeaways"
---

## What you will see

Two measurements, back to back, on ordinary bench parts. Not a flight board, and not a scripted temperature.

First, an LDO. A current-limited bench supply, a power resistor as the load, and either a thermal camera or a thermocouple (or both). The load steps up. The case gets warmer. The [LDO widget]({{ '/ee/05-power-conversion/' | relative_url }}) sits beside the bench with the same Vin, Vout, and current, and the predicted junction temperature is compared with the direction of the measurement. The case will not match $$T_J$$. The case should move the same way as the prediction.

Second, a buck. A scope on the output capacitor, once with the probe's long ground lead and once with a short ground spring on the probe tip. The long lead draws a taller spike. Most of that extra spike is the probe's loop, not the capacitor voltage.

## Key numbers and formulas

The heat and junction formulas are the ones on the reading page:

$$
P_D = (V_{\mathrm{in}} - V_{\mathrm{out}}) I_{\mathrm{out}} + V_{\mathrm{in}} I_q
$$

$$
T_J = T_A + P_D \, \theta_{JA}
$$

$$P_D$$ is in watts, voltages in volts, currents in amperes, $$T_J$$ and $$T_A$$ in °C, $$\theta_{JA}$$ in °C/W.

The resistor load is $$I = V_{\mathrm{out}} / R$$ and the resistor's own heat is $$P = V_{\mathrm{out}} \times I$$. Both the regulator and the resistor warm up. A thermal camera is looking at two heaters. The one this practical cares about is the regulator package.

For the buck, continuous-conduction current ripple is

$$
\Delta I_L = \frac{(V_{\mathrm{in}} - V_{\mathrm{out}}) D}{L \, f_{\mathrm{sw}}}, \qquad D = \frac{V_{\mathrm{out}}}{V_{\mathrm{in}}}
$$

The output ripple estimate (capacitor plus ESR) is on the reading page. The scope lesson is not a new formula. A long ground lead is a loop. The buck's switch node is a large, fast voltage. That loop picks up a magnetic kick and adds a spike on the screen. A short spring makes a small loop, so the spike that remains is closer to the voltage on the capacitor.

No measured spike height is quoted here, because this page is the companion to a recording that has not been made.

## What to look for

**Thermal camera.** The bright spot should be the regulator package (and the load resistor, separately). If the whole board looks uniform, the scale is too wide or the part is not loaded. Shiny metal reads low on many cameras. Matte plastic, or a piece of tape on a metal tab, is easier to believe. Say which surface you aimed at.

**Thermocouple.** Put it on the tab or the package, not in the air next to the board. Let each current step settle before you write the number down. Record Vin, Vout (it must still be in regulation), current, air temperature, and case temperature.

**Calculator.** Type those Vin, Vout, and current values into the widget. If the case gets hotter as current rises and the predicted $$T_J$$ does too, the model and the bench agree in direction. If the case is hotter than the prediction, $$\theta_{JA}$$ on this board is worse than the number you typed. If Vout sags, stop. That is dropout or current limit, and the heat formula no longer describes a regulating part.

**Scope.** First the long ground lead, then the spring, same capacitor, same bandwidth setting. Look at the spike at the switching edges. The long-lead trace should look worse. Believe the spring when the two disagree. Keep the probe ground on the capacitor's ground terminal, not on a convenient screw at the other end of the board.

## Takeaways

- Predicted junction temperature and a thermometer on the case are different numbers. Use the thermometer to see the trend. Use the formula, with an honest $$\theta_{JA}$$, for the limit.
- The load resistor is also a heater. Do not point at it and call it the regulator.
- A long scope ground lead can invent a ripple spike. The short spring is the measurement. The long lead is the lesson.
- The student table on the [reading page]({{ '/ee/05-power-conversion/' | relative_url }}) is the version you do yourself. This page is the recording of that kind of measurement, plus the scope comparison.
