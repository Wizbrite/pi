"use client";

import React, { useEffect, useState, useCallback, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  FileCheck2, 
  Loader2, 
  ChevronRight,
  Clock,
  Award,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function AdminExamSubjectPapersPage({ params }: { params: Promise<{ subjectId: string }> }) {
  const { subjectId } = use(params);
  const router = useRouter();

  const [subject, setSubject] = useState<any>(null);
  const [papers, setPapers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    paperNumber: 1,
    title: "Paper 1 (MCQ)",
    type: "mcq" as "mcq" | "essay" | "practical",
    durationMinutes: 90,
    totalMarks: 50,
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/exams/${subjectId}`);
      const json = await res.json();
      if (json.success) {
        setSubject(json.data);
        setPapers(json.data.papers || []);
      }
    } catch (err) {
      console.error("Failed to fetch exam papers:", err);
    } finally {
      setIsLoading(false);
    }
  }, [subjectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreatePaper = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const generatedSlug = `${subject?.slug || "exam"}-${formData.year}-paper-${formData.paperNumber}`;

    try {
      const res = await fetch(`/api/admin/exams/${subjectId}/papers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          year: Number(formData.year),
          paperNumber: Number(formData.paperNumber),
          durationMinutes: Number(formData.durationMinutes),
          totalMarks: Number(formData.totalMarks),
          slug: generatedSlug,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setShowModal(false);
        fetchData();
      } else {
        alert(json.message || "Failed to add exam paper");
      }
    } catch (err) {
      console.error("Failed to add paper:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-sm text-muted-foreground">Loading subject exam papers...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push("/admin/exams")} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Exam Subjects
        </Button>
        <Button onClick={() => setShowModal(true)} className="bg-blue-600 text-white hover:bg-blue-700 gap-2">
          <Plus className="w-4 h-4" /> Add Past Paper
        </Button>
      </div>

      {/* Header */}
      <Card className="bg-card border-border shadow-xs">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-500/10 px-2.5 py-0.5 rounded-full">
              GCE {subject?.level}
            </span>
            <span className="text-xs font-mono font-bold text-muted-foreground">
              [{subject?.code}]
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-foreground">{subject?.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-3xl">
            {subject?.description || "Manage past GCE examination papers for this subject."}
          </p>
        </CardContent>
      </Card>

      {/* Papers Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <FileCheck2 className="w-5 h-5 text-blue-600" /> Configured GCE Papers ({papers.length})
        </h2>

        {papers.length === 0 ? (
          <Card className="bg-card border-border p-12 text-center">
            <FileCheck2 className="w-10 h-10 mx-auto text-muted-foreground opacity-40 mb-2" />
            <p className="text-base font-semibold text-foreground">No past papers added yet</p>
            <p className="text-xs text-muted-foreground mt-0.5 mb-4">
              Add past papers (e.g. 2023 Paper 1, 2022 Paper 2) to start adding GCE exam questions.
            </p>
            <Button onClick={() => setShowModal(true)} size="sm" className="bg-blue-600 text-white gap-2">
              <Plus className="w-4 h-4" /> Add First Past Paper
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {papers.map((paper) => (
              <Card key={paper._id} className="bg-card border-border hover:border-blue-500/40 transition-all shadow-xs flex flex-col justify-between">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded">
                      GCE {paper.year}
                    </span>
                    <span className="text-xs font-semibold uppercase text-muted-foreground">
                      Paper {paper.paperNumber} ({paper.type})
                    </span>
                  </div>
                  <CardTitle className="text-lg font-bold">{paper.title}</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4 pt-0">
                  <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3">
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      {paper.durationMinutes} mins
                    </span>
                    <span className="flex items-center gap-1 font-medium">
                      <Award className="w-3.5 h-3.5 text-amber-600" />
                      {paper.totalMarks} Marks
                    </span>
                    <span className="font-semibold text-foreground">
                      {paper.questionCount || 0} Questions
                    </span>
                  </div>

                  <Link href={`/admin/exams/${subjectId}/papers/${paper._id}`} className="block w-full">
                    <Button variant="outline" className="w-full justify-between text-xs font-semibold hover:bg-blue-50 dark:hover:bg-blue-950/40">
                      <span>Manage Past GCE Questions</span>
                      <ChevronRight className="w-4 h-4 text-blue-600" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add Paper Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-lg font-bold text-foreground">Add Past GCE Exam Paper</h3>
              <Button size="icon" variant="ghost" onClick={() => setShowModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <form onSubmit={handleCreatePaper} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold">GCE Year</label>
                  <input
                    type="number"
                    required
                    min="1990"
                    max="2030"
                    value={formData.year}
                    onChange={(e) => setFormData((prev) => ({ ...prev, year: Number(e.target.value) }))}
                    className="w-full px-3 py-1.5 bg-background border border-input rounded-md text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Paper Number</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="4"
                    value={formData.paperNumber}
                    onChange={(e) => setFormData((prev) => ({ ...prev, paperNumber: Number(e.target.value) }))}
                    className="w-full px-3 py-1.5 bg-background border border-input rounded-md text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold">Paper Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Paper 1 (MCQ), Paper 2 (Theory & Practical)"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-1.5 bg-background border border-input rounded-md text-sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Paper Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value as any }))}
                    className="w-full px-2 py-1.5 bg-background border border-input rounded-md text-xs"
                  >
                    <option value="mcq">MCQ</option>
                    <option value="essay">Essay / Structured</option>
                    <option value="practical">Practical</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold">Duration (Mins)</label>
                  <input
                    type="number"
                    required
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData((prev) => ({ ...prev, durationMinutes: Number(e.target.value) }))}
                    className="w-full px-3 py-1.5 bg-background border border-input rounded-md text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold">Total Marks</label>
                  <input
                    type="number"
                    required
                    value={formData.totalMarks}
                    onChange={(e) => setFormData((prev) => ({ ...prev, totalMarks: Number(e.target.value) }))}
                    className="w-full px-3 py-1.5 bg-background border border-input rounded-md text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-border pt-3">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Paper"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
