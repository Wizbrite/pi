"use client";

import Link from "next/link";
// import { GraduationCap } from "lucide-react";
import Image from "next/image";
// import pi from "@/public/pi.png"

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
        className={`relative flex items-center justify-center rounded-xl  ${sizeMap[size]}  transition-all duration-300 group-hover:scale-105`}
      >
        <Image src="/pi.png" alt="logo" width={70} height={50}/>
        {/* <GraduationCap className="h-[55%] w-[55%] text-white" strokeWidth={2.2} /> */}
        <div className="absolute inset-0 rounded-xl " />
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
