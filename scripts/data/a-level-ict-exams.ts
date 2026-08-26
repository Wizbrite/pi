// =============================================================================
//  ICT A-LEVEL EXAM DATA — scripts/data/a-level-ict-exams.ts
//
//  HOW TO ADD MORE EXAMS
//  ─────────────────────
//  1. Add a new object to the `subjects` array for a new subject, OR
//     add papers/questions to an existing subject.
//  2. Each subject must have a unique `slug` (used in URLs).
//  3. Each paper must have a unique `slug`.
//  4. Questions are identified by (examPaperId + questionNumber) for upserts.
//  5. After editing, run:  npm run seed:exams
//     The seed is idempotent — re-running will update existing records
//     and insert new ones WITHOUT deleting anything.
// =============================================================================

export const examSeedData = {
  subjects: [
    {
      slug: "ict-a",
      title: "Information & Communication Technology",
      code: "ICT801",
      level: "A-Level" as const,
      category: "Science" as const,
      description:
        "GCE Advanced Level ICT examination papers covering Networks, Data Communication, Internet Technologies, and Electronic Services.",

      papers: [
        // ─────────────────────────────────────────────────────────
        // Paper 1 — MCQ (50 marks, 90 minutes)
        // ─────────────────────────────────────────────────────────
        {
          slug: "ict801-2024-p1",
          year: 2024,
          paperNumber: 1,
          title: "Paper 1 — Multiple Choice Questions",
          type: "MCQ" as const,
          durationMinutes: 90,
          totalMarks: 50,

          questions: [
            // ── Unit 1: Networks ──
            {
              questionNumber: 1,
              text: "Which network architecture relies on a centralized computer dedicated to managing resources and serving client requests?",
              options: [
                "Peer-to-Peer (P2P)",
                "Client-Server",
                "Mesh Architecture",
                "Bus Architecture",
              ],
              correctAnswerIndex: 1,
              correctAnswerText: "Client-Server",
              marks: 1,
              topic: "Networks — Architecture",
              markingSchemeNotes:
                "In a Client-Server architecture, central servers host data and manage network resources while client nodes request services from them.",
              aiExplanation:
                "Client-Server separates resource management (server) from resource consumption (client), enabling centralized control, security, and scalability.",
            },
            {
              questionNumber: 2,
              text: "Which device operates at the Network Layer (Layer 3) of the OSI model to connect two disparate networks using IP addressing?",
              options: ["Switch", "Hub", "Router", "Repeater"],
              correctAnswerIndex: 2,
              correctAnswerText: "Router",
              marks: 1,
              topic: "Networks — Hardware",
              markingSchemeNotes:
                "Routers forward data packets across separate networks based on logical IP addresses at Layer 3.",
              aiExplanation:
                "Routers examine destination IP addresses in packet headers and make forwarding decisions across network boundaries using routing tables.",
            },
            {
              questionNumber: 3,
              text: "Which OSI model layer is responsible for logical IP addressing and packet routing across intermediate nodes?",
              options: [
                "Data Link Layer",
                "Transport Layer",
                "Network Layer",
                "Physical Layer",
              ],
              correctAnswerIndex: 2,
              correctAnswerText: "Network Layer",
              marks: 1,
              topic: "Networks — OSI Model",
              markingSchemeNotes:
                "Layer 3 (Network Layer) handles end-to-end packet addressing, routing, and traffic control.",
              aiExplanation:
                "The Network Layer (Layer 3) is where IP addressing and routing decisions happen, enabling data to traverse multiple networks to reach its destination.",
            },
            {
              questionNumber: 4,
              text: "Which device control mechanism involves the CPU periodically checking each peripheral to determine if it requires attention?",
              options: ["Interrupt", "Polling", "Buffering", "Handshaking"],
              correctAnswerIndex: 1,
              correctAnswerText: "Polling",
              marks: 1,
              topic: "Networks — Peripheral Control",
              markingSchemeNotes:
                "Polling is the CPU-driven process of sequentially querying hardware devices to verify their ready state.",
              aiExplanation:
                "In polling, the CPU actively and repeatedly checks each device's status register. Simple to implement but wastes CPU cycles when devices are idle.",
            },
            {
              questionNumber: 5,
              text: "A Local Area Network (LAN) typically covers which geographic scope?",
              options: [
                "A single building or campus",
                "A metropolitan city",
                "Multiple countries",
                "The entire globe",
              ],
              correctAnswerIndex: 0,
              correctAnswerText: "A single building or campus",
              marks: 1,
              topic: "Networks — Types",
              markingSchemeNotes:
                "LANs are confined to a small geographic area such as a room, floor, building, or campus.",
              aiExplanation:
                "LANs use technologies like Ethernet and Wi-Fi to connect devices within a limited area, typically owned and managed by a single organization.",
            },
            {
              questionNumber: 6,
              text: "In a Star topology, what happens when the central switch fails?",
              options: [
                "Only one node is affected",
                "The entire network goes down",
                "The network automatically reconfigures to a ring",
                "Performance degrades but no nodes disconnect",
              ],
              correctAnswerIndex: 1,
              correctAnswerText: "The entire network goes down",
              marks: 1,
              topic: "Networks — Topologies",
              markingSchemeNotes:
                "Star topology has a single point of failure at the central device. All communication passes through it.",
              aiExplanation:
                "In a Star topology, every node connects to the central switch/hub. If the central device fails, no node can communicate with any other.",
            },
            {
              questionNumber: 7,
              text: "Which security technology creates an encrypted tunnel over public networks to protect corporate data?",
              options: [
                "Firewall",
                "Antivirus software",
                "Virtual Private Network (VPN)",
                "Proxy server",
              ],
              correctAnswerIndex: 2,
              correctAnswerText: "Virtual Private Network (VPN)",
              marks: 1,
              topic: "Networks — Security",
              markingSchemeNotes:
                "VPNs create encrypted tunnels across public networks, preventing eavesdropping and data tampering.",
              aiExplanation:
                "A VPN encapsulates and encrypts all traffic between the client and the VPN server, making data unreadable to anyone intercepting it on the public network.",
            },

            // ── Unit 2: Data Communication ──
            {
              questionNumber: 8,
              text: "Which term describes the loss of signal strength as a wave propagates through a transmission medium over a distance?",
              options: ["Noise", "Attenuation", "Distortion", "Crosstalk"],
              correctAnswerIndex: 1,
              correctAnswerText: "Attenuation",
              marks: 1,
              topic: "Data Communication — Impairments",
              markingSchemeNotes:
                "Attenuation refers to the gradual reduction in signal amplitude over distance, requiring repeaters or amplifiers.",
              aiExplanation:
                "As signals travel through any medium (copper, fibre, air), they lose energy. This weakening is attenuation, measured in decibels (dB).",
            },
            {
              questionNumber: 9,
              text: "Using Even Parity, what parity bit must be appended to the 7-bit data string 1011001?",
              options: ["0", "1", "10", "None"],
              correctAnswerIndex: 0,
              correctAnswerText: "0",
              marks: 1,
              topic: "Data Communication — Error Detection",
              markingSchemeNotes:
                "The string 1011001 contains 4 ones (already even). A parity bit of 0 keeps the total count even.",
              aiExplanation:
                "Count the 1s: 1+0+1+1+0+0+1 = 4 (even). For even parity, append 0 so the total remains even (4+0 = 4).",
            },
            {
              questionNumber: 10,
              text: "Which transmission mode allows data to flow in both directions simultaneously?",
              options: ["Simplex", "Half-Duplex", "Full-Duplex", "Multiplex"],
              correctAnswerIndex: 2,
              correctAnswerText: "Full-Duplex",
              marks: 1,
              topic: "Data Communication — Modes",
              markingSchemeNotes:
                "Full-Duplex allows concurrent bidirectional data transfer over separate channels.",
              aiExplanation:
                "Full-Duplex uses two separate channels (or frequency bands) so both parties can send and receive at the same time, like a telephone conversation.",
            },
            {
              questionNumber: 11,
              text: "Which type of guided transmission medium uses total internal reflection of light to achieve high bandwidth and immunity to EMI?",
              options: [
                "Twisted Pair (UTP)",
                "Coaxial Cable",
                "Fibre Optic Cable",
                "Radio Wave",
              ],
              correctAnswerIndex: 2,
              correctAnswerText: "Fibre Optic Cable",
              marks: 1,
              topic: "Data Communication — Media",
              markingSchemeNotes:
                "Fibre optic transmits pulses of light through glass/plastic core using total internal reflection.",
              aiExplanation:
                "Fibre optic cables carry data as light pulses. Since light doesn't generate or respond to electromagnetic fields, fibre is immune to EMI.",
            },
            {
              questionNumber: 12,
              text: "A Hamming Code is primarily used for:",
              options: [
                "Data compression",
                "Error detection only",
                "Error detection and automatic correction",
                "Encryption of data",
              ],
              correctAnswerIndex: 2,
              correctAnswerText: "Error detection and automatic correction",
              marks: 1,
              topic: "Data Communication — Error Correction",
              markingSchemeNotes:
                "Hamming codes are self-correcting codes that can detect and correct single-bit errors without retransmission.",
              aiExplanation:
                "Hamming codes insert redundant parity bits at power-of-2 positions, enabling the receiver to locate and flip the corrupted bit automatically.",
            },

            // ── Unit 3: Internet ──
            {
              questionNumber: 13,
              text: "Which organization level operates the global fibre-optic backbone networks that form the primary Internet infrastructure?",
              options: [
                "Tier 3 ISP",
                "Tier 1 ISP",
                "Local Internet Registry",
                "Sub-domain Manager",
              ],
              correctAnswerIndex: 1,
              correctAnswerText: "Tier 1 ISP",
              marks: 1,
              topic: "Internet — ISP Architecture",
              markingSchemeNotes:
                "Tier 1 ISPs own and operate the high-speed optical backbone infrastructure of the Internet.",
              aiExplanation:
                "Tier 1 ISPs (e.g., AT&T, NTT) form the Internet backbone. They peer with each other at no cost and sell transit to Tier 2/3 providers.",
            },
            {
              questionNumber: 14,
              text: "Which web technology is primarily executed on the server to process form data and interact with databases?",
              options: ["JavaScript", "HTML5", "CSS3", "PHP"],
              correctAnswerIndex: 3,
              correctAnswerText: "PHP",
              marks: 1,
              topic: "Internet — Web Technologies",
              markingSchemeNotes:
                "PHP is a server-side scripting engine that handles logic and database interactions before sending HTML to the browser.",
              aiExplanation:
                "PHP (Hypertext Preprocessor) runs on the web server, processes business logic, queries databases, and generates HTML that is sent to the client browser.",
            },
            {
              questionNumber: 15,
              text: "Which web hosting option isolates virtual server resources on a shared physical server, giving root access control?",
              options: [
                "Shared Hosting",
                "Virtual Private Server (VPS)",
                "Domain Parking",
                "FTP Gateway",
              ],
              correctAnswerIndex: 1,
              correctAnswerText: "Virtual Private Server (VPS)",
              marks: 1,
              topic: "Internet — Hosting",
              markingSchemeNotes:
                "A VPS utilizes hypervisors to partition a physical server into dedicated virtual operating environments.",
              aiExplanation:
                "VPS hosting uses virtualization to create isolated server instances on shared hardware. Each VPS has its own OS, root access, and dedicated resources.",
            },

            // ── Unit 4: Electronic Services ──
            {
              questionNumber: 16,
              text: "An online auction site where private individuals sell goods directly to other individuals operates under which e-commerce model?",
              options: [
                "B2B (Business-to-Business)",
                "B2C (Business-to-Consumer)",
                "C2C (Consumer-to-Consumer)",
                "G2C (Government-to-Citizen)",
              ],
              correctAnswerIndex: 2,
              correctAnswerText: "C2C (Consumer-to-Consumer)",
              marks: 1,
              topic: "Electronic Services — E-Commerce",
              markingSchemeNotes:
                "C2C platforms facilitate direct transactions between individual consumers.",
              aiExplanation:
                "C2C (Consumer-to-Consumer) e-commerce involves individuals selling to individuals, typically through platforms like eBay or Facebook Marketplace.",
            },
            {
              questionNumber: 17,
              text: "Which domain of e-government covers online public service delivery directly to individual citizens?",
              options: ["G2B", "G2G", "G2C", "C2C"],
              correctAnswerIndex: 2,
              correctAnswerText: "G2C",
              marks: 1,
              topic: "Electronic Services — E-Government",
              markingSchemeNotes:
                "Government-to-Citizen (G2C) platforms allow individual citizens to access public services online.",
              aiExplanation:
                "G2C services include online tax filing, licence renewals, and government portals that serve citizens directly via the internet.",
            },
            {
              questionNumber: 18,
              text: "What security measure is mandatory in e-banking to verify user identity through multiple independent factors?",
              options: [
                "Single Sign-On (SSO)",
                "Multi-Factor Authentication (MFA)",
                "CAPTCHA verification",
                "Cookie tracking",
              ],
              correctAnswerIndex: 1,
              correctAnswerText: "Multi-Factor Authentication (MFA)",
              marks: 1,
              topic: "Electronic Services — E-Banking",
              markingSchemeNotes:
                "MFA requires two or more independent verification factors: something you know, have, or are.",
              aiExplanation:
                "MFA combines multiple authentication factors (password + SMS code + fingerprint) to dramatically reduce unauthorized access to banking systems.",
            },
            {
              questionNumber: 19,
              text: "Which electronic health application allows patients to consult specialists remotely via video conferencing?",
              options: [
                "Electronic Health Records (EHR)",
                "Telemedicine",
                "Health Insurance Portal",
                "Pharmacy Automation",
              ],
              correctAnswerIndex: 1,
              correctAnswerText: "Telemedicine",
              marks: 1,
              topic: "Electronic Services — E-Health",
              markingSchemeNotes:
                "Telemedicine uses telecommunications for remote clinical consultations between patients and medical professionals.",
              aiExplanation:
                "Telemedicine bridges geographical barriers, allowing patients in rural or remote areas to access specialist medical consultations via video/audio links.",
            },
            {
              questionNumber: 20,
              text: "Computer Assisted Learning (CAL) improves education through all of the following EXCEPT:",
              options: [
                "Interactive simulations",
                "Immediate assessment feedback",
                "Physical laboratory experiments",
                "Self-paced learning paths",
              ],
              correctAnswerIndex: 2,
              correctAnswerText: "Physical laboratory experiments",
              marks: 1,
              topic: "Electronic Services — CAL",
              markingSchemeNotes:
                "CAL is software-based learning; physical lab experiments require hands-on equipment, not computer software.",
              aiExplanation:
                "While CAL can simulate experiments, actual physical laboratory work requires real equipment and materials, which is outside CAL's digital scope.",
            },
          ],
        },

        // ─────────────────────────────────────────────────────────
        // Paper 2 — Structured / Essay (100 marks, 150 minutes)
        // ─────────────────────────────────────────────────────────
        {
          slug: "ict801-2024-p2",
          year: 2024,
          paperNumber: 2,
          title: "Paper 2 — Structured & Essay Questions",
          type: "Structured" as const,
          durationMinutes: 150,
          totalMarks: 100,

          questions: [
            {
              questionNumber: 1,
              text: "a) Differentiate between a standalone computer and a networked computer in terms of resource sharing. (4 marks)\nb) Explain why Client-Server architecture is preferred over Peer-to-Peer for large enterprise networks. (6 marks)\nc) State TWO advantages of a physical Star topology compared to a physical Bus topology. (4 marks)",
              options: [],
              correctAnswerIndex: -1,
              correctAnswerText:
                "a) A standalone computer operates independently and cannot share hardware or files directly without physical media, whereas a networked computer shares devices (e.g., printers, storage) and data over transmission links.\n\nb) Client-Server is preferred because: (1) It enables centralized security management and access control via the server. (2) It scales better as dedicated servers handle increasing workloads. (3) Data backup and recovery is centralized. (4) Resources like databases and printers are managed efficiently from one point.\n\nc) 1. Cable failure on one node does not bring down the entire network. 2. Easier to diagnose faults and isolate problem nodes since each has a dedicated link.",
              marks: 14,
              topic: "Networks — Architecture & Topologies",
              markingSchemeNotes:
                "Award 1 mark per valid point. Part (a): 2 marks standalone, 2 marks networked. Part (b): 1.5 marks per valid reason (need 4). Part (c): 2 marks per advantage.",
              aiExplanation:
                "This question tests understanding of network fundamentals. Focus on the practical implications of each architecture rather than just definitions.",
            },
            {
              questionNumber: 2,
              text: "a) List the seven layers of the OSI reference model in order from Layer 1 to Layer 7. (7 marks)\nb) For EACH of the following devices, state the OSI layer at which it primarily operates and explain its function:\n   i) Switch (3 marks)\n   ii) Router (3 marks)\n   iii) Gateway (3 marks)",
              options: [],
              correctAnswerIndex: -1,
              correctAnswerText:
                "a) 1. Physical, 2. Data Link, 3. Network, 4. Transport, 5. Session, 6. Presentation, 7. Application.\n\nb) i) Switch — Data Link Layer (Layer 2): Learns MAC addresses from incoming frames and forwards each frame only to the port where the destination device resides.\n   ii) Router — Network Layer (Layer 3): Examines IP addresses, makes routing decisions, and forwards packets between distinct IP subnets.\n   iii) Gateway — Multiple layers (typically Application Layer): Translates between different protocols or network architectures.",
              marks: 16,
              topic: "Networks — OSI Model & Hardware",
              markingSchemeNotes:
                "Part (a): 1 mark per correct layer in correct order. Part (b): 1 mark for correct layer, 2 marks for function explanation per device.",
              aiExplanation:
                "Remember the mnemonic 'Please Do Not Throw Sausage Pizza Away' for layers 1-7. Each device operates at the layer matching its addressing scheme.",
            },
            {
              questionNumber: 3,
              text: "a) Define the term 'protocol' in the context of data communication. (2 marks)\nb) Explain the difference between Analogue and Digital transmission. (4 marks)\nc) Describe the function of a Modem, explaining both Modulation and Demodulation processes. (4 marks)\nd) List the FIVE essential components of a data communication system. (5 marks)",
              options: [],
              correctAnswerIndex: -1,
              correctAnswerText:
                "a) A protocol is a formal set of rules that governs data exchange between network devices, defining data format, packet structure, control signals, and error handling.\n\nb) Analogue transmission uses continuous wave signals that vary in amplitude, frequency, or phase. Digital transmission uses discrete binary pulses (0s and 1s) that are less susceptible to noise degradation.\n\nc) A Modem (Modulator-Demodulator) converts digital signals to analogue (Modulation) for transmission over analogue media like telephone lines, and converts received analogue signals back to digital (Demodulation) for the computer.\n\nd) 1. Sender, 2. Receiver, 3. Message (Data), 4. Transmission Medium, 5. Protocol.",
              marks: 15,
              topic: "Data Communication — Fundamentals",
              markingSchemeNotes:
                "Part (a): 2 marks for complete definition. Part (b): 2 marks analogue, 2 marks digital. Part (c): 2 marks modulation, 2 marks demodulation. Part (d): 1 mark each.",
              aiExplanation:
                "This question covers the foundational theory of data communication. Ensure your answers are precise and use technical terminology appropriately.",
            },
            {
              questionNumber: 4,
              text: "a) Compare Fibre Optic cables and UTP Copper cables in terms of:\n   i) Bandwidth capacity (2 marks)\n   ii) EMI susceptibility (2 marks)\n   iii) Cost of installation (2 marks)\nb) Explain the main difference between error detection (e.g., Checksum) and error correction (e.g., Hamming Code). (4 marks)\nc) Distinguish between Simplex, Half-Duplex, and Full-Duplex communication modes, giving one example of each. (6 marks)",
              options: [],
              correctAnswerIndex: -1,
              correctAnswerText:
                "a) i) Fibre Optic provides significantly higher bandwidth (up to terabits per second) compared to UTP which is limited to about 10 Gbps.\n   ii) Fibre Optic is totally immune to EMI as it transmits light, while UTP copper is susceptible to electromagnetic interference from nearby electrical sources.\n   iii) Fibre Optic has higher installation costs due to specialised equipment and splicing, while UTP copper is cheaper and easier to terminate.\n\nb) Error detection methods (Checksum, Parity, CRC) only identify that corruption occurred, requiring retransmission via ARQ. Error correction codes (Hamming) detect AND locate error positions, automatically correcting bit errors without retransmission.\n\nc) Simplex: Unidirectional only (e.g., TV broadcasting). Half-Duplex: Bidirectional but one direction at a time (e.g., Walkie-Talkie). Full-Duplex: Simultaneous bidirectional (e.g., mobile phone call).",
              marks: 16,
              topic: "Data Communication — Media & Modes",
              markingSchemeNotes:
                "Part (a): 2 marks per comparison point. Part (b): 2 marks detection, 2 marks correction. Part (c): 1 mark definition + 1 mark example per mode.",
              aiExplanation:
                "When comparing transmission media, focus on measurable differences. For communication modes, the key differentiator is directionality and simultaneity.",
            },
            {
              questionNumber: 5,
              text: "a) Explain the role of an Internet Service Provider (ISP) and describe the three-tier ISP hierarchy. (6 marks)\nb) State the specific roles of HTML, CSS, and JavaScript in modern web development. (6 marks)\nc) Outline the steps required to publish a static HTML/CSS/JS website to the live Internet. (4 marks)",
              options: [],
              correctAnswerIndex: -1,
              correctAnswerText:
                "a) An ISP provides commercial infrastructure access connecting client equipment to the global Internet. Tier 1 ISPs operate the global fibre-optic backbone and peer with each other. Tier 2 ISPs are regional providers that buy transit from Tier 1. Tier 3 ISPs are local providers that connect end-users.\n\nb) HTML provides web content structure using semantic tags. CSS handles styling, layout, and visual presentation using selectors and properties. JavaScript implements client-side interactivity, dynamic behaviour, and DOM manipulation.\n\nc) 1. Register a unique Domain Name. 2. Purchase Web Hosting space on a Web Server. 3. Upload site files via FTP/SFTP. 4. Configure Domain DNS records (A record) to point to the server's IP address.",
              marks: 16,
              topic: "Internet — Infrastructure & Web Development",
              markingSchemeNotes:
                "Part (a): 2 marks ISP role, 2 marks per tier (need all 3). Part (b): 2 marks per technology. Part (c): 1 mark per step.",
              aiExplanation:
                "ISP hierarchy is a core GCE topic. Remember that Tier 1 = backbone, Tier 2 = regional, Tier 3 = local access. Web technologies have distinct roles: structure, style, behaviour.",
            },
            {
              questionNumber: 6,
              text: "a) Define E-Commerce and explain THREE e-commerce business models (B2B, B2C, C2C). (6 marks)\nb) State TWO advantages and TWO security risks associated with E-Banking services. (4 marks)\nc) Explain how Computer Assisted Learning (CAL) improves educational outcomes compared to traditional classroom-only methods. Give THREE specific benefits. (6 marks)\nd) Describe the concept of Telemedicine and explain how it benefits rural communities with limited access to medical specialists. (4 marks)",
              options: [],
              correctAnswerIndex: -1,
              correctAnswerText:
                "a) E-Commerce is the buying and selling of goods/services electronically over networks. B2B: Transactions between businesses (e.g., wholesale suppliers). B2C: Business sells to individual consumers (e.g., Amazon). C2C: Individuals sell to other individuals (e.g., eBay auctions).\n\nb) Advantages: 1. 24/7 account access from anywhere. 2. Convenient remote transfers and bill payments. Risks: 1. Phishing attacks targeting login credentials. 2. Credential theft via keyloggers or malware.\n\nc) 1. Interactive simulations allow hands-on virtual experimentation. 2. Immediate automated feedback on assessments helps students identify weaknesses instantly. 3. Self-paced learning paths accommodate different student speeds and learning styles.\n\nd) Telemedicine uses telecommunications for remote clinical consultations. It benefits rural communities by: eliminating travel to distant hospitals, providing access to specialists not locally available, enabling real-time video consultations for diagnosis, and reducing healthcare costs for patients.",
              marks: 20,
              topic: "Electronic Services — E-Commerce, E-Banking, CAL, E-Health",
              markingSchemeNotes:
                "Part (a): 1 mark definition, 2 marks per model explanation (need B2B, B2C, C2C). Part (b): 1 mark per point. Part (c): 2 marks per benefit. Part (d): 2 marks concept, 2 marks rural benefit.",
              aiExplanation:
                "This comprehensive question covers all electronic services in Unit 4. Structure your answers clearly with labeled points for maximum marks.",
            },
          ],
        },
      ],
    },
  ],
};
