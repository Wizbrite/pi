"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, RefreshCw } from "lucide-react";

interface Message {
  id: string;
  sender: "ai" | "user";
  text: string;
  timestamp: string;
}

export default function AITutorPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "ai",
      text: "Hello! I am your AI GCE Study Assistant. Ask me anything about your subjects, past questions, or difficult concepts!",
      timestamp: "10:00 AM",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // Simulated API response - swap with your actual OpenRouter endpoint call
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: "That is a great question regarding your GCE preparation! Let's break down this concept step-by-step...",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-5xl mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-[#131834] border border-slate-200/80 dark:border-white/10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-violet-600/10 text-violet-600 dark:text-violet-400">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#0a0d1d] dark:text-white flex items-center gap-2">
              AI Study Assistant
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-violet-600/10 text-violet-600 dark:text-violet-400">
                GCE Tutor
              </span>
            </h1>
            
          </div>
        </div>
        <button
          onClick={() => setMessages([messages[0]])}
          className="p-2 rounded-lg text-slate-500 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
          title="Clear Chat"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 rounded-xl bg-white dark:bg-[#131834] border border-slate-200/80 dark:border-white/10 shadow-sm">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.sender === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                msg.sender === "user"
                  ? "bg-violet-600 text-white"
                  : "bg-slate-200 dark:bg-[#181e3d] text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-white/10"
              }`}
            >
              {msg.sender === "user" ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4 text-violet-500" />}
            </div>

            <div
              className={`max-w-[80%] sm:max-w-[70%] p-3.5 rounded-2xl text-sm leading-relaxed ${
                msg.sender === "user"
                  ? "bg-violet-600 text-white rounded-tr-none"
                  : "bg-[#f4f6fc] dark:bg-[#0a0d1d] text-[#0a0d1d] dark:text-slate-200 border border-slate-200/80 dark:border-white/10 rounded-tl-none"
              }`}
            >
              <p>{msg.text}</p>
              <span
                className={`block text-[10px] mt-1.5 text-right ${
                  msg.sender === "user" ? "text-violet-200" : "text-slate-400"
                }`}
              >
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 p-2">
            <Sparkles className="w-4 h-4 animate-spin text-violet-500" />
            <span>AI Tutor is thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about your GCE topics..."
          className="flex-1 px-4 py-3 rounded-xl bg-white dark:bg-[#131834] border border-slate-200/80 dark:border-white/10 text-[#0a0d1d] dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-600/50 text-sm"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-violet-600/20"
        >
          <span>Send</span>
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}