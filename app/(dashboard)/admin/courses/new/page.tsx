"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ArrowLeft, Loader2 } from "lucide-react";

interface TopicInput {
  title: string;
  description: string;
}

export default function CreateCoursePage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    level: "O-Level" as "O-Level" | "A-Level",
    description: "",
  });

  const [topics, setTopics] = useState<TopicInput[]>([
    { title: "", description: "" }
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle Main Course Fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Dynamic Topic Handlers
  const handleTopicChange = (index: number, field: keyof TopicInput, value: string) => {
    setTopics((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const addTopic = () => {
    setTopics((prev) => [...prev, { title: "", description: "" }]);
  };

  const removeTopic = (index: number) => {
    setTopics((prev) => prev.filter((_, i) => i !== index));
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Filter out completely empty topic rows
    const cleanedTopics = topics.filter((t) => t.title.trim() !== "");

    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          topics: cleanedTopics,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to create course");
      }

      router.push("/admin/courses");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => router.back()} className="gap-2 text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Courses
      </Button>

      <Card className="bg-card text-card-foreground border-border shadow-xs">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Create New Course</CardTitle>
          <CardDescription>
            Add a new subject course and define its main syllabus topics.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md">
                {error}
              </div>
            )}

            {/* Title & Level Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium">Course Title</label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. Pure Mathematics & Mechanics"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">GCE Level</label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="O-Level">O-Level</option>
                  <option value="A-Level">A-Level</option>
                </select>
              </div>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject Category</label>
              <input
                type="text"
                name="subject"
                required
                placeholder="e.g. Mathematics, Physics, Chemistry"
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                name="description"
                rows={3}
                placeholder="Provide a brief summary of what this course covers..."
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <hr className="border-border" />

            {/* Dynamic Topics Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-md font-semibold text-foreground">Syllabus Topics</h3>
                  <p className="text-xs text-muted-foreground">Define modules/topics for this course.</p>
                </div>
                <Button type="button" variant="outline" onClick={addTopic} size="sm" className="gap-1">
                  <Plus className="h-4 w-4" /> Add Topic
                </Button>
              </div>

              {topics.map((topic, index) => (
                <div key={index} className="p-4 border border-border rounded-lg bg-muted/40 space-y-3 relative">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">
                      Topic #{index + 1}
                    </span>
                    {topics.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeTopic(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <input
                    type="text"
                    placeholder="Topic Title (e.g. Quadratic Equations)"
                    value={topic.title}
                    onChange={(e) => handleTopicChange(index, "title", e.target.value)}
                    className="w-full px-3 py-1.5 bg-background border border-input rounded-md text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Brief Topic Description (Optional)"
                    value={topic.description}
                    onChange={(e) => handleTopicChange(index, "description", e.target.value)}
                    className="w-full px-3 py-1.5 bg-background border border-input rounded-md text-sm"
                  />
                </div>
              ))}
            </div>
          </CardContent>

          <CardFooter className="flex justify-end gap-3 border-t border-border pt-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-primary text-primary-foreground">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save & Publish Course"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}