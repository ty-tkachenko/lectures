## Power conversion
### Linear versus switching

A pack moves. A flight computer does not want to.
Reading page has the full worked examples.

---

## Why regulate

- 2S full is about 8.4 V. 3S full is about 12.6 V.
- Many boards want 3.3 V or 5 V anyway.
- A regulator stands between the pack and that rail.

---

## Two families

- **Linear:** a pass transistor drops the spare volts. The drop becomes heat.
- **Buck:** a switch chops the input. An inductor and a capacitor average it.

---

## LDO, in one picture

Pass element in series with the load.
Feedback holds Vout.
Dropout is the smallest Vin − Vout that still works.

A 3.3 V part with 1 V of dropout needs Vin ≥ 4.3 V.
A single cell fails that. A 2S pack usually does not.
Heat is the 2S problem.

---

## Heat

$$P_D = (V_{in}-V_{out}) I_{out} + V_{in} I_q$$

Example: 8.4 V to 3.3 V, 0.20 A, Iq = 5 mA.

- Drop term: 5.1 × 0.20 = 1.020 W
- Iq term: 8.4 × 0.005 = 0.042 W
- **P_D = 1.062 W**

---

## Efficiency

$$\eta = \frac{V_{out} I_{out}}{V_{in}(I_{out}+I_q)} \approx \frac{V_{out}}{V_{in}}$$

Same example: 0.660 / 1.722 = **38%**.
Quick estimate 3.3/8.4 = **39%**.

At 12.6 V the same load is **1.923 W** and about **26%**.

---

## Junction temperature

$$T_J = T_A + P_D\,\theta_{JA}$$

1.062 W, 25 °C air, θJA = 50 °C/W → **78 °C**.
Same heat, θJA = 100 °C/W on a small board → **131 °C**.

Datasheet θJA is the datasheet's board, not your rocket.

---

## Buck, two moments

Switch closed: inductor current rises. Voltage on L is Vin − Vout.
Switch open: current falls but keeps flowing.

Ideal continuous duty: $$D = V_{out}/V_{in}$$.
8.4 V to 3.3 V → **D = 0.393**.

---

## Current ripple

$$\Delta I_L = \frac{(V_{in}-V_{out}) D}{L f_{sw}}$$

10 µH, 1 MHz, the 8.4 V example: **ΔI = 0.200 A**.
Valley = 0.20 − 0.10 = 0.10 A, still continuous.

If half the ripple exceeds the load, the current hits zero.
That is discontinuous conduction.

---

## Output ripple, and the heat

Capacitor piece plus ESR piece, continuous conduction.
The worked example is about **5 mV** with 22 µF and 20 mΩ.
A real ceramic under DC bias is often smaller.

Buck heat at a guessed 85%: **0.116 W**, against 1.062 W in the LDO.

---

## Which one

| Need | Pick |
| --- | --- |
| Small drop, small current | LDO |
| 2S/3S to 3.3 V at hundreds of mA | Buck |
| Quiet radio or LNA rail | Buck, then LDO |

---

## Buck, then LDO

The buck does the big drop.
The LDO drops a little and cleans slower ripple.

Illustration: 3.8 V to 3.3 V at 50 mA → **0.025 W**.
PSRR falls at high frequency, so a filter still helps.

---

## Layout

- LDO: copper on the tab, capacitors on the pins.
- Some old LDOs oscillate with a ceramic that is too low-ESR.
- Buck: tiny hot loop, input capacitor against the IC.
- Feedback away from the inductor and the switch node.

---

## 2S and 3S, same computer

0.20 A at 3.3 V. LDO Iq = 5 mA. Buck guess 85%.

- 8.4 V LDO: **1.062 W**, 78 °C at 50 °C/W
- 12.6 V LDO: **1.923 W**, 121 °C at 50 °C/W, 217 °C at 100 °C/W
- Buck heat stays about **0.116 W**

Design the heat at full charge, 4.2 V per cell.

---

## Your turn

Check-yourself questions are on the reading page, from recall up to a 3S design problem.

Practicals (video, notes up now):

- Design walkthrough: 1 W PA and LNA from a 3S pack (draft)
- Lab: LDO temperature, then scope ground lead versus spring

Hands-on table: you measure an LDO. The recording is separate.
