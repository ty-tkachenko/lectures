# RF Engineering: PCB & Hardware Design

A lecture series on how radio-frequency hardware actually works and how to design it. It starts from the physics of waves on conductors and builds up to transmission lines, matching, components, PCB layout, measurement, system budgets, EMC, antennas, modulation and radio-control firmware. It ends with a design review of a real telemetry link.

**Who it's for:** anyone curious about how radios, antennas and wireless links really work, from people who have never touched RF to those who have seen a bit and want to go further. Every lesson starts in plain language with pictures and interactive demos; the math comes next, and the heaviest derivations sit in optional "go deeper" boxes you can skip on a first read. Basic algebra is enough to start; complex numbers and logarithms are introduced as they're needed.

**How to read it:** the modules are meant to be read in order, since each one builds on the last. Modules 0–2 are the foundation and everything later depends on them. After that, 3–8 cover hardware and system design, 9 covers antennas, and 10–11 cover signals and software. The case study pulls it all together.

---

## Contents

### Part I: Foundations

**[Module 0: Mindset Shift, Why RF Is Different](00-mindset/)**
The lumped-to-distributed transition · skin effect and return current · "ground is not ground" · energy flows in the fields · the RF designer's mental model

**[Module 1: RF Fundamentals](01-fundamentals/)**
Transmission lines and Z₀ · reflection and transmission coefficients · VSWR · time-domain reflectometry · reflections in time vs. frequency · dB, dBm, dBc · polarization · dielectric constant and loss tangent · phase and group delay

**[Module 2: Transmission Lines, Propagation & Matching](02-lines-and-matching/)**
Propagation modes · microstrip, stripline, CPW, GCPW · the Smith chart · lumped-element matching · input impedance and quarter-wave transformers · S-parameters · return loss and insertion loss · bandwidth

### Part II: Hardware

**[Module 3: RF Components & Circuit Blocks](03-components/)**
Connectors · directional couplers · LNAs · power amplifiers · filters · mixers · switches, attenuators, baluns · conductor, dielectric and radiation loss · diplexers, duplexers, circulators, isolators · splitters and combiners · waveguide

**[Module 4: PCB Design & Layout Essentials](04-pcb-layout/)**
Stackup selection · materials · trace width and impedance · solder mask and surface finish · via transitions · grounding and return paths · stitching vias and fencing · parasitics and self-resonance · differential RF pairs · PA thermal design

**[Module 5: Measurements & Lab Tools](05-measurements/)**
Vector network analyzers · VNA calibration (SOLT, TRL) · VNA techniques · spectrum analyzers · signal generators · power meters · noise figure analyzers · load-pull

### Part III: Systems

**[Module 6: System-Level Performance](06-system/)**
Amplifier stability · noise figure · noise floor and the Friis cascade · link budgets and free-space path loss · P1dB · IP3 and intermodulation · harmonics · phase noise · desense and dynamic range · channel interference

**[Module 7: EMI/EMC, Integrity & Regulations](07-emc-and-regulatory/)**
EMI/EMC fundamentals · RF leakage and crosstalk · via fencing and guard traces · decoupling and power integrity · enclosure effects and cavity resonances · shielding · FCC and regulatory design

**[Module 8: Simulation, Verification & Practical Layout](08-simulation-and-verification/)**
EM simulation overview · HFSS and CST workflow · simulation vs. measurement · surface-mount parts at RF · layout guidelines · common layout mistakes · PCB verification flow

### Part IV: Antennas, Signals & Software

**[Module 9: Antennas](09-antennas/)**
Antenna fundamentals · radiation patterns, directivity and gain · polarization · antenna types · patch antennas · ground planes and enclosures · antenna matching · near vs. far field · gain measurement and anechoic chambers · MIMO · SMD antennas, cavity modes, via fencing

**[Module 10: Modulation & Protocols](10-modulation/)**
Why we modulate · AM and FM · ASK, FSK, PSK · QAM, OFDM, chirp spread spectrum · I/Q representation · symbol rate, bit rate and bandwidth · noise, EVM and constellations · spectral masks, ACLR, occupied bandwidth · DSSS vs. FHSS · common protocols

**[Module 11: Software & Radio Control](11-software/)**
Register-based control · PLL frequency synthesis · TX configuration · packet framing · encoding, whitening, FEC · TX/RX/idle state machines · RX chain and FIFOs · frequency offset and drift · debugging and verification

### Case Study

**[Bonus: Current Telemetry](b-case-study/)**
Reviewing a real block diagram · finding what's missing · the plots that prove each component works

---

## Folder layout

Each module has its own folder holding the slides, figures and the scripts that generate them. Shared plotting style and constants are in [`common/`](common/).
