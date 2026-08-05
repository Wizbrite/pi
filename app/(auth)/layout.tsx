import { Logo } from "@/components/shared/logo";

export const metadata = {
  title: "Authentication",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50/80 via-sky-50/40 to-slate-50 px-4 py-12">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-0 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-blue-400/10 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] translate-y-1/2 rounded-full bg-indigo-400/10 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo size="lg" />
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xl">
          {children}
        </div>
        <p className="mt-6 text-center text-xs text-slate-500 font-medium">
          &copy; {new Date().getFullYear()} Pi Learning. All rights reserved.
        </p>
      </div>
    </div>
  );
}
