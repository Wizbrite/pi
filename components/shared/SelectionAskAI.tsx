"use client";

/**
 * SelectionAskAI
 *
 * Wraps any content. When the student highlights text inside the wrapper,
 * a floating "Ask Pi AI" button appears right next to the selection.
 * Clicking it calls `onAsk(selectedText)` with the highlighted excerpt.
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Sparkles } from "lucide-react";

interface PopupState {
  x: number;
  y: number;
  text: string;
}

interface SelectionAskAIProps {
  children: React.ReactNode;
  onAsk: (selectedText: string) => void;
  className?: string;
}

export function SelectionAskAI({ children, onAsk, className }: SelectionAskAIProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [popup, setPopup] = useState<PopupState | null>(null);

  const handleMouseUp = useCallback(() => {
    requestAnimationFrame(() => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) { setPopup(null); return; }
      const text = selection.toString().trim();
      if (text.length < 3) { setPopup(null); return; }
      if (containerRef.current && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        if (!containerRef.current.contains(range.commonAncestorContainer)) { setPopup(null); return; }
        const rect = range.getBoundingClientRect();
        setPopup({ x: rect.left + rect.width / 2, y: rect.bottom + 10, text });
      }
    });
  }, []);

  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (popupRef.current && popupRef.current.contains(e.target as Node)) return;
    setPopup(null);
  }, []);

  const handleSelectionChange = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) setPopup(null);
  }, []);

  useEffect(() => {
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchend", handleMouseUp);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchend", handleMouseUp);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, [handleMouseUp, handleMouseDown, handleSelectionChange]);

  const handleAsk = () => {
    if (!popup) return;
    onAsk(popup.text);
    setPopup(null);
    window.getSelection()?.removeAllRanges();
  };

  return (
    <div ref={containerRef} className={className}>
      {children}

      {popup && (
        <div
          ref={popupRef}
          style={{
            position: "fixed",
            left: Math.max(70, Math.min(popup.x, window.innerWidth - 70)),
            top: popup.y,
            transform: "translateX(-50%)",
            zIndex: 9999,
            pointerEvents: "auto",
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* Caret pointing up toward the selection */}
          <div
            className="absolute -top-1.5 left-1/2 -translate-x-1/2"
            style={{
              width: 0, height: 0,
              borderLeft: "6px solid transparent",
              borderRight: "6px solid transparent",
              borderBottom: "7px solid hsl(var(--primary))",
            }}
          />
          <button
            type="button"
            onClick={handleAsk}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-primary text-primary-foreground shadow-xl border border-primary/30 animate-in fade-in zoom-in-95 duration-150 hover:brightness-110 active:scale-95 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            Ask Pi AI
          </button>
        </div>
      )}
    </div>
  );
}
