// Course catalog: the single source of truth for menus, the landing page, prev/next links and progress.
// Add a module here when its page exists and set status:'ready'. Paths are relative to the site root.
window.COURSE = {
  site: 'Hardware Engineering Fundamentals',
  // Where the advanced theory pages live, relative to the site root (used by "Go deeper" links).
  deepBase: '../theory/',
  tracks: [
    {
      id: 'ee', title: 'EE Fundamentals', short: 'EE', path: 'EE/',
      blurb: 'Circuits, semiconductors, power, microcontrollers, data acquisition and building real hardware. No lab experience assumed.',
      modules: [
        // Foundations
        {id:'ee01', n:1,  status:'ready',   path:'EE/01_Circuit_Basics/',         title:'Voltage, Current, Resistance & Power', blurb:'Ohm\'s law, power ratings, wire resistance, batteries and the multimeter.'},
        {id:'ee02', n:2,  status:'ready',   path:'EE/02_Circuit_Analysis/',       title:'Circuit Analysis', blurb:'Kirchhoff\'s laws, dividers, loading, Thévenin, and reading schematics and datasheets.'},
        {id:'ee03', n:3,  status:'ready',   path:'EE/03_Capacitors_Inductors/',   title:'Capacitors & Inductors', blurb:'Time constants, inrush, inductive kickback, real parts, and your first oscilloscope.'},
        {id:'ee04', n:4,  status:'planned', path:'EE/04_AC_and_Frequency/',       title:'AC Signals & Frequency Response', blurb:'Impedance, RC filters, Bode plots and decibels.'},
        // Moving power: driving actuators
        {id:'ee05', n:5,  status:'planned', path:'EE/05_Diodes/',                 title:'Diodes', blurb:'Rectifiers, LEDs, Zener/TVS protection and reverse-polarity protection.'},
        {id:'ee06', n:6,  status:'planned', path:'EE/06_Transistors/',            title:'Transistors as Switches', blurb:'MOSFET drivers for solenoid valves and pyro channels.'},
        {id:'ee07', n:7,  status:'planned', path:'EE/07_Power/',                  title:'Power Systems', blurb:'LiPos, linear and switching regulators, power budgets and protection.'},
        // Sensing & computing: the signal chain
        {id:'ee08', n:8,  status:'planned', path:'EE/08_Digital_MCU/',            title:'Digital Logic & Microcontrollers', blurb:'Logic levels, GPIO, pull-ups, PWM, interrupts and watchdogs.'},
        {id:'ee09', n:9,  status:'planned', path:'EE/09_Buses/',                  title:'Communication Buses', blurb:'UART, SPI, I²C, CAN and RS-485, and when to use each.'},
        {id:'ee10', n:10, status:'planned', path:'EE/10_OpAmps_Sensors/',         title:'Op-Amps & Sensor Front Ends', blurb:'Bridges, instrumentation amps, thermocouples and 4–20 mA loops.'},
        {id:'ee11', n:11, status:'planned', path:'EE/11_Data_Acquisition/',       title:'Data Acquisition', blurb:'ADCs, aliasing and anti-alias filters: from transducer to logged data.'},
        // Building hardware
        {id:'ee12', n:12, status:'planned', path:'EE/12_PCB_Design/',             title:'Schematics & PCB Design', blurb:'KiCad, footprints, grounding, decoupling and design review.'},
        {id:'ee13', n:13, status:'planned', path:'EE/13_Harnesses/',              title:'Harnesses, Connectors & Ruggedization', blurb:'Crimping, connectors, vibration and ground loops.'},
        {id:'ee14', n:14, status:'planned', path:'EE/14_Test_and_Debug/',         title:'Test, Debug & Bring-Up', blurb:'Bring-up with a current-limited supply, a debugging method, and flight-readiness testing.'},
        {id:'eeC',  n:'C', status:'planned', path:'EE/C_Capstone/',               title:'Capstone: Test-Stand DAQ Design Review', blurb:'Review a real board end to end.'}
      ]
    },
    {
      id: 'rf', title: 'RF & High-Speed Design', short: 'RF', path: 'RF/',
      blurb: 'How radio hardware works and how to design it, from transmission lines to the telemetry link. Builds on EE modules 1–4 and 12.',
      modules: [
        {id:'rf00', n:0, status:'ready',   path:'RF/00_Mindset/',                  title:'Mindset Shift: Why RF Is Different', blurb:'Lumped vs distributed, return current, and "ground is not ground".'},
        {id:'rf01', n:1, status:'ready',   path:'RF/01_Fundamentals/',             title:'RF Fundamentals', blurb:'Decibels, transmission lines, Z₀, reflections, VSWR and TDR.'},
        {id:'rf02', n:2, status:'ready',   path:'RF/02_Lines_and_Matching/',       title:'Transmission Lines & Matching', blurb:'Microstrip, the Smith chart, matching networks and S-parameters.'},
        {id:'rf03', n:3, status:'planned', path:'RF/03_Components/',               title:'RF Components & Circuit Blocks', blurb:'LNAs, PAs, filters, mixers, switches and couplers.'},
        {id:'rf04', n:4, status:'planned', path:'RF/04_PCB_Layout/',               title:'PCB Design & Layout Essentials', blurb:'Stackups, controlled impedance, vias and return paths.'},
        {id:'rf05', n:5, status:'planned', path:'RF/05_Measurements/',             title:'Measurements & Lab Tools', blurb:'VNAs, calibration, spectrum analyzers and power meters.'},
        {id:'rf06', n:6, status:'planned', path:'RF/06_System_Performance/',       title:'System-Level Performance', blurb:'Noise figure, link budgets, compression and intermodulation.'},
        {id:'rf07', n:7, status:'planned', path:'RF/07_EMC_and_Regulatory/',       title:'EMI/EMC, Integrity & Regulations', blurb:'Crosstalk, shielding, power integrity and regulatory limits.'},
        {id:'rf08', n:8, status:'planned', path:'RF/08_Simulation_and_Verification/', title:'Simulation & Verification', blurb:'EM simulation, simulation vs measurement and layout review.'},
        {id:'rf09', n:9, status:'planned', path:'RF/09_Antennas/',                 title:'Antennas', blurb:'Patterns, gain, polarization, and antennas on a rocket.'},
        {id:'rf10', n:10,status:'planned', path:'RF/10_Modulation/',               title:'Modulation & Protocols', blurb:'FSK, PSK, QAM, LoRa, bandwidth and EVM.'},
        {id:'rf11', n:11,status:'planned', path:'RF/11_Software/',                 title:'Software & Radio Control', blurb:'Configuring a radio chip: PLLs, packets, FEC and state machines.'},
        {id:'rfB',  n:'B',status:'planned', path:'RF/B_Case_Study/',                title:'Case Study: Rocket Telemetry Link', blurb:'Review a real telemetry design and prove each block works.'}
      ]
    }
  ]
};

// Videos for each module. Paste a YouTube link (or a path to an .mp4 in the repo) when it's recorded.
// Until then, the page shows the planned outline written in the module page, which doubles as your recording plan.
//   lecture: you walking through the page's content     lab: you at the bench doing the demo
window.COURSE.videos = {
  ee01: {lecture: '', lab: ''},
  ee02: {lecture: '', lab: ''},
  ee03: {lecture: '', lab: ''},
  rf00: {lecture: '', lab: ''},
  rf01: {lecture: '', lab: ''},
  rf02: {lecture: '', lab: ''}
};
