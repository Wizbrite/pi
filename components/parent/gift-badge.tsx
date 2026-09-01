"use client";

import { Lock, Unlock, Gift, ExternalLink } from "lucide-react";

interface GiftBadgeProps {
  emoji?: string;
  title: string;
  description?: string;
  couponCode?: string;
  externalLink?: string;
  isUnlocked: boolean;
  size?: "sm" | "md" | "lg";
}

export function GiftBadge({
  emoji = "🎁",
  title,
  description,
  couponCode,
  externalLink,
  isUnlocked,
  size = "md",
}: GiftBadgeProps) {
  const sizeClasses = {
    sm: { wrapper: "p-3", emoji: "text-xl", title: "text-xs", desc: "text-[10px]" },
    md: { wrapper: "p-4", emoji: "text-3xl", title: "text-sm", desc: "text-xs" },
    lg: { wrapper: "p-5", emoji: "text-4xl", title: "text-base", desc: "text-sm" },
  };
  const sz = sizeClasses[size];

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ${
        isUnlocked
          ? "border-amber-300/60 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10 shadow-md shadow-amber-500/10"
          : "border-border bg-muted/40 opacity-75"
      } ${sz.wrapper}`}
    >
      {/* Lock/Unlock badge */}
      <div
        className={`absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full ${
          isUnlocked
            ? "bg-amber-500 text-white shadow-sm"
            : "bg-muted-foreground/20 text-muted-foreground"
        }`}
      >
        {isUnlocked ? (
          <Unlock className="h-3 w-3" />
        ) : (
          <Lock className="h-3 w-3" />
        )}
      </div>

      <div className="flex items-start gap-3">
        {/* Emoji / Gift icon */}
        <div
          className={`flex items-center justify-center rounded-xl ${
            isUnlocked ? "bg-amber-100 dark:bg-amber-500/20" : "bg-muted"
          } p-2`}
        >
          {isUnlocked ? (
            <span className={sz.emoji}>{emoji}</span>
          ) : (
            <Gift className={`${size === "sm" ? "h-5 w-5" : "h-7 w-7"} text-muted-foreground`} />
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1 pr-6">
          <p
            className={`font-bold ${sz.title} ${
              isUnlocked ? "text-amber-700 dark:text-amber-400" : "text-muted-foreground"
            }`}
          >
            {isUnlocked ? title : "Locked Gift 🔒"}
          </p>
          {isUnlocked && description && (
            <p className={`mt-0.5 ${sz.desc} text-muted-foreground`}>
              {description}
            </p>
          )}
          {isUnlocked && couponCode && (
            <div className="mt-2 flex items-center gap-2">
              <code className="rounded-lg border border-amber-300/50 bg-amber-100 px-2 py-1 text-xs font-bold tracking-widest text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">
                {couponCode}
              </code>
            </div>
          )}
          {isUnlocked && externalLink && (
            <a
              href={externalLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              Claim Gift <ExternalLink className="h-3 w-3" />
            </a>
          )}
          {!isUnlocked && (
            <p className={`mt-0.5 ${sz.desc} text-muted-foreground`}>
              Complete the milestone to unlock this reward
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
