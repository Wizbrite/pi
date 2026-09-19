import os
import re

base_dir = "/home/favour/Documents/defense project/pi_project/pi"

files = {}

# Read existing courses/route.ts
with open(f"{base_dir}/app/api/courses/route.ts", "r") as f:
    courses_route = f.read()

courses_post = """
export async function POST(request: Request) {
  try {
    if (request.headers.get("x-user-role") !== "admin") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }
    await connectToDatabase();
    const body = await request.json();
    const { title, level, subject, description, topics } = body;
    if (!title || !level || !subject) {
      return NextResponse.json({ success: false, message: "Title, level, and subject required" }, { status: 400 });
    }
    const formattedTopics = Array.isArray(topics)
      ? topics.map((t: any, i: number) => ({
          title: t.title,
          description: t.description || "",
          order: t.order ?? (i + 1),
          difficulty: t.difficulty,
        }))
      : [];
    const newCourse = await Course.create({ title, level, subject, description, topics: formattedTopics });
    return NextResponse.json({ success: true, data: newCourse });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
"""

if "export async function POST" not in courses_route:
    courses_route += "\n" + courses_post

files["app/api/courses/route.ts"] = courses_route

# Read existing courses/[id]/route.ts
with open(f"{base_dir}/app/api/courses/[id]/route.ts", "r") as f:
    courses_id_route = f.read()

courses_id_route = re.sub(r'export async function POST[\s\S]*?^}', '', courses_id_route, flags=re.MULTILINE)
# we might need to add Question import to courses_id_route if not there
if "import Question" not in courses_id_route:
    courses_id_route = 'import Question from "@/modules/course/models/question.model";\n' + courses_id_route

courses_id_put_delete = """
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (request.headers.get("x-user-role") !== "admin") return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    await connectToDatabase();
    const { id } = await params;
    const body = await request.json();
    const course = await Course.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json({ success: true, data: course });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (request.headers.get("x-user-role") !== "admin") return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    await connectToDatabase();
    const { id } = await params;
    await Promise.all([
      Lesson.deleteMany({ courseId: id }),
      Question.deleteMany({ courseId: id }),
      Course.findByIdAndDelete(id)
    ]);
    return NextResponse.json({ success: true, message: "Deleted" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
"""
courses_id_route += "\n" + courses_id_put_delete
files["app/api/courses/[id]/route.ts"] = courses_id_route

# Task 3
files["app/api/admin/users/route.ts"] = """import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import User from "@/modules/auth/models/user.model";

export async function GET(request: Request) {
  try {
    if (request.headers.get("x-user-role") !== "admin") return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const status = searchParams.get("status");
    
    const query: any = {};
    if (role) query.role = role;
    if (status) query.teacherApprovalStatus = status;

    const users = await User.find(query).select("-passwordHash").sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: users });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
"""

# Task 4
files["app/api/admin/users/[userId]/route.ts"] = """import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import User from "@/modules/auth/models/user.model";

export async function PATCH(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    if (request.headers.get("x-user-role") !== "admin") return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    await connectToDatabase();
    const { userId } = await params;
    const body = await request.json();
    const user = await User.findByIdAndUpdate(userId, body, { new: true }).select("-passwordHash");
    return NextResponse.json({ success: true, data: user });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    if (request.headers.get("x-user-role") !== "admin") return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    await connectToDatabase();
    const { userId } = await params;
    await User.findByIdAndDelete(userId);
    return NextResponse.json({ success: true, message: "Deleted" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
"""

# Task 5
files["app/api/admin/courses/[courseId]/lessons/route.ts"] = """import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Lesson from "@/modules/course/models/lesson.model";

export async function GET(request: Request, { params }: { params: Promise<{ courseId: string }> }) {
  try {
    if (request.headers.get("x-user-role") !== "admin") return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    await connectToDatabase();
    const { courseId } = await params;
    const lessons = await Lesson.find({ courseId }).sort({ order: 1 });
    return NextResponse.json({ success: true, data: lessons });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ courseId: string }> }) {
  try {
    if (request.headers.get("x-user-role") !== "admin") return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    await connectToDatabase();
    const { courseId } = await params;
    const body = await request.json();
    const lesson = await Lesson.create({ ...body, courseId });
    return NextResponse.json({ success: true, data: lesson });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
"""

# Task 6
files["app/api/admin/lessons/[lessonId]/route.ts"] = """import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Lesson from "@/modules/course/models/lesson.model";
import Question from "@/modules/course/models/question.model";

export async function GET(request: Request, { params }: { params: Promise<{ lessonId: string }> }) {
  try {
    await connectToDatabase();
    const { lessonId } = await params;
    const lesson = await Lesson.findById(lessonId);
    return NextResponse.json({ success: true, data: lesson });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ lessonId: string }> }) {
  try {
    if (request.headers.get("x-user-role") !== "admin") return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    await connectToDatabase();
    const { lessonId } = await params;
    const body = await request.json();
    const lesson = await Lesson.findByIdAndUpdate(lessonId, body, { new: true });
    return NextResponse.json({ success: true, data: lesson });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ lessonId: string }> }) {
  try {
    if (request.headers.get("x-user-role") !== "admin") return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    await connectToDatabase();
    const { lessonId } = await params;
    await Promise.all([
      Question.deleteMany({ lessonId }),
      Lesson.findByIdAndDelete(lessonId)
    ]);
    return NextResponse.json({ success: true, message: "Deleted" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
"""

# Task 7
files["app/api/admin/lessons/[lessonId]/questions/route.ts"] = """import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Question from "@/modules/course/models/question.model";
import Lesson from "@/modules/course/models/lesson.model";

export async function GET(request: Request, { params }: { params: Promise<{ lessonId: string }> }) {
  try {
    await connectToDatabase();
    const { lessonId } = await params;
    const questions = await Question.find({ lessonId });
    return NextResponse.json({ success: true, data: questions });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ lessonId: string }> }) {
  try {
    if (request.headers.get("x-user-role") !== "admin") return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    await connectToDatabase();
    const { lessonId } = await params;
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) return NextResponse.json({ success: false, message: "Lesson not found" }, { status: 404 });
    const body = await request.json();
    const question = await Question.create({
      ...body,
      lessonId,
      courseId: lesson.courseId,
      topicId: lesson.topicId
    });
    return NextResponse.json({ success: true, data: question });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
"""

# Task 8
files["app/api/admin/lessons/[lessonId]/questions/[questionId]/route.ts"] = """import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Question from "@/modules/course/models/question.model";

export async function PUT(request: Request, { params }: { params: Promise<{ questionId: string }> }) {
  try {
    if (request.headers.get("x-user-role") !== "admin") return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    await connectToDatabase();
    const { questionId } = await params;
    const body = await request.json();
    const question = await Question.findByIdAndUpdate(questionId, body, { new: true });
    return NextResponse.json({ success: true, data: question });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ questionId: string }> }) {
  try {
    if (request.headers.get("x-user-role") !== "admin") return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    await connectToDatabase();
    const { questionId } = await params;
    await Question.findByIdAndDelete(questionId);
    return NextResponse.json({ success: true, message: "Deleted" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
"""

# Task 9
files["app/api/admin/exams/route.ts"] = """import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import { ExamSubject, ExamPaper } from "@/modules/course/models/exam.model";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const subjects = await ExamSubject.find().lean();
    const subjectIds = subjects.map((s: any) => s._id);
    const papers = await ExamPaper.find({ examSubjectId: { $in: subjectIds } }).lean();
    
    const data = subjects.map((subj: any) => {
      const count = papers.filter((p: any) => p.examSubjectId.toString() === subj._id.toString()).length;
      return { ...subj, paperCount: count };
    });
    
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (request.headers.get("x-user-role") !== "admin") return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    await connectToDatabase();
    const body = await request.json();
    const existing = await ExamSubject.findOne({ slug: body.slug });
    if (existing) return NextResponse.json({ success: false, message: "Slug must be unique" }, { status: 400 });
    const subject = await ExamSubject.create(body);
    return NextResponse.json({ success: true, data: subject });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
"""

# Task 10
files["app/api/admin/exams/[subjectId]/route.ts"] = """import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import { ExamSubject, ExamPaper, ExamQuestion } from "@/modules/course/models/exam.model";

export async function GET(request: Request, { params }: { params: Promise<{ subjectId: string }> }) {
  try {
    await connectToDatabase();
    const { subjectId } = await params;
    const subject = await ExamSubject.findById(subjectId).lean();
    if (!subject) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
    const papers = await ExamPaper.find({ examSubjectId: subjectId }).lean();
    const paperIds = papers.map((p: any) => p._id);
    const questions = await ExamQuestion.find({ examPaperId: { $in: paperIds } }).lean();
    
    const formattedPapers = papers.map((p: any) => {
      const qCount = questions.filter((q: any) => q.examPaperId.toString() === p._id.toString()).length;
      return { ...p, questionCount: qCount };
    });
    
    return NextResponse.json({ success: true, data: { ...subject, papers: formattedPapers } });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ subjectId: string }> }) {
  try {
    if (request.headers.get("x-user-role") !== "admin") return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    await connectToDatabase();
    const { subjectId } = await params;
    const body = await request.json();
    const subject = await ExamSubject.findByIdAndUpdate(subjectId, body, { new: true });
    return NextResponse.json({ success: true, data: subject });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ subjectId: string }> }) {
  try {
    if (request.headers.get("x-user-role") !== "admin") return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    await connectToDatabase();
    const { subjectId } = await params;
    const papers = await ExamPaper.find({ examSubjectId: subjectId });
    const paperIds = papers.map((p: any) => p._id);
    await ExamQuestion.deleteMany({ examPaperId: { $in: paperIds } });
    await ExamPaper.deleteMany({ examSubjectId: subjectId });
    await ExamSubject.findByIdAndDelete(subjectId);
    return NextResponse.json({ success: true, message: "Deleted" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
"""

# Task 11
files["app/api/admin/exams/[subjectId]/papers/route.ts"] = """import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import { ExamPaper } from "@/modules/course/models/exam.model";

export async function GET(request: Request, { params }: { params: Promise<{ subjectId: string }> }) {
  try {
    await connectToDatabase();
    const { subjectId } = await params;
    const papers = await ExamPaper.find({ examSubjectId: subjectId });
    return NextResponse.json({ success: true, data: papers });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ subjectId: string }> }) {
  try {
    if (request.headers.get("x-user-role") !== "admin") return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    await connectToDatabase();
    const { subjectId } = await params;
    const body = await request.json();
    const paper = await ExamPaper.create({ ...body, examSubjectId: subjectId });
    return NextResponse.json({ success: true, data: paper });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
"""

# Task 12
files["app/api/admin/exams/[subjectId]/papers/[paperId]/questions/route.ts"] = """import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import { ExamQuestion } from "@/modules/course/models/exam.model";

export async function GET(request: Request, { params }: { params: Promise<{ paperId: string }> }) {
  try {
    await connectToDatabase();
    const { paperId } = await params;
    const questions = await ExamQuestion.find({ examPaperId: paperId }).sort({ questionNumber: 1 });
    return NextResponse.json({ success: true, data: questions });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ paperId: string }> }) {
  try {
    if (request.headers.get("x-user-role") !== "admin") return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    await connectToDatabase();
    const { paperId } = await params;
    const body = await request.json();
    const question = await ExamQuestion.create({ ...body, examPaperId: paperId });
    return NextResponse.json({ success: true, data: question });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
"""

# Task 13
files["app/api/student/catalog/route.ts"] = """import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Course from "@/modules/course/models/course.model";
import Lesson from "@/modules/course/models/lesson.model";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const courses = await Course.find()
      .select("_id title subject level description topics createdAt")
      .sort({ createdAt: -1 })
      .lean();
    
    const courseIds = courses.map((c: any) => c._id);
    const lessons = await Lesson.find({ courseId: { $in: courseIds } }).lean();
    
    const data = courses.map((c: any) => {
      const lCount = lessons.filter((l: any) => l.courseId.toString() === c._id.toString()).length;
      const tCount = c.topics ? c.topics.length : 0;
      return {
        _id: c._id,
        title: c.title,
        subject: c.subject,
        level: c.level,
        description: c.description,
        topicsCount: tCount,
        lessonCount: lCount,
        createdAt: c.createdAt
      };
    });
    
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
"""

# Task 14 Enrollment model
files["modules/course/models/enrollment.model.ts"] = """import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEnrollment {
  userId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  enrolledAt: Date;
}

export interface IEnrollmentDocument extends IEnrollment, Document {}

const enrollmentSchema = new Schema<IEnrollmentDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    enrolledAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

enrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export const Enrollment: Model<IEnrollmentDocument> =
  mongoose.models.Enrollment || mongoose.model<IEnrollmentDocument>("Enrollment", enrollmentSchema);

export default Enrollment;
"""

# Task 14 Route
files["app/api/student/enrollments/route.ts"] = """import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Enrollment from "@/modules/course/models/enrollment.model";
import { getUserId } from "@/lib/auth/get-user";

export async function GET(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    await connectToDatabase();
    const enrollments = await Enrollment.find({ userId }).lean();
    const enrolledCourseIds = enrollments.map((e: any) => e.courseId);
    return NextResponse.json({ success: true, enrolledCourseIds });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    await connectToDatabase();
    const { courseId } = await request.json();
    const existing = await Enrollment.findOne({ userId, courseId });
    if (existing) return NextResponse.json({ success: false, message: "Already enrolled" }, { status: 409 });
    await Enrollment.create({ userId, courseId });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
"""

for file_path, content in files.items():
    full_path = os.path.join(base_dir, file_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w") as f:
        f.write(content)
    print(f"Wrote {full_path}")
