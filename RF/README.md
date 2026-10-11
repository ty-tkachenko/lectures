# RF Engineering: PCB & Hardware Design

Interactive notes on how radio-frequency hardware works. They start from the physics of waves on conductors and build up to transmission lines, matching, components, PCB layout, measurement, system budgets, EMC, antennas, modulation and radio-control firmware. They end with a review of a real telemetry link.

**Who it's for:** avionics team members who want to work on the radio, GPS and high-speed parts of our hardware. The [EE notes](../EE/) modules 1–3 are what Module 1 assumes. EE Module 4 (reactance) is what Module 2 will assume. No prior RF or electromagnetics background is needed.

**Status.** **Modules 0 and 1** are written. Modules 2–11 and the case study are placeholders: the pages exist so the navigation works, and the topic lists below are the plan for those pages, not a description of notes you can read yet. There is no separate theory site; further reading is Pozar, cited on the written pages.

**How to read it:** the modules are meant to be read in order, since each one builds on the last. Modules 0–2 are the foundation and everything later depends on them. After that, 3–8 cover hardware and system design, 9 covers antennas, and 10–11 cover signals and software. The case study pulls it all together.

---

## Contents

### Part I: Foundations

**[Module 0: Mindset Shift, Why RF Is Different](00_Mindset/)** *(written)*
The lumped-to-distributed transition · skin effect and return current · "ground is not ground" · energy flows in the fields · the RF designer's mental model

**[Module 1: RF Fundamentals](01_Fundamentals/)** *(written)*
Transmission lines and Z₀ · reflection and transmission coefficients · VSWR · time-domain reflectometry · reflections in time vs. frequency · dB, dBm, dBc · polarization · dielectric constant and loss tangent · phase and group delay

**[Module 2: Transmission Lines, Propagation & Matching](02_Lines_and_Matching/)** *(not written yet)*
Propagation modes · microstrip, stripline, CPW, GCPW · the Smith chart · lumped-element matching · input impedance and quarter-wave transformers · S-parameters · return loss and insertion loss · bandwidth

### Part II: Hardware

**[Module 3: RF Components & Circuit Blocks](03_Components/)** *(not written yet)*
Connectors · directional couplers · LNAs · power amplifiers · filters · mixers · switches, attenuators, baluns · conductor, dielectric and radiation loss · diplexers, duplexers, circulators, isolators · splitters and combiners · waveguide

**[Module 4: PCB Design & Layout Essentials](04_PCB_Layout/)** *(not written yet)*
Stackup selection · materials · trace width and impedance · solder mask and surface finish · via transitions · grounding and return paths · stitching vias and fencing · parasitics and self-resonance · differential RF pairs · PA thermal design

**[Module 5: Measurements & Lab Tools](05_Measurements/)** *(not written yet)*
Vector network analyzers · VNA calibration (SOLT, TRL) · VNA techniques · spectrum analyzers · signal generators · power meters · noise figure analyzers · load-pull

### Part III: Systems

**[Module 6: System-Level Performance](06_System_Performance/)** *(not written yet)*
Amplifier stability · noise figure · noise floor and the Friis cascade · link budgets and free-space path loss · P1dB · IP3 and intermodulation · harmonics · phase noise · desense and dynamic range · channel interference

**[Module 7: EMI/EMC, Integrity & Regulations](07_EMC_and_Regulatory/)** *(not written yet)*
EMI/EMC fundamentals · RF leakage and crosstalk · via fencing and guard traces · decoupling and power integrity · enclosure effects and cavity resonances · shielding · FCC and regulatory design

**[Module 8: Simulation, Verification & Practical Layout](08_Simulation_and_Verification/)** *(not written yet)*
EM simulation overview · HFSS and CST workflow · simulation vs. measurement · surface-mount parts at RF · layout guidelines · common layout mistakes · PCB verification flow

### Part IV: Antennas, Signals & Software

**[Module 9: Antennas](09_Antennas/)** *(not written yet)*
Antenna fundamentals · radiation patterns, directivity and gain · polarization · antenna types · patch antennas · ground planes and enclosures · antenna matching · near vs. far field · gain measurement and anechoic chambers · MIMO · SMD antennas, cavity modes, via fencing

**[Module 10: Modulation & Protocols](10_Modulation/)** *(not written yet)*
Why we modulate · AM and FM · ASK, FSK, PSK · QAM, OFDM, chirp spread spectrum · I/Q representation · symbol rate, bit rate and bandwidth · noise, EVM and constellations · spectral masks, ACLR, occupied bandwidth · DSSS vs. FHSS · common protocols

**[Module 11: Software & Radio Control](11_Software/)** *(not written yet)*
Register-based control · PLL frequency synthesis · TX configuration · packet framing · encoding, whitening, FEC · TX/RX/idle state machines · RX chain and FIFOs · frequency offset and drift · debugging and verification

### Case Study

**[Bonus: Current Telemetry](B_Case_Study/)** *(not written yet)*
Reviewing a real block diagram · finding what's missing · the plots that prove each component works

---

## Folder layout

Each module is a folder with an `index.html` page. Shared styles, the plotting helpers and the site engine are in [`../assets/`](../assets/), and the module list that drives the menus is [`../assets/course.js`](../assets/course.js).
