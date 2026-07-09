"use client";

import React, { useEffect, useState, useRef } from "react";
import type { TemplateFolder } from "@/modules/playground/lib/path-to-json";
import { transformToWebContainerFormat } from "../hooks/tranformer";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import TerminalComponent from "./terminal";
import { WebContainer } from "@webcontainer/api";

interface WebContainerPreviewProps {
  templateData: TemplateFolder;
  serverUrl: string;
  isLoading: boolean;
  error: string | null;
  instance: WebContainer | null;
  writeFileSync: (path: string, content: string) => Promise<void>;
  forceResetup?: boolean; // Optional prop to force re-setup
}

const WebContainerPreview: React.FC<WebContainerPreviewProps> = ({
  templateData,
  error,
  instance,
  isLoading,
  serverUrl,
  writeFileSync,
  forceResetup = false,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [loadingState, setLoadingState] = useState({
    transforming: false,
    mounting: false,
    installing: false,
    starting: false,
    ready: false,
  });
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 4;
  const [setupError, setSetupError] = useState<string | null>(null);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [isSetupInProgress, setIsSetupInProgress] = useState(false);
  
  // Ref to access terminal methods
  const terminalRef = useRef<any>(null);

  // Reset setup state when forceResetup changes
  useEffect(() => {
    if (forceResetup) {
      setIsSetupComplete(false);
      setIsSetupInProgress(false);
      setPreviewUrl("");
      setCurrentStep(0);
      setLoadingState({
        transforming: false,
        mounting: false,
        installing: false,
        starting: false,
        ready: false,
      });
    }
  }, [forceResetup]);

  useEffect(() => {
    async function setupContainer() {
      // Don't run setup if it's already complete or in progress
      if (!instance || isSetupComplete || isSetupInProgress) return;

      try {
        setIsSetupInProgress(true);
        setSetupError(null);
        
        // Check if server is already running by testing if files are already mounted
        try {
          const packageJsonExists = await instance.fs.readFile('package.json', 'utf8');
          if (packageJsonExists) {
            // Files are already mounted, just reconnect to existing server
            if (terminalRef.current?.writeToTerminal) {
              terminalRef.current.writeToTerminal("🔄 Reconnecting to existing WebContainer session...\r\n");
            }
            
            // Check if server is already running
            instance.on("server-ready", (port: number, url: string) => {
              console.log(`Reconnected to server on port ${port} at ${url}`);
              if (terminalRef.current?.writeToTerminal) {
                terminalRef.current.writeToTerminal(`🌐 Reconnected to server at ${url}\r\n`);
              }
              setPreviewUrl(url);
              setLoadingState((prev) => ({
                ...prev,
                starting: false,
                ready: true,
              }));
              setIsSetupComplete(true);
              setIsSetupInProgress(false);
            });
            
            setCurrentStep(4);
            setLoadingState((prev) => ({ ...prev, starting: true }));
            return;
          }
        } catch (e) {
          // Files don't exist, proceed with normal setup
        }
        
        // Step 1: Transform data
        setLoadingState((prev) => ({ ...prev, transforming: true }));
        setCurrentStep(1);
        
        // Write to terminal
        if (terminalRef.current?.writeToTerminal) {
          terminalRef.current.writeToTerminal("🔄 Transforming template data...\r\n");
        }

        // @ts-ignore
        const files = transformToWebContainerFormat(templateData);

        setLoadingState((prev) => ({
          ...prev,
          transforming: false,
          mounting: true,
        }));
        setCurrentStep(2);

        // Step 2: Mount files
        if (terminalRef.current?.writeToTerminal) {
          terminalRef.current.writeToTerminal("📁 Mounting files to WebContainer...\r\n");
        }
        
        await instance.mount(files);
        
        if (terminalRef.current?.writeToTerminal) {
          terminalRef.current.writeToTerminal("✅ Files mounted successfully\r\n");
        }

        setLoadingState((prev) => ({
          ...prev,
          mounting: false,
          installing: true,
        }));
        setCurrentStep(3);

        // Step 3: Install dependencies
        if (terminalRef.current?.writeToTerminal) {
          terminalRef.current.writeToTerminal("📦 Installing dependencies...\r\n");
        }
        
        const installProcess = await instance.spawn("npm", ["install"]);

        // Stream install output to terminal
        installProcess.output.pipeTo(
          new WritableStream({
            write(data) {
              // Write directly to terminal
              if (terminalRef.current?.writeToTerminal) {
                terminalRef.current.writeToTerminal(data);
              }
            },
          })
        );

        const installExitCode = await installProcess.exit;

        if (installExitCode !== 0) {
          throw new Error(`Failed to install dependencies. Exit code: ${installExitCode}`);
        }

        if (terminalRef.current?.writeToTerminal) {
          terminalRef.current.writeToTerminal("✅ Dependencies installed successfully\r\n");
        }

        setLoadingState((prev) => ({
          ...prev,
          installing: false,
          starting: true,
        }));
        setCurrentStep(4);

        // Step 4: Start the server
        let startScript = "start";
        try {
          const pkgFile = files["package.json"];
          if (pkgFile && "file" in pkgFile) {
            const pkgContent = pkgFile.file.contents;
            const pkg = JSON.parse(pkgContent);
            if (pkg.scripts && pkg.scripts.dev) {
              startScript = "dev";
            }
          }
        } catch (e) {
          console.warn("Failed to parse package.json scripts", e);
        }

        if (terminalRef.current?.writeToTerminal) {
          terminalRef.current.writeToTerminal(`🚀 Starting development server (npm run ${startScript})...\r\n`);
        }
        
        const startProcess = await instance.spawn("npm", ["run", startScript]);

        // Listen for server ready event
        instance.on("server-ready", (port: number, url: string) => {
          console.log(`Server ready on port ${port} at ${url}`);
          if (terminalRef.current?.writeToTerminal) {
            terminalRef.current.writeToTerminal(`🌐 Server ready at ${url}\r\n`);
          }
          setPreviewUrl(url);
          setLoadingState((prev) => ({
            ...prev,
            starting: false,
            ready: true,
          }));
          setIsSetupComplete(true);
          setIsSetupInProgress(false);
        });

        // Handle start process output - stream to terminal
        startProcess.output.pipeTo(
          new WritableStream({
            write(data) {
              if (terminalRef.current?.writeToTerminal) {
                terminalRef.current.writeToTerminal(data);
              }
            },
          })
        );

      } catch (err) {
        console.error("Error setting up container:", err);
        const errorMessage = err instanceof Error ? err.message : String(err);
        
        if (terminalRef.current?.writeToTerminal) {
          terminalRef.current.writeToTerminal(`❌ Error: ${errorMessage}\r\n`);
        }
        
        setSetupError(errorMessage);
        setIsSetupInProgress(false);
        setLoadingState({
          transforming: false,
          mounting: false,
          installing: false,
          starting: false,
          ready: false,
        });
      }
    }

    setupContainer();
  }, [instance, templateData, isSetupComplete, isSetupInProgress]);

  // Cleanup function to prevent memory leaks
  useEffect(() => {
    return () => {
      // Don't kill processes or cleanup when component unmounts
      // The WebContainer should persist across component re-mounts
    };
  }, []);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-sm p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/20 backdrop-blur-md shadow-lg relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-purple-500/10 blur-xl pointer-events-none" />
          <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mx-auto shadow-inner border border-zinc-200 dark:border-zinc-850 relative animate-pulse">
            <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-bold bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">Initializing Container</h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Allocating browser execution threads and booting up the node runtime...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || setupError) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 p-6 rounded-2xl border border-rose-100 dark:border-rose-900/30 max-w-md shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <XCircle className="h-5 w-5 text-rose-500" />
            <h3 className="font-bold text-sm">Container Setup Failed</h3>
          </div>
          <p className="text-xs leading-relaxed font-mono bg-rose-500/5 p-3 rounded-lg border border-rose-500/10">{error || setupError}</p>
        </div>
      </div>
    );
  }

  const getStepIcon = (stepIndex: number) => {
    if (stepIndex < currentStep) {
      return <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />;
    } else if (stepIndex === currentStep) {
      return <Loader2 className="h-4 w-4 animate-spin text-purple-500 shrink-0" />;
    } else {
      return <div className="h-4 w-4 rounded-full border border-zinc-200 dark:border-zinc-800 shrink-0" />;
    }
  };

  const getStepText = (stepIndex: number, label: string) => {
    const isActive = stepIndex === currentStep;
    const isComplete = stepIndex < currentStep;
    
    return (
      <span className={`text-xs font-semibold ${
        isComplete ? 'text-emerald-600 dark:text-emerald-400' : 
        isActive ? 'text-purple-600 dark:text-purple-400' : 
        'text-zinc-400 dark:text-zinc-500'
      }`}>
        {label}
      </span>
    );
  };

  return (
    <div className="h-full w-full flex flex-col z-10">
      {!previewUrl ? (
        <div className="h-full flex flex-col p-4 space-y-4">
          <div className="w-full max-w-lg p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/30 backdrop-blur-md shadow-sm mx-auto space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-850 pb-2.5">
              <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 text-purple-500 animate-spin" />
                Container Setup Pipeline
              </h3>
              <span className="text-[9px] font-mono text-zinc-450 dark:text-zinc-500">Step {currentStep} of {totalSteps}</span>
            </div>

            <Progress
              value={(currentStep / totalSteps) * 100}
              className="h-1 bg-zinc-100 dark:bg-zinc-850"
            />

            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5">
                {getStepIcon(1)}
                {getStepText(1, "Transforming workspace template")}
              </div>
              <div className="flex items-center gap-2.5">
                {getStepIcon(2)}
                {getStepText(2, "Mounting files to virtual memory")}
              </div>
              <div className="flex items-center gap-2.5">
                {getStepIcon(3)}
                {getStepText(3, "Installing node dependencies")}
              </div>
              <div className="flex items-center gap-2.5">
                {getStepIcon(4)}
                {getStepText(4, "Starting local dev server")}
              </div>
            </div>
          </div>

          {/* Terminal */}
          <div className="flex-1 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-950 shadow-md overflow-hidden flex flex-col">
            <div className="h-9 border-b border-zinc-900 bg-zinc-950 px-4 flex items-center justify-between text-[9px] font-mono text-zinc-500 select-none">
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Container Build Logs
              </span>
              <span>xterm.js</span>
            </div>
            <div className="flex-1 p-2">
              <TerminalComponent 
                ref={terminalRef}
                webContainerInstance={instance}
                theme="dark"
                className="h-full"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="h-full flex flex-col p-4 space-y-4">
          {/* Preview with Browser Chrome */}
          <div className="flex-1 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-md overflow-hidden flex flex-col">
            
            {/* Browser Header Bar */}
            <div className="h-10 border-b border-zinc-200 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-900/30 px-4 flex items-center gap-3 select-none">
              {/* Traffic light dots */}
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                <div className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                <div className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-700" />
              </div>
              
              {/* Browser Navigation Arrows */}
              <div className="flex items-center gap-2.5 text-zinc-400 dark:text-zinc-500 shrink-0 font-mono text-xs">
                <span className="cursor-pointer hover:text-zinc-600 dark:hover:text-zinc-200">&larr;</span>
                <span className="cursor-pointer hover:text-zinc-600 dark:hover:text-zinc-200">&rarr;</span>
                <span className="cursor-pointer hover:text-zinc-600 dark:hover:text-zinc-200 font-bold">&#8635;</span>
              </div>

              {/* Simulated URL bar */}
              <div className="flex-1 max-w-lg bg-white/70 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-md px-4 py-0.5 text-[10px] font-mono text-zinc-500 dark:text-zinc-400 text-center truncate shadow-inner flex items-center justify-center gap-1">
                <span className="text-emerald-500 font-bold">🔒</span>
                localhost:3000
              </div>
            </div>

            {/* Iframe View */}
            <div className="flex-1 bg-white">
              <iframe
                src={previewUrl}
                className="w-full h-full border-none"
                title="WebContainer Preview"
              />
            </div>

          </div>
          
          {/* Terminal at bottom when preview is ready */}
          <div className="h-60 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-950 shadow-md overflow-hidden flex flex-col">
            <div className="h-9 border-b border-zinc-900 bg-zinc-950 px-4 flex items-center justify-between text-[9px] font-mono text-zinc-500 select-none">
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Terminal Output Stream
              </span>
              <span>xterm.js</span>
            </div>
            <div className="flex-1 p-2">
              <TerminalComponent 
                ref={terminalRef}
                webContainerInstance={instance}
                theme="dark"
                className="h-full"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebContainerPreview;