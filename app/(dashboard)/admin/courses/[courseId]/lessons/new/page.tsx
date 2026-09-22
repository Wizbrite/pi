"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Loader2, FileText, Video, Upload, CheckCircle2, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

interface LessonPartInput {
  partNumber: number;
  title: string;
  content: string;
  aiPromptHint?: string;
  videoUrl?: string;
  vimeoVideoId?: string;
  vimeoEmbedUrl?: string;
}

export default function CreateLessonPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const router = useRouter();

  const [course, setCourse] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    topicId: "",
    order: 1,
  });

  const [parts, setParts] = useState<LessonPartInput[]>([
    { partNumber: 1, title: "Introduction", content: "", aiPromptHint: "", videoUrl: "", vimeoVideoId: "", vimeoEmbedUrl: "" },
  ]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingPartIdx, setUploadingPartIdx] = useState<number | null>(null);
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
    setParts((prev) => [
      ...prev,
      { partNumber: prev.length + 1, title: "", content: "", aiPromptHint: "", videoUrl: "", vimeoVideoId: "", vimeoEmbedUrl: "" },
    ]);
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
          parts: parts.map((p, idx) => ({
            partNumber: idx + 1,
            title: p.title || `Part ${idx + 1}`,
            content: p.content,
            aiPromptHint: p.aiPromptHint || "",
            videoUrl: p.videoUrl || "",
            vimeoVideoId: p.vimeoVideoId || "",
            vimeoEmbedUrl: p.vimeoEmbedUrl || "",
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
            Add a structured lesson and define its learning content parts and Vimeo videos for {course?.title}.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium">Lesson Title</label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. Introduction to Data Transmission & Networks"
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

            <hr className="border-border" />

            {/* Dynamic Parts Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-semibold text-foreground">Lesson Parts, Explanations & Videos</h3>
                  <p className="text-xs text-muted-foreground">Add text/markdown content and Vimeo videos for each part.</p>
                </div>
                <Button type="button" variant="outline" onClick={addPart} size="sm" className="gap-1">
                  <Plus className="h-4 w-4" /> Add Lesson Part
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
                    placeholder="Part Title (e.g. Concept Overview)"
                    value={part.title}
                    onChange={(e) => handlePartChange(index, "title", e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm font-semibold"
                  />

                  {/* Video Section */}
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
                      <div className="space-y-1">
                        <input
                          type="text"
                          placeholder="Paste Vimeo URL or Video ID (e.g. 1057488392)"
                          value={part.videoUrl || ""}
                          onChange={(e) => handleVimeoUrlChange(index, e.target.value)}
                          className="w-full px-3 py-1.5 bg-background border border-input rounded-md text-xs font-mono"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-input bg-background hover:bg-accent text-xs font-semibold text-foreground">
                          {uploadingPartIdx === index ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" /> Uploading to Vimeo...
                            </>
                          ) : (
                            <>
                              <Upload className="w-3.5 h-3.5 text-blue-600" /> Upload Video File to Vimeo
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

                    {/* Live Preview */}
                    {part.vimeoEmbedUrl && (
                      <div className="relative w-full pt-[56.25%] rounded-lg overflow-hidden bg-black border border-border mt-2">
                        <iframe
                          src={part.vimeoEmbedUrl}
                          className="absolute top-0 left-0 w-full h-full"
                          allow="autoplay; fullscreen; picture-in-picture"
                          allowFullScreen
                          title={`Preview Part ${index + 1}`}
                        />
                      </div>
                    )}
                  </div>

                  <textarea
                    rows={4}
                    placeholder="Part Content (Markdown supported)..."
                    value={part.content}
                    onChange={(e) => handlePartChange(index, "content", e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />

                  <input
                    type="text"
                    placeholder="AI Prompt Hint / Explanation Focus (Optional)"
                    value={part.aiPromptHint || ""}
                    onChange={(e) => handlePartChange(index, "aiPromptHint", e.target.value)}
                    className="w-full px-3 py-1.5 bg-background border border-input rounded-md text-xs text-muted-foreground"
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
