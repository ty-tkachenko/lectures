## The same battery
### One LED lives. One dies.

The difference is a resistor.
Reading page has the worked numbers.

---

## Four words

- **Charge** — coulombs.
- **Current** — coulombs per second. Amperes.
- **Voltage** — a difference between two points.
- **Resistance** — ohms. Opposition to current.

---

## Ohm's law

$$V = IR$$

5 V across 100 Ω:

$$I = 5 / 100 = 50\,\mathrm{mA}$$

The voltage is the voltage **across that resistor**.

---

## Power

$$P = VI = I^2 R = V^2 / R$$

Same resistor: **0.25 W**, three ways.

A 1/4 W part is exactly at the rating.
Past the rating, the part is the wrong part.

---

## Series and parallel

- Series: one current. Resistances **add**.
- Parallel: one voltage.

$$R = \frac{R_1 R_2}{R_1+R_2}$$

100 Ω || 220 Ω = **68.75 Ω**.

---

## KVL, one loop

100 Ω + 220 Ω + 180 Ω = 500 Ω on 12 V.

- I = 24 mA
- Drops 2.40 V, 5.28 V, 4.32 V
- Sum = **12 V**

---

## Two nodes

12 V, R1 = 1 kΩ, R2 = R3 = R4 = 2 kΩ.

- Node A = **6.857 V**
- Node B = **3.429 V**
- Current in equals current out at each node.

---

## Divider, no load

5 V, 10 kΩ over 10 kΩ.

$$V_{out} = 2.50\,\mathrm{V}$$

True only if nothing else draws current.

---

## Divider, with a load

Another 10 kΩ on the output.

Bottom becomes 5 kΩ.

$$V_{out} = 1.667\,\mathrm{V}$$

A 10 MΩ meter on the same divider reads **2.499 V**.

---

## The LED

$$R = (V_s - V_f) / I_f$$

9 V, Vf = 2.0 V, 20 mA → ideal **350 Ω**.

E24 next up: **360 Ω** → 19.4 mA, 0.136 W.
Use a 1/4 W resistor, not 1/8 W.

No resistor: the battery sets the current. The LED dies.

---

## Real sources and ground

- Internal resistance: terminal voltage falls as current rises.
- 9 V, 1 Ω inside, 8 Ω load → **8 V** at the terminals. A model, not a measurement.
- Ground is the node you call 0 V.

---

## The meter

- **Voltage:** parallel. Often about 10 MΩ.
- **Current:** series. Across a source, the fuse opens.
- **Resistance:** unpowered circuit only.

---

## Takeaways

The resistor is why one LED lives.
Dividers sag when the load is not large.
KVL and KCL are the checks.
Measure voltage in parallel, current in series.
