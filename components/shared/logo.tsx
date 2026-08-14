"use client";

import Link from "next/link";
import { GraduationCap } from "lucide-react";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

const sizeMap = {
  sm: "h-7 w-7",
  md: "h-9 w-9",
  lg: "h-12 w-12",
};

const textSizeMap = {
  sm: "text-xl",
  md: "text-2xl",
  lg: "text-3xl",
};

export function Logo({ className = "", size = "md", showText = true }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center gap-2.5 group ${className}`}>
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 via-violet-500 to-violet-600 ${sizeMap[size]} shadow-md shadow-violet-500/20 transition-all duration-300 group-hover:shadow-violet-500/35 group-hover:scale-105`}
      >
        <GraduationCap className="h-[55%] w-[55%] text-white" strokeWidth={2.2} />
        <div className="absolute inset-0 rounded-xl bg-white/15 opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      {showText && (
        <span
          className={`font-bold tracking-tight ${textSizeMap[size]} bg-gradient-to-r from-violet-600 to-violet-600 bg-clip-text text-transparent`}
        >
          Pi
        </span>
      )}
    </Link>
  );
}

export default Logo;
