// =============================================================================
//  EXAM SEED SCRIPT — Idempotent
//
//  Usage:  npm run seed:exams
//
//  This script is safe to re-run at any time. It uses upserts so:
//    • Existing records are updated in-place (no duplicates).
//    • New subjects / papers / questions are inserted automatically.
//    • Nothing is deleted — add new data files and re-run safely.
//
//  To add more exams:
//    1. Create or edit a data file in scripts/data/ (e.g. a-level-physics-exams.ts)
//    2. Import it below and add it to the `ALL_EXAM_DATA` array.
//    3. Run:  npm run seed:exams
// =============================================================================

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import * as crypto from "crypto";

if (typeof globalThis.crypto === "undefined") {
  (globalThis as any).crypto = crypto.webcrypto;
}

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// Import models
import {
  ExamSubject,
  ExamPaper,
  ExamQuestion,
} from "../modules/course/models/exam.model";

// ── Import all exam data files here ──────────────────────────────────────────
import { examSeedData as ictExams } from "./data/a-level-ict-exams";
// To add more subjects in the future, simply:
//   import { examSeedData as physicsExams } from "./data/a-level-physics-exams";
//   Then add `physicsExams` to ALL_EXAM_DATA below.

const ALL_EXAM_DATA = [ictExams];

// ---------------------------------------------------------------------------
async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌  MONGODB_URI is not set in .env.local");
    process.exit(1);
  }

  console.log("🔌  Connecting to MongoDB…");
  await mongoose.connect(uri);
  console.log("✅  Connected.\n");

  let totalSubjects = 0;
  let totalPapers = 0;
  let totalQuestions = 0;

  for (const examData of ALL_EXAM_DATA) {
    for (const subjectData of examData.subjects) {
      // ── 1. Upsert ExamSubject ──────────────────────────────────────────
      console.log(`📚  Upserting exam subject: "${subjectData.title}" [${subjectData.slug}]…`);

      const subjectDoc = await ExamSubject.findOneAndUpdate(
        { slug: subjectData.slug },
        {
          $set: {
            title: subjectData.title,
            code: subjectData.code,
            level: subjectData.level,
            category: subjectData.category,
            description: subjectData.description,
          },
        },
        { upsert: true, new: true }
      );
      totalSubjects++;
      console.log(`   Subject _id: ${subjectDoc._id}\n`);

      // ── 2. Upsert ExamPapers ──────────────────────────────────────────
      for (const paperData of subjectData.papers) {
        console.log(`   📄  Upserting paper: "${paperData.title}" [${paperData.slug}]…`);

        const paperDoc = await ExamPaper.findOneAndUpdate(
          { slug: paperData.slug },
          {
            $set: {
              examSubjectId: subjectDoc._id,
              year: paperData.year,
              paperNumber: paperData.paperNumber,
              title: paperData.title,
              type: paperData.type,
              durationMinutes: paperData.durationMinutes,
              totalMarks: paperData.totalMarks,
            },
          },
          { upsert: true, new: true }
        );
        totalPapers++;
        console.log(`      Paper _id: ${paperDoc._id}`);

        // ── 3. Upsert ExamQuestions ────────────────────────────────────
        for (const qData of paperData.questions) {
          await ExamQuestion.findOneAndUpdate(
            {
              examPaperId: paperDoc._id,
              questionNumber: qData.questionNumber,
            },
            {
              $set: {
                text: qData.text,
                options: qData.options,
                correctAnswerIndex: qData.correctAnswerIndex,
                correctAnswerText: qData.correctAnswerText,
                marks: qData.marks,
                topic: qData.topic,
                markingSchemeNotes: qData.markingSchemeNotes,
                aiExplanation: qData.aiExplanation,
              },
            },
            { upsert: true, new: true }
          );
          totalQuestions++;
        }

        console.log(`      ✅  ${paperData.questions.length} question(s) upserted.\n`);
      }
    }
  }

  // ── 4. Done ─────────────────────────────────────────────────────────────
  console.log("═══════════════════════════════════════════════════");
  console.log(`🎉  Exam seed complete!`);
  console.log(`    ${totalSubjects} subject(s), ${totalPapers} paper(s), ${totalQuestions} question(s)`);
  console.log("═══════════════════════════════════════════════════\n");

  await mongoose.disconnect();
  console.log("🔌  Disconnected.");
}

main().catch((err) => {
  console.error("❌  Exam seed failed:", err);
  mongoose.disconnect();
  process.exit(1);
});
