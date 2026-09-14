"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  GraduationCap,
  Brain,
  BarChart3,
  BookOpen,
  Users,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Star,
  Play,
  ChevronLeft,
  ChevronRight,
  Zap,
  ShieldCheck,
  Award,
  TrendingUp,
  Clock,
  Target,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

// ─── Typewriter Hook ────────────────────────────────────────────
const phrases = [
  "Pi AI assistance",
  "10,000+ past questions",
  "24/7 AI tutoring",
  "smart exam analytics",
];

function useTypewriter() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    const blinkTimer = setInterval(() => setBlink((b) => !b), 500);
    return () => clearInterval(blinkTimer);
  }, []);

  useEffect(() => {
    const phrase = phrases[phraseIndex];
    let timeout: ReturnType<typeof setTimeout>;

    if (!deleting && charIndex < phrase.length) {
      timeout = setTimeout(() => setCharIndex((c) => c + 1), 60);
    } else if (!deleting && charIndex === phrase.length) {
      timeout = setTimeout(() => setDeleting(true), 2500);
    } else if (deleting && charIndex > 0) {
      timeout = setTimeout(() => setCharIndex((c) => c - 1), 30);
    } else if (deleting && charIndex === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDeleting(false);
      setPhraseIndex((p) => (p + 1) % phrases.length);
    }
    return () => clearTimeout(timeout);
  }, [charIndex, deleting, phraseIndex]);

  return { text: phrases[phraseIndex].slice(0, charIndex), blink };
}

// ─── Data ────────────────────────────────────────────────────────
const heroSlides = [
  { image: "/images/hero_1.jpg", alt: "GCE Students Celebrating" },
  { image: "/images/hero_2.jpg", alt: "Focused Student Studying" },
  { image: "/images/hero_3.jpg", alt: "Teacher Mentoring Students" },
];

const features = [
  {
    icon: BookOpen,
    title: "GCE Past Questions",
    description: "Access 10,000+ past O & A Level questions organised by subject, topic and year — always up to date.",
    color: "from-violet-600 to-violet-500",
    glow: "hover:shadow-violet-500/25",
  },
  {
    icon: Brain,
    title: "AI Tutor",
    description: "Get instant step-by-step explanations from our AI tutor available 24/7, adapting to your unique learning pace.",
    color: "from-indigo-600 to-indigo-500",
    glow: "hover:shadow-indigo-500/25",
  },
  {
    icon: BarChart3,
    title: "Smart Analytics",
    description: "Track your progress with detailed performance dashboards and know exactly which topics need revision.",
    color: "from-purple-600 to-purple-500",
    glow: "hover:shadow-purple-500/25",
  },
  {
    icon: GraduationCap,
    title: "Mock Exams",
    description: "Simulate real GCE exam conditions with timed tests and receive AI-powered post-exam performance reports.",
    color: "from-violet-700 to-indigo-600",
    glow: "hover:shadow-violet-500/25",
  },
  {
    icon: Users,
    title: "Teacher & Parent Portals",
    description: "Dedicated portals for teachers to assign exercises and parents to monitor their child's daily progress.",
    color: "from-indigo-700 to-purple-600",
    glow: "hover:shadow-indigo-500/25",
  },
  {
    icon: Sparkles,
    title: "Adaptive Learning",
    description: "Our AI maps your weak areas and generates a personalised daily study plan to maximise your exam score.",
    color: "from-purple-700 to-violet-600",
    glow: "hover:shadow-purple-500/25",
  },
];

const stats = [
  { value: "10K+", label: "Past Questions", icon: BookOpen },
  { value: "15+", label: "GCE Subjects", icon: GraduationCap },
  { value: "24/7", label: "AI Tutoring", icon: Brain },
  { value: "100%", label: "Curriculum Aligned", icon: CheckCircle2 },
];

const howItWorks = [
  { step: "01", title: "Create your free account", desc: "Sign up in seconds — no credit card needed. Set your GCE level and subjects.", icon: Target },
  { step: "02", title: "Practice past questions", desc: "Access thousands of past O & A Level questions with instant AI marking and explanations.", icon: BookOpen },
  { step: "03", title: "Track & improve", desc: "View your analytics dashboard and follow your personalised study plan to exam success.", icon: TrendingUp },
];

const testimonials = [
  {
    name: "Ngwa Blessing",
    role: "A Level Student, Bamenda",
    quote: "Pi helped me understand Further Mathematics concepts I had struggled with for months. The AI explanations are clear and patient.",
    stars: 5,
    avatar: "NB",
    color: "from-violet-600 to-indigo-600",
  },
  {
    name: "Mr. Tabi Emmanuel",
    role: "Physics Teacher, Douala",
    quote: "The teacher portal makes it easy to create custom questions and see exactly where my students need help.",
    stars: 5,
    avatar: "TE",
    color: "from-indigo-600 to-purple-600",
  },
  {
    name: "Mrs. Fouda Marie",
    role: "Parent, Yaoundé",
    quote: "I can finally track my daughter's study progress from my phone. The weekly reports give me peace of mind.",
    stars: 5,
    avatar: "FM",
    color: "from-purple-600 to-violet-600",
  },
];

// ─── Component ───────────────────────────────────────────────────
export default function LandingPage() {
  const { text: typedText, blink } = useTypewriter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  // 7-second hero background rotation
  useEffect(() => {
    const t = setInterval(() => setCurrentSlide((p) => (p + 1) % heroSlides.length), 7000);
    return () => clearInterval(t);
  }, []);

  // Auto-advance testimonials
  useEffect(() => {
    const t = setInterval(() => setTestimonialIndex((p) => (p + 1) % testimonials.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-[#06071a] text-white selection:bg-violet-500 selection:text-white">
      <Navbar />

      {/* ═══════════════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden min-h-[95vh] flex flex-col justify-center items-center">
        {/* Blurry Background Slideshow */}
        <div className="pointer-events-none absolute inset-0">
          {heroSlides.map((slide, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-all duration-[2000ms] ease-in-out ${
                idx === currentSlide ? "opacity-20 scale-105" : "opacity-0 scale-100"
              }`}
            >
              <Image src={slide.image} alt={slide.alt} fill className="object-cover blur-sm brightness-50" priority={idx === 0} />
            </div>
          ))}

          {/* Vibrant light streak — inspired by reference */}
          <div className="absolute right-0 top-0 h-full w-1/2 overflow-hidden opacity-60">
            <div
              className="absolute right-[-10%] top-[10%] h-[90%] w-[120%] rotate-[-15deg]"
              style={{
                background:
                  "conic-gradient(from 200deg at 80% 50%, transparent 0deg, rgba(139,92,246,0.5) 30deg, rgba(99,102,241,0.7) 60deg, rgba(168,85,247,0.5) 90deg, transparent 120deg)",
                filter: "blur(40px)",
              }}
            />
            <div
              className="absolute right-[-5%] top-[20%] h-[60%] w-[80%] rotate-[-10deg]"
              style={{
                background:
                  "linear-gradient(135deg, transparent 0%, rgba(139,92,246,0.4) 40%, rgba(99,102,241,0.6) 60%, rgba(168,85,247,0.3) 80%, transparent 100%)",
                filter: "blur(25px)",
              }}
            />
          </div>

          {/* Deep glow orbs */}
          <div className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-700/20 blur-[180px]" />
          <div className="absolute left-[10%] top-[20%] h-[400px] w-[400px] rounded-full bg-indigo-700/15 blur-[140px]" />
          <div className="absolute right-[5%] bottom-[10%] h-[300px] w-[300px] rounded-full bg-purple-700/15 blur-[120px]" />

          {/* Subtle grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(139,92,246,1) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,1) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          

          {/* Giant headline */}
          <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl xl:text-8xl leading-[1.1] max-w-4xl">
            The All-in-one
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              GCE Study Platform
            </span>
          </h1>

          {/* Typewriter sub-line */}
          <div className="mt-4 flex items-baseline justify-center gap-2 text-xl sm:text-2xl font-semibold text-slate-300">
            <span>Powered by</span>
            <span className="text-violet-400 font-black min-w-[14ch] text-left">
              {typedText}
              <span className={`inline-block w-0.5 h-[1.2em] bg-violet-400 ml-0.5 align-middle transition-opacity duration-100 ${blink ? "opacity-100" : "opacity-0"}`} />
            </span>
          </div>

          <p className="mt-6 text-base text-slate-400 sm:text-lg leading-relaxed max-w-2xl">
            Practice with real past questions, get instant AI tutoring, track your progress, and connect with teachers & parents — all in one powerful platform built for Cameroon GCE students.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-9 py-4 text-base font-bold text-white overflow-hidden shadow-2xl shadow-violet-600/40 transition-all duration-300 hover:scale-105 hover:shadow-violet-600/60 hover:from-violet-500 hover:to-indigo-500 active:scale-100"
            >
              <span className="relative z-10 flex items-center gap-2.5">
                Get Started Free
                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
              {/* Shimmer overlay */}
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </Link>

            <button>
            <Link
              href="/login"
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-900/60 backdrop-blur-md px-8 py-4 text-base font-semibold text-slate-300 transition-all duration-300 hover:border-violet-500/50 hover:bg-slate-800 hover:text-white hover:scale-105"
            >
              Log in now
            </Link>
            </button>
          </div>

          {/* Slide dots */}
          <div className="mt-10 flex items-center gap-2">
            {heroSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all duration-500 ${idx === currentSlide ? "w-8 bg-violet-400" : "w-2 bg-slate-700 hover:bg-slate-500"}`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Stats strip */}
        {/* <div className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 mt-20">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="group relative rounded-2xl border border-violet-500/15 bg-slate-900/60 backdrop-blur-md p-5 text-center transition-all duration-300 hover:border-violet-500/40 hover:bg-slate-800/80 hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-500/10 overflow-hidden cursor-default"
                >
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-violet-600/5 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  <Icon className="mx-auto h-5 w-5 text-violet-400 mb-2 opacity-70" />
                  <div className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-violet-400 to-indigo-300 bg-clip-text text-transparent">{stat.value}</div>
                  <div className="mt-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div> */}
      </section>

      {/* ═══════════════════════════════════════════════════
          TRUSTED BY / PARTNER LOGOS STRIP
      ═══════════════════════════════════════════════════ */}
      {/* <section className="border-y border-slate-800/60 bg-slate-900/30 py-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-500 mb-8">Designed for Cameroon GCE Students</p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14">
            {[
              { label: "O Level", sub: "8 core subjects" },
              { label: "A Level", sub: "12+ subject options" },
              { label: "AI Tutor", sub: "24/7 availability" },
              { label: "Analytics", sub: "Real-time insights" },
              { label: "Exams", sub: "Timed mock tests" },
            ].map((item) => (
              <div key={item.label} className="group flex flex-col items-center gap-1 opacity-60 transition-opacity duration-200 hover:opacity-100 cursor-default">
                <span className="text-base font-black text-violet-300">{item.label}</span>
                <span className="text-[10px] text-slate-500 font-medium">{item.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* ═══════════════════════════════════════════════════
          FEATURES SECTION
      ═══════════════════════════════════════════════════ */}
      <section id="features" className="py-28 bg-[#06071a]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-950/50 px-4 py-1.5 text-xs font-bold text-violet-300 mb-4">
              Why Choose Pi?
            </div>
            <h2 className="text-3xl font-black text-white sm:text-5xl">
              Everything you need to{" "}
              <span className="bg-gradient-to-r from-violet-400 to-indigo-300 bg-clip-text text-transparent">excel in your GCE</span>
            </h2>
            <p className="mt-4 text-slate-400 text-base sm:text-lg max-w-2xl mx-auto">
              Tailored directly to the Cameroon GCE Board curriculum — O Level & A Level.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className={`group relative rounded-3xl border border-slate-800/80 bg-slate-900/50 p-7 overflow-hidden transition-all duration-300 hover:border-violet-500/40 hover:-translate-y-2 hover:shadow-2xl ${feature.glow} cursor-default`}
                >
                  {/* Hover glow bg */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-5`} />
                  </div>
                  {/* Corner accent */}
                  <div className={`absolute top-0 right-0 h-20 w-20 rounded-bl-3xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-sm`} />

                  <div className={`relative z-10 inline-flex rounded-2xl p-3.5 bg-gradient-to-br ${feature.color} shadow-lg shadow-violet-900/30 mb-5 transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="relative z-10 text-lg font-bold text-white mb-2 group-hover:text-violet-200 transition-colors duration-200">
                    {feature.title}
                  </h3>
                  <p className="relative z-10 text-sm leading-relaxed text-slate-400 group-hover:text-slate-300 transition-colors duration-200">
                    {feature.description}
                  </p>

                  {/* Bottom shine on hover */}
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          HOW IT WORKS
      ═══════════════════════════════════════════════════ */}
      <section id="about" className="py-28 bg-slate-950/60 border-y border-slate-800/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            {/* Left text */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-950/50 px-4 py-1.5 text-xs font-bold text-violet-300 mb-5">
                <Target className="h-3 w-3" /> How It Works
              </div>
              <h2 className="text-3xl font-black text-white sm:text-5xl leading-[1.15]">
                Built specifically for{" "}
                <span className="bg-gradient-to-r from-violet-400 to-indigo-300 bg-clip-text text-transparent">
                  Cameroon GCE Students
                </span>
              </h2>
              <p className="mt-5 text-slate-400 text-base sm:text-lg leading-relaxed">
                We understand the challenges GCE candidates face — limited past question access, crowded classrooms, and difficulty getting targeted explanations. Pi bridges that gap completely.
              </p>

              <div className="mt-10 space-y-6">
                {howItWorks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.step} className="group flex gap-5 items-start cursor-default">
                      <div className="relative shrink-0 flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-500/30 bg-violet-950/50 text-xs font-black text-violet-400 transition-all duration-300 group-hover:border-violet-500/60 group-hover:bg-violet-900/40 group-hover:scale-110">
                        {item.step}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white mb-1 group-hover:text-violet-300 transition-colors duration-200">{item.title}</h4>
                        <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-10">
                <Link
                  href="/register"
                  className="group inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-600/30 transition-all duration-300 hover:scale-105 hover:shadow-violet-600/50 hover:from-violet-500 hover:to-indigo-500 overflow-hidden relative"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Join Pi Today <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                </Link>
              </div>
            </div>

            {/* Right image */}
            <div className="relative">
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-violet-500/20 shadow-2xl shadow-violet-900/40 transition-all duration-300 hover:border-violet-500/40 hover:-translate-y-2 hover:shadow-2xl ${feature.glow} cursor-default">
                <Image
                  src="/images/hero_2.jpg"
                  alt="Focused GCE Student Learning with Pi"
                  fill
                  className="object-cover "
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <span className="rounded-full bg-violet-600/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">Targeted Learning</span>
                  <p className="mt-2 text-sm font-semibold text-slate-200">Step-by-step AI guidance that turns weak subjects into top grades.</p>
                </div>
              </div>

              {/* Floating card */}
              <div className="absolute -bottom-6 -right-6 hidden sm:flex items-center gap-3 rounded-2xl border border-violet-500/20 bg-slate-900/90 backdrop-blur-md p-4 shadow-xl transition-all duration-300 hover:border-violet-500/40 hover:-translate-y-2 hover:shadow-2xl ${feature.glow} cursor-default">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white font-black text-sm shadow-lg shadow-violet-600/30">A*</div>
                <div>
                  <p className="text-xs font-bold text-white">GCE Excellence</p>
                  <p className="text-[10px] text-slate-400">O & A Level Mastery</p>
                </div>
              </div>

              {/* Floating stat */}
              <div className="absolute -top-5 -left-5 hidden sm:flex items-center gap-3 rounded-2xl border border-indigo-500/20 bg-slate-900/90 backdrop-blur-md p-4 shadow-xl transition-all duration-300 hover:border-violet-500/40 hover:-translate-y-2 hover:shadow-2xl ${feature.glow} cursor-default">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg shadow-indigo-600/30">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">+45% Score Boost</p>
                  <p className="text-[10px] text-slate-400">Average improvement</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          TEACHER & PARENT SECTION
      ═══════════════════════════════════════════════════ */}
      <section className="py-28 bg-[#06071a]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            {/* Image */}
            <div className="relative order-2 lg:order-1 transition-all duration-300 hover:border-violet-500/40 hover:-translate-y-2 hover:shadow-2xl ${feature.glow} cursor-default">
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-indigo-500/20 shadow-2xl shadow-indigo-900/30">
                <Image src="/images/hero_3.jpg" alt="Teacher mentoring GCE Students" fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <span className="rounded-full bg-indigo-600/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">Educator Guided</span>
                  <p className="mt-2 text-sm font-semibold text-slate-200">Real classroom-quality support, enhanced with modern AI tools.</p>
                </div>
              </div>
            </div>

            {/* Text */}
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-950/50 px-4 py-1.5 text-xs font-bold text-indigo-300 mb-5">
                <Users className="h-3 w-3" /> Teacher & Parent Connection
              </div>
              <h2 className="text-3xl font-black text-white sm:text-5xl leading-[1.15]">
                Complete{" "}
                <span className="bg-gradient-to-r from-indigo-400 to-purple-300 bg-clip-text text-transparent">
                  Student Growth Ecosystem
                </span>
              </h2>
              <p className="mt-5 text-slate-400 text-base sm:text-lg leading-relaxed">
                Teachers send exercises and corrections directly; parents see real-time progress reports. Everyone stays connected to ensure each student succeeds.
              </p>

              <div className="mt-8 grid sm:grid-cols-2 gap-4">
                {[
                  { icon: Users, title: "Teacher Portal", desc: "Send exercises, mark submissions, and track class performance.", color: "violet" },
                  { icon: ShieldCheck, title: "Parent View", desc: "Monitor study time, exam scores, and milestone progress.", color: "indigo" },
                  { icon: Clock, title: "Real-time Updates", desc: "All progress tracked and synced instantly across all portals.", color: "purple" },
                  { icon: Award, title: "Milestone Rewards", desc: "Students earn achievement badges to stay motivated.", color: "violet" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className={`group rounded-2xl border border-slate-800/80 bg-slate-900/50 p-4 transition-all duration-300 hover:border-${item.color}-500/40 hover:-translate-y-1 hover:shadow-xl hover:shadow-${item.color}-500/10 cursor-default overflow-hidden relative`}
                    >
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-transparent" />
                      </div>
                      <Icon className="relative z-10 h-5 w-5 text-violet-400 mb-2 transition-transform duration-300 group-hover:scale-110" />
                      <h4 className="relative z-10 text-sm font-bold text-white mb-1">{item.title}</h4>
                      <p className="relative z-10 text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          TESTIMONIALS
      ═══════════════════════════════════════════════════ */}
      <section id="testimonials" className="py-28 bg-slate-950/60 border-y border-slate-800/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-950/50 px-4 py-1.5 text-xs font-bold text-violet-300 mb-4">
               Student Reviews
            </div>
            <h2 className="text-3xl font-black text-white sm:text-5xl">
              What students say about{" "}
              <span className="bg-gradient-to-r from-violet-400 to-indigo-300 bg-clip-text text-transparent">Pi</span>
            </h2>
            <p className="mt-4 text-slate-400 text-lg">
              Hear from students, teachers and parents across Cameroon.
            </p>
          </div>

          {/* Testimonial Cards */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t, i) => (
              <div
                key={t.name}
                className={`group relative rounded-3xl border border-slate-800/80 bg-slate-900/50 p-7 transition-all duration-300 hover:border-violet-500/40 hover:-translate-y-2 hover:shadow-2xl hover:shadow-violet-500/10 cursor-default overflow-hidden ${i === testimonialIndex ? "border-violet-500/30 shadow-lg shadow-violet-500/10" : ""}`}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />

                <div className="relative z-10">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.stars }).map((_, si) => (
                      <Star key={si} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-slate-300 italic mb-6">&ldquo;{t.quote}&rdquo;</p>
                  <div className="flex items-center gap-3 border-t border-slate-800 pt-4">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${t.color} text-xs font-black text-white shadow-lg`}>
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{t.name}</p>
                      <p className="text-[11px] text-violet-400 font-medium">{t.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Testimonial dots */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setTestimonialIndex(idx)}
                className={`h-2 rounded-full transition-all duration-500 ${idx === testimonialIndex ? "w-8 bg-violet-500" : "w-2 bg-slate-700 hover:bg-slate-500"}`}
                aria-label={`Testimonial ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          CTA SECTION
      ═══════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-28 bg-[#06071a]">
        {/* Glow orbs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-700/20 blur-[180px]" />
          <div className="absolute left-0 top-0 h-[300px] w-[300px] rounded-full bg-indigo-700/15 blur-[120px]" />
          <div className="absolute right-0 bottom-0 h-[300px] w-[300px] rounded-full bg-purple-700/15 blur-[120px]" />
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: "linear-gradient(rgba(139,92,246,1) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,1) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-950/60 px-4 py-1.5 text-xs font-bold text-violet-300 backdrop-blur-md mb-6">
            <Zap className="h-3 w-3 text-amber-400" /> Start Your Journey Today
          </div>
          <h2 className="text-4xl font-black tracking-tight text-white sm:text-6xl leading-[1.1]">
            Ready to Pass Your
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">GCE Exams?</span>
          </h2>
          <p className="mt-6 text-slate-400 text-base sm:text-lg max-w-2xl mx-auto">
            Join thousands of Cameroon GCE students already studying smarter with Pi. Free to start — no credit card required.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-10 py-4.5 py-4 text-base font-bold text-white shadow-2xl shadow-violet-600/40 overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-violet-600/60 hover:from-violet-500 hover:to-indigo-500 active:scale-100"
            >
              <span className="relative z-10 flex items-center gap-2.5">
                Create Free Account
                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </Link>

            <Link
              href="/login"
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-900/60 backdrop-blur-md px-8 py-4 text-base font-semibold text-slate-300 transition-all duration-300 hover:border-violet-500/50 hover:bg-slate-800 hover:text-white hover:scale-105"
            >
              Already have an account?
            </Link>
          </div>

          {/* Trust icons */}
          {/* <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-xs font-semibold text-slate-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-violet-500" /> GCE Curriculum Aligned
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" /> Optimised for Mobile
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-emerald-500" /> Free Tier Available
            </div>
          </div> */}
        </div>
      </section>

      <Footer />
    </div>
  );
}
