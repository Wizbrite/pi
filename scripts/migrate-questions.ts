import "dotenv/config";
import mongoose from "mongoose";
import Question from "../modules/course/models/question.model";
import Lesson from "../modules/course/models/lesson.model";
import Course, { ITopic } from "../modules/course/models/course.model";
import mongodb from "@/lib/db/mongodb";

type StoredTopic = ITopic & { _id: mongoose.Types.ObjectId };

async function migrate() {
  const uri = "mongodb://localhost:27017/pi_db";
  if (!uri) {
    console.error("❌ MONGODB_URI is not set in .env.local");
    process.exit(1);
  }
  try {
    await mongoose.connect(uri);
    console.log("🔌 Connected to MongoDB");

    // 1. Add topicId to questions that don't have it
    // Use lean documents so defaults from the current schema do not mask missing
    // fields in legacy records.
    const questionsWithoutTopic = await Question.find({
      $or: [{ topicId: { $exists: false } }, { topicId: null }],
    }).lean();
    console.log(
      `\n📝 Found ${questionsWithoutTopic.length} questions without topicId`,
    );

    let topicUpdated = 0;
    for (const q of questionsWithoutTopic) {
      const lesson = await Lesson.findById(q.lessonId);
      if (lesson?.topicId) {
        await Question.updateOne(
          { _id: q._id },
          { $set: { topicId: lesson.topicId } },
        );
        topicUpdated++;
      }
    }
    console.log(`✅ Added topicId to ${topicUpdated} questions`);

    // 2. Add difficulty and type to questions missing them
    const questionsMissingFields = await Question.find({
      $or: [
        { difficulty: { $exists: false } },
        { difficulty: null },
        { type: { $exists: false } },
        { type: null },
      ],
    }).lean();
    console.log(
      `\n📝 Found ${questionsMissingFields.length} questions missing difficulty/type`,
    );

    let fieldUpdated = 0;
    for (const q of questionsMissingFields) {
      const fields: Partial<Pick<typeof q, "difficulty" | "type">> = {};
      if (q.difficulty == null) {
        fields.difficulty = "medium";
      }
      if (q.type == null) {
        fields.type = q.options?.length ? "mcq" : "open-ended";
      }
      if (Object.keys(fields).length > 0) {
        await Question.updateOne({ _id: q._id }, { $set: fields });
        fieldUpdated++;
      }
    }
    console.log(`✅ Updated difficulty/type on ${fieldUpdated} questions`);

    // 3. Add difficulty and prerequisites to topics
    const courses = await Course.find({}).lean();
    console.log(`\n📚 Found ${courses.length} courses`);

    let courseUpdated = 0;
    for (const course of courses) {
      let changed = false;
      for (const topic of course.topics || []) {
        if (topic.difficulty == null) {
          if (topic.order <= 2) topic.difficulty = "beginner";
          else if (topic.order <= 4) topic.difficulty = "intermediate";
          else topic.difficulty = "advanced";
          changed = true;
        }
        if (topic.prerequisites == null) {
          topic.prerequisites = (course.topics || [])
            .filter((t: ITopic) => t.order < topic.order)
            .map((t: StoredTopic) => t._id);
          changed = true;
        }
      }
      if (changed) {
        await Course.updateOne(
          { _id: course._id },
          { $set: { topics: course.topics } },
        );
        courseUpdated++;
      }
    }
    console.log(`✅ Updated topics in ${courseUpdated} courses`);

    // 4. Summary
    const totalQuestions = await Question.countDocuments();
    const questionsWithTopic = await Question.countDocuments({
      topicId: { $exists: true, $ne: null },
    });
    const questionsWithDifficulty = await Question.countDocuments({
      difficulty: { $exists: true },
    });
    const questionsWithType = await Question.countDocuments({
      type: { $exists: true },
    });

    console.log("\n📊 Question Stats:");
    console.log(`   Total: ${totalQuestions}`);
    console.log(`   With topicId: ${questionsWithTopic}/${totalQuestions}`);
    console.log(
      `   With difficulty: ${questionsWithDifficulty}/${totalQuestions}`,
    );
    console.log(`   With type: ${questionsWithType}/${totalQuestions}`);

    console.log("\n🎉 Migration complete!");
  } finally {
    if (
      mongoose.connection.readyState !== mongoose.ConnectionStates.disconnected
    ) {
      await mongoose.disconnect();
    }
  }
}

migrate().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
