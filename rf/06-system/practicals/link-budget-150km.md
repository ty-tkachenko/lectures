---
title: "Practical: Will the Camera Reach the Ground from 150 km?"
series: rf
module: 6
level: intermediate
prereqs: [rf-01-fundamentals]
type: practical
widgets: [link-budget-calculator]
practicals: [link-budget-150km]
draft: true
---

# Practical: Will the Camera Reach the Ground from 150 km?

**The example.** A rocket-mounted camera sends 1080p photos to the ground live, from the pad up to a 150 km apogee. Every frame is a full-quality ~2 Mbit image. When the signal gets weak, the radio sends fewer frames per second instead of blurrier ones.

**The question this practical answers:** at 150 km, how many frames per second actually make it to the ground, and which parts of the system decide that?

All numbers come from a real flight-camera link budget, simplified to the parts that matter for the downlink.

---

## 1. Requirements

| What we need | Why |
|---|---|
| Live 1080p frames at **150 km** slant range | The money shot is the view from apogee |
| More frames when close | Near the pad there's plenty of signal, so use it |
| Legal in the US without a license | FCC Part 15.247, 902–928 MHz: **≤ 1 W (30 dBm)** conducted, ≤ 6 dBi antenna |
| Ground station a student team can afford | An SDR plus a laptop, with a fixed 9 dBi antenna and no tracker |

## 2. Choices, and why

- **915 MHz.** It's license-free, and a lower frequency means less path loss and wider antenna beams than 2.4 or 5.8 GHz. (FSPL grows as 20·log f, so 5.8 GHz loses an extra 16 dB.)
- **Full 1 W.** That's the legal maximum. At 150 km we need every dB.
- **Adaptive rate.** The ground tells the rocket how strong the signal is about 10 times a second, and the rocket picks the fastest symbol rate and coding that will still get through.

## 3. The budget, line by line (at 150 km)

### Transmit side
| Item | Value | Note |
|---|---|---|
| PA power at the antenna connector | +30.0 dBm | 1 W, the Part 15 limit |
| Feed and mismatch loss | −0.5 dB | short coax plus match |
| Vehicle antenna gain toward ground | −3.0 dBi | a *planning* average toward the ground station, not the peak |
| **EIRP** | **+26.5 dBm** | |

### The path
$$\text{FSPL} = 20\log_{10}(d) + 20\log_{10}(f) - 147.55 = 135.2\ \text{dB} \quad (d = 150\ \text{km},\ f = 915\ \text{MHz})$$

### Receive side
| Item | Value |
|---|---|
| Ground antenna gain | +9.0 dBi |
| Pointing loss (fixed antenna, no tracker) | −2.0 dB |
| Polarization loss (circular at both ends) | −1.5 dB |
| **Received carrier C** | 26.5 − 135.2 + 9 − 2 − 1.5 = **−103.2 dBm** |

### Noise
The receive chain is antenna → filter (0.8 dB) → LNA (NF 0.8 dB, 20 dB gain) → cable (1 dB) → SDR (NF 6 dB). The Friis cascade gives a system NF of **1.74 dB**:

$$F = F_1 + \frac{F_2-1}{G_1} + \frac{F_3-1}{G_1G_2} + \dots$$

The SDR's 6 dB noise figure barely matters (+0.2 dB) because the LNA's 20 dB of gain comes first. That's why the LNA sits at the antenna.

$$T_{sys} = 290 + 290(F-1) \approx 433\ \text{K}, \qquad N_0 = kT_{sys} = -172.2\ \text{dBm/Hz}$$

### The result
$$C/N_0 = -103.2 - (-172.2) = 69.0\ \text{dB-Hz}$$

## 4. Margins: planning for a bad day

| Margin | dB | Covers |
|---|---|---|
| Implementation | 2 | real demodulators aren't perfect |
| Fade | 6 | antenna pattern ripple as the rocket spins, plus multipath |
| Interference | 2 | 902–928 MHz is shared with LoRa, trackers and others |
| **Total** | **10** | |

**Worst case:** 69.0 − 10 = **59.0 dB-Hz** usable.

## 5. From dB-Hz to frames per second

Divide out the symbol rate to get the SNR per symbol: \(E_s/N_0 = C/N_0 - 10\log_{10}(R_s)\). Then pick the fastest modulation and code rate whose threshold you clear.

| Range | C/N0 | Worst case (−10 dB) | Nominal (−5 dB) |
|---|---|---|---|
| 5 km | 98.6 dB-Hz | ~19 fps (8PSK 8/9 @ 16 Msps) | ~19 fps |
| 20 km | 86.5 | ~11 fps | ~16 fps |
| 50 km | 78.6 | ~2 fps | ~6 fps |
| 100 km | 72.6 | ~0.5 fps | ~1.8 fps |
| **150 km** | **69.0** | **~0.24 fps** (QPSK 1/2 @ 0.625 Msps) | **~0.72 fps** |

At apogee that's **one full-quality frame every 1.5–4 seconds**. Notice how fast it falls: every doubling of distance costs 6 dB, and each 3 dB lost roughly halves the frame rate.

## 6. What moves the answer the most?

Try these in the link budget calculator below:

| Change | dB | Worst case → nominal at 150 km |
|---|---|---|
| Baseline | 0 | 0.24 → 0.72 fps |
| Ground antenna 9 → 16.5 dBi (hand-pointed, 1 dB pointing loss) | +8.5 | ~1.8 → ~5.7 fps (about 7×) |
| Vehicle antenna −3 → −6 dBi | −3 | ~0.1 → ~0.37 fps (halved) |
| Remove the LNA (filter → cable → SDR, NF ≈ 7.8 dB) | −6.1 | **no link** → ~0.19 fps |
| Same hardware at 2.4 GHz (+8.4 dB FSPL) | −8.4 | **no link** → ~0.1 fps |

**Lesson:** on a long link the **antennas** are the biggest knobs, not the transmitter. Power is capped by law, while antenna gain is (mostly) free.

## 7. Bench and flight results

*Placeholder: predicted vs. measured C/N0 against altitude from the first flight. Until then, this is a prediction.*

## 8. What we'd change

*Placeholder: lessons after flight.*

## Check yourself

1. If the rocket's antenna turned out to be −6 dBi toward the ground instead of −3 dBi, what would the worst-case C/N0 be at 150 km?
2. Why does putting the LNA *at the antenna* matter more than buying a better SDR?
3. At what range does the worst-case link drop below 1 fps?
