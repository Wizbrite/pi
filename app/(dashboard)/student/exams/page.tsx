"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  BookOpen,
  FileText,
  CheckCircle2,
  Filter,
  ArrowRight,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/auth-store";

// 1. Mock Data for 10 Subjects
interface ExamSubject {
  id: string;
  code: string;
  title: string;
  level: "O-Level" | "A-Level";
  category: "Science" | "Arts";
  paperCount: number;
  totalQuestions: number;
  completedPapers: number;
}

const MOCK_EXAM_SUBJECTS: ExamSubject[] = [
  { id: "phy-a", code: "PHY701", title: "Physics", level: "A-Level", category: "Science", paperCount: 3, totalQuestions: 150, completedPapers: 1 },
  { id: "chem-a", code: "CHE702", title: "Chemistry", level: "A-Level", category: "Science", paperCount: 3, totalQuestions: 140, completedPapers: 0 },
  { id: "math-a", code: "MAT703", title: "Further Mathematics", level: "A-Level", category: "Science", paperCount: 3, totalQuestions: 120, completedPapers: 2 },
  { id: "bio-a", code: "BIO704", title: "Biology", level: "A-Level", category: "Science", paperCount: 3, totalQuestions: 160, completedPapers: 0 },
  { id: "econ-a", code: "ECO705", title: "Economics", level: "A-Level", category: "Arts", paperCount: 2, totalQuestions: 100, completedPapers: 1 },
  { id: "lit-a", code: "LIT706", title: "Literature in English", level: "A-Level", category: "Arts", paperCount: 2, totalQuestions: 80, completedPapers: 0 },
  { id: "phy-o", code: "PHY501", title: "Physics", level: "O-Level", category: "Science", paperCount: 2, totalQuestions: 100, completedPapers: 2 },
  { id: "chem-o", code: "CHE502", title: "Chemistry", level: "O-Level", category: "Science", paperCount: 2, totalQuestions: 100, completedPapers: 1 },
  { id: "geo-o", code: "GEO503", title: "Geography", level: "O-Level", category: "Arts", paperCount: 2, totalQuestions: 90, completedPapers: 0 },
  { id: "hist-o", code: "HIS504", title: "History", level: "O-Level", category: "Arts", paperCount: 2, totalQuestions: 85, completedPapers: 0 },
];

export default function MockExamsPage() {
  const { user } = useAuthStore();
  const currentLevel = user?.gceLevel === "Advanced" ? "A-Level" : "O-Level";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"All" | "Science" | "Arts">("All");

  // 2. Filter & Search Logic
  const filteredSubjects = useMemo(() => {
    return MOCK_EXAM_SUBJECTS.filter((subject) => {
      // Search match
      const matchesSearch =
        subject.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subject.code.toLowerCase().includes(searchQuery.toLowerCase());

      // Level filter match
      const matchesLevel = subject.level === currentLevel;

      // Category filter match
      const matchesCategory = selectedCategory === "All" || subject.category === selectedCategory;

      return matchesSearch && matchesLevel && matchesCategory;
    });
  }, [searchQuery, currentLevel, selectedCategory]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-semibold text-primary border-primary/30 bg-primary/5">
              GCE Examination Bank
            </Badge>
          </div>
          <h1 className="text-2xl font-black text-foreground mt-1 tracking-tight">Mock Examinations</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Select a subject to view past exam papers, timed mock tests, and marking schemes.
          </p>
        </div>
      </div>

      {/* SEARCH AND FILTER BAR */}
      <div className="bg-card border border-border rounded-2xl p-4 shadow-xs space-y-4">
        
        {/* Search Input */}
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search subject or code (e.g., Physics, CHE702)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 text-sm bg-background"
          />
        </div>

        {/* Filter Badges & Options */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-border">
          
          {/* Field Category Filter (Science vs Arts) */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-muted-foreground mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Field:
            </span>
            {(["All", "Science", "Arts"] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                  selectedCategory === cat
                    ? "bg-foreground text-background shadow-xs"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* RESULTS COUNT SUMMARY */}
      <div className="flex justify-between items-center text-xs text-muted-foreground px-1">
        <span>Showing <strong className="text-foreground">{filteredSubjects.length}</strong> subjects</span>
        {(selectedCategory !== "All" || searchQuery) && (
          <button
            onClick={() => {
              setSelectedCategory("All");
              setSearchQuery("");
            }}
            className="text-primary hover:underline font-semibold"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* SUBJECT EXAM CARDS GRID */}
      {filteredSubjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSubjects.map((subject) => (
            <div
              key={subject.id}
              className="bg-card border border-border rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-primary/40 transition group"
            >
              <div className="space-y-3">
                {/* Level & Category Badges */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Badge
                      className={
                        subject.level === "A-Level"
                          ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
                          : "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20"
                      }
                    >
                      {subject.level}
                    </Badge>
                    <Badge variant="outline" className="text-[11px]">
                      {subject.category}
                    </Badge>
                  </div>
                  <span className="text-xs font-mono font-bold text-muted-foreground">{subject.code}</span>
                </div>

                {/* Subject Title */}
                <div>
                  <h3 className="text-base font-bold text-foreground group-hover:text-primary transition">
                    {subject.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-primary" /> {subject.paperCount} Exam Papers
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-muted-foreground" /> {subject.totalQuestions} Questions
                    </span>
                  </p>
                </div>
              </div>

              {/* Progress & Action Button */}
              <div className="pt-4 mt-4 border-t border-border space-y-3">
                
                {/* Completion Indicator */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Progress
                  </span>
                  <span className="font-bold text-foreground">
                    {subject.completedPapers} / {subject.paperCount} Completed
                  </span>
                </div>

                {/* 📍 REDIRECT BUTTON: "Exam Papers" */}
                <Link href={`/student/exams/${subject.id}`} className="block">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs h-10 gap-1.5 shadow-xs">
                    Exam Papers <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>

              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty Search Results */
        <div className="bg-card border border-border rounded-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">No subjects found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            No mock exam subjects matched your current search or filter criteria. Try adjusting your filters.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedCategory("All");
              setSearchQuery("");
            }}
            className="text-xs mt-2"
          >
            Clear All Filters
          </Button>
        </div>
      )}

    </div>
  );
}