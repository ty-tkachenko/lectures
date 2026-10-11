# EE Fundamentals for Avionics

Interactive notes on the electronics behind the avionics team's hardware, from basic circuit theory to designing, building and debugging boards for flight and for the test stand. Every module is tied to things we actually build: flight computers, pressure-transducer front ends, solenoid valve drivers, igniter (pyro) channels, test-stand data acquisition, and the harnesses that connect it all.

**Who it's for:** new team members with little or no hands-on EE experience, typically first to third year. Comfort with algebra is enough to start; no lab experience is assumed.

**What's in each module:** one web page of explanations with interactive simulations and worked examples, a lecture video walking through it, a lab video showing the ideas at the bench, and a set of design exercises drawn from our own hardware. There's roughly a semester's worth of material in total, at about a module a week.

**Where it leads:** the [RF notes](../RF/) build on modules 1–4 and 12.

---

## Contents

The modules are grouped so that each part ends on something you can point to on the rocket: a battery driving a valve, a transducer reading logged by the flight computer, a board you can review and bring up.

### Part I: Foundations

**[Module 1: Voltage, Current, Resistance & Power](01_Circuit_Basics/)**
What current and voltage actually are · ground is a reference, not a place · Ohm's law · power and resistor ratings · wires have resistance (the igniter-cable problem) · batteries, capacity and internal resistance · using a multimeter without blowing its fuse · electrical safety around LiPos

**[Module 2: Circuit Analysis](02_Circuit_Analysis/)**
Kirchhoff's laws · series and parallel · the voltage divider (battery-voltage monitoring) · loading: why your divider reads wrong · Thévenin equivalents · superposition · reading schematics and datasheets

**[Module 3: Capacitors & Inductors](03_Capacitors_Inductors/)**
Storing energy in fields · RC and RL time constants · charging, discharging, and inrush current · inductive kickback, and why a solenoid valve's coil needs a flyback diode · real capacitors: ESR, ESL, DC-bias derating, tolerance · real inductors: DCR, saturation and current ratings · decoupling capacitors in the time domain · the oscilloscope: triggering, probes and the ground-lead trap

**[Module 4: AC Signals & Frequency Response](04_AC_and_Frequency/)**
Sinusoids, amplitude, frequency, phase · RMS · impedance of R, L and C · a capacitor's self-resonance · RC low-pass and high-pass filters · Bode plots and decibels · resonance · *the bridge to the RF notes*

### Part II: Moving Power: Driving Actuators

**[Module 5: Diodes](05_Diodes/)**
The diode as a one-way valve · forward drop and the I–V curve · rectifiers · LEDs and current limiting · Zener and TVS diodes · reverse-polarity protection · diode-OR of redundant batteries

**[Module 6: Transistors as Switches](06_Transistors/)**
MOSFETs and BJTs as switches · low-side vs high-side switching · gate drive and logic-level FETs · flyback diodes for solenoid valves · switching losses and heat · pyro-channel design: arming, continuity sensing and fail-safe states

**[Module 7: Power Systems](07_Power/)**
LiPo cells: C-rating, sag and safe handling · linear regulators and dropout · buck and boost converters (a switch, a diode and an inductor) · efficiency and heat · power budgets · fuses, eFuses and current limiting · umbilical-to-internal power switchover · power sequencing

### Part III: Sensing & Computing: The Signal Chain

**[Module 8: Digital Logic & Microcontrollers](08_Digital_MCU/)**
Logic levels and thresholds · CMOS inputs and floating pins · pull-ups and pull-downs · GPIO, push-pull and open-drain · timers and PWM · interrupts · watchdogs and brown-out resets · level shifting

**[Module 9: Communication Buses](09_Buses/)**
UART, SPI and I²C · CAN and RS-485 for long runs · single-ended vs differential · choosing a bus · ringing and termination on long wires (a first look at signal integrity) · debugging with a logic analyzer

**[Module 10: Op-Amps & Sensor Front Ends](10_OpAmps_Sensors/)**
The op-amp golden rules · inverting, non-inverting and buffer stages · comparators · current-sense amplifiers · Wheatstone bridges (load cells, pressure transducers) · instrumentation amplifiers · thermocouples and cold-junction compensation · 4–20 mA current loops

**[Module 11: Data Acquisition](11_Data_Acquisition/)**
ADCs: resolution, reference and input range · sampling and aliasing · anti-alias filters · noise and averaging · choosing sample rates (chamber pressure vs tank temperature) · timestamps and synchronization · logging without losing data · putting it together: transducer → front end → ADC → bus → log

### Part IV: Building Hardware

**[Module 12: Schematics & PCB Design](12_PCB_Design/)**
The KiCad flow · symbols and footprints · stackups · trace width and current capacity · ground planes and return paths · decoupling placement · design rule checks · running a design review

**[Module 13: Harnesses, Connectors & Ruggedization](13_Harnesses/)**
Wire gauge and insulation · crimping technique · locking connectors · strain relief and vibration · conformal coating · noise from valves and pumps · ground loops on the test stand

**[Module 14: Test, Debug & Bring-Up](14_Test_and_Debug/)**
Bring-up with a current-limited supply · advanced probing and logic analyzers · a debugging method that works · failure analysis · test reports and flight-readiness reviews

### Capstone

**[Design Review: Test-Stand DAQ Board](C_Capstone/)**
Review a real board end to end: power, sensor front ends, valve drivers, buses and layout. Find the problems, then write the test plan that proves the fixed design works.

---

## Folder layout

Each module is a folder with an `index.html` page. Shared styles, the site engine and the plotting helpers are in [`../assets/`](../assets/). The module list that drives the menus is [`../assets/course.js`](../assets/course.js).
