"use client";

import Link from "next/link";
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
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const features = [
  {
    icon: BookOpen,
    title: "GCE Past Questions",
    description:
      "Access thousands of past O Level and A Level questions organised by subject, topic, and year.",
    iconBg: "bg-blue-50 text-blue-600",
  },
  {
    icon: Brain,
    title: "AI Tutor",
    description:
      "Get instant, personalised explanations from our AI tutor that adapts to your learning style.",
    iconBg: "bg-indigo-50 text-indigo-600",
  },
  {
    icon: BarChart3,
    title: "Smart Analytics",
    description:
      "Track your progress with detailed analytics and know exactly which topics need more revision.",
    iconBg: "bg-sky-50 text-sky-600",
  },
  {
    icon: GraduationCap,
    title: "Mock Exams",
    description:
      "Simulate real GCE exams with timed mock tests and get AI-powered performance reports.",
    iconBg: "bg-cyan-50 text-cyan-600",
  },
  {
    icon: Users,
    title: "Teacher & Parent Portals",
    description:
      "Teachers can create questions and track students. Parents can monitor progress remotely.",
    iconBg: "bg-blue-50 text-blue-700",
  },
  {
    icon: Sparkles,
    title: "Adaptive Learning",
    description:
      "Our AI identifies your weak areas and creates a personalised study plan just for you.",
    iconBg: "bg-indigo-50 text-indigo-700",
  },
];

const stats = [
  { value: "10K+", label: "Past Questions" },
  { value: "15+", label: "GCE Subjects" },
  { value: "AI", label: "Powered Tutoring" },
  { value: "24/7", label: "Study Access" },
];

const testimonials = [
  {
    name: "Ngwa Blessing",
    role: "A Level Student, Bamenda",
    quote:
      "Pi helped me understand Further Mathematics concepts I had struggled with for months. The AI explanations are clear and patient.",
    stars: 5,
  },
  {
    name: "Mr. Tabi Emmanuel",
    role: "Physics Teacher, Douala",
    quote:
      "The teacher portal makes it easy to create custom questions and see exactly where my students need help.",
    stars: 5,
  },
  {
    name: "Mrs. Fouda Marie",
    role: "Parent, Yaoundé",
    quote:
      "I can finally track my daughter's study progress from my phone. The weekly reports give me peace of mind.",
    stars: 5,
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/60 via-sky-50/20 to-white">
        {/* Soft background ambient glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-blue-400/10 blur-[130px]" />
          <div className="absolute right-10 top-1/3 h-[400px] w-[400px] rounded-full bg-sky-300/15 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-20 sm:px-6 sm:pt-28 lg:px-8 lg:pt-36">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-4 py-1.5 text-sm font-medium text-blue-700 shadow-xs">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span>AI-Powered Learning for Cameroon GCE</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Ace your{" "}
              <span className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 bg-clip-text text-transparent">
                GCE exams
              </span>{" "}
              with the power of AI
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-slate-600 sm:text-xl">
              Practice with real past questions, get instant AI tutoring, and
              track your progress — built specifically for Cameroon O Level and
              A Level students.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/register"
                className="group inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-700 hover:shadow-blue-500/35 hover:-translate-y-0.5"
              >
                Start Learning Free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-8 py-3.5 text-base font-semibold text-slate-700 shadow-xs transition-all hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900"
              >
                See Features
              </a>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="mx-auto mt-20 grid max-w-3xl grid-cols-2 gap-6 sm:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-blue-100/80 bg-white p-6 text-center shadow-xs"
              >
                <div className="text-3xl font-extrabold text-blue-600">
                  {stat.value}
                </div>
                <div className="mt-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative bg-slate-50/60 py-24 border-y border-slate-200/70">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Why students choose Pi?
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Everything you need to study smarter, tailored directly to the Cameroon GCE curriculum.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group rounded-2xl border border-slate-200/80 bg-white p-7 shadow-xs transition-all duration-300 hover:border-blue-300 hover:shadow-md hover:-translate-y-1"
                >
                  <div
                    className={`inline-flex rounded-xl p-3.5 ${feature.iconBg} shadow-xs`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-xl font-bold text-slate-900">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="relative py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Built specifically for{" "}
                <span className="text-blue-600">Cameroon GCE Students</span>
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-slate-600">
                We understand the challenges GCE students face — limited past question access, crowded classrooms, and difficulty getting targeted explanations. Pi bridges that gap.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  "Aligned with GCE O Level & A Level syllabuses",
                  "Optimised for low-bandwidth connections",
                  "AI tutoring in English and French",
                  "Free tier for all Cameroon students",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-slate-700 font-medium"
                  >
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/80 to-indigo-50/50 p-8 shadow-sm">
              <div className="grid grid-cols-2 gap-6">
                {[
                  { n: "O Level", d: "8 core subjects" },
                  { n: "A Level", d: "12+ subject options" },
                  { n: "AI Tutor", d: "24/7 availability" },
                  { n: "Analytics", d: "Real-time insights" },
                ].map((item) => (
                  <div key={item.n} className="rounded-xl bg-white p-5 text-center shadow-xs border border-slate-100">
                    <div className="text-xl font-bold text-blue-600">
                      {item.n}
                    </div>
                    <div className="mt-1 text-xs text-slate-500 font-medium">
                      {item.d}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="bg-slate-50/70 py-24 border-t border-slate-200/70">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Loved by students & teachers
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Hear from students and educators across Cameroon using Pi.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="rounded-2xl border border-slate-200/80 bg-white p-7 shadow-xs"
              >
                <div className="flex gap-1">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-slate-700 italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-6 border-t border-slate-100 pt-4">
                  <p className="text-sm font-bold text-slate-900">{t.name}</p>
                  <p className="text-xs text-blue-600 font-medium">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 py-20 text-white">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Ready to pass your GCE exams?
          </h2>
          <p className="mt-4 text-lg text-blue-100">
            Join thousands of GCE students already studying smarter with Pi.
          </p>
          <Link
            href="/register"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-10 py-4 text-base font-bold text-blue-700 shadow-xl transition-all hover:bg-blue-50 hover:-translate-y-0.5"
          >
            Create Free Account
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
