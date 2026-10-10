## Not instant
### Capacitors and inductors

Voltage on a capacitor does not jump.
Current in an inductor does not jump.

---

## Energy

$$E_C = \tfrac{1}{2}CV^2, \qquad E_L = \tfrac{1}{2}LI^2$$

- 10 µF at 5 V → **125 µJ**
- 1 mH at 0.2 A → **20 µJ**

---

## The laws

$$I = C\,dV/dt$$

$$V = L\,dI/dt$$

A constant voltage means no capacitor current.
A constant current means no inductor voltage.

---

## Hold-up

Ideal: $$\Delta t = C\,\Delta V / I$$

10 µF, 0.1 V, 100 mA → **10 µs**.

ESR and the regulator come in module 09.

---

## Time constant

$$\tau = RC$$

- 1 τ → **63%** of the step
- 5 τ → **99%**

10 kΩ and 100 nF → **τ = 1.00 ms**.
Half-supply, if that is the threshold: **0.693 ms**.

---

## RL is the same shape

$$\tau = L/R$$

1 mH and 10 Ω → τ = 0.10 ms.
On 5 V the current aims at 0.50 A.
At one τ it is **0.316 A**.

---

## Kickback

$$V = L\,\Delta I / \Delta t$$

1 mH, 0.2 A, stopped in 1 µs → **200 V**.
That 1 µs is a model, not a measured edge.

---

## Flyback diode

Across the coil, cathode to the supply.

Clamp is about **Vs + 0.7 V**.
Decay time $$t = LI / V_f$$ → **286 µs** in the example.

---

## Reactance

$$X_C = 1/(2\pi f C)$$ falls with frequency.

$$X_L = 2\pi f L$$ rises.

At 1 kHz: 100 nF is **1592 Ω**. 10 mH is **62.8 Ω**.

---

## RC filters

$$f_c = 1/(2\pi RC)$$

1.6 kΩ and 100 nF → **995 Hz**.
At fc, gain is **0.707**, which is **−3 dB**.
A decade above, a low-pass is about **−20 dB**.

---

## Combinations

- Parallel capacitors **add**.
- Series capacitors combine like parallel resistors.
- Series inductors add. Parallel inductors do not.

10 µF || 10 µF = 20 µF. In series, 5 µF.

---

## Resonance, only a pointer

$$f_0 = 1/(2\pi\sqrt{LC})$$

10 µH and 100 pF → **5.03 MHz**.

Matching and antennas are the RF series.

---

## Takeaways

Capacitors cover a short dip and set an RC delay.
Inductors kick when you open the switch. Use the diode.
Filters cut off at 1/(2πRC), −3 dB.
