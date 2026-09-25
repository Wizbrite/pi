"use client";

import React, { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Edit3, 
  Loader2, 
  HelpCircle, 
  CheckCircle2, 
  FileText,
  Save,
  X,
  Video,
  Upload,
  Clock,
  Tag,
  Target,
  BookOpenCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

// Helpers
const secToMmss = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
};
const mmssToSec = (mmss: string): number => {
  const parts = mmss.split(":");
  if (parts.length === 2) return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  return parseInt(mmss) || 0;
};
const genId = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

export default function EditLessonPage({ params }: { params: Promise<{ courseId: string; lessonId: string }> }) {
  const { courseId, lessonId } = use(params);
  const router = useRouter();

  const [lesson, setLesson] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingLesson, setIsSavingLesson] = useState(false);
  const [uploadingPartIdx, setUploadingPartIdx] = useState<number | null>(null);

  // Lesson Edit Form State
  const [title, setTitle] = useState("");
  const [order, setOrder] = useState(1);
  const [parts, setParts] = useState<any[]>([]);

  // Notion Management State
  const [activeNotionPartIdx, setActiveNotionPartIdx] = useState<number | null>(null);
  const [isSavingNotions, setIsSavingNotions] = useState(false);
  const [editingNotionIdx, setEditingNotionIdx] = useState<number | null>(null);
  const [notionForm, setNotionForm] = useState({
    id: "",
    label: "",
    startTime: "00:00",
    endTime: "00:00",
    passingScore: 80,
  });

  // Question Add/Edit Modal State
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [qFormData, setQFormData] = useState({
    text: "",
    type: "mcq" as "mcq" | "open-ended",
    options: ["", "", "", ""],
    correctAnswerIndex: 0,
    correctAnswerText: "",
    explanation: "",
    difficulty: "beginner" as "beginner" | "intermediate" | "advanced",
    xpPoints: 10,
  });
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [lessonRes, questionsRes] = await Promise.all([
        fetch(`/api/admin/lessons/${lessonId}`),
        fetch(`/api/admin/lessons/${lessonId}/questions`),
      ]);

      const lessonJson = await lessonRes.json();
      const questionsJson = await questionsRes.json();

      if (lessonJson.success && lessonJson.data) {
        setLesson(lessonJson.data);
        setTitle(lessonJson.data.title || "");
        setOrder(lessonJson.data.order || 1);
        setParts(lessonJson.data.parts || []);
      }
      if (questionsJson.success) {
        setQuestions(questionsJson.data);
      }
    } catch (err) {
      console.error("Failed to load lesson or questions:", err);
    } finally {
      setIsLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePartFieldChange = (idx: number, field: string, val: any) => {
    setParts((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  const handleVimeoUrlChange = async (idx: number, value: string) => {
    handlePartFieldChange(idx, "videoUrl", value);
    if (!value.trim()) {
      handlePartFieldChange(idx, "vimeoVideoId", "");
      handlePartFieldChange(idx, "vimeoEmbedUrl", "");
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
        handlePartFieldChange(idx, "vimeoVideoId", json.data.vimeoVideoId);
        handlePartFieldChange(idx, "vimeoEmbedUrl", json.data.vimeoEmbedUrl);
        handlePartFieldChange(idx, "videoUrl", json.data.videoUrl || value);
      }
    } catch (err) {
      console.error("Vimeo URL parse error:", err);
    }
  };

  const handleVideoFileUpload = async (idx: number, file: File) => {
    if (!file) return;
    setUploadingPartIdx(idx);
    try {
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("title", `${title || "Lesson"} - Part ${idx + 1}`);

      const res = await fetch("/api/admin/vimeo/upload", {
        method: "POST",
        body: uploadData,
      });

      const json = await res.json();
      if (json.success && json.data) {
        handlePartFieldChange(idx, "vimeoVideoId", json.data.vimeoVideoId);
        handlePartFieldChange(idx, "vimeoEmbedUrl", json.data.vimeoEmbedUrl);
        handlePartFieldChange(idx, "videoUrl", json.data.videoUrl);
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

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingLesson(true);
    try {
      const res = await fetch(`/api/admin/lessons/${lessonId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          order: Number(order),
          parts: parts.map((p, i) => ({
            ...p,
            partNumber: i + 1,
          })),
        }),
      });
      const json = await res.json();
      if (json.success) {
        alert("Lesson saved successfully!");
        fetchData();
      }
    } catch (err) {
      console.error("Failed to save lesson:", err);
    } finally {
      setIsSavingLesson(false);
    }
  };

  const handleOpenAddQuestion = () => {
    setEditingQuestionId(null);
    setQFormData({
      text: "",
      type: "mcq",
      options: ["", "", "", ""],
      correctAnswerIndex: 0,
      correctAnswerText: "",
      explanation: "",
      difficulty: "beginner",
      xpPoints: 10,
    });
    setShowQuestionModal(true);
  };

  const handleOpenEditQuestion = (q: any) => {
    setEditingQuestionId(q._id);
    setQFormData({
      text: q.questionText || q.text || "",
      type: q.type || "mcq",
      options: q.options && q.options.length > 0 ? q.options : ["", "", "", ""],
      correctAnswerIndex: q.correctAnswerIndex ?? 0,
      correctAnswerText: q.correctAnswer || q.correctAnswerText || "",
      explanation: q.explanation || "",
      difficulty: q.difficulty || "beginner",
      xpPoints: q.xpPoints ?? 10,
    });
    setShowQuestionModal(true);
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qFormData.text.trim()) return;
    setIsSubmittingQuestion(true);

    try {
      const payload = {
        text: qFormData.text.trim(),
        type: qFormData.type,
        options: qFormData.type === "mcq" ? qFormData.options.filter((o) => o.trim() !== "") : [],
        correctAnswerIndex: qFormData.type === "mcq" ? qFormData.correctAnswerIndex : undefined,
        correctAnswerText: qFormData.type === "open-ended" ? qFormData.correctAnswerText : undefined,
        explanation: qFormData.explanation,
        difficulty: qFormData.difficulty,
        xpPoints: Number(qFormData.xpPoints),
      };

      const url = editingQuestionId
        ? `/api/admin/lessons/${lessonId}/questions/${editingQuestionId}`
        : `/api/admin/lessons/${lessonId}/questions`;

      const method = editingQuestionId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setShowQuestionModal(false);
        fetchData();
      }
    } catch (err) {
      console.error("Failed to save question:", err);
    } finally {
      setIsSubmittingQuestion(false);
    }
  };

  const handleDeleteQuestion = async (qId: string) => {
    if (!confirm("Delete this question?")) return;
    try {
      const res = await fetch(`/api/admin/lessons/${lessonId}/questions/${qId}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setQuestions((prev) => prev.filter((q) => q._id !== qId));
      }
    } catch (err) {
      console.error("Failed to delete question:", err);
    }
  };

  // ── Notion helpers ────────────────────────────────────────────────────────
  const openAddNotion = (partIdx: number) => {
    setEditingNotionIdx(null);
    setNotionForm({ id: genId(), label: "", startTime: "00:00", endTime: "00:00", passingScore: 80 });
    setActiveNotionPartIdx(partIdx);
  };

  const openEditNotion = (partIdx: number, nIdx: number) => {
    const n = parts[partIdx].notions?.[nIdx];
    if (!n) return;
    setEditingNotionIdx(nIdx);
    setNotionForm({
      id: n.id,
      label: n.label,
      startTime: secToMmss(n.startTime),
      endTime: secToMmss(n.endTime),
      passingScore: n.passingScore ?? 80,
    });
    setActiveNotionPartIdx(partIdx);
  };

  const handleSaveNotion = () => {
    if (!notionForm.label.trim()) return;
    const newNotion = {
      id: notionForm.id || genId(),
      label: notionForm.label.trim(),
      startTime: mmssToSec(notionForm.startTime),
      endTime: mmssToSec(notionForm.endTime),
      passingScore: Number(notionForm.passingScore) || 80,
    };
    setParts((prev) =>
      prev.map((p, i) => {
        if (i !== activeNotionPartIdx) return p;
        const existing: any[] = p.notions || [];
        const updated =
          editingNotionIdx !== null
            ? existing.map((n: any, ni: number) => (ni === editingNotionIdx ? newNotion : n))
            : [...existing, newNotion];
        return { ...p, notions: updated.sort((a: any, b: any) => a.startTime - b.startTime) };
      })
    );
    setEditingNotionIdx(null);
    setNotionForm({ id: genId(), label: "", startTime: "00:00", endTime: "00:00", passingScore: 80 });
  };

  const handleDeleteNotion = (partIdx: number, nIdx: number) => {
    if (!confirm("Delete this notion?")) return;
    setParts((prev) =>
      prev.map((p, i) =>
        i === partIdx ? { ...p, notions: (p.notions || []).filter((_: any, ni: number) => ni !== nIdx) } : p
      )
    );
  };

  const handleSaveNotionsToDB = async (partIdx: number) => {
    setIsSavingNotions(true);
    try {
      const part = parts[partIdx];
      const res = await fetch(`/api/admin/lessons/${lessonId}/notions`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partNumber: part.partNumber, notions: part.notions || [] }),
      });
      const json = await res.json();
      if (!json.success) alert(json.message || "Failed to save notions.");
    } catch (err) {
      console.error("Failed to save notions:", err);
      alert("Error saving notions.");
    } finally {
      setIsSavingNotions(false);
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
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push(`/admin/courses/${courseId}`)} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Course
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Edit Lesson Details & Parts */}
        <Card className="bg-card border-border shadow-xs">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" /> Edit Lesson Details & Videos
            </CardTitle>
          </CardHeader>
          <form onSubmit={handleSaveLesson}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-muted-foreground">Lesson Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm font-semibold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-muted-foreground">Order Index</label>
                <input
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-background border border-input rounded-md text-sm"
                />
              </div>

              <hr className="border-border" />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-foreground">Content Parts ({parts.length})</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs gap-1"
                    onClick={() =>
                      setParts((prev) => [
                        ...prev,
                        { partNumber: prev.length + 1, title: "", content: "", videoUrl: "", vimeoVideoId: "", vimeoEmbedUrl: "" },
                      ])
                    }
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Part
                  </Button>
                </div>

                {parts.map((p: any, idx: number) => (
                  <div key={idx} className="p-3 border border-border rounded-lg bg-muted/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-600">Part #{idx + 1}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-red-500 hover:bg-red-50"
                        onClick={() => setParts((prev) => prev.filter((_, i) => i !== idx))}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    <input
                      type="text"
                      placeholder="Part Title"
                      value={p.title}
                      onChange={(e) => handlePartFieldChange(idx, "title", e.target.value)}
                      className="w-full px-2.5 py-1 text-xs bg-background border border-input rounded font-semibold"
                    />

                    {/* Vimeo Video Upload / URL Section */}
                    <div className="p-3 bg-card border border-border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                          <Video className="w-3.5 h-3.5 text-blue-600" /> Vimeo Video
                        </label>
                        {p.vimeoEmbedUrl && (
                          <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded">
                            <CheckCircle2 className="w-3 h-3" /> Vimeo Configured
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-center">
                        <input
                          type="text"
                          placeholder="Paste Vimeo URL or ID (e.g. 1057488392)"
                          value={p.videoUrl || ""}
                          onChange={(e) => handleVimeoUrlChange(idx, e.target.value)}
                          className="w-full px-2.5 py-1 bg-background border border-input rounded text-xs font-mono"
                        />

                        <label className="cursor-pointer inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded border border-input bg-background hover:bg-accent text-xs font-semibold text-foreground">
                          {uploadingPartIdx === idx ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin text-blue-600" /> Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="w-3 h-3 text-blue-600" /> Upload Video File
                            </>
                          )}
                          <input
                            type="file"
                            accept="video/*"
                            disabled={uploadingPartIdx === idx}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleVideoFileUpload(idx, file);
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        💡 <strong>Tip:</strong> While waiting for Vimeo API verification, upload directly on <a href="https://vimeo.com/upload" target="_blank" rel="noreferrer" className="underline text-blue-600">vimeo.com/upload</a> and paste the link or video ID above.
                      </p>

                      {p.vimeoEmbedUrl && (
                        <div className="relative w-full pt-[56.25%] rounded overflow-hidden bg-black border border-border mt-1">
                          <iframe
                            src={p.vimeoEmbedUrl}
                            className="absolute top-0 left-0 w-full h-full"
                            allow="autoplay; fullscreen; picture-in-picture"
                            allowFullScreen
                            title={`Preview Part ${idx + 1}`}
                          />
                        </div>
                      )}
                    </div>

                    {/* ── Notion Management (only shows when video is set) ── */}
                    {p.vimeoEmbedUrl && (
                      <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                            <BookOpenCheck className="w-3.5 h-3.5" /> Video Notions ({(p.notions || []).length})
                          </label>
                          <div className="flex gap-1.5">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="text-[10px] h-6 px-2 gap-1 border-blue-500/40 text-blue-700 dark:text-blue-400 hover:bg-blue-500/10"
                              onClick={() => openAddNotion(idx)}
                            >
                              <Plus className="w-3 h-3" /> Add Notion
                            </Button>
                            {(p.notions || []).length > 0 && (
                              <Button
                                type="button"
                                size="sm"
                                disabled={isSavingNotions}
                                className="text-[10px] h-6 px-2 gap-1 bg-blue-600 text-white hover:bg-blue-700"
                                onClick={() => handleSaveNotionsToDB(idx)}
                              >
                                {isSavingNotions ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Save
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Existing notions list */}
                        {(p.notions || []).length > 0 && (
                          <div className="space-y-1.5">
                            {(p.notions as any[]).map((n: any, nIdx: number) => (
                              <div key={n.id} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-card border border-border text-xs">
                                <Clock className="w-3 h-3 text-blue-500 shrink-0" />
                                <span className="font-semibold text-foreground flex-1 truncate">{n.label}</span>
                                <span className="text-muted-foreground">{secToMmss(n.startTime)}–{secToMmss(n.endTime)}</span>
                                <span className="text-muted-foreground">Pass: {n.passingScore}%</span>
                                <button type="button" onClick={() => openEditNotion(idx, nIdx)} className="p-0.5 text-muted-foreground hover:text-blue-600 rounded">
                                  <Edit3 className="w-3 h-3" />
                                </button>
                                <button type="button" onClick={() => handleDeleteNotion(idx, nIdx)} className="p-0.5 text-muted-foreground hover:text-red-500 rounded">
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Inline add/edit notion form */}
                        {activeNotionPartIdx === idx && (
                          <div className="p-3 rounded-lg bg-card border border-blue-500/30 space-y-2">
                            <p className="text-[10px] font-bold uppercase text-blue-600 tracking-wide">
                              {editingNotionIdx !== null ? "Edit Notion" : "New Notion"}
                            </p>

                            <div className="grid grid-cols-2 gap-2">
                              <div className="col-span-2">
                                <label className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1">
                                  <Tag className="w-3 h-3" /> Label
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g. Introduction, Core Concepts"
                                  value={notionForm.label}
                                  onChange={(e) => setNotionForm((f) => ({ ...f, label: e.target.value }))}
                                  className="w-full mt-0.5 px-2 py-1 text-xs bg-background border border-input rounded"
                                />
                              </div>

                              <div>
                                <label className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> Start (MM:SS)
                                </label>
                                <input
                                  type="text"
                                  placeholder="00:00"
                                  value={notionForm.startTime}
                                  onChange={(e) => setNotionForm((f) => ({ ...f, startTime: e.target.value }))}
                                  className="w-full mt-0.5 px-2 py-1 text-xs bg-background border border-input rounded font-mono"
                                />
                              </div>

                              <div>
                                <label className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> End (MM:SS)
                                </label>
                                <input
                                  type="text"
                                  placeholder="01:30"
                                  value={notionForm.endTime}
                                  onChange={(e) => setNotionForm((f) => ({ ...f, endTime: e.target.value }))}
                                  className="w-full mt-0.5 px-2 py-1 text-xs bg-background border border-input rounded font-mono"
                                />
                              </div>

                              <div>
                                <label className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1">
                                  <Target className="w-3 h-3" /> Passing Score (%)
                                </label>
                                <input
                                  type="number"
                                  min={50} max={100}
                                  value={notionForm.passingScore}
                                  onChange={(e) => setNotionForm((f) => ({ ...f, passingScore: Number(e.target.value) }))}
                                  className="w-full mt-0.5 px-2 py-1 text-xs bg-background border border-input rounded"
                                />
                              </div>

                              <div className="col-span-2" />
                            </div>

                            <div className="flex gap-2 justify-end pt-1">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="text-xs h-7"
                                onClick={() => { setActiveNotionPartIdx(null); setEditingNotionIdx(null); }}
                              >
                                Cancel
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                disabled={!notionForm.label.trim()}
                                className="text-xs h-7 bg-blue-600 text-white hover:bg-blue-700 gap-1"
                                onClick={handleSaveNotion}
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                {editingNotionIdx !== null ? "Update" : "Add"} Notion
                              </Button>
                            </div>
                          </div>
                        )}

                        {(p.notions || []).length === 0 && activeNotionPartIdx !== idx && (
                          <p className="text-[10px] text-muted-foreground text-center py-1">
                            No notions yet. Add segments to gate student progress with AI quizzes.
                          </p>
                        )}
                      </div>
                    )}

                    {/* ── Video AI Quiz Config (part-level) ── */}
                    {p.vimeoEmbedUrl && (p.notions || []).length > 0 && (
                      <div className="p-3 bg-purple-500/5 border border-purple-500/20 rounded-lg space-y-2">
                        <label className="text-xs font-bold text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
                          <BookOpenCheck className="w-3.5 h-3.5" /> AI Question Pool (whole video)
                        </label>
                        <p className="text-[10px] text-muted-foreground">
                          Pi AI generates a total pool of questions for the full video, then splits them across all notions ({p.questionsPerNotion ?? 10} per notion).
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-semibold text-muted-foreground">Total Questions to Generate</label>
                            <input
                              type="number"
                              min={5} max={100}
                              value={p.totalQuestions ?? 20}
                              onChange={(e) => handlePartFieldChange(idx, "totalQuestions", Number(e.target.value))}
                              className="w-full mt-0.5 px-2 py-1 text-xs bg-background border border-input rounded"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-semibold text-muted-foreground">Questions per Notion</label>
                            <input
                              type="number"
                              min={1} max={50}
                              value={p.questionsPerNotion ?? 10}
                              onChange={(e) => handlePartFieldChange(idx, "questionsPerNotion", Number(e.target.value))}
                              className="w-full mt-0.5 px-2 py-1 text-xs bg-background border border-input rounded"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="text-[10px] font-semibold text-muted-foreground">
                              Video Context / Transcript Summary (fed to AI for better questions)
                            </label>
                            <textarea
                              rows={3}
                              placeholder="Paste a summary, key topics, or transcript excerpt from this video. The more context, the better the AI questions."
                              value={p.videoContext || ""}
                              onChange={(e) => handlePartFieldChange(idx, "videoContext", e.target.value)}
                              className="w-full mt-0.5 px-2 py-1 text-xs bg-background border border-input rounded"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <textarea
                      rows={3}
                      placeholder="Content (Markdown)"
                      value={p.content}
                      onChange={(e) => handlePartFieldChange(idx, "content", e.target.value)}
                      className="w-full px-2.5 py-1 text-xs bg-background border border-input rounded"
                    />

                    <input
                      type="text"
                      placeholder="AI Prompt Hint (Optional)"
                      value={p.aiPromptHint || ""}
                      onChange={(e) => handlePartFieldChange(idx, "aiPromptHint", e.target.value)}
                      className="w-full px-2.5 py-1 text-xs bg-background border border-input rounded text-muted-foreground"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t border-border pt-3">
              <Button type="submit" disabled={isSavingLesson} className="bg-emerald-600 text-white gap-2">
                {isSavingLesson ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Lesson
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Right: Manage Quiz Questions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-purple-600" /> Quiz Questions ({questions.length})
            </h2>
            <Button onClick={handleOpenAddQuestion} className="bg-purple-600 text-white hover:bg-purple-700 gap-1 text-xs">
              <Plus className="w-3.5 h-3.5" /> Add Question
            </Button>
          </div>

          {questions.length === 0 ? (
            <Card className="bg-card border-border p-8 text-center">
              <HelpCircle className="w-10 h-10 mx-auto text-muted-foreground opacity-40 mb-2" />
              <p className="text-sm font-semibold text-foreground">No questions added yet</p>
              <p className="text-xs text-muted-foreground mt-0.5 mb-3">
                Create MCQs or open-ended practice questions for this lesson.
              </p>
              <Button onClick={handleOpenAddQuestion} size="sm" className="bg-purple-600 text-white text-xs gap-1">
                <Plus className="w-3.5 h-3.5" /> Add First Question
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {questions.map((q, idx) => (
                <Card key={q._id} className="bg-card border-border hover:border-purple-500/40 transition-all shadow-xs">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/10 text-purple-600">
                          Q#{idx + 1} • {q.type === "mcq" ? "MCQ" : "Open-ended"} • {q.difficulty} • {q.xpPoints ?? 10} XP
                        </span>
                        <p className="text-sm font-semibold text-foreground">{q.questionText || q.text}</p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleOpenEditQuestion(q)}
                          className="h-7 w-7 text-muted-foreground hover:text-purple-600"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteQuestion(q._id)}
                          className="h-7 w-7 text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>

                    {q.type === "mcq" && q.options && q.options.length > 0 && (
                      <div className="grid grid-cols-2 gap-1.5 pt-1">
                        {q.options.map((opt: string, optIdx: number) => (
                          <div
                            key={optIdx}
                            className={`text-xs px-2.5 py-1 rounded border ${
                              optIdx === q.correctAnswerIndex
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 font-semibold"
                                : "bg-muted/40 border-border text-muted-foreground"
                            }`}
                          >
                            {String.fromCharCode(65 + optIdx)}. {opt}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Question Modal */}
      {showQuestionModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-xl w-full space-y-4 shadow-xl my-8">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-lg font-bold text-foreground">
                {editingQuestionId ? "Edit Question" : "Add New Question"}
              </h3>
              <Button size="icon" variant="ghost" onClick={() => setShowQuestionModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold">Question Text</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Enter question text..."
                  value={qFormData.text}
                  onChange={(e) => setQFormData((prev) => ({ ...prev, text: e.target.value }))}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Question Type</label>
                  <select
                    value={qFormData.type}
                    onChange={(e) => setQFormData((prev) => ({ ...prev, type: e.target.value as any }))}
                    className="w-full px-2.5 py-1.5 bg-background border border-input rounded-md text-xs"
                  >
                    <option value="mcq">MCQ (Multiple Choice)</option>
                    <option value="open-ended">Open-ended</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold">Difficulty</label>
                  <select
                    value={qFormData.difficulty}
                    onChange={(e) => setQFormData((prev) => ({ ...prev, difficulty: e.target.value as any }))}
                    className="w-full px-2.5 py-1.5 bg-background border border-input rounded-md text-xs"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold">XP Points</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={qFormData.xpPoints}
                    onChange={(e) => setQFormData((prev) => ({ ...prev, xpPoints: Number(e.target.value) }))}
                    className="w-full px-2.5 py-1.5 bg-background border border-input rounded-md text-xs font-bold text-purple-600"
                  />
                </div>
              </div>

              {/* Options for MCQ */}
              {qFormData.type === "mcq" ? (
                <div className="space-y-2">
                  <label className="text-xs font-semibold">MCQ Options (Select Radio for Correct Answer)</label>
                  {qFormData.options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={qFormData.correctAnswerIndex === idx}
                        onChange={() => setQFormData((prev) => ({ ...prev, correctAnswerIndex: idx }))}
                      />
                      <span className="text-xs font-bold w-4">{String.fromCharCode(65 + idx)}.</span>
                      <input
                        type="text"
                        placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                        value={opt}
                        onChange={(e) => {
                          const opts = [...qFormData.options];
                          opts[idx] = e.target.value;
                          setQFormData((prev) => ({ ...prev, options: opts }));
                        }}
                        className="w-full px-2.5 py-1 bg-background border border-input rounded-md text-xs"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-xs font-semibold">Correct Answer Text / Sample Solution</label>
                  <textarea
                    rows={2}
                    placeholder="Provide expected answer text..."
                    value={qFormData.correctAnswerText}
                    onChange={(e) => setQFormData((prev) => ({ ...prev, correctAnswerText: e.target.value }))}
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-semibold">Explanation / Hint (Optional)</label>
                <input
                  type="text"
                  placeholder="Explanation shown after answering..."
                  value={qFormData.explanation}
                  onChange={(e) => setQFormData((prev) => ({ ...prev, explanation: e.target.value }))}
                  className="w-full px-3 py-1.5 bg-background border border-input rounded-md text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-border pt-3">
                <Button type="button" variant="outline" onClick={() => setShowQuestionModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmittingQuestion} className="bg-purple-600 text-white">
                  {isSubmittingQuestion ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Question"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
