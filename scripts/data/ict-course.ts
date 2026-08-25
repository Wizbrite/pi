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
  title: "Information and Communication Technology",
  level: "O-Level" as const,
  subject: "ICT",
  description:
    "Comprehensive introduction to computer systems, hardware components, data representation, and networking.",

  // ── Topics ───────────────────────────────────────────────────────────────
  topics: [
    // =========================================================================
    // TOPIC 1
    // =========================================================================
    {
      title: "Hardware Components & Architecture",
      description:
        "Understanding CPUs, primary/secondary storage, and input/output mechanisms.",
      order: 1,

      // ── Lessons inside Topic 1 ──────────────────────────────────────────
      lessons: [
        // -------------------------------------------------------------------
        // LESSON 1.1
        // -------------------------------------------------------------------
        {
          title: "Input Devices and Microprocessors",
          order: 1,

          // Parts — add as many sections as you need
          parts: [
            {
              partNumber: 1,
              title: "Part 1: Manual Input Devices",
              content:
                // ✏️  REPLACE this text with the actual lesson content
                "Manual input devices require direct human intervention to send data to a computer. Examples include keyboards, mice, trackpads, and graphics tablets. A keyboard encodes each keypress into an ASCII or Unicode value before sending it to the CPU via the system bus.",
              aiPromptHint:
                "Ask AI: What is the difference between an optical mouse and a laser mouse?",
            },
            {
              partNumber: 2,
              title: "Part 2: Automatic & Sensor-Based Input",
              content:
                // ✏️  REPLACE this text with the actual lesson content
                "Automatic input devices capture data without manual keying. Barcode scanners, RFID readers, and biometric sensors convert physical signals into digital data the CPU can process. An Analogue-to-Digital Converter (ADC) is the key component that bridges continuous physical measurements and discrete binary values.",
              aiPromptHint:
                "Ask AI: How does an ADC convert an analogue signal to a digital one?",
            },
            {
              partNumber: 3,
              title: "Part 3: The Microprocessor (CPU)",
              content:
                // ✏️  REPLACE this text with the actual lesson content
                "The Central Processing Unit (CPU) is the brain of a computer. It follows the Fetch–Decode–Execute cycle: it fetches an instruction from RAM, decodes the opcode, and executes the operation using the ALU or Control Unit. Key performance factors include clock speed (GHz), number of cores, and cache size.",
              aiPromptHint:
                "Ask AI: Explain the difference between the ALU and the Control Unit.",
            },
          ],

          // Questions for this lesson (MCQ or NCQ)
          questions: [
            // ── MCQ (Structural) ──────────────────────────────────────────
            {
              questionText:
                "Which device converts continuous physical measurements into digital data that a microprocessor can process?",
              options: ["DAC", "ADC", "RFID Tag", "Optical Sensor"],
              correctAnswer: "ADC",
              explanation:
                "An Analogue-to-Digital Converter (ADC) samples a continuous analogue signal at regular intervals and converts each sample to a binary number, making it readable by the CPU.",
            },
            {
              questionText:
                "What is the correct sequence of the CPU instruction cycle?",
              options: [
                "Execute → Decode → Fetch",
                "Fetch → Decode → Execute",
                "Decode → Fetch → Execute",
                "Fetch → Execute → Decode",
              ],
              correctAnswer: "Fetch → Decode → Execute",
              explanation:
                "The CPU first fetches the instruction from memory (RAM), then decodes its opcode to understand what operation is required, and finally executes the operation.",
            },
            // ── NCQ (Open-ended) ──────────────────────────────────────────
            {
              questionText:
                "Describe TWO differences between a manual input device and an automatic input device, giving one example of each.",
              options: [], // empty = NCQ / open-ended
              correctAnswer:
                "Manual: requires human intervention (e.g., keyboard). Automatic: captures data without keying (e.g., barcode scanner / RFID reader).",
              explanation:
                "Manual devices depend on a human operator to supply each data item. Automatic devices sense or read data directly from an object or environment, reducing human error and increasing speed.",
            },
          ],
        },

        // -------------------------------------------------------------------
        // LESSON 1.2  —  ✏️ Add more lessons here following the same pattern
        // -------------------------------------------------------------------
        {
          title: "Primary and Secondary Storage",
          order: 2,

          parts: [
            {
              partNumber: 1,
              title: "Part 1: Primary Storage (RAM & ROM)",
              content:
                // ✏️  REPLACE with actual content
                "Primary storage refers to memory that the CPU can access directly. RAM (Random Access Memory) is volatile — it loses data when power is cut. ROM (Read-Only Memory) is non-volatile and stores firmware such as the BIOS. Cache memory sits between the CPU and RAM, storing frequently used instructions for ultra-fast access.",
              aiPromptHint:
                "Ask AI: Why is cache memory faster than RAM?",
            },
            {
              partNumber: 2,
              title: "Part 2: Secondary Storage",
              content:
                // ✏️  REPLACE with actual content
                "Secondary storage is non-volatile and holds data permanently. Hard Disk Drives (HDD) use magnetic platters; Solid-State Drives (SSD) use NAND flash cells. Optical discs (CD/DVD/Blu-ray) use laser pits. Cloud storage extends this concept over a network.",
              aiPromptHint:
                "Ask AI: Compare the access speed and durability of an HDD vs an SSD.",
            },
          ],

          questions: [
            {
              questionText:
                "A student needs to store the operating system permanently so it is available when the computer starts. Which type of storage is most appropriate?",
              options: ["RAM", "Cache", "ROM", "Virtual Memory"],
              correctAnswer: "ROM",
              explanation:
                "ROM is non-volatile, meaning it retains data without power. The BIOS/firmware stored in ROM initialises the hardware and loads the OS when the computer is switched on.",
            },
            {
              questionText:
                "State ONE advantage and ONE disadvantage of using an SSD instead of an HDD.",
              options: [],
              correctAnswer:
                "Advantage: faster read/write speeds (no moving parts). Disadvantage: higher cost per gigabyte.",
              explanation:
                "SSDs have no mechanical parts, giving them much lower latency. However, the NAND flash technology makes them more expensive than HDDs for equivalent capacity.",
            },
          ],
        },
      ],
    },

    // =========================================================================
    // TOPIC 2  —  ✏️ Duplicate this block to add more topics
    // =========================================================================
    {
      title: "Data Representation",
      description:
        "How computers represent numbers, text, images, and sound in binary.",
      order: 2,

      lessons: [
        // -------------------------------------------------------------------
        // LESSON 2.1
        // -------------------------------------------------------------------
        {
          title: "Number Systems and Binary Arithmetic",
          order: 1,

          parts: [
            {
              partNumber: 1,
              title: "Part 1: Binary, Denary, and Hexadecimal",
              content:
                // ✏️  REPLACE with actual content
                "Computers work exclusively in binary (base-2), using only 0 and 1. Denary (base-10) is the number system humans use daily. Hexadecimal (base-16) uses digits 0–9 and letters A–F and is a compact way to represent long binary strings. A single hex digit represents exactly 4 bits (a nibble).",
              aiPromptHint:
                "Ask AI: Convert the denary number 255 to binary and then to hexadecimal.",
            },
            {
              partNumber: 2,
              title: "Part 2: Binary Addition and Overflow",
              content:
                // ✏️  REPLACE with actual content
                "Binary addition follows the same carry rules as denary addition. When two binary numbers produce a result that exceeds the available bits, an overflow error occurs. For example, adding 1111 + 0001 in a 4-bit system overflows the register.",
              aiPromptHint:
                "Ask AI: What is a carry bit and when does overflow occur in binary addition?",
            },
          ],

          questions: [
            {
              questionText:
                "What is the denary value of the 8-bit binary number 10110100?",
              options: ["180", "164", "148", "172"],
              correctAnswer: "180",
              explanation:
                "10110100 = 128 + 32 + 16 + 4 = 180. Each 1-bit contributes its positional value (powers of 2 from right to left).",
            },
            {
              questionText:
                "Convert the hexadecimal value 3F to its binary equivalent.",
              options: ["00111111", "00110011", "11110011", "00111100"],
              correctAnswer: "00111111",
              explanation:
                "3 in hex = 0011 in binary; F in hex = 1111 in binary. Combined: 00111111.",
            },
            {
              questionText:
                "Explain what is meant by an overflow error in binary arithmetic.",
              options: [],
              correctAnswer:
                "An overflow error occurs when the result of an arithmetic operation requires more bits than the register or fixed word length can hold, causing the most significant bit(s) to be lost.",
              explanation:
                "Because registers have a fixed number of bits, any carry out of the most significant bit position is discarded, giving an incorrect result — this is an overflow.",
            },
          ],
        },
      ],
    },
  ],
};

// =============================================================================
//  END OF CONTENT FILE
//  To add a new topic:  copy a `topics[n]` block and increment `order`.
//  To add a new lesson: copy a `lessons[n]` block and increment `order`.
//  To add a new part:   copy a `parts[n]` block and increment `partNumber`.
//  To add a question:   copy a question object into the `questions[]` array.
// =============================================================================
