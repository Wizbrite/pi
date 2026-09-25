"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Loader2,
  FileText,
  Video,
  Upload,
  CheckCircle2,
  FileSpreadsheet,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";

interface LessonPartInput {
  partNumber: number;
  title: string;
  content: string;
  aiPromptHint?: string;
  videoUrl?: string;
  vimeoVideoId?: string;
  vimeoEmbedUrl?: string;
  // PDF Part Config
  pdfUrl?: string;
  startPage?: number;
  endPage?: number;
  passingScore?: number;
  partContext?: string;
}

export default function CreateLessonPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const router = useRouter();

  const [course, setCourse] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    topicId: "",
    order: 1,
    lessonType: "text" as "text" | "video" | "pdf",
    pdfUrl: "",
  });

  const [parts, setParts] = useState<LessonPartInput[]>([
    {
      partNumber: 1,
      title: "Part 1: Introduction",
      content: "",
      aiPromptHint: "",
      videoUrl: "",
      vimeoVideoId: "",
      vimeoEmbedUrl: "",
      startPage: 1,
      endPage: 5,
      passingScore: 80,
      partContext: "",
    },
  ]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingPartIdx, setUploadingPartIdx] = useState<number | null>(null);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCourse() {
      try {
        const res = await fetch(`/api/courses/${courseId}`);
        const json = await res.json();
        if (json.success) {
          const c = json.data.course || json.data;
          setCourse(c);
          if (c.topics && c.topics.length > 0) {
            setFormData((prev) => ({ ...prev, topicId: c.topics[0]._id }));
          }
        }
      } catch (err) {
        console.error("Failed to load course:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadCourse();
  }, [courseId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePartChange = (index: number, field: keyof LessonPartInput, value: any) => {
    setParts((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handlePdfUpload = async (file: File) => {
    if (!file) return;
    setIsUploadingPdf(true);
    try {
      const uploadData = new FormData();
      uploadData.append("file", file);

      const res = await fetch("/api/admin/upload/pdf", {
        method: "POST",
        body: uploadData,
      });

      const json = await res.json();
      if (json.success && json.data) {
        setFormData((prev) => ({ ...prev, pdfUrl: json.data.pdfUrl }));
        toast.success("PDF document uploaded successfully!");
      } else {
        alert(json.message || "Failed to upload PDF file.");
      }
    } catch (err) {
      console.error("PDF upload error:", err);
      alert("An error occurred while uploading PDF.");
    } finally {
      setIsUploadingPdf(false);
    }
  };

  const handlePartPdfUpload = async (index: number, file: File) => {
    if (!file) return;
    setUploadingPartIdx(index);
    try {
      const uploadData = new FormData();
      uploadData.append("file", file);

      const res = await fetch("/api/admin/upload/pdf", {
        method: "POST",
        body: uploadData,
      });

      const json = await res.json();
      if (json.success && json.data) {
        handlePartChange(index, "pdfUrl", json.data.pdfUrl);
        if (!formData.pdfUrl) {
          setFormData((prev) => ({ ...prev, pdfUrl: json.data.pdfUrl }));
        }
        toast.success(`PDF loaded for Part ${index + 1}!`);
      } else {
        alert(json.message || "Failed to upload PDF for this part.");
      }
    } catch (err) {
      console.error("Part PDF upload error:", err);
      alert("An error occurred while uploading PDF for this part.");
    } finally {
      setUploadingPartIdx(null);
    }
  };

  const handleVimeoUrlChange = async (index: number, value: string) => {
    handlePartChange(index, "videoUrl", value);
    if (!value.trim()) {
      handlePartChange(index, "vimeoVideoId", "");
      handlePartChange(index, "vimeoEmbedUrl", "");
      return;
    }

    try {
      const res = await fetch("/api/admin/vimeo/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vimeoUrl: value }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        handlePartChange(index, "vimeoVideoId", json.data.vimeoVideoId);
        handlePartChange(index, "vimeoEmbedUrl", json.data.vimeoEmbedUrl);
        handlePartChange(index, "videoUrl", json.data.videoUrl || value);
      }
    } catch (err) {
      console.error("Vimeo URL parse error:", err);
    }
  };

  const handleVideoFileUpload = async (index: number, file: File) => {
    if (!file) return;
    setUploadingPartIdx(index);
    try {
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("title", `${formData.title || "Lesson"} - Part ${index + 1}`);

      const res = await fetch("/api/admin/vimeo/upload", {
        method: "POST",
        body: uploadData,
      });

      const json = await res.json();
      if (json.success && json.data) {
        handlePartChange(index, "vimeoVideoId", json.data.vimeoVideoId);
        handlePartChange(index, "vimeoEmbedUrl", json.data.vimeoEmbedUrl);
        handlePartChange(index, "videoUrl", json.data.videoUrl);
      } else {
        alert(json.message || "Failed to upload video to Vimeo.");
      }
    } catch (err) {
      console.error("Video upload error:", err);
      alert("An error occurred while uploading video file.");
    } finally {
      setUploadingPartIdx(null);
    }
  };

  const addPart = () => {
    setParts((prev) => {
      const lastPart = prev[prev.length - 1];
      const nextStart = (lastPart?.endPage || 5) + 1;
      const nextEnd = nextStart + 4;
      return [
        ...prev,
        {
          partNumber: prev.length + 1,
          title: `Part ${prev.length + 1}`,
          content: "",
          aiPromptHint: "",
          videoUrl: "",
          vimeoVideoId: "",
          vimeoEmbedUrl: "",
          startPage: nextStart,
          endPage: nextEnd,
          passingScore: 80,
          partContext: "",
        },
      ];
    });
  };

  const removePart = (index: number) => {
    setParts((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((p, i) => ({ ...p, partNumber: i + 1 }))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError("Lesson title is required.");
      return;
    }
    if (formData.lessonType === "pdf" && !formData.pdfUrl.trim()) {
      setError("PDF document file or URL is required for PDF lessons.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/courses/${courseId}/lessons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title.trim(),
          topicId: formData.topicId || undefined,
          order: Number(formData.order) || 1,
          lessonType: formData.lessonType,
          pdfUrl: formData.pdfUrl.trim(),
          parts: parts.map((p, idx) => ({
            partNumber: idx + 1,
            title: p.title || `Part ${idx + 1}`,
            content: p.content || "",
            aiPromptHint: p.aiPromptHint || "",
            videoUrl: p.videoUrl || "",
            vimeoVideoId: p.vimeoVideoId || "",
            vimeoEmbedUrl: p.vimeoEmbedUrl || "",
            startPage: Number(p.startPage) || 1,
            endPage: Number(p.endPage) || 1,
            passingScore: Number(p.passingScore) || 80,
            partContext: p.partContext || "",
          })),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to create lesson");
      }

      router.push(`/admin/courses/${courseId}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to create lesson.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="text-sm text-muted-foreground">Loading lesson editor...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => router.push(`/admin/courses/${courseId}`)} className="gap-2 text-muted-foreground">
        <ArrowLeft className="w-4 h-4" /> Back to Course
      </Button>

      <Card className="bg-card border-border shadow-xs">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-600" /> Create New Lesson
          </CardTitle>
          <CardDescription>
            Add a structured lesson and choose format: Markdown Text, Vimeo Video, or PDF Document with gated page checkpoints.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md">
                {error}
              </div>
            )}

            {/* ── Lesson Type Switcher ── */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Lesson Format / Type</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, lessonType: "text" }))}
                  className={`p-3 rounded-lg border text-xs font-bold flex flex-col items-center gap-2 transition-all ${
                    formData.lessonType === "text"
                      ? "bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400"
                      : "bg-background border-border text-muted-foreground hover:bg-accent"
                  }`}
                >
                  <FileText className="w-5 h-5" /> Standard Text / Markdown
                </button>

                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, lessonType: "video" }))}
                  className={`p-3 rounded-lg border text-xs font-bold flex flex-col items-center gap-2 transition-all ${
                    formData.lessonType === "video"
                      ? "bg-blue-500/10 border-blue-500 text-blue-700 dark:text-blue-400"
                      : "bg-background border-border text-muted-foreground hover:bg-accent"
                  }`}
                >
                  <Video className="w-5 h-5" /> Video Lesson (Vimeo)
                </button>

                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, lessonType: "pdf" }))}
                  className={`p-3 rounded-lg border text-xs font-bold flex flex-col items-center gap-2 transition-all ${
                    formData.lessonType === "pdf"
                      ? "bg-purple-500/10 border-purple-500 text-purple-700 dark:text-purple-400"
                      : "bg-background border-border text-muted-foreground hover:bg-accent"
                  }`}
                >
                  <FileSpreadsheet className="w-5 h-5" /> PDF Document & Page Checkpoints
                </button>
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium">Lesson Title</label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. Chapter 4: Computer Systems & Architecture"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Order Index</label>
                <input
                  type="number"
                  name="order"
                  min="1"
                  value={formData.order}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Select Topic */}
            {course?.topics && course.topics.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Associated Syllabus Topic</label>
                <select
                  name="topicId"
                  value={formData.topicId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {course.topics.map((t: any) => (
                    <option key={t._id} value={t._id}>
                      {t.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* ── Global PDF Document Section ── */}
            {formData.lessonType === "pdf" && (
              <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
                    <FileSpreadsheet className="w-4 h-4" /> Lesson PDF Document File / URL
                  </label>
                  {formData.pdfUrl && (
                    <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded">
                      <CheckCircle2 className="w-3 h-3" /> PDF Attached
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
                  <input
                    type="text"
                    placeholder="Paste PDF File URL (e.g. /uploads/pdf/document.pdf or Cloudinary URL)"
                    value={formData.pdfUrl}
                    onChange={(e) => setFormData((prev) => ({ ...prev, pdfUrl: e.target.value }))}
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-xs font-mono"
                  />

                  <label className="cursor-pointer inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-xs font-semibold text-purple-700 dark:text-purple-400">
                    {isUploadingPdf ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-purple-600" /> Uploading PDF...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 text-purple-600" /> Upload PDF File
                      </>
                    )}
                    <input
                      type="file"
                      accept="application/pdf,.pdf"
                      disabled={isUploadingPdf}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handlePdfUpload(file);
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            )}

            <hr className="border-border" />

            {/* ── Dynamic Parts Section ── */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    {formData.lessonType === "pdf" ? "PDF Page-Range Part Checkpoints" : "Lesson Parts & Explanations"}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {formData.lessonType === "pdf"
                      ? "Divide the PDF into page ranges (parts). Students must pass an AI quiz to unlock subsequent pages."
                      : "Add text/markdown content and optional videos for each part."}
                  </p>
                </div>
                <Button type="button" variant="outline" onClick={addPart} size="sm" className="gap-1">
                  <Plus className="h-4 w-4" /> Add Part Range
                </Button>
              </div>

              {parts.map((part, index) => (
                <div key={index} className="p-4 border border-border rounded-xl bg-muted/30 space-y-3 relative">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                      Part #{index + 1}
                    </span>
                    {parts.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removePart(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-7 w-7"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <input
                    type="text"
                    placeholder="Part Title (e.g. Chapter 1: Introduction & Basic Principles)"
                    value={part.title}
                    onChange={(e) => handlePartChange(index, "title", e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm font-semibold"
                  />

                  {/* PDF Page Range Config (Only shown when lessonType === 'pdf') */}
                  {formData.lessonType === "pdf" && (
                    <div className="p-3 bg-purple-500/5 border border-purple-500/20 rounded-lg space-y-3">
                      <span className="text-xs font-bold text-purple-700 dark:text-purple-400 flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5" /> PDF Page Range & AI Quiz Checkpoint
                      </span>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-muted-foreground">Start Page</label>
                          <input
                            type="number"
                            min="1"
                            value={part.startPage || 1}
                            onChange={(e) => handlePartChange(index, "startPage", parseInt(e.target.value) || 1)}
                            className="w-full px-2.5 py-1.5 bg-background border border-input rounded text-xs font-mono"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-muted-foreground">End Page</label>
                          <input
                            type="number"
                            min={part.startPage || 1}
                            value={part.endPage || 1}
                            onChange={(e) => handlePartChange(index, "endPage", parseInt(e.target.value) || 1)}
                            className="w-full px-2.5 py-1.5 bg-background border border-input rounded text-xs font-mono"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-muted-foreground">Passing Score %</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={part.passingScore || 80}
                            onChange={(e) => handlePartChange(index, "passingScore", parseInt(e.target.value) || 80)}
                            className="w-full px-2.5 py-1.5 bg-background border border-input rounded text-xs font-mono"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-purple-600" /> Context Summary / Key Topics for AI Quiz Generation
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Summarize key topics in pages for AI to generate accurate questions..."
                          value={part.partContext || ""}
                          onChange={(e) => handlePartChange(index, "partContext", e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-background border border-input rounded text-xs"
                        />
                      </div>

                      {/* Direct Part PDF Upload */}
                      <div className="space-y-1 pt-2 border-t border-purple-500/20">
                        <label className="text-[11px] font-semibold text-muted-foreground flex items-center justify-between">
                          <span>Part PDF Document (Upload PDF directly for this part)</span>
                          {part.pdfUrl && <span className="text-emerald-600 font-bold text-[10px]">✓ Loaded</span>}
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Part PDF URL (e.g. /uploads/pdf/part1.pdf)"
                            value={part.pdfUrl || ""}
                            onChange={(e) => handlePartChange(index, "pdfUrl", e.target.value)}
                            className="w-full px-2.5 py-1 bg-background border border-input rounded text-xs font-mono"
                          />
                          <label className="cursor-pointer inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-xs font-semibold text-purple-700 dark:text-purple-400">
                            {uploadingPartIdx === index ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin text-purple-600" /> Uploading PDF...
                              </>
                            ) : (
                              <>
                                <Upload className="w-3 h-3 text-purple-600" /> Load PDF for Part #{index + 1}
                              </>
                            )}
                            <input
                              type="file"
                              accept="application/pdf,.pdf"
                              disabled={uploadingPartIdx === index}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handlePartPdfUpload(index, file);
                              }}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Video Section (Only shown when lessonType === 'video') */}
                  {formData.lessonType === "video" && (
                    <div className="p-3 bg-card border border-border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                          <Video className="w-4 h-4 text-blue-600" /> Lesson Part Video (Vimeo)
                        </label>
                        {part.vimeoEmbedUrl && (
                          <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded">
                            <CheckCircle2 className="w-3 h-3" /> Vimeo Configured
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
                        <input
                          type="text"
                          placeholder="Paste Vimeo URL or Video ID (e.g. 1057488392)"
                          value={part.videoUrl || ""}
                          onChange={(e) => handleVimeoUrlChange(index, e.target.value)}
                          className="w-full px-3 py-1.5 bg-background border border-input rounded-md text-xs font-mono"
                        />

                        <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-input bg-background hover:bg-accent text-xs font-semibold text-foreground">
                          {uploadingPartIdx === index ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" /> Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="w-3.5 h-3.5 text-blue-600" /> Upload Video
                            </>
                          )}
                          <input
                            type="file"
                            accept="video/*"
                            disabled={uploadingPartIdx === index}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleVideoFileUpload(index, file);
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  )}

                  <textarea
                    rows={3}
                    placeholder="Part Description / Content (Markdown supported)..."
                    value={part.content}
                    onChange={(e) => handlePartChange(index, "content", e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              ))}
            </div>
          </CardContent>

          <CardFooter className="flex justify-end gap-3 border-t border-border pt-4">
            <Button type="button" variant="outline" onClick={() => router.push(`/admin/courses/${courseId}`)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 text-white hover:bg-emerald-700">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Lesson"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
