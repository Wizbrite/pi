"use client";

import React, { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Loader2, 
  GraduationCap, 
  FileCheck2,
  Award,
  HelpCircle,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function AdminExamPaperQuestionsPage({ params }: { params: Promise<{ subjectId: string; paperId: string }> }) {
  const { subjectId, paperId } = use(params);
  const router = useRouter();

  const [questions, setQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    questionNumber: 1,
    text: "",
    options: ["", "", "", ""],
    correctAnswerIndex: 0,
    correctAnswerText: "",
    marks: 1,
    xpPoints: 10,
    topic: "",
    markingSchemeNotes: "",
    aiExplanation: "",
  });

  const fetchQuestions = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/exams/${subjectId}/papers/${paperId}/questions`);
      const json = await res.json();
      if (json.success) {
        setQuestions(json.data);
        if (json.data.length > 0) {
          const maxNum = Math.max(...json.data.map((q: any) => Number(q.questionNumber) || 0));
          setFormData((prev) => ({ ...prev, questionNumber: maxNum + 1 }));
        }
      }
    } catch (err) {
      console.error("Failed to fetch exam questions:", err);
    } finally {
      setIsLoading(false);
    }
  }, [subjectId, paperId]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.text.trim()) return;
    setIsSubmitting(true);

    const cleanedOptions = formData.options.filter((o) => o.trim() !== "");

    try {
      const res = await fetch(`/api/admin/exams/${subjectId}/papers/${paperId}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          questionNumber: Number(formData.questionNumber),
          options: cleanedOptions.length > 0 ? cleanedOptions : undefined,
          correctAnswerIndex: cleanedOptions.length > 0 ? formData.correctAnswerIndex : undefined,
          marks: Number(formData.marks) || 1,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setShowModal(false);
        setFormData({
          questionNumber: Number(formData.questionNumber) + 1,
          text: "",
          options: ["", "", "", ""],
          correctAnswerIndex: 0,
          correctAnswerText: "",
          marks: 1,
          xpPoints: 10,
          topic: "",
          markingSchemeNotes: "",
          aiExplanation: "",
        });
        fetchQuestions();
      } else {
        alert(json.message || "Failed to add question");
      }
    } catch (err) {
      console.error("Failed to add question:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push(`/admin/exams/${subjectId}`)} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Subject Papers
        </Button>
        <Button onClick={() => setShowModal(true)} className="bg-blue-600 text-white hover:bg-blue-700 gap-2">
          <Plus className="w-4 h-4" /> Add Past GCE Question
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-blue-600" /> Past GCE Exam Question Bank
          </h1>
          <p className="text-sm text-muted-foreground">
            Insert official past GCE questions, marking schemes, and AI step-by-step explanations.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="py-16 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm text-muted-foreground">Loading questions...</p>
        </div>
      ) : questions.length === 0 ? (
        <Card className="bg-card border-border p-12 text-center">
          <HelpCircle className="w-12 h-12 mx-auto text-muted-foreground opacity-40 mb-3" />
          <p className="text-base font-semibold text-foreground">No questions inserted yet</p>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
            Start inserting past GCE questions for this exam paper.
          </p>
          <Button onClick={() => setShowModal(true)} size="sm" className="bg-blue-600 text-white gap-2">
            <Plus className="w-4 h-4" /> Insert First Question
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {questions.map((q) => (
            <Card key={q._id} className="bg-card border-border hover:border-blue-500/40 transition-all shadow-xs">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-blue-600 bg-blue-500/10 px-2.5 py-0.5 rounded">
                        Q#{q.questionNumber}
                      </span>
                      {q.topic && (
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded font-medium">
                          Topic: {q.topic}
                        </span>
                      )}
                      <span className="text-xs font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded">
                        {q.marks} Mark{q.marks > 1 ? "s" : ""}
                      </span>
                      <span className="text-xs font-bold text-purple-600 bg-purple-500/10 px-2 py-0.5 rounded">
                        {q.xpPoints ?? 10} XP
                      </span>
                    </div>
                    <p className="text-base font-bold text-foreground pt-1">{q.text}</p>
                  </div>
                </div>

                {/* MCQ Options */}
                {q.options && q.options.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                    {q.options.map((opt: string, optIdx: number) => (
                      <div
                        key={optIdx}
                        className={`text-xs p-2 rounded-lg border ${
                          optIdx === q.correctAnswerIndex
                            ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-700 font-bold"
                            : "bg-muted/30 border-border text-muted-foreground"
                        }`}
                      >
                        {String.fromCharCode(65 + optIdx)}. {opt}
                      </div>
                    ))}
                  </div>
                )}

                {/* Open ended correct answer */}
                {q.correctAnswerText && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs space-y-1">
                    <p className="font-bold text-emerald-700">Official Correct Answer:</p>
                    <p className="text-emerald-800">{q.correctAnswerText}</p>
                  </div>
                )}

                {/* Marking scheme notes */}
                {q.markingSchemeNotes && (
                  <div className="p-3 bg-muted/40 border border-border rounded-lg text-xs space-y-1">
                    <p className="font-bold text-foreground">Marking Scheme Notes:</p>
                    <p className="text-muted-foreground">{q.markingSchemeNotes}</p>
                  </div>
                )}

                {/* AI Explanation */}
                {q.aiExplanation && (
                  <div className="p-3 bg-violet-500/10 border border-violet-500/20 rounded-lg text-xs space-y-1">
                    <p className="font-bold text-violet-700">AI Tutor Explanation:</p>
                    <p className="text-violet-950 dark:text-violet-200">{q.aiExplanation}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Question Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-2xl w-full space-y-4 shadow-xl my-8">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-lg font-bold text-foreground">Insert Past GCE Question</h3>
              <Button size="icon" variant="ghost" onClick={() => setShowModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <form onSubmit={handleAddQuestion} className="space-y-4">
              <div className="grid grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Question No.</label>
                  <input
                    type="number"
                    required
                    value={formData.questionNumber}
                    onChange={(e) => setFormData((prev) => ({ ...prev, questionNumber: Number(e.target.value) }))}
                    className="w-full px-3 py-1.5 bg-background border border-input rounded-md text-sm font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold">Marks</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.marks}
                    onChange={(e) => setFormData((prev) => ({ ...prev, marks: Number(e.target.value) }))}
                    className="w-full px-3 py-1.5 bg-background border border-input rounded-md text-sm font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold">XP Points</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.xpPoints}
                    onChange={(e) => setFormData((prev) => ({ ...prev, xpPoints: Number(e.target.value) }))}
                    className="w-full px-3 py-1.5 bg-background border border-input rounded-md text-sm font-bold text-purple-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold">Topic Tag</label>
                  <input
                    type="text"
                    placeholder="e.g. Protection"
                    value={formData.topic}
                    onChange={(e) => setFormData((prev) => ({ ...prev, topic: e.target.value }))}
                    className="w-full px-3 py-1.5 bg-background border border-input rounded-md text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold">Question Text</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Enter exact GCE question text..."
                  value={formData.text}
                  onChange={(e) => setFormData((prev) => ({ ...prev, text: e.target.value }))}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm"
                />
              </div>

              {/* MCQ Options */}
              <div className="space-y-2">
                <label className="text-xs font-semibold">MCQ Options (If Paper 1 / MCQ)</label>
                {formData.options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="gceCorrectOpt"
                      checked={formData.correctAnswerIndex === idx}
                      onChange={() => setFormData((prev) => ({ ...prev, correctAnswerIndex: idx }))}
                    />
                    <span className="text-xs font-bold w-4">{String.fromCharCode(65 + idx)}.</span>
                    <input
                      type="text"
                      placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                      value={opt}
                      onChange={(e) => {
                        const opts = [...formData.options];
                        opts[idx] = e.target.value;
                        setFormData((prev) => ({ ...prev, options: opts }));
                      }}
                      className="w-full px-2.5 py-1 bg-background border border-input rounded-md text-xs"
                    />
                  </div>
                ))}
              </div>

              {/* Correct Answer Text */}
              <div className="space-y-1">
                <label className="text-xs font-semibold">Correct Answer / Solution Text (For Theory / Practical)</label>
                <textarea
                  rows={2}
                  placeholder="Expected answer or official key..."
                  value={formData.correctAnswerText}
                  onChange={(e) => setFormData((prev) => ({ ...prev, correctAnswerText: e.target.value }))}
                  className="w-full px-3 py-1.5 bg-background border border-input rounded-md text-xs"
                />
              </div>

              {/* Marking Scheme Notes */}
              <div className="space-y-1">
                <label className="text-xs font-semibold">Marking Scheme Notes</label>
                <textarea
                  rows={2}
                  placeholder="Key points required to award full marks..."
                  value={formData.markingSchemeNotes}
                  onChange={(e) => setFormData((prev) => ({ ...prev, markingSchemeNotes: e.target.value }))}
                  className="w-full px-3 py-1.5 bg-background border border-input rounded-md text-xs"
                />
              </div>

              {/* AI Explanation */}
              <div className="space-y-1">
                <label className="text-xs font-semibold">AI Tutor Step-by-Step Explanation</label>
                <textarea
                  rows={2}
                  placeholder="Comprehensive breakdown explaining why the answer is correct..."
                  value={formData.aiExplanation}
                  onChange={(e) => setFormData((prev) => ({ ...prev, aiExplanation: e.target.value }))}
                  className="w-full px-3 py-1.5 bg-background border border-input rounded-md text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-border pt-3">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Question"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
