// =============================================================================
//  ICT Course — Idempotent Seed Script
//
//  Usage:  npm run seed:ict
//
//  This script is safe to re-run at any time.  It uses upserts (findOneAndUpdate
//  with { upsert: true }) so:
//    • Existing records are updated in-place (no duplicates).
//    • New lessons / questions are inserted automatically.
//    • Deleted questions are NOT automatically removed — drop the Questions
//      collection manually if you need a clean slate.
// =============================================================================

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// Import models  (must import BEFORE any model is referenced)
import Course from "../modules/course/models/course.model";
import Lesson from "../modules/course/models/lesson.model";
import Question from "../modules/course/models/question.model";

// Import the content you control
import { ictCourseData } from "./data/a-level-ict";

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

  // ── 1. Upsert Course ────────────────────────────────────────────────────
  console.log(`📚  Upserting course: "${ictCourseData.title}"…`);

  const courseDoc = await Course.findOneAndUpdate(
    { subject: ictCourseData.subject, level: ictCourseData.level },
    {
      $set: {
        title: ictCourseData.title,
        description: ictCourseData.description,
        // Overwrite the entire topics array so ordering / titles stay fresh
        topics: ictCourseData.topics.map((t) => ({
          title: t.title,
          description: t.description,
          order: t.order,
        })),
      },
    },
    { upsert: true, new: true }
  );

  console.log(`   Course _id: ${courseDoc._id}\n`);

  // ── 2. Build a topicTitle → ObjectId lookup map ─────────────────────────
  const topicMap = new Map<string, mongoose.Types.ObjectId>();
  for (const topic of courseDoc.topics) {
    topicMap.set(topic.title, topic._id as mongoose.Types.ObjectId);
  }

  // ── 3. Upsert Lessons & Questions ───────────────────────────────────────
  for (const topicData of ictCourseData.topics) {
    const topicId = topicMap.get(topicData.title);
    if (!topicId) {
      console.warn(`   ⚠️  Could not find topicId for "${topicData.title}". Skipping.`);
      continue;
    }

    console.log(`🗂️   Topic: "${topicData.title}"`);

    for (const lessonData of topicData.lessons) {
      // Upsert Lesson
      const lessonDoc = await Lesson.findOneAndUpdate(
        {
          courseId: courseDoc._id,
          topicId,
          order: lessonData.order,
        },
        {
          $set: {
            title: lessonData.title,
            parts: lessonData.parts,
          },
        },
        { upsert: true, new: true }
      );

      console.log(`   📖  Lesson "${lessonData.title}" (_id: ${lessonDoc._id})`);

      // Upsert Questions
      for (const qData of lessonData.questions) {
        await Question.findOneAndUpdate(
          {
            lessonId: lessonDoc._id,
            questionText: qData.questionText,
          },
          {
            $set: {
              courseId: courseDoc._id,
              options: qData.options,
              correctAnswer: qData.correctAnswer,
              explanation: qData.explanation,
            },
          },
          { upsert: true, new: true }
        );
      }

      console.log(`   ✅  ${lessonData.questions.length} question(s) upserted.`);
    }
  }

  // ── 4. Done ─────────────────────────────────────────────────────────────
  console.log("\n🎉  Seed complete! Disconnecting…");
  await mongoose.disconnect();
  console.log("🔌  Disconnected.");
}

main().catch((err) => {
  console.error("❌  Seed failed:", err);
  mongoose.disconnect();
  process.exit(1);
});
