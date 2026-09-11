import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import { User } from "@/modules/auth/models/user.model";
import { ProgressService } from "@/modules/progress/services/progress.service";
import { AdaptationService } from "@/modules/adaptive/services/adaptation.service";
import { getAiProvider } from "@/lib/ai/provider";
import { getUserId } from "@/lib/auth/get-user";
import LearnerProfile from "@/modules/adaptive/models/learner-profile.model";
import { Types } from "mongoose";

export interface AIStudentReport {
  generatedAt: string;
  overallRating: "excellent" | "good" | "fair" | "needs-improvement";
  overallRatingScore: number; // 0–100
  summary: string;
  weeklyInsight: string;
  examInsight: string;
  studyPattern: {
    avgSessionsPerWeek: number;
    avgDailyMinutes: number;
    consistencyScore: number; // 0–100
    mostActiveDay: string;
    totalStudyHours: number;
  };
  strengths: { topic: string; subject: string; masteryPercent: number }[];
  concerns: {
    topic: string;
    subject: string;
    masteryPercent: number;
    lastPracticed: string | null;
    urgency: "high" | "medium" | "low";
  }[];
  recommendations: {
    priority: number;
    action: string;
    type: "lesson" | "quiz" | "review" | "rest";
    reason: string;
  }[];
}

/**
 * GET /api/student/report
 *
 * Authenticated student endpoint.
 * Builds a rich data context from the student's real database activity and BKT mastery,
 * then sends it to Gemini AI to generate a structured study report.
 */
export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    // Fetch student details
    const student = await User.findById(userId).select("fullName name gceLevel createdAt email");
    if (!student) {
      return NextResponse.json({ message: "Student not found" }, { status: 404 });
    }
    const studentName = student.fullName || student.name || "Student";

    // Fetch progress and adaptive data in parallel
    const progressService = new ProgressService();
    const adaptationService = new AdaptationService();

    const [progress, weakAreas, nextSteps, learnerProfile] = await Promise.all([
      progressService.getFullProgress(userId),
      adaptationService.getWeakAreas(userId, 8),
      adaptationService.getNextSteps(userId, 6),
      LearnerProfile.findOne({ userId: new Types.ObjectId(userId) }).lean(),
    ]);

    // ── Build study pattern metrics ────────────────────────────────────────
    const activeDays = progress.weeklyActivity.filter((d) => d.lessonsCompleted > 0 || d.timeSpentMinutes > 0);
    const avgSessionsPerWeek = activeDays.length;
    const totalWeeklyMins = progress.weeklyActivity.reduce((s, d) => s + d.timeSpentMinutes, 0);
    const avgDailyMinutes = activeDays.length > 0 ? Math.round(totalWeeklyMins / activeDays.length) : 0;
    const consistencyScore = Math.round((activeDays.length / 7) * 100);
    const mostActiveDayIndex = progress.weeklyActivity.reduce(
      (maxI, d, i, arr) => (d.timeSpentMinutes > arr[maxI].timeSpentMinutes ? i : maxI), 0
    );
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const mostActiveDay = dayNames[mostActiveDayIndex] || "N/A";
    const totalStudyHours = Math.round((progress.overall.totalTimeSpentMinutes / 60) * 10) / 10;

    // ── BKT strengths from learner profile ───────────────────────────────
    const profileSkills: any[] = (learnerProfile as any)?.skills || [];
    const strengths = profileSkills
      .filter((s: any) => s.masteryLevel >= 0.8 && s.totalAttempts > 0)
      .sort((a: any, b: any) => b.masteryLevel - a.masteryLevel)
      .slice(0, 5)
      .map((s: any) => {
        const subj = progress.subjects.find((sub) => sub.courseId === s.courseId);
        return {
          topic: s.topicTitle,
          subject: subj?.subject || subj?.title || "General",
          masteryPercent: Math.round(s.masteryLevel * 100),
        };
      });

    // ── Exam performance summary ──────────────────────────────────────────
    const exams = progress.examHistory;
    const avgExamScore =
      exams.length > 0
        ? Math.round(exams.reduce((s, e) => s + e.percentage, 0) / exams.length)
        : null;
    const lastExam = exams[0] || null;

    // ── Build the AI prompt ───────────────────────────────────────────────
    const systemPrompt = `You are Pi's personal AI study coach for GCE students in Cameroon. 
You analyze student learning data and produce precise, encouraging, and highly actionable personal study reports. 
Address the student directly as "you". Respond ONLY with valid JSON matching the schema exactly.
The student's name is "${studentName}".`;

    const dataContext = {
      studentName,
      gceLevel: student.gceLevel,
      overall: {
        totalXp: progress.overall.totalXp,
        currentStreak: progress.overall.currentStreak,
        longestStreak: progress.overall.longestStreak,
        totalStudyHours,
        totalLessonsCompleted: progress.overall.totalLessonsCompleted,
        totalExamsTaken: progress.overall.totalExamsTaken,
        overallAccuracy: progress.overall.overallAccuracy,
        subjectsEnrolled: progress.overall.subjectsEnrolled,
      },
      studyPattern: {
        avgSessionsPerWeek,
        avgDailyMinutes,
        consistencyScore,
        mostActiveDay,
        weeklyActivity: progress.weeklyActivity,
      },
      strengths,
      weakAreas: weakAreas.slice(0, 6),
      nextSteps: nextSteps.slice(0, 5),
      examHistory: {
        totalAttempts: exams.length,
        avgScore: avgExamScore,
        lastExam: lastExam
          ? { title: lastExam.paperTitle, score: lastExam.percentage, passed: lastExam.percentage >= 50 }
          : null,
      },
      subjects: progress.subjects.map((s) => ({
        title: s.title,
        subject: s.subject,
        level: s.level,
        overallMastery: s.overallMastery,
        completedLessons: s.completedLessons,
        totalLessons: s.totalLessons,
        averageAccuracy: s.averageAccuracy,
      })),
    };

    const userPrompt = `Analyze your learning data and return a JSON personal study report:

${JSON.stringify(dataContext, null, 2)}

Return ONLY this exact JSON structure (no markdown, no explanations outside JSON):
{
  "overallRating": "excellent" | "good" | "fair" | "needs-improvement",
  "overallRatingScore": <integer 0-100>,
  "summary": "<2-3 sentence personalized summary of your performance and progress>",
  "weeklyInsight": "<1-2 sentence insight specifically about your weekly study consistency and habits>",
  "examInsight": "<1-2 sentences about your exam practice readiness, or 'Take your first mock exam to unlock exam insights' if none>",
  "recommendations": [
    {
      "priority": 1,
      "action": "<specific action to take>",
      "type": "lesson" | "quiz" | "review" | "rest",
      "reason": "<why this will boost your preparation, 1 sentence>"
    }
  ]
}`;

    let aiResult: any = null;
    try {
      const provider = getAiProvider();
      const res = await provider.chat(
        [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        { responseFormat: "json_object" }
      );
      if (res.ok) {
        const resJson = await res.json();
        const rawResponse = resJson.choices?.[0]?.message?.content || "";
        const cleanJson = rawResponse.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
        aiResult = JSON.parse(cleanJson);
      }
    } catch (aiErr) {
      console.warn("AI generation failed for student report, using statistical fallback:", aiErr);
    }

    // ── Statistical fallback engine if AI fails ────────────────────────────
    const accuracy = progress.overall.overallAccuracy || 0;
    const overallScore = Math.min(100, Math.round(accuracy * 0.5 + consistencyScore * 0.3 + (progress.overall.currentStreak > 0 ? 20 : 0)));

    let rating: "excellent" | "good" | "fair" | "needs-improvement" = "needs-improvement";
    if (overallScore >= 80) rating = "excellent";
    else if (overallScore >= 65) rating = "good";
    else if (overallScore >= 45) rating = "fair";

    const concernsFormatted = weakAreas.slice(0, 5).map((w) => ({
      topic: w.topicTitle || "Topic",
      subject: w.courseTitle || "General",
      masteryPercent: Math.round(w.mastery * 100),
      lastPracticed: w.lastPracticedAt ? new Date(w.lastPracticedAt).toISOString().split("T")[0] : null,
      urgency: w.mastery < 0.4 ? ("high" as const) : w.mastery < 0.65 ? ("medium" as const) : ("low" as const),
    }));

    const recommendationsFallback = nextSteps.slice(0, 4).map((ns, idx) => ({
      priority: idx + 1,
      action: `Master ${ns.topicTitle} in ${ns.courseTitle}`,
      type: ns.reason.includes("Review") ? ("review" as const) : ("lesson" as const),
      reason: ns.reason,
    }));

    if (recommendationsFallback.length === 0) {
      recommendationsFallback.push({
        priority: 1,
        action: "Start your first study unit",
        type: "lesson",
        reason: "Complete lesson units to build topic mastery and track your GCE readiness.",
      });
    }

    const report: AIStudentReport = {
      generatedAt: new Date().toISOString(),
      overallRating: aiResult?.overallRating || rating,
      overallRatingScore: aiResult?.overallRatingScore ?? overallScore,
      summary:
        aiResult?.summary ||
        `You have achieved an overall accuracy of ${accuracy}% across ${progress.overall.totalLessonsCompleted} completed lessons with a ${progress.overall.currentStreak}-day study streak. Keep up the dedication!`,
      weeklyInsight:
        aiResult?.weeklyInsight ||
        (avgSessionsPerWeek >= 4
          ? `Great consistency! You studied ${avgSessionsPerWeek} days this week, averaging ${avgDailyMinutes} minutes per session.`
          : `You studied ${avgSessionsPerWeek} day(s) this week. Increasing your regular daily practice will significantly boost your retention.`),
      examInsight:
        aiResult?.examInsight ||
        (lastExam
          ? `Your latest mock exam score was ${lastExam.percentage}% in ${lastExam.paperTitle}. ${lastExam.percentage >= 50 ? "Solid performance!" : "Focus on weak areas to raise your score."}`
          : "Take mock exam papers under timed conditions to get real-time GCE readiness feedback."),
      studyPattern: {
        avgSessionsPerWeek,
        avgDailyMinutes,
        consistencyScore,
        mostActiveDay,
        totalStudyHours,
      },
      strengths: strengths.length > 0 ? strengths : progress.subjects.slice(0, 3).map((s) => ({ topic: s.title, subject: s.subject, masteryPercent: s.overallMastery })),
      concerns: concernsFormatted,
      recommendations: aiResult?.recommendations || recommendationsFallback,
    };

    return NextResponse.json({ success: true, report });
  } catch (error: any) {
    console.error("GET /api/student/report error:", error);
    return NextResponse.json({ message: error.message || "Server Error" }, { status: 500 });
  }
}
