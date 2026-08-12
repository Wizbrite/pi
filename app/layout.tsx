import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Pi — AI-Powered Learning for GCE Students",
    template: "%s | Pi Learning",
  },
  description:
    "The adaptive AI learning platform built for Cameroon GCE Ordinary & Advanced Level students. Practice exams, AI tutoring, and personalised study plans.",
  keywords: [
    "GCE",
    "Cameroon",
    "O Level",
    "A Level",
    "AI tutor",
    "adaptive learning",
    "mock exams",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning={true}>
      <body className="min-h-screen bg-background font-sans antialiased">
       
          {children}
          <Toaster richColors position="top-right" />
        
        
      </body>
    </html>
  );
}
