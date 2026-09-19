"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  GraduationCap, 
  Plus, 
  Trash2, 
  ArrowLeft, 
  Loader2, 
  ChevronRight,
  FileCheck2,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function AdminExamsPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    code: "",
    level: "A-Level" as "O-Level" | "A-Level",
    category: "Science & Tech",
    description: "",
    slug: "",
  });

  const fetchSubjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/exams");
      const json = await res.json();
      if (json.success) {
        setSubjects(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch exam subjects:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.code.trim()) return;
    setIsSubmitting(true);

    const generatedSlug = formData.slug.trim() || 
      `${formData.level.toLowerCase()}-${formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

    try {
      const res = await fetch("/api/admin/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, slug: generatedSlug }),
      });
      const json = await res.json();
      if (json.success) {
        setShowModal(false);
        setFormData({
          title: "",
          code: "",
          level: "A-Level",
          category: "Science & Tech",
          description: "",
          slug: "",
        });
        fetchSubjects();
      } else {
        alert(json.message || "Failed to create subject");
      }
    } catch (err) {
      console.error("Failed to create exam subject:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSubject = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete exam subject "${title}" and all its past papers and questions?`)) {
      return;
    }
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/exams/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setSubjects((prev) => prev.filter((s) => s._id !== id));
      }
    } catch (err) {
      console.error("Failed to delete exam subject:", err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push("/admin")} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Button>
        <Button onClick={() => setShowModal(true)} className="bg-blue-600 text-white hover:bg-blue-700 gap-2">
          <Plus className="w-4 h-4" /> Add Exam Subject
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-blue-600" /> Past GCE Exam Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage official GCE O-Level and A-Level exam subjects, papers, and past question banks.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="py-16 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm text-muted-foreground">Loading past exam subjects...</p>
        </div>
      ) : subjects.length === 0 ? (
        <Card className="bg-card border-border p-12 text-center">
          <GraduationCap className="w-12 h-12 mx-auto text-muted-foreground opacity-40 mb-3" />
          <p className="text-base font-semibold text-foreground">No Exam Subjects configured</p>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
            Add exam subjects (e.g., A-Level Information & Communication Technology) to start populating GCE papers.
          </p>
          <Button onClick={() => setShowModal(true)} size="sm" className="bg-blue-600 text-white gap-2">
            <Plus className="w-4 h-4" /> Add Exam Subject Now
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <Card key={subject._id} className="bg-card border-border hover:border-blue-500/50 transition-all shadow-xs flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-500/10 px-2.5 py-0.5 rounded-full">
                    GCE {subject.level}
                  </span>
                  <span className="text-xs font-mono font-bold text-muted-foreground">
                    [{subject.code}]
                  </span>
                </div>
                <CardTitle className="text-xl font-bold">{subject.title}</CardTitle>
                <CardDescription className="line-clamp-2 text-xs text-muted-foreground mt-1">
                  {subject.description || "No subject description provided."}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 pt-0">
                <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3">
                  <span className="flex items-center gap-1 font-semibold text-foreground">
                    <FileCheck2 className="w-3.5 h-3.5 text-blue-600" />
                    {subject.paperCount || 0} Past Exam Papers
                  </span>
                  <span className="text-[11px] text-muted-foreground">{subject.category}</span>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <Link href={`/admin/exams/${subject._id}`} className="w-full">
                    <Button variant="outline" className="w-full justify-between text-xs font-semibold hover:bg-blue-50 dark:hover:bg-blue-950/40">
                      <span>Manage Papers & Questions</span>
                      <ChevronRight className="w-4 h-4 text-blue-600" />
                    </Button>
                  </Link>

                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={deletingId === subject._id}
                    onClick={() => handleDeleteSubject(subject._id, subject.title)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 shrink-0"
                  >
                    {deletingId === subject._id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Subject Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-lg font-bold text-foreground">Add Past GCE Exam Subject</h3>
              <Button size="icon" variant="ghost" onClick={() => setShowModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <form onSubmit={handleCreateSubject} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Subject Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ICT, Pure Maths"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-1.5 bg-background border border-input rounded-md text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Subject Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 0796, 0570"
                    value={formData.code}
                    onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))}
                    className="w-full px-3 py-1.5 bg-background border border-input rounded-md text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold">GCE Level</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData((prev) => ({ ...prev, level: e.target.value as any }))}
                    className="w-full px-3 py-1.5 bg-background border border-input rounded-md text-sm"
                  >
                    <option value="A-Level">A-Level</option>
                    <option value="O-Level">O-Level</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Computer Science"
                    value={formData.category}
                    onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-1.5 bg-background border border-input rounded-md text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold">Description</label>
                <textarea
                  rows={3}
                  placeholder="Overview of this GCE exam subject..."
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-1.5 bg-background border border-input rounded-md text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-border pt-3">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Subject"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
