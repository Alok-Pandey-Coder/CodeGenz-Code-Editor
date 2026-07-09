"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Terminal as TerminalIcon,
  Code,
  Bot,
  Play,
  ArrowRight,
  Search,
  FileCode,
  Folder,
  Check,
  RotateCcw,
  Send,
  Zap,
  ChevronRight,
  Plus,
  X,
  Layers,
  Settings,
  Activity,
  Maximize2,
  Minimize2,
  Copy,
  CheckCircle2,
  Coffee,
  HelpCircle,
  FolderOpen
} from "lucide-react";

// Types for syntax highlighting
interface CodeToken {
  text: string;
  colorClass: string;
}

interface CodeLine {
  tokens: CodeToken[];
  isGhost?: boolean;
}

interface FileData {
  name: string;
  path: string;
  language: string;
  lines: CodeLine[];
}

export function Hero() {
  // Navigation / active states
  const [activeFile, setActiveFile] = useState<string>("page.tsx");
  const [isVibeMode, setIsVibeMode] = useState<boolean>(false);
  const [isPlayingTour, setIsPlayingTour] = useState<boolean>(false);
  const [tourStep, setTourStep] = useState<number>(0);
  const [isTerminalRunning, setIsTerminalRunning] = useState<boolean>(false);
  const [activeTerminalTab, setActiveTerminalTab] = useState<"terminal" | "output" | "problems">("terminal");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Chat states
  const [chatInput, setChatInput] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "ai"; text: string; codeBlock?: { filename: string; code: string } }>>([
    {
      sender: "ai",
      text: "👋 Welcome to VibeCode! I'm your AI agent. Pick one of the actions below or ask me to modify any part of the project.",
    },
  ]);

  // Terminal state logs
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "Microsoft Windows [Version 10.0.22631]",
    "(c) Microsoft Corporation. All rights reserved.",
    "",
    "D:\\newgen_code_editor> _",
  ]);

  // Track if AI generated code was applied
  const [appliedFiles, setAppliedFiles] = useState<Record<string, boolean>>({});

  // Mock code files database
  const [files, setFiles] = useState<Record<string, FileData>>({
    "page.tsx": {
      name: "page.tsx",
      path: "app/page.tsx",
      language: "typescript",
      lines: [
        [
          { text: "import ", colorClass: "text-pink-500 font-semibold" },
          { text: "{ useState } ", colorClass: "text-zinc-800 dark:text-zinc-100" },
          { text: "from ", colorClass: "text-pink-500 font-semibold" },
          { text: "'react'", colorClass: "text-emerald-500" },
          { text: ";", colorClass: "text-zinc-500" }
        ],
        [
          { text: "import ", colorClass: "text-pink-500 font-semibold" },
          { text: "{ Sparkles, Zap } ", colorClass: "text-zinc-800 dark:text-zinc-100" },
          { text: "from ", colorClass: "text-pink-500 font-semibold" },
          { text: "'lucide-react'", colorClass: "text-emerald-500" },
          { text: ";", colorClass: "text-zinc-500" }
        ],
        [],
        [
          { text: "export default function ", colorClass: "text-pink-500 font-semibold" },
          { text: "VibeApp", colorClass: "text-blue-500 dark:text-blue-400 font-medium" },
          { text: "() {", colorClass: "text-zinc-800 dark:text-zinc-100" }
        ],
        [
          { text: "  const ", colorClass: "text-pink-500 font-semibold" },
          { text: "[status, setStatus] = ", colorClass: "text-zinc-800 dark:text-zinc-100" },
          { text: "useState", colorClass: "text-yellow-600 dark:text-yellow-400" },
          { text: "(", colorClass: "text-zinc-800 dark:text-zinc-100" },
          { text: "'idle'", colorClass: "text-emerald-500" },
          { text: ");", colorClass: "text-zinc-500" }
        ],
        [],
        [
          { text: "  return (", colorClass: "text-pink-500 font-semibold" }
        ],
        [
          { text: "    <", colorClass: "text-zinc-500" },
          { text: "div ", colorClass: "text-sky-500" },
          { text: "className=", colorClass: "text-purple-500" },
          { text: "\"p-8 border border-zinc-800 rounded-2xl bg-zinc-950\"", colorClass: "text-emerald-500" },
          { text: ">", colorClass: "text-zinc-500" }
        ],
        [
          { text: "      <", colorClass: "text-zinc-500" },
          { text: "h1 ", colorClass: "text-sky-500" },
          { text: "className=", colorClass: "text-purple-500" },
          { text: "\"text-2xl font-bold\"", colorClass: "text-emerald-500" },
          { text: ">", colorClass: "text-zinc-500" },
          { text: "Vibe Sandbox", colorClass: "text-zinc-800 dark:text-zinc-100" },
          { text: "</", colorClass: "text-zinc-500" },
          { text: "h1", colorClass: "text-sky-500" },
          { text: ">", colorClass: "text-zinc-500" }
        ],
        [
          { text: "      <", colorClass: "text-zinc-500" },
          { text: "p", colorClass: "text-sky-500" },
          { text: ">", colorClass: "text-zinc-500" },
          { text: "Status: {status}", colorClass: "text-zinc-800 dark:text-zinc-100" },
          { text: "</", colorClass: "text-zinc-500" },
          { text: "p", colorClass: "text-sky-500" },
          { text: ">", colorClass: "text-zinc-500" }
        ],
        [
          { text: "    </", colorClass: "text-zinc-500" },
          { text: "div", colorClass: "text-sky-500" },
          { text: ">", colorClass: "text-zinc-500" }
        ],
        [
          { text: "  );", colorClass: "text-pink-500 font-semibold" }
        ],
        [
          { text: "}", colorClass: "text-zinc-800 dark:text-zinc-100" }
        ]
      ].map(tokens => ({ tokens }))
    },
    "auth.ts": {
      name: "auth.ts",
      path: "lib/auth.ts",
      language: "typescript",
      lines: [
        [
          { text: "import ", colorClass: "text-pink-500 font-semibold" },
          { text: "NextAuth ", colorClass: "text-zinc-800 dark:text-zinc-100" },
          { text: "from ", colorClass: "text-pink-500 font-semibold" },
          { text: "'next-auth'", colorClass: "text-emerald-500" },
          { text: ";", colorClass: "text-zinc-500" }
        ],
        [
          { text: "import ", colorClass: "text-pink-500 font-semibold" },
          { text: "CredentialsProvider ", colorClass: "text-zinc-800 dark:text-zinc-100" },
          { text: "from ", colorClass: "text-pink-500 font-semibold" },
          { text: "'next-auth/providers/credentials'", colorClass: "text-emerald-500" },
          { text: ";", colorClass: "text-zinc-500" }
        ],
        [],
        [
          { text: "export const ", colorClass: "text-pink-500 font-semibold" },
          { text: "{ auth, signIn, signOut, handlers } = ", colorClass: "text-zinc-800 dark:text-zinc-100" },
          { text: "NextAuth", colorClass: "text-blue-500 dark:text-blue-400 font-medium" },
          { text: "({", colorClass: "text-zinc-800 dark:text-zinc-100" }
        ],
        [
          { text: "  providers: [", colorClass: "text-zinc-800 dark:text-zinc-100" }
        ],
        [
          { text: "    CredentialsProvider({", colorClass: "text-zinc-800 dark:text-zinc-100" }
        ],
        [
          { text: "      name: ", colorClass: "text-zinc-800 dark:text-zinc-100" },
          { text: "'Vibe Account'", colorClass: "text-emerald-500" },
          { text: ",", colorClass: "text-zinc-500" }
        ],
        [
          { text: "      credentials: {", colorClass: "text-zinc-800 dark:text-zinc-100" }
        ],
        [
          { text: "        email: { label: ", colorClass: "text-zinc-800 dark:text-zinc-100" },
          { text: "'Email'", colorClass: "text-emerald-500" },
          { text: ", type: ", colorClass: "text-zinc-800 dark:text-zinc-100" },
          { text: "'text'", colorClass: "text-emerald-500" },
          { text: " },", colorClass: "text-zinc-500" }
        ],
        [
          { text: "        password: { label: ", colorClass: "text-zinc-800 dark:text-zinc-100" },
          { text: "'Password'", colorClass: "text-emerald-500" },
          { text: ", type: ", colorClass: "text-zinc-800 dark:text-zinc-100" },
          { text: "'password'", colorClass: "text-emerald-500" },
          { text: " }", colorClass: "text-zinc-850 dark:text-zinc-100" }
        ],
        [
          { text: "      },", colorClass: "text-zinc-500" }
        ],
        [
          { text: "      async authorize(credentials) {", colorClass: "text-pink-500 font-semibold" }
        ],
        [
          { text: "        // Mock verification logic", colorClass: "text-zinc-400 dark:text-zinc-500 italic" }
        ],
        [
          { text: "        return { id: '1', name: 'Vibe User', email: 'vibe@vibecode.com' };", colorClass: "text-zinc-800 dark:text-zinc-100" }
        ],
        [
          { text: "      }", colorClass: "text-pink-500 font-semibold" }
        ],
        [
          { text: "    })", colorClass: "text-zinc-800 dark:text-zinc-100" }
        ],
        [
          { text: "  ],", colorClass: "text-zinc-800 dark:text-zinc-100" }
        ],
        [
          { text: "});", colorClass: "text-zinc-500" }
        ]
      ].map(tokens => ({ tokens }))
    },
    "route.ts": {
      name: "route.ts",
      path: "app/api/auth/route.ts",
      language: "typescript",
      lines: [
        [
          { text: "import ", colorClass: "text-pink-500 font-semibold" },
          { text: "{ NextResponse } ", colorClass: "text-zinc-800 dark:text-zinc-100" },
          { text: "from ", colorClass: "text-pink-500 font-semibold" },
          { text: "'next/server'", colorClass: "text-emerald-500" },
          { text: ";", colorClass: "text-zinc-500" }
        ],
        [],
        [
          { text: "export async function ", colorClass: "text-pink-500 font-semibold" },
          { text: "GET", colorClass: "text-blue-500 dark:text-blue-400 font-medium" },
          { text: "() {", colorClass: "text-zinc-800 dark:text-zinc-100" }
        ],
        [
          { text: "  return NextResponse.json({ authenticated: false, vibeLevel: 'maximum' });", colorClass: "text-zinc-800 dark:text-zinc-100" }
        ],
        [
          { text: "}", colorClass: "text-zinc-800 dark:text-zinc-100" }
        ]
      ].map(tokens => ({ tokens }))
    },
    "globals.css": {
      name: "globals.css",
      path: "app/globals.css",
      language: "css",
      lines: [
        [
          { text: "@import ", colorClass: "text-pink-500 font-semibold" },
          { text: "\"tailwindcss\";", colorClass: "text-emerald-500" }
        ],
        [],
        [
          { text: ":root {", colorClass: "text-purple-500" }
        ],
        [
          { text: "  --background: #09090b;", colorClass: "text-zinc-800 dark:text-zinc-100" }
        ],
        [
          { text: "  --foreground: #fafafa;", colorClass: "text-zinc-800 dark:text-zinc-100" }
        ],
        [
          { text: "  --vibe-glow: radial-gradient(circle, #a855f7 0%, #3b82f6 100%);", colorClass: "text-zinc-800 dark:text-zinc-100" }
        ],
        [
          { text: "}", colorClass: "text-purple-500" }
        ],
        [],
        [
          { text: ".vibe-glow-active {", colorClass: "text-blue-500" }
        ],
        [
          { text: "  animation: pulse-glow 2s infinite alternate;", colorClass: "text-zinc-850 dark:text-zinc-100" }
        ],
        [
          { text: "}", colorClass: "text-blue-500" }
        ]
      ].map(tokens => ({ tokens }))
    }
  });

  const chatScrollRef = useRef<HTMLDivElement>(null);
  const editorScrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat and editor to bottom on state updates
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, isTyping]);

  // Suggested Prompts
  const suggestedPrompts = [
    { label: "✨ Implement JWT Route", prompt: "Implement a JWT authorization route in route.ts" },
    { label: "⚡ Activate Vibe Glow", prompt: "Add custom neon vibe-glow utility to page.tsx" },
    { label: "🧪 Generate Unit Tests", prompt: "Write complete unit tests for the auth modules" }
  ];

  // Handler for custom user inputs or click suggestions
  const handlePromptSubmit = (promptText: string) => {
    if (!promptText.trim() || isTyping) return;

    // 1. Add user message
    setChatMessages((prev) => [...prev, { sender: "user", text: promptText }]);
    setChatInput("");
    setIsTyping(true);

    // Simulated responses based on keyword match
    setTimeout(() => {
      let aiResponseText = "";
      let codeToApply = "";
      let targetFile = "route.ts";

      if (promptText.toLowerCase().includes("jwt") || promptText.toLowerCase().includes("auth")) {
        targetFile = "route.ts";
        aiResponseText = "🔒 I have generated a JSON Web Token verification endpoint in `/app/api/auth/route.ts`. It includes signature checking, cookie extraction, and verification. Ready to apply?";
        codeToApply = `import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "vibe_secret_key";

export async function POST(req: Request) {
  try {
    const { token } = await req.json();
    if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });
    
    const decoded = jwt.verify(token, SECRET);
    return NextResponse.json({ verified: true, user: decoded });
  } catch (err) {
    return NextResponse.json({ verified: false, error: "Invalid signatures" }, { status: 401 });
  }
}`;
      } else if (promptText.toLowerCase().includes("glow") || promptText.toLowerCase().includes("vibe")) {
        targetFile = "page.tsx";
        aiResponseText = "🚀 Let's spice up the main page.tsx with dynamic vibe effects! Here is the upgraded component incorporating state-driven glowing animations and real-time vibe metering.";
        codeToApply = `import { useState, useEffect } from "react";
import { Sparkles, Zap } from "lucide-react";

export default function VibeApp() {
  const [status, setStatus] = useState("VIBING");
  const [vibeIndex, setVibeIndex] = useState(100);

  useEffect(() => {
    const interval = setInterval(() => {
      setVibeIndex(prev => Math.min(100, Math.max(80, prev + Math.floor(Math.random() * 7) - 3)));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 border border-purple-500/50 rounded-2xl bg-zinc-950 shadow-[0_0_50px_rgba(168,85,247,0.15)] animate-pulse">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-400" />
          Vibecode System
        </h1>
        <span className="text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded-full">
          ⚡ {vibeIndex}%
        </span>
      </div>
      <p className="mt-4 text-zinc-400">System status: <span className="text-purple-400 font-bold">{status}</span></p>
    </div>
  );
}`;
      } else {
        // generic response
        targetFile = "globals.css";
        aiResponseText = "🎨 Let's modify globals.css to declare custom keyframes for the pulsing glowing elements. I've designed custom gradient animations:";
        codeToApply = `@import "tailwindcss";

@layer utilities {
  .vibe-pulse {
    animation: vibePulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
}

@keyframes vibePulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
    filter: drop-shadow(0 0 15px rgba(168, 85, 247, 0.6));
  }
  50% {
    opacity: .8;
    transform: scale(1.02);
    filter: drop-shadow(0 0 35px rgba(59, 130, 246, 0.8));
  }
}`;
      }

      setChatMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: aiResponseText,
          codeBlock: { filename: targetFile, code: codeToApply },
        },
      ]);
      setIsTyping(false);
    }, 1500);
  };

  // Click on code block inside chat to apply changes to the editor
  const applyCodeChange = (filename: string, codeStr: string) => {
    setActiveFile(filename);
    setAppliedFiles((prev) => ({ ...prev, [filename]: true }));

    // Convert code string into tokenized structure for editor
    const codeLines = codeStr.split("\n").map((lineText) => {
      // Simple custom highlighter for visual demo
      const tokens: CodeToken[] = [];
      const words = lineText.split(/(\s+|\(|\)|\{|\}|;|,|\.|"|'|<|>)/);

      words.forEach((word) => {
        if (!word) return;
        let colorClass = "text-zinc-800 dark:text-zinc-100";

        if (/^(import|export|default|function|const|let|var|return|async|await|try|catch|from|if|else|typeof)$/.test(word)) {
          colorClass = "text-pink-500 font-semibold";
        } else if (/^(NextResponse|NextAuth|CredentialsProvider|jwt|useState|useEffect|setInterval|clearInterval|Math)$/.test(word)) {
          colorClass = "text-yellow-600 dark:text-yellow-400 font-medium";
        } else if (/^(".*"|'.*'|`.*`)$/.test(word)) {
          colorClass = "text-emerald-500";
        } else if (/^(\/\/.*)$/.test(word)) {
          colorClass = "text-zinc-400 dark:text-zinc-500 italic";
        } else if (/^[A-Z][a-zA-Z0-9]*$/.test(word)) {
          colorClass = "text-blue-500 dark:text-blue-400";
        } else if (/^[0-9]+$/.test(word)) {
          colorClass = "text-amber-500";
        } else if (/^[{}[\]().,;]$/.test(word)) {
          colorClass = "text-zinc-500";
        }

        tokens.push({ text: word, colorClass });
      });

      return { tokens };
    });

    // Animate typing into file
    setFiles((prev) => {
      const current = prev[filename];
      if (!current) return prev;
      return {
        ...prev,
        [filename]: {
          ...current,
          lines: codeLines,
        },
      };
    });

    // Trigger run sequence automatically
    triggerTerminalBuild(filename);
  };

  // Run terminal build logs simulation
  const triggerTerminalBuild = (filename: string) => {
    setIsTerminalRunning(true);
    setActiveTerminalTab("terminal");
    setTerminalLogs((prev) => [
      ...prev,
      "",
      `$ npm run build --file=${filename}`,
      `[vibe-compiler] analyzing ${filename}...`,
    ]);

    setTimeout(() => {
      setTerminalLogs((prev) => [
        ...prev,
        `[vibe-compiler] parsing TypeScript AST modules...`,
        `[vibe-compiler] verified schema imports & types.`,
      ]);
    }, 800);

    setTimeout(() => {
      setTerminalLogs((prev) => [
        ...prev,
        `[vibe-compiler] compiled successfully in 284ms!`,
        `[vibe-server] reloading dev server...`,
        `[vibe-server] ✔ dev server hot-swapped online at: http://localhost:3000`,
        "",
        "D:\\newgen_code_editor> _",
      ]);
      setIsTerminalRunning(false);
    }, 1800);
  };

  // Interactive Tour / Demo Sequence
  const startDemoTour = () => {
    setIsPlayingTour(true);
    setTourStep(1);
  };

  useEffect(() => {
    if (!isPlayingTour) return;

    if (tourStep === 1) {
      // Step 1: Prompt AI
      setTimeout(() => {
        handlePromptSubmit("Implement a JWT authorization route in route.ts");
        setTourStep(2);
      }, 1000);
    } else if (tourStep === 2) {
      // Wait for AI response, then trigger apply
      const checkInterval = setInterval(() => {
        const lastMsg = chatMessages[chatMessages.length - 1];
        if (lastMsg && lastMsg.sender === "ai" && lastMsg.codeBlock) {
          clearInterval(checkInterval);
          setTimeout(() => {
            applyCodeChange(lastMsg.codeBlock!.filename, lastMsg.codeBlock!.code);
            setTourStep(3);
          }, 1500);
        }
      }, 500);
      return () => clearInterval(checkInterval);
    } else if (tourStep === 3) {
      // Wait for terminal run to finish
      const checkInterval = setInterval(() => {
        if (!isTerminalRunning) {
          clearInterval(checkInterval);
          setTimeout(() => {
            setIsVibeMode(true);
            setTourStep(4);
          }, 1000);
        }
      }, 500);
      return () => clearInterval(checkInterval);
    } else if (tourStep === 4) {
      // Finish Tour
      setTimeout(() => {
        setIsPlayingTour(false);
        setTourStep(0);
      }, 2500);
    }
  }, [isPlayingTour, tourStep, chatMessages, isTerminalRunning]);

  return (
    <section className="relative overflow-hidden pt-28 pb-20 md:pt-36 md:pb-28 flex flex-col items-center justify-center w-full z-10">
      
      {/* Dynamic Glow Blobs Behind Content */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] rounded-full bg-violet-500/10 dark:bg-violet-600/10 blur-[80px] sm:blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-1/3 right-1/4 translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[450px] h-[300px] sm:h-[450px] rounded-full bg-cyan-400/10 dark:bg-cyan-500/10 blur-[80px] sm:blur-[120px] pointer-events-none z-0" />
      {isVibeMode && (
        <div className="absolute inset-0 bg-radial-gradient from-fuchsia-500/5 via-transparent to-transparent pointer-events-none animate-pulse duration-[4000ms] z-0" />
      )}

      {/* Main Content Area */}
      <div className="relative z-10 flex flex-col items-center max-w-7xl mx-auto px-4 text-center">
        
        {/* Banner Announcement Badge */}
        <div 
          onClick={() => setIsVibeMode(!isVibeMode)}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-full border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md text-zinc-800 dark:text-zinc-200 shadow-sm mb-6 hover:border-purple-500 dark:hover:border-purple-400 hover:shadow-purple-500/10 hover:shadow-lg transition-all duration-300 cursor-pointer"
        >
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
          </span>
          <span className="text-zinc-500 dark:text-zinc-400 font-normal">Introducing VibeCode v2.0 &bull;</span>
          <span className="flex items-center gap-1 font-semibold text-purple-600 dark:text-purple-400">
            {isVibeMode ? "Disable Neon Mode" : "Activate Neon Vibe Mode"} <Zap className="w-3 h-3 fill-current" />
          </span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight text-center max-w-5xl leading-[1.08] mb-6">
          Vibe Code With{" "}
          <span className={`relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 dark:from-violet-400 dark:via-indigo-400 dark:to-cyan-300 transition-all duration-500 ${
            isVibeMode ? "drop-shadow-[0_0_25px_rgba(168,85,247,0.45)] dark:drop-shadow-[0_0_25px_rgba(168,85,247,0.35)]" : ""
          }`}>
            Pure Intelligence
            {isVibeMode && (
              <span className="absolute bottom-1 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500 blur-[2px] animate-pulse" />
            )}
          </span>
        </h1>

        {/* Hero Description */}
        <p className="text-base sm:text-lg md:text-xl text-center text-zinc-600 dark:text-zinc-400 max-w-3xl px-4 mb-8 leading-relaxed">
          The first AI-first browser IDE that thinks, writes, and runs code side-by-side. 
          Prompt to generate whole modules, autocomplete instantly with predictive code, and test real-time compilation, all inside a browser container.
        </p>

        {/* CTAs Group */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full px-4 mb-14">
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold shadow-[0_4px_20px_rgba(99,102,241,0.25)] dark:shadow-[0_4px_20px_rgba(99,102,241,0.15)] hover:shadow-indigo-500/40 rounded-xl px-8 h-12 flex items-center justify-center gap-2 group transition-all duration-300">
              Start Vibing Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="lg" 
            onClick={startDemoTour}
            disabled={isPlayingTour}
            className="w-full sm:w-auto border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl px-8 h-12 flex items-center justify-center gap-2 text-zinc-700 dark:text-zinc-300 font-semibold"
          >
            <Play className={`w-4 h-4 ${isPlayingTour ? "animate-spin text-purple-500" : "fill-current text-zinc-600 dark:text-zinc-400"}`} />
            {isPlayingTour ? `Simulating Tour (Step ${tourStep}/4)...` : "Interactive Tour Demo"}
          </Button>
        </div>

        {/* Interactive IDE Mockup Container */}
        <div className="w-full max-w-[1240px] px-2 sm:px-4 relative group">
          
          {/* Subtle Ambient Behind Editor */}
          <div className={`absolute -inset-1 rounded-[24px] bg-gradient-to-r from-violet-600/30 to-cyan-500/30 opacity-40 blur-lg transition-all duration-700 group-hover:opacity-65 ${isVibeMode ? "from-pink-500/50 via-purple-600/50 to-cyan-500/50 opacity-80 blur-xl" : ""}`} />

          {/* IDE Window */}
          <div className={`relative w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-900 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col transition-all duration-500 ${isVibeMode ? "border-purple-500/40 shadow-[0_0_50px_rgba(168,85,247,0.1)]" : ""}`}>
            
            {/* Header / Title Bar */}
            <div className="h-12 border-b border-zinc-800 bg-zinc-950/80 px-4 flex items-center justify-between select-none">
              
              {/* Traffic Light Dots */}
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80 border border-rose-600" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80 border border-amber-600" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80 border border-emerald-600" />
                <span className="ml-4 text-xs font-semibold text-zinc-500 flex items-center gap-1.5 font-mono">
                  <FolderOpen className="w-3.5 h-3.5" />
                  newgen_code_editor
                </span>
              </div>

              {/* IDE Tabs */}
              <div className="hidden md:flex items-center bg-zinc-900/60 rounded-lg p-0.5 border border-zinc-800/80 max-w-sm">
                {Object.keys(files).map((fileName) => (
                  <button
                    key={fileName}
                    onClick={() => setActiveFile(fileName)}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
                      activeFile === fileName
                        ? "bg-zinc-850 dark:bg-zinc-800 text-zinc-200 shadow-sm border border-zinc-700/50"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    <FileCode className={`w-3.5 h-3.5 ${
                      fileName.endsWith(".ts") 
                        ? "text-blue-400" 
                        : fileName.endsWith(".css") 
                        ? "text-teal-400" 
                        : "text-purple-400"
                    }`} />
                    {fileName}
                    {appliedFiles[fileName] && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    )}
                  </button>
                ))}
              </div>

              {/* Action Buttons (Run, Clear, Vibe Switch) */}
              <div className="flex items-center gap-2">
                
                {/* Vibe Mode Switch */}
                <button
                  onClick={() => setIsVibeMode(!isVibeMode)}
                  className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border transition-all duration-300 ${
                    isVibeMode
                      ? "bg-purple-500/20 border-purple-500/40 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                      : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <Zap className={`w-3.5 h-3.5 ${isVibeMode ? "fill-current text-purple-400" : ""}`} />
                  {isVibeMode ? "Vibing" : "Vibe Mode"}
                </button>

                {/* Run Button */}
                <button
                  onClick={() => triggerTerminalBuild(activeFile)}
                  disabled={isTerminalRunning}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-bold shadow-sm transition-all ${
                    isTerminalRunning
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 cursor-not-allowed animate-pulse"
                      : "bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-700 hover:shadow-emerald-500/10 hover:shadow-md cursor-pointer"
                  }`}
                >
                  <Play className={`w-3.5 h-3.5 fill-current ${isTerminalRunning ? "animate-spin" : ""}`} />
                  Run
                </button>

              </div>
            </div>

            {/* IDE Body */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-12 min-h-[480px] md:min-h-[580px]">
              
              {/* Column 1: Sidebar File Explorer (3 cols) */}
              <div className="md:col-span-2 border-r border-zinc-800 bg-zinc-950/70 p-3 select-none flex flex-col justify-between hidden md:flex">
                <div className="space-y-4">
                  
                  {/* EXPLORER heading */}
                  <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500 tracking-wider uppercase px-2">
                    <span>Explorer</span>
                    <Plus className="w-3.5 h-3.5 hover:text-zinc-300 cursor-pointer" />
                  </div>

                  {/* File List */}
                  <div className="space-y-0.5">
                    {/* Project Folder */}
                    <div className="flex items-center gap-1.5 px-2 py-1 text-xs font-semibold text-zinc-400">
                      <Folder className="w-3.5 h-3.5 text-zinc-500 fill-zinc-500/20" />
                      <span>workspace</span>
                    </div>

                    {/* Sub Files */}
                    {Object.values(files).map((file) => {
                      const isActive = activeFile === file.name;
                      return (
                        <div
                          key={file.name}
                          onClick={() => setActiveFile(file.name)}
                          className={`flex items-center justify-between px-4 py-1.5 rounded-md text-xs cursor-pointer transition-colors ${
                            isActive
                              ? "bg-zinc-850 text-zinc-100 font-medium"
                              : "text-zinc-500 hover:bg-zinc-900/40 hover:text-zinc-300"
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <FileCode className={`w-3.5 h-3.5 shrink-0 ${
                              file.name.endsWith(".ts") 
                                ? "text-blue-400" 
                                : file.name.endsWith(".css") 
                                ? "text-teal-400" 
                                : "text-purple-400"
                            }`} />
                            <span className="truncate">{file.name}</span>
                          </div>
                          {appliedFiles[file.name] && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                </div>

                {/* Small Sidebar Footer */}
                <div className="pt-3 border-t border-zinc-900 space-y-2">
                  <div className="flex items-center justify-between text-xs text-zinc-500 px-2">
                    <span className="flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                      AI engine online
                    </span>
                    <Settings className="w-3.5 h-3.5 hover:text-zinc-300 cursor-pointer" />
                  </div>
                </div>
              </div>

              {/* Column 2: Code Editor (6 cols) */}
              {(() => {
                const activeFileData = files[activeFile] || files["page.tsx"];
                return (
                  <div className="md:col-span-6 bg-zinc-950 flex flex-col justify-between border-r border-zinc-800">
                    
                    {/* Editor Content Area */}
                    <div 
                      ref={editorScrollRef}
                      className="flex-1 p-4 font-mono text-xs overflow-y-auto leading-relaxed select-text select-all"
                    >
                      <div className="flex flex-col space-y-0.5">
                        {activeFileData.lines.map((line, idx) => (
                          <div 
                            key={idx} 
                            className={`flex group hover:bg-zinc-900/40 py-0.5 px-1 rounded-sm ${
                              line.isGhost ? "opacity-50 italic" : ""
                            }`}
                          >
                            {/* Line number spacer */}
                            <span className="w-8 select-none text-zinc-600 text-right pr-3 font-semibold">
                              {idx + 1}
                            </span>
                            
                            {/* Render highlight tokens */}
                            <div className="flex-1 whitespace-pre-wrap">
                              {line.tokens.length === 0 ? (
                                <span className="text-zinc-600 dark:text-zinc-500">&#8203;</span>
                              ) : (
                                line.tokens.map((token, tokIdx) => (
                                  <span 
                                    key={tokIdx} 
                                    className={`${token.colorClass} transition-colors`}
                                  >
                                    {token.text}
                                  </span>
                                ))
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Floating Autocomplete / Ghost suggest bubble (Simulated) */}
                    {activeFile === "page.tsx" && !appliedFiles["page.tsx"] && (
                      <div className="mx-4 mb-3 p-2.5 rounded-lg border border-purple-500/30 bg-purple-500/5 backdrop-blur-sm flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[11px] text-purple-400 font-semibold font-mono">
                          <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                          AI suggests: Add status monitoring handlers
                        </div>
                        <button
                          onClick={() => handlePromptSubmit("Activate Vibe Glow")}
                          className="text-[10px] bg-purple-600 hover:bg-purple-500 text-white font-bold px-2 py-1 rounded cursor-pointer"
                        >
                          Tab Accept
                        </button>
                      </div>
                    )}

                    {/* Editor Footer / Info panel */}
                    <div className="h-8 border-t border-zinc-800/80 bg-zinc-900/40 px-4 flex items-center justify-between text-[10px] text-zinc-500 font-medium select-none">
                      <span className="flex items-center gap-1">
                        <Code className="w-3 h-3" />
                        UTF-8 &bull; {activeFileData.language}
                      </span>
                      <span>
                        Ln {activeFileData.lines.length}, Col 1
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Column 3: AI Assistant Sidebar (4 cols) */}
              <div className="md:col-span-4 bg-zinc-950/90 flex flex-col justify-between">
                
                {/* Chat Panel Header */}
                <div className="h-10 border-b border-zinc-800 bg-zinc-900/30 px-3 flex items-center gap-1.5 select-none">
                  <Bot className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold text-zinc-300">VibeCoder Agent</span>
                  <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-1.5 py-0.5 rounded-md ml-auto">
                    Gemini 1.5 Pro
                  </span>
                </div>

                {/* Conversation Box */}
                <div 
                  ref={chatScrollRef}
                  className="flex-1 p-3 overflow-y-auto space-y-3.5 max-h-[300px] md:max-h-[380px]"
                >
                  {chatMessages.map((msg, index) => {
                    const isAi = msg.sender === "ai";
                    return (
                      <div
                        key={index}
                        className={`flex flex-col ${
                          isAi ? "items-start" : "items-end"
                        }`}
                      >
                        {/* Text Message */}
                        <div
                          className={`p-2.5 rounded-xl text-xs max-w-[85%] leading-relaxed ${
                            isAi
                              ? "bg-zinc-900 text-zinc-300 rounded-tl-none border border-zinc-800"
                              : "bg-violet-600 text-white rounded-tr-none"
                          }`}
                        >
                          {msg.text}
                        </div>

                        {/* Custom applied Codeblock within message */}
                        {isAi && msg.codeBlock && (
                          <div className="w-full mt-2.5 rounded-lg border border-zinc-800 bg-zinc-950 overflow-hidden text-left shadow-md">
                            <div className="px-2.5 py-1.5 border-b border-zinc-800 bg-zinc-900/60 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                              <span>{msg.codeBlock.filename}</span>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(msg.codeBlock!.code);
                                  setCopiedIndex(index);
                                  setTimeout(() => setCopiedIndex(null), 2000);
                                }}
                                className="hover:text-zinc-200 flex items-center gap-1 cursor-pointer"
                              >
                                {copiedIndex === index ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                                {copiedIndex === index ? "Copied" : "Copy"}
                              </button>
                            </div>
                            <pre className="p-3 text-[10px] font-mono text-zinc-300 overflow-x-auto max-h-[140px] leading-tight">
                              <code>{msg.codeBlock.code}</code>
                            </pre>
                            <button
                              onClick={() => applyCodeChange(msg.codeBlock!.filename, msg.codeBlock!.code)}
                              className="w-full border-t border-zinc-800 hover:bg-purple-950/20 text-purple-400 hover:text-purple-300 font-bold py-2 text-[11px] flex items-center justify-center gap-1 cursor-pointer transition-colors"
                            >
                              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                              Apply to {msg.codeBlock.filename}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* AI typing state indicator */}
                  {isTyping && (
                    <div className="flex items-center gap-1.5 text-zinc-500 text-xs pl-2 font-semibold">
                      <Bot className="w-4 h-4 text-purple-400 animate-spin" />
                      VibeCoder is coding...
                    </div>
                  )}
                </div>

                {/* Suggestions / Prompt Chips */}
                <div className="p-3 border-t border-zinc-900 space-y-2 select-none">
                  
                  {/* Suggestion list */}
                  <div className="flex flex-wrap gap-1.5">
                    {suggestedPrompts.map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={() => handlePromptSubmit(chip.prompt)}
                        disabled={isTyping}
                        className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-purple-500/50 rounded-full px-2.5 py-1 cursor-pointer transition-colors disabled:opacity-50 disabled:pointer-events-none"
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>

                  {/* Chat Input Bar */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handlePromptSubmit(chatInput);
                    }}
                    className="flex gap-1.5"
                  >
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask AI to write code..."
                      disabled={isTyping}
                      className="flex-1 bg-zinc-900 border border-zinc-850 rounded-lg px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={isTyping || !chatInput.trim()}
                      className="bg-purple-600 hover:bg-purple-500 text-white font-bold p-1.5 rounded-lg cursor-pointer transition-colors disabled:opacity-50 disabled:bg-zinc-800 disabled:text-zinc-500"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>

              </div>

            </div>

            {/* Column 4: Bottom Panel / Terminal (Integrated Console) */}
            <div className="h-40 border-t border-zinc-850 bg-zinc-950 flex flex-col justify-between">
              
              {/* Terminal tabs header */}
              <div className="h-8 border-b border-zinc-900 px-4 flex items-center justify-between text-[10px] font-semibold text-zinc-500 select-none">
                <div className="flex gap-3.5">
                  <button
                    onClick={() => setActiveTerminalTab("terminal")}
                    className={`pb-2 border-b-2 transition-colors ${
                      activeTerminalTab === "terminal"
                        ? "text-zinc-200 border-purple-500"
                        : "border-transparent hover:text-zinc-300"
                    }`}
                  >
                    Terminal
                  </button>
                  <button
                    onClick={() => setActiveTerminalTab("output")}
                    className={`pb-2 border-b-2 transition-colors ${
                      activeTerminalTab === "output"
                        ? "text-zinc-200 border-purple-500"
                        : "border-transparent hover:text-zinc-300"
                    }`}
                  >
                    Output
                  </button>
                  <button
                    onClick={() => setActiveTerminalTab("problems")}
                    className={`pb-2 border-b-2 transition-colors ${
                      activeTerminalTab === "problems"
                        ? "text-zinc-200 border-purple-500"
                        : "border-transparent hover:text-zinc-300"
                    }`}
                  >
                    Problems (0)
                  </button>
                </div>
                
                {/* Right utility elements */}
                <div className="flex items-center gap-3">
                  <span className="text-zinc-700">|</span>
                  <button
                    onClick={() => setTerminalLogs(["D:\\newgen_code_editor> _"])}
                    className="hover:text-zinc-300 flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Clear Logs
                  </button>
                </div>
              </div>

              {/* Terminal Output Body */}
              <div className="flex-1 p-3 font-mono text-[10px] leading-relaxed overflow-y-auto text-zinc-400 text-left bg-zinc-950/90 select-text">
                {activeTerminalTab === "terminal" ? (
                  <div className="space-y-0.5">
                    {terminalLogs.map((logLine, idx) => (
                      <div key={idx} className={logLine.startsWith("[success]") ? "text-emerald-400" : logLine.startsWith("[info]") ? "text-blue-400" : ""}>
                        {logLine}
                      </div>
                    ))}
                  </div>
                ) : activeTerminalTab === "output" ? (
                  <div className="text-zinc-500">
                    [system] container initialized with Node v20.11.0
                    <br />
                    [system] workspace files listening for file changes...
                  </div>
                ) : (
                  <div className="text-emerald-500 font-semibold flex items-center gap-1.5 mt-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    No problems have been detected in the workspace.
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>

        {/* Feature stats bento grid below IDE */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl w-full mt-20 px-4 select-none">
          
          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md text-left flex flex-col justify-between hover:border-violet-500/40 transition-colors duration-300">
            <div>
              <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400 mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-100">Predictive Intelligence</h3>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                Continuous ghost text suggestions that adapt to your context, coding patterns, and libraries.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-violet-600 dark:text-violet-400">
              Learn about autocomplete <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md text-left flex flex-col justify-between hover:border-indigo-500/40 transition-colors duration-300">
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
                <TerminalIcon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-100">In-Browser Containers</h3>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                Execute nodes, trigger local compiles, and test packages directly inside local WebContainers.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              Explore webcontainers <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md text-left flex flex-col justify-between hover:border-cyan-500/40 transition-colors duration-300">
            <div>
              <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 mb-4">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-100">AI Code Agents</h3>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                Describe features in plain English and let multi-agent workspaces resolve dependencies and generate code.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-cyan-600 dark:text-cyan-400">
              See agent architecture <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

        </div>

        {/* Framework Integrations Section */}
        <div className="mt-20 flex flex-col items-center">
          <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-6">
            Supporting any stack &amp; runtime
          </span>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-45 dark:opacity-30 hover:opacity-60 transition-opacity duration-300">
            <span className="font-bold text-base select-none hover:text-zinc-800 dark:hover:text-zinc-100 transition-colors">React</span>
            <span className="font-bold text-base select-none hover:text-zinc-800 dark:hover:text-zinc-100 transition-colors">Next.js</span>
            <span className="font-bold text-base select-none hover:text-zinc-800 dark:hover:text-zinc-100 transition-colors">TypeScript</span>
            <span className="font-bold text-base select-none hover:text-zinc-800 dark:hover:text-zinc-100 transition-colors">Python</span>
            <span className="font-bold text-base select-none hover:text-zinc-800 dark:hover:text-zinc-100 transition-colors">Node.js</span>
            <span className="font-bold text-base select-none hover:text-zinc-800 dark:hover:text-zinc-100 transition-colors">Rust</span>
          </div>
        </div>

      </div>
    </section>
  );
}
