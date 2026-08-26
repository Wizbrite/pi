// =============================================================================
//  ICT COURSE CONTENT  —  scripts/data/ict-course.ts
//
//  HOW TO ADD CONTENT
//  ──────────────────
//  1. Edit the topics[], lessons[], parts[], and questions[] arrays below.
//  2. Each lesson must have at least one part (the micro-learning sections).
//  3. Questions support two types:
//       • MCQ  (Structural) — fill `options` with 4 choices.
//       • NCQ  (Open-ended) — leave `options` as an empty array [].
//  4. After editing, run:  npm run seed:ict
//     The seed is idempotent — you can re-run it safely at any time.
// =============================================================================

export const ictCourseData = {
  // ── Course metadata ──────────────────────────────────────────────────────
  title: "Information and Communication Technology (Upper Sixth)",
  level: "A-Level" as const,
  subject: "ICT",
  description:
    "Comprehensive coverage of computer networks, data communication, internet services, web technologies, and electronic services based on the Cameroon GCE A-Level ICT syllabus.",

  // ── Topics ───────────────────────────────────────────────────────────────
  topics: [
    // =========================================================================
    // TOPIC 1: UNIT 1 - CONCEPTS AND FEATURES OF NETWORKS
    // =========================================================================
    {
      title: "Unit 1: Concepts and Features of Networks",
      description:
        "Fundamentals of computer networks, architectures, hardware components, topologies, protocols, OSI model, peripheral control, and security implementation.",
      order: 1,

      lessons: [
        {
          title: "Introduction to Computer Networks",
          order: 1,
          parts: [
            {
              partNumber: 1,
              title: "Part 1: Definition & Standalone vs. Networked Computers",
              content:
               `A **computer network** is a collection of autonomous computing devices (workstations, servers, routers, etc.) that are linked by transmission media so they can exchange data and share resources such as files, printers, or applications.

**Standalone computers** – also called *air‑gapped* or *isolated* machines – operate without any network interface being active. They keep all data on local storage and can only exchange information by physically moving media (USB sticks, CDs, external hard drives).

**Networked computers** – the opposite – have at least one active network interface (Ethernet, Wi‑Fi, cellular). They can:  

1. **Share peripherals** – e.g., multiple workstations printing to a single network printer.  
2. **Centralise storage** – files are kept on a server or NAS so every user accesses the same version.  
3. **Run client‑server applications** – such as email, ERP, or remote desktop services.  

The diagram below shows a simple LAN with three client PCs and a shared printer:  

\`\`\`text
[PC‑A]───┐
          │
[PC‑B]───┼───[Switch]───[Printer]
          │
[PC‑C]───┘
\`\`\`

**Key security implication:** a networked computer inherits the vulnerabilities of every other device on the same broadcast domain, whereas a standalone computer is protected from remote network attacks but is vulnerable to physical theft.`,
              aiPromptHint:
                "Ask Pi: What are the security risks of networked computers compared to standalone systems?",
            },
            {
              partNumber: 2,
              title: "Part 2: Network Types and Architectures",
              content:
                `Networks are classified by **geographic scope** and **architectural design**.

**Geographic scope**  
| Scope | Typical coverage | Example technologies | Typical use‑case |
|------|-------------------|----------------------|------------------|
| LAN (Local Area Network) | A single building or campus | Ethernet (Cat‑5e/6), Wi‑Fi 6 | Office floor, school computer lab |
| MAN (Metropolitan Area Network) | A city or large town | Fiber‑to‑the‑node, Metro Ethernet | Municipal Wi‑Fi, ISP regional backbone |
| WAN (Wide Area Network) | Countries, continents, or the globe | MPLS, Satellite, Submarine fiber | International corporate VPN, Internet backbone |

**Architectural design** – the way nodes interact with one another:

* **Client‑Server** – a *central* server(s) provides services (file sharing, DB, web) while *clients* request those services. This model scales well, allows strict access control, and isolates failures. Example: a corporate Active Directory domain controller.

* **Peer‑to‑Peer (P2P)** – every node acts as both client and server, sharing resources equally. It is simple to set up but suffers from limited security and performance in large deployments. Example: early file‑sharing applications like Napster.

* **Hybrid** – combines elements of both; for instance, a P2P content distribution network (CDN) that relies on central control for metadata but distributes actual data among peers.

In large enterprises, **Client‑Server** is the de‑facto standard because it enables granular authentication, load balancing, and centralized management.`,
              aiPromptHint:
                "Ask Pi: Why is Client-Server architecture preferred over Peer-to-Peer for large enterprises?",
            },
          ],
          questions: [
            {
              questionText:
                "Which network architecture relies on a centralized computer dedicated to managing resources and serving client requests?",
              options: [
                "Peer-to-Peer (P2P)",
                "Client-Server",
                "Mesh Architecture",
                "Bus Architecture",
              ],
              correctAnswer: "Client-Server",
              explanation:
                "In a Client-Server architecture, central servers host data and manage network resources while client nodes request services from them.",
            },
            {
              questionText:
                "Differentiate between a standalone computer and a networked computer in terms of resource sharing.",
              options: [],
              correctAnswer:
                "A standalone computer operates independently and cannot share hardware or files directly without physical media, whereas a networked computer shares devices (e.g., printers, storage) and data over transmission links.",
              explanation:
                "Networked computers are connected via communication media, allowing remote hardware access and instantaneous data sharing.",
            },
          ],
        },
        {
          title: "Network Hardware and Topologies",
          order: 2,
          parts: [
            {
              partNumber: 1,
              title: "Part 1: Network Hardware Devices",
              content:
                `Network hardware provides the *physical* and *logical* mechanisms for moving bits between devices.

1. **Network Interface Card (NIC)** – a Layer‑2 device that attaches a host to a physical medium (copper, fiber, or wireless). It embeds a unique MAC address used for frame delivery on a LAN.

2. **Switch** – operates at the Data Link layer (Layer 2). It learns MAC addresses from incoming frames and forwards each frame only to the port where the destination device resides, dramatically reducing collisions and improving bandwidth efficiency.

3. **Router** – works at the Network layer (Layer 3). It examines IP addresses, makes routing decisions, and forwards packets between distinct IP subnets or autonomous systems. Routers also perform NAT, ACL filtering, and traffic shaping.

4. **Gateway** – a more generic term for a device that *translates* between different protocols or network architectures (e.g., an Ethernet‑to‑Wi‑Fi bridge, or a VoIP‑to‑PSTN gateway). Gateways often operate at multiple OSI layers.

5. **Modem** – Modulator‑Demodulator, bridging the digital world of a computer with analogue transmission media such as telephone lines or cable TV. It converts digital bits to analogue signals (modulation) and vice‑versa (demodulation).

All of these devices may have built‑in management interfaces (CLI, web UI, SNMP) for configuration and monitoring.`,

              aiPromptHint:
                "Ask Pi: What is the main structural difference between a Switch and a Router?",
            },
            {
              partNumber: 2,
              title: "Part 2: Physical & Logical Topologies",
              content:
                "Physical topology describes the layout of cables and nodes. Star topology connects all nodes to a central switch/hub; Bus uses a single backbone cable terminated at ends; Ring connects nodes in a closed loop; Mesh provides redundant paths between nodes. Logical topology describes how data actually travels through the physical setup (e.g., Logical Bus on a Physical Star using a Hub).",
              aiPromptHint:
                "Ask Pi: Explain why a physical star topology fails if the central switch crashes.",
            },
          ],
          questions: [
            {
              questionText:
                "Which device operates at the Network Layer to connect two disparate networks using IP addressing?",
              options: ["Switch", "Hub", "Router", "Repeater"],
              correctAnswer: "Router",
              explanation:
                "Routers forward data packets across separate networks based on logical IP addresses.",
            },
            {
              questionText:
                "State TWO advantages of a physical Star topology compared to a physical Bus topology.",
              options: [],
              correctAnswer:
                "1. Cable failure on one node does not bring down the entire network. 2. Easier to diagnose faults and isolate problem nodes.",
              explanation:
                "Star topology isolates each node on its own cable segment linked to a central switch.",
            },
          ],
        },
        {
          title: "Network Protocols & The OSI Model",
          order: 3,
          parts: [
            {
              partNumber: 1,
              title: "Part 1: Network Protocols",
              content:
                "A **protocol** is a formal set of rules that governs data exchange between network devices. Protocols define aspects such as data format, packet structure, control signals, and error handling procedures, ensuring seamless communication even between heterogeneous systems.",
              aiPromptHint:
                "Ask Pi: How does HTTPS achieve secure data transfer compared to HTTP?",
            },
            {
              partNumber: 2,
              title: "Part 2: The 7-Layer OSI Reference Model",
              content:
                "The Open Systems Interconnection (OSI) model standardizes network communication into 7 layers: 7. Application, 6. Presentation, 5. Session, 4. Transport, 3. Network, 2. Data Link, and 1. Physical. Data flows down from Layer 7 to Layer 1 via encapsulation at the transmitter, and up from Layer 1 to Layer 7 via decapsulation at the receiver.",
              aiPromptHint:
                "Ask Pi: Name a mnemonic to easily remember all 7 layers of the OSI model from Layer 7 to Layer 1.",
            },
          ],
          questions: [
            {
              questionText:
                "Which OSI model layer is responsible for logical IP addressing and packet routing across intermediate nodes?",
              options: [
                "Data Link Layer",
                "Transport Layer",
                "Network Layer",
                "Physical Layer",
              ],
              correctAnswer: "Network Layer",
              explanation:
                "Layer 3 (Network Layer) handles end-to-end packet addressing, routing, and traffic control.",
            },
            {
              questionText:
                "List the seven layers of the OSI reference model in order from Layer 1 to Layer 7.",
              options: [],
              correctAnswer:
                "1. Physical, 2. Data Link, 3. Network, 4. Transport, 5. Session, 6. Presentation, 7. Application.",
              explanation:
                "The layers begin with physical transmission (Layer 1) up to end-user software interaction (Layer 7).",
            },
          ],
        },
        {
          title: "Peripheral Control & Network Security Implementation",
          order: 4,
          parts: [
            {
              partNumber: 1,
              title: "Part 1: Peripheral Device Control Mechanisms",
              content:
                "Peripheral communication relies on control mechanisms: Buffers temporarily store data to balance speed differences between CPU and devices; Interrupts signal CPU to stop current execution for urgent I/O tasks; Polling periodically checks device status; Handshaking establishes agreement on communication parameters prior to transmission.",
              aiPromptHint:
                "Ask Pi: Why is Interrupt-driven I/O more efficient than Polling?",
            },
            {
              partNumber: 2,
              title: "Part 2: Implementing Network Security",
              content:
                "Organisations secure resources through Intranets (private internal network), Extranets (extended access for trusted partners), and Virtual Private Networks (VPNs) which tunnel encrypted traffic across public networks. Firewalls inspect incoming/outgoing traffic against predefined access rules to block unauthorized connections.",
              aiPromptHint:
                "Ask Pi: How does a VPN protect data transmitted over public Wi-Fi?",
            },
          ],
          questions: [
            {
              questionText:
                "Which device control mechanism involves the CPU periodically checking each peripheral to determine if it requires attention?",
              options: ["Interrupt", "Polling", "Buffering", "Handshaking"],
              correctAnswer: "Polling",
              explanation:
                "Polling is the CPU-driven process of sequentially querying hardware devices to verify their ready state.",
            },
            {
              questionText:
                "Explain the function of a Firewall and describe how a VPN secures corporate data transmission across the Internet.",
              options: [],
              correctAnswer:
                "A Firewall filters network traffic by inspecting data packets against security rules. A VPN creates an encrypted tunnel over public networks, preventing eavesdropping and data tampering.",
              explanation:
                "Firewalls block unauthorized network access, while VPNs protect confidentiality via encryption.",
            },
          ],
        },
      ],
    },

    // =========================================================================
    // TOPIC 2: UNIT 2 - DATA COMMUNICATION & TRANSMISSION
    // =========================================================================
    {
      title: "Unit 2: Data Communication & Transmission",
      description:
        "Principles of data communication, transmission media, error detection/correction methods, and communication modes.",
      order: 2,

      lessons: [
        {
          title: "Data Communication & Transmission Fundamentals",
          order: 1,
          parts: [
            {
              partNumber: 1,
              title: "Part 1: Components and Features of Data Communication",
              content:
                "Data communication is the exchange of data between two nodes via a transmission medium. Its essential components are the Message, Sender, Receiver, Medium, and Protocol. Performance features include Bandwidth (data capacity per second), Baud Rate (signal state changes per second), Bit Rate (bits transmitted per second), and Transmission Impairments (attenuation, noise, and distortion).",
              aiPromptHint:
                "Ask Pi: What is the relationship between Bit Rate and Baud Rate?",
            },
            {
              partNumber: 2,
              title: "Part 2: Digital vs. Analogue Transmission",
              content:
                "Transmission can be Analogue (continuous wave signals) or Digital (discrete binary pulses). Modems perform Modulation (digital to analogue conversion) and Demodulation (analogue to digital conversion) to allow digital computers to communicate over analogue media like telephone lines.",
              aiPromptHint:
                "Ask Pi: How does Amplitude Modulation differ from Frequency Modulation?",
            },
          ],
          questions: [
            {
              questionText:
                "Which term describes the loss of signal strength as a wave propagates through a transmission medium over a distance?",
              options: ["Noise", "Attenuation", "Distortion", "Crosstalk"],
              correctAnswer: "Attenuation",
              explanation:
                "Attenuation refers to the gradual reduction in signal amplitude over distance, requiring repeaters or amplifiers.",
            },
            {
              questionText:
                "List the FIVE essential components of any data communication system.",
              options: [],
              correctAnswer:
                "1. Sender, 2. Receiver, 3. Message (Data), 4. Transmission Medium, 5. Protocol.",
              explanation:
                "A data communication system requires a source, destination, data payload, transfer path, and rule set.",
            },
          ],
        },
        {
          title: "Correctness Checking Methods & Error Control",
          order: 2,
          parts: [
            {
              partNumber: 1,
              title: "Part 1: Transfer Error Detection Methods",
              content:
                "To ensure transmission integrity, systems employ error detection methods. Parity Bits add an extra bit to make total 1s even (Even Parity) or odd (Odd Parity). Checksums generate a numeric sum from data blocks, appending it to the transmission for recalculation at the receiver end. Cyclic Redundancy Check (CRC) uses polynomial division to detect block errors.",
              aiPromptHint:
                "Ask Pi: Why does a single parity bit fail to detect an even number of bit errors?",
            },
            {
              partNumber: 2,
              title: "Part 2: Self-Correcting Codes & Echo Checks",
              content:
                "Self-correcting codes, such as Hamming Code, append redundant parity bits at specific positions, allowing the receiver to locate and automatically correct single-bit errors without requesting retransmission. Echo checks require the receiving device to send received data back to the sender for verification.",
              aiPromptHint:
                "Ask Pi: How does Hamming Code calculate the position of an inverted error bit?",
            },
          ],
          questions: [
            {
              questionText:
                "Using Even Parity, what parity bit must be appended to the 7-bit data string 1011001?",
              options: ["0", "1", "10", "None"],
              correctAnswer: "0",
              explanation:
                "The string 1011001 contains 4 ones (which is already an even number). Therefore, a parity bit of 0 is appended to keep the total count even.",
            },
            {
              questionText:
                "Explain the main difference between error detection (e.g., Checksum) and error correction (e.g., Hamming Code).",
              options: [],
              correctAnswer:
                "Error detection methods only identify that data corruption occurred, requiring retransmission. Error correction codes detect and pin-point error locations, automatically correcting bit errors without retransmission.",
              explanation:
                "Self-correcting codes use redundant structure to calculate bit inversion locations directly.",
            },
          ],
        },
        {
          title: "Transmission Media & Communication Modes",
          order: 3,
          parts: [
            {
              partNumber: 1,
              title: "Part 1: Guided & Unguided Media",
              content:
                "Guided media transport signals along physical paths: Twisted Pair cables (UTP/STP) resist EMI; Coaxial cables offer shielding for high frequencies; Fibre Optic cables use total internal reflection of light waves for immune, high-bandwidth transmission. Unguided media transmit electromagnetic signals through air/vacuum: Radio waves, Microwaves (requires line-of-sight), and Infrared.",
              aiPromptHint:
                "Ask Pi: Why is Fibre Optic cabling immune to Electromagnetic Interference (EMI)?",
            },
            {
              partNumber: 2,
              title: "Part 2: Data Communication Modes",
              content:
                "Transmission direction modes include: Simplex (unidirectional communication, e.g., radio broadcasting); Half-Duplex (bidirectional communication, but only one direction at a time, e.g., Walkie-Talkies); Full-Duplex (simultaneous bidirectional communication, e.g., mobile phones). Transmission modes also classify into Serial vs Parallel and Synchronous vs Asynchronous.",
              aiPromptHint:
                "Ask Pi: What is the primary operational difference between Simplex and Half-Duplex transmission?",
            },
          ],
          questions: [
            {
              questionText:
                "Which transmission mode allows data to flow in both directions simultaneously?",
              options: ["Simplex", "Half-Duplex", "Full-Duplex", "Multiplex"],
              correctAnswer: "Full-Duplex",
              explanation:
                "Full-Duplex allows concurrent bidirectional data transfer over separate channels.",
            },
            {
              questionText:
                "Compare Fibre Optic cables and UTP Copper cables in terms of bandwidth and EMI susceptibility.",
              options: [],
              correctAnswer:
                "Fibre Optic cables provide significantly higher bandwidth and are totally immune to Electromagnetic Interference (EMI), whereas UTP copper cables have lower bandwidth limits and are susceptible to EMI.",
              explanation:
                "Fibre transmits pulses of light through glass, eliminating electrical interference.",
            },
          ],
        },
      ],
    },

    // =========================================================================
    // TOPIC 3: UNIT 3 - THE INTERNET
    // =========================================================================
    {
      title: "Unit 3: The Internet",
      description:
        "Internet structure, ISP operations, core Internet services, social networks, collaborative platforms, and full-stack web development (HTML, CSS, PHP, JS, Hosting).",
      order: 3,

      lessons: [
        {
          title: "Structure of the Internet & Internet Services",
          order: 1,
          parts: [
            {
              partNumber: 1,
              title: "Part 1: Internet Infrastructure & ISP Architecture",
              content:
                "The Internet is a globally connected WAN of networks using TCP/IP protocols. Internet Service Providers (ISPs) provide user connectivity and are arranged hierarchically: Tier 1 ISPs form the global Internet Backbone, Tier 2 are regional providers, and Tier 3 are local ISPs. Connection technologies include DSL, Cable, Fibre (FTTH), Satellite, and Cellular (4G/5G).",
              aiPromptHint:
                "Ask Pi: How does DNS convert human-readable URLs into IP addresses?",
            },
            {
              partNumber: 2,
              title: "Part 2: Internet & Collaborative Services",
              content:
                "Core internet services include the World Wide Web (WWW), Email (SMTP/POP/IMAP), FTP, VoIP, and SSH. Social networking platforms enable communication and community interactions, while Collaborative Environments (Wiki, Forums, Blogs, Google Workspace) allow remote real-time content creation and knowledge sharing.",
              aiPromptHint:
                "Ask Pi: What is the main structural difference between the Internet and the World Wide Web?",
            },
          ],
          questions: [
            {
              questionText:
                "Which organization level operates the global fiber-optic backbone networks that form the primary internet infrastructure?",
              options: [
                "Tier 3 ISP",
                "Tier 1 ISP",
                "Local Internet Registry",
                "Sub-domain Manager",
              ],
              correctAnswer: "Tier 1 ISP",
              explanation:
                "Tier 1 ISPs own and operate the high-speed optical backbone infrastructure of the Internet.",
            },
            {
              questionText:
                "Explain the role of an Internet Service Provider (ISP) and list TWO technologies used by ISPs to deliver home internet access.",
              options: [],
              correctAnswer:
                "An ISP provides commercial infrastructure access connecting client equipment to the global Internet. Connection technologies include DSL, FTTH (Fibre to the Home), Cable, or 4G/5G Cellular.",
              explanation:
                "ISPs lease routing bandwidth and issue IP addresses to subscribers.",
            },
          ],
        },
        {
          title: "Web Development Technologies (HTML, CSS, JavaScript, PHP)",
          order: 2,
          parts: [
            {
              partNumber: 1,
              title: "Part 1: Client-Side Markup & Styling (HTML & CSS)",
              content:
                "HTML (HyperText Markup Language) structures web content using semantic tags (`<div>`, `<form>`, `<table>`, `<a>`, `<img>`, `<video>`). CSS (Cascading Style Sheets) controls styling and layout presentation using selectors, properties, and values, supporting responsive design across viewing devices.",
              aiPromptHint:
                "Ask Pi: What is the difference between inline, internal, and external CSS?",
            },
            {
              partNumber: 2,
              title: "Part 2: Client-Side & Server-Side Scripting (JS & PHP)",
              content:
                "JavaScript runs on the client browser to create dynamic interactive user interfaces, modify DOM elements, and validate form inputs. PHP (Hypertext Preprocessor) is a server-side scripting language executed on the web server to handle business logic, process HTML form requests, and interface with relational databases.",
              aiPromptHint:
                "Ask Pi: Why must form validation be performed on the server-side even if JavaScript handles it on the client-side?",
            },
          ],
          questions: [
            {
              questionText:
                "Which web technology is primarily executed on the server to process form data and interact with databases?",
              options: ["JavaScript", "HTML5", "CSS3", "PHP"],
              correctAnswer: "PHP",
              explanation:
                "PHP is a server-side scripting engine that handles logic and database interactions before sending HTML to the browser.",
            },
            {
              questionText:
                "State the specific roles of HTML, CSS, and JavaScript in modern web development.",
              options: [],
              correctAnswer:
                "HTML provides web content structure; CSS handles styling and layout visual presentation; JavaScript implements client-side interactivity and dynamic behavior.",
              explanation:
                "These three client-side technologies handle structure, layout, and functionality respectively.",
            },
          ],
        },
        {
          title: "Web Hosting Platforms & Requirements",
          order: 3,
          parts: [
            {
              partNumber: 1,
              title: "Part 1: Web Server Architecture & Hosting Requirements",
              content:
                "To publish websites, web servers (e.g., Apache, Nginx, IIS) store web assets and listen for incoming HTTP/HTTPS requests. Web hosting environments include Shared Hosting (multiple sites share one server), Virtual Private Server (VPS), Dedicated Hosting, and Cloud Hosting. Essential deployment assets include domain registration, DNS mapping, and database access.",
              aiPromptHint:
                "Ask Pi: What is the difference between Shared Hosting and Dedicated Hosting?",
            },
          ],
          questions: [
            {
              questionText:
                "Which web hosting option isolates virtual server resources on a shared physical server, giving root access control?",
              options: [
                "Shared Hosting",
                "Virtual Private Server (VPS)",
                "Domain Parking",
                "FTP Gateway",
              ],
              correctAnswer: "Virtual Private Server (VPS)",
              explanation:
                "A VPS utilizes hypervisors to partition a physical server into dedicated virtual operating environments.",
            },
            {
              questionText:
                "Outline the steps required to publish a static HTML/CSS/JS website to the live Internet.",
              options: [],
              correctAnswer:
                "1. Register a unique Domain Name. 2. Purchase Web Hosting space on a Web Server. 3. Upload site files via FTP/SFTP. 4. Configure Domain DNS records (A record) to point to the server's IP address.",
              explanation:
                "Web publishing requires file uploading to a web server and DNS record linking.",
            },
          ],
        },
      ],
    },

    // =========================================================================
    // TOPIC 4: UNIT 4 - ELECTRONIC SERVICES
    // =========================================================================
    {
      title: "Unit 4: Electronic Services",
      description:
        "Analysis of modern online electronic services: E-Commerce, E-Banking, E-Health, Computer-Assisted Learning (CAL), E-Government, and Digital Customer Systems.",
      order: 4,

      lessons: [
        {
          title: "E-Commerce, E-Banking & Financial Services",
          order: 1,
          parts: [
            {
              partNumber: 1,
              title: "Part 1: E-Commerce Models & Architecture",
              content:
                "E-Commerce is the electronic buying and selling of goods/services across online networks. Business models include B2B (Business-to-Business), B2C (Business-to-Consumer), and C2C (Consumer-to-Consumer, e.g., online auctions). Essential infrastructure includes digital product catalogs, shopping carts, secure payment gateways (SSL/TLS), and inventory automation.",
              aiPromptHint:
                "Ask Pi: How do secure payment gateways process credit card transactions online?",
            },
            {
              partNumber: 2,
              title: "Part 2: E-Banking Services & Security",
              content:
                "E-Banking allows customers to conduct financial transactions remotely via electronic platforms. Services include electronic funds transfer (EFT), mobile banking, real-time balance inquiries, utility payments, and online credit processing. Security depends on multi-factor authentication (MFA), end-to-end encryption, and fraud-detection monitoring.",
              aiPromptHint:
                "Ask Pi: What is Multi-Factor Authentication and why is it mandatory in E-Banking?",
            },
          ],
          questions: [
            {
              questionText:
                "An online auction site where private individuals sell goods directly to other individuals operates under which model?",
              options: [
                "B2B (Business-to-Business)",
                "B2C (Business-to-Consumer)",
                "C2C (Consumer-to-Consumer)",
                "G2C (Government-to-Citizen)",
              ],
              correctAnswer: "C2C (Consumer-to-Consumer)",
              explanation:
                "C2C platforms facilitate direct transactions between individual consumers.",
            },
            {
              questionText:
                "State TWO advantages and TWO security risks associated with E-Banking services.",
              options: [],
              correctAnswer:
                "Advantages: 24/7 account access and convenient remote transfers. Security Risks: Phishing attacks and credential theft via keyloggers or malware.",
              explanation:
                "E-Banking improves accessibility, but introduces web-based cybersecurity threats.",
            },
          ],
        },
        {
          title: "E-Health, E-Government & Computer Assisted Learning (CAL)",
          order: 2,
          parts: [
            {
              partNumber: 1,
              title: "Part 1: E-Health & Telemedicine Systems",
              content:
                "E-Health integrates ICT into healthcare administration and patient treatment. Key applications include Electronic Health Records (EHR) for centralized patient history, Telemedicine for remote specialist consultations, and AI diagnostic analysis tools. Major concerns involve strict data privacy, HIPAA compliance, and system availability.",
              aiPromptHint:
                "Ask Pi: How does Telemedicine benefit rural communities with limited specialists?",
            },
            {
              partNumber: 2,
              title: "Part 2: E-Government & Computer Assisted Learning (CAL)",
              content:
                "E-Government uses IT platforms to deliver public services to citizens (G2C), businesses (G2B), and government agencies (G2G), such as online tax filing, passport renewals, and voting registries. Computer Assisted Learning (CAL) uses educational software, simulations, and Learning Management Systems (LMS) to facilitate self-paced, interactive instruction.",
              aiPromptHint:
                "Ask Pi: What are the benefits of G2C E-Government portals for public administration?",
            },
          ],
          questions: [
            {
              questionText:
                "Which domain of E-Government covers online public service delivery directly to individual citizens, such as driver's license renewals?",
              options: ["G2B", "G2G", "G2C", "C2C"],
              correctAnswer: "G2C",
              explanation:
                "Government-to-Citizen (G2C) platforms allow individual citizens to access public services online.",
            },
            {
              questionText:
                "Explain how Computer Assisted Learning (CAL) improves educational outcomes compared to traditional rote learning.",
              options: [],
              correctAnswer:
                "CAL provides interactive simulations, immediate feedback on assessments, self-paced learning paths, and accessible multimedia content tailored to individual student speeds.",
              explanation:
                "CAL leverages interactive multimedia and software feedback loops to enhance comprehension.",
            },
          ],
        },
      ],
    },
  ],
};

// =============================================================================
//  END OF CONTENT FILE
// =============================================================================