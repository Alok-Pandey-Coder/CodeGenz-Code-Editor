"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LoadingStep } from "@/modules/playground/components/loader";
import { PlaygroundEditor } from "@/modules/playground/components/playground-editor";
import { TemplateFileTree } from "@/modules/playground/components/playground-explorer";
import ToggleAI from "@/modules/playground/components/toggle-ai";
import { useAISuggestions } from "@/modules/playground/hooks/useAISuggestion";
import { useFileExplorer } from "@/modules/playground/hooks/useFileExplorer";
import { usePlayground } from "@/modules/playground/hooks/usePlayground";
import { findFilePath } from "@/modules/playground/lib";
import { TemplateFile, TemplateFolder } from "@/modules/playground/lib/path-to-json";
import WebConatinerPreview from "@/modules/webcontainers/components/webcontainer-preview";
import { useWebContainer } from "@/modules/webcontainers/hooks/useWebcontainer";
import { AlertCircle, Bot, FileText, FolderOpen, Save, Settings, X } from "lucide-react";
import { useParams } from "next/navigation";
import { writeFileSync } from "node:fs";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { AIChatSidePanel } from "@/modules/ai-chat/components/ai-chat-sidebarpanel";
import { getEditorLanguage } from "@/modules/playground/lib/editor-config";
import { toast } from "sonner";

const MainPlaygroundPage = () => {
  const { id } = useParams<{ id: string }>();
  const [isPreviewVisible, setIsPreviewVisible] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { playgroundData, isLoading, templateData, error, saveTemplateData } =
    usePlayground(id);

  const aiSuggestions = useAISuggestions();


  const {
    activeFileId,
    closeAllFiles,
    openFile,
    openFiles,
    setTemplateData,
    setActiveFileId,
    setPlagroundId,
    setOpenFiles,
    closeFile,
    handleAddFile,
    handleAddFolder,
    handleDeleteFile,
    handleDeleteFolder,
    handleRenameFile,
    handleRenameFolder,
    updateFileContent

  } = useFileExplorer();

  const {serverUrl, isLoading:containerLoading, error:containerError, writeFileSync, instance} = 
  //@ts-ignore
  useWebContainer({templateData})

  const lastSyncedContent = useRef<Map<string, string>>(new Map());
  const activeFile = openFiles.find((file) => file.id === activeFileId);
  const hasUnsavedChanges = openFiles.some((file) => file.hasUnsavedChanges);


  useEffect(() => {
    setPlagroundId(id);
  }, [id, setPlagroundId]);

  useEffect(() => {
    if (templateData && !openFiles.length) {
      setTemplateData(templateData);
    }
  }, [templateData, setTemplateData, openFiles.length]);

  // Debounced Autosave / Sync changes instantly to WebContainer filesystem for hot reload
  useEffect(() => {
    if (!activeFileId || !activeFile) return;

    const currentContent = activeFile.content;
    const lastSynced = lastSyncedContent.current.get(activeFile.id);

    if (currentContent === lastSynced) return;

    const timer = setTimeout(async () => {
      try {
        const latestTemplateData = useFileExplorer.getState().templateData;
        if (!latestTemplateData) return;

        const filePath = findFilePath(activeFile, latestTemplateData);
        if (!filePath) return;

        // Write directly to WebContainer filesystem to trigger instant dev server compilation and browser hot reload!
        if (instance && instance.fs) {
          await instance.fs.writeFile(filePath, currentContent);
        }

        // Update synced content map to prevent redundant saves
        lastSyncedContent.current.set(activeFile.id, currentContent);

        // Update database context in background
        const updatedTemplateData = JSON.parse(JSON.stringify(latestTemplateData));
        const updateFile = (items: any[]): any[] =>
          items.map((item) => {
            if ("folderName" in item) {
              return { ...item, items: updateFile(item.items) };
            } else if (
              item.filename === activeFile.filename &&
              item.fileExtension === activeFile.fileExtension
            ) {
              return { ...item, content: currentContent };
            }
            return item;
          });
        updatedTemplateData.items = updateFile(updatedTemplateData.items);

        // Save data to database
        await saveTemplateData(updatedTemplateData);
        setTemplateData(updatedTemplateData);

        // Mark file changes as successfully saved
        const updatedOpenFiles = openFiles.map((f) =>
          f.id === activeFileId
            ? {
                ...f,
                content: currentContent,
                originalContent: currentContent,
                hasUnsavedChanges: false,
              }
            : f
        );
        setOpenFiles(updatedOpenFiles);
      } catch (err) {
        console.error("Autosave error:", err);
      }
    }, 850); // 850ms debounce after last keystroke

    return () => clearTimeout(timer);
  }, [activeFileId, activeFile?.content, instance, openFiles, saveTemplateData, setTemplateData, setOpenFiles]);

  const wrappedHandleAddFile = useCallback(
    (newFile: TemplateFile, parentPath: string) => {
      return handleAddFile(
        newFile,
        parentPath,
        writeFileSync!,
        instance,
        saveTemplateData
      );
    },
    [handleAddFile, writeFileSync, instance, saveTemplateData]
  );

  const wrappedHandleAddFolder = useCallback(
    (newFolder: TemplateFolder, parentPath: string) => {
      return handleAddFolder(newFolder, parentPath, instance, saveTemplateData);
    },
    [handleAddFolder, instance, saveTemplateData]
  );

  const wrappedHandleDeleteFile = useCallback(
    (file: TemplateFile, parentPath: string) => {
      return handleDeleteFile(file, parentPath, saveTemplateData);
    },
    [handleDeleteFile, saveTemplateData]
  );

  const wrappedHandleDeleteFolder = useCallback(
    (folder: TemplateFolder, parentPath: string) => {
      return handleDeleteFolder(folder, parentPath, saveTemplateData);
    },
    [handleDeleteFolder, saveTemplateData]
  );

  const wrappedHandleRenameFile = useCallback(
    (
      file: TemplateFile,
      newFilename: string,
      newExtension: string,
      parentPath: string
    ) => {
      return handleRenameFile(
        file,
        newFilename,
        newExtension,
        parentPath,
        saveTemplateData
      );
    },
    [handleRenameFile, saveTemplateData]
  );

  const wrappedHandleRenameFolder = useCallback(
    (folder: TemplateFolder, newFolderName: string, parentPath: string) => {
      return handleRenameFolder(
        folder,
        newFolderName,
        parentPath,
        saveTemplateData
      );
    },
    [handleRenameFolder, saveTemplateData]
  );



  const handleFileSelect = (file: TemplateFile) => {
    openFile(file);
  };

  const handleSave = useCallback(
    async (fileId?: string) => {
      const targetFileId = fileId || activeFileId;
      if (!targetFileId) return;

      const fileToSave = openFiles.find((f) => f.id === targetFileId);
      if (!fileToSave) return;

      const latestTemplateData = useFileExplorer.getState().templateData;
      if (!latestTemplateData) return;

      try {
        const filePath = findFilePath(fileToSave, latestTemplateData);
        if (!filePath) {
          toast.error(
            `Could not find path for file: ${fileToSave.filename}.${fileToSave.fileExtension}`
          );
          return;
        }

        // Update file content in template data (clone for immutability)
        const updatedTemplateData = JSON.parse(
          JSON.stringify(latestTemplateData)
        );
        //@ts-ignore
        const updateFileContent = (items: any[]) =>
          //@ts-ignore
          items.map((item) => {
            if ("folderName" in item) {
              return { ...item, items: updateFileContent(item.items) };
            } else if (
              item.filename === fileToSave.filename &&
              item.fileExtension === fileToSave.fileExtension
            ) {
              return { ...item, content: fileToSave.content };
            }
            return item;
          });
        updatedTemplateData.items = updateFileContent(
          updatedTemplateData.items
        );

        // Sync with WebContainer
        if (writeFileSync) {
          await writeFileSync(filePath, fileToSave.content);
          lastSyncedContent.current.set(fileToSave.id, fileToSave.content);
          if (instance && instance.fs) {
            await instance.fs.writeFile(filePath, fileToSave.content);
          }
        }

        // Use saveTemplateData to persist changes
        const newTemplateData = await saveTemplateData(updatedTemplateData);
        setTemplateData(newTemplateData! || updatedTemplateData);

        // Update open files
        const updatedOpenFiles = openFiles.map((f) =>
          f.id === targetFileId
            ? {
                ...f,
                content: fileToSave.content,
                originalContent: fileToSave.content,
                hasUnsavedChanges: false,
              }
            : f
        );
        setOpenFiles(updatedOpenFiles);

        toast.success(
          `Saved ${fileToSave.filename}.${fileToSave.fileExtension}`
        );
      } catch (error) {
        console.error("Error saving file:", error);
        toast.error(
          `Failed to save ${fileToSave.filename}.${fileToSave.fileExtension}`
        );
        throw error;
      }
    },
    [
      activeFileId,
      openFiles,
      writeFileSync,
      instance,
      saveTemplateData,
      setTemplateData,
      setOpenFiles,
    ]
  );

  const handleSaveAll = async () => {
    const unsavedFiles = openFiles.filter((f) => f.hasUnsavedChanges);

    if (unsavedFiles.length === 0) {
      toast.info("No unsaved changes");
      return;
    }

    try {
      await Promise.all(unsavedFiles.map((f) => handleSave(f.id)));
      toast.success(`Saved ${unsavedFiles.length} file(s)`);
    } catch (error) {
      toast.error("Failed to save some files");
    }
  };

  // Add event to save file by click ctrl + s
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave]);

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] p-4">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-red-600 mb-2">
          Something went wrong
        </h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()} variant="destructive">
          Try Again
        </Button>
      </div>
    );
  }


  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] p-4">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-red-600 mb-2">
          Something went wrong
        </h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()} variant="destructive">
          Try Again
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] p-4">
        <div className="w-full max-w-md p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-6 text-center">
            Loading Playground
          </h2>
          <div className="mb-8">
            <LoadingStep
              currentStep={1}
              step={1}
              label="Loading playground data"
            />
            <LoadingStep
              currentStep={2}
              step={2}
              label="Setting up environment"
            />
            <LoadingStep currentStep={3} step={3} label="Ready to code" />
          </div>
        </div>
      </div>
    );
  }

  if (!templateData) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] p-4">
        <FolderOpen className="h-12 w-12 text-amber-500 mb-4" />
        <h2 className="text-xl font-semibold text-amber-600 mb-2">
          No template data available
        </h2>
        <Button onClick={() => window.location.reload()} variant="outline">
          Reload Template
        </Button>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <>
        <TemplateFileTree
          data={templateData!}
          onFileSelect={handleFileSelect}
          selectedFile={activeFile}
          title="File Explorer"
          onAddFile={wrappedHandleAddFile}
          onAddFolder={wrappedHandleAddFolder}
          onDeleteFile={wrappedHandleDeleteFile}
          onDeleteFolder={wrappedHandleDeleteFolder}
          onRenameFile={wrappedHandleRenameFile}
          onRenameFolder={wrappedHandleRenameFolder}
        />
        <SidebarInset className="bg-zinc-50 dark:bg-zinc-950 relative overflow-hidden flex flex-col h-full">
          {/* Ambient background glow matching hero section */}
          <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-purple-500/5 dark:bg-purple-500/[0.02] blur-3xl pointer-events-none z-0" />
          <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] rounded-full bg-cyan-500/5 dark:bg-cyan-500/[0.015] blur-3xl pointer-events-none z-0" />

          <header className="flex h-16 shrink-0 items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-950/20 backdrop-blur-md px-6 z-10 select-none shadow-sm relative">
            <SidebarTrigger className="-ml-1 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200" />
            <Separator orientation="vertical" className="mr-2 h-4 bg-zinc-200 dark:bg-zinc-800" />
            <div className="flex flex-1 items-center gap-2">
              <div className="flex flex-col flex-1">
                <h1 className="text-sm font-bold bg-gradient-to-r from-zinc-800 via-zinc-900 to-zinc-700 dark:from-zinc-100 dark:via-zinc-200 dark:to-zinc-300 bg-clip-text text-transparent">
                  {playgroundData?.title || "Code Playground"}
                </h1>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {openFiles.length} File(s) Open
                  {hasUnsavedChanges && (
                    <span className="flex items-center gap-1 text-amber-500 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      Unsaved changes
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSave()}
                      disabled={!activeFile || !activeFile.hasUnsavedChanges}
                      className="rounded-lg border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/55 hover:bg-white/80 dark:hover:bg-zinc-800/80 transition-all shadow-sm"
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Save (Ctrl+S)</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleSaveAll}
                      disabled={!hasUnsavedChanges}
                      className="rounded-lg border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/55 hover:bg-white/80 dark:hover:bg-zinc-800/80 transition-all shadow-sm"
                    >
                      <Save className="h-4 w-4" /> All
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Save All (Ctrl+Shift+S)</TooltipContent>
                </Tooltip>
 
                <ToggleAI
                  isEnabled={aiSuggestions.isEnabled}
                  onToggle={aiSuggestions.toggleEnabled}
                  suggestionLoading={aiSuggestions.isLoading}
                  isChatOpen={isChatOpen}
                  onChatToggle={setIsChatOpen}
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="rounded-lg border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/55 hover:bg-white/80 dark:hover:bg-zinc-800/80 transition-all shadow-sm"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => setIsPreviewVisible(!isPreviewVisible)}
                    >
                      {isPreviewVisible ? "Hide" : "Show"} Preview
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setIsChatOpen(!isChatOpen)}
                    >
                      {isChatOpen ? "Hide" : "Show"} AI Chat Panel
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={closeAllFiles}>
                      Close All Files
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>
          <div className="flex-1 min-h-0 overflow-hidden relative">
            {openFiles.length > 0 ? (
              <div className="h-full flex flex-col min-h-0 overflow-hidden">
                <div className="border-b bg-muted/30">
                  <Tabs
                    value={activeFileId || ""}
                    onValueChange={setActiveFileId}
                  >
                    <div className="flex items-center justify-between px-4 py-2">
                      <TabsList className="h-8 bg-transparent p-0">
                        {openFiles.map((file) => (
                          <TabsTrigger
                            key={file.id}
                            value={file.id}
                            className="relative h-8 px-3 data-[state=active]:bg-background data-[state=active]:shadow-sm group"
                          >
                            <div className="flex items-center gap-2">
                              <FileText className="h-3 w-3" />
                              <span>
                                {file.filename}.{file.fileExtension}
                              </span>
                              {file.hasUnsavedChanges && (
                                <span className="h-2 w-2 rounded-full bg-orange-500" />
                              )}
                              <span
                                className="ml-2 h-4 w-4 hover:bg-destructive hover:text-destructive-foreground rounded-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  closeFile(file.id);
                                }}
                              >
                                <X className="h-3 w-3" />
                              </span>
                            </div>
                          </TabsTrigger>
                        ))}
                      </TabsList>

                      {openFiles.length > 1 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={closeAllFiles}
                          className="h-6 px-2 text-xs"
                        >
                          Close All
                        </Button>
                      )}
                    </div>
                  </Tabs>
                </div>  
                <div className="flex-1 min-h-0 flex flex-col relative overflow-hidden">
                  <ResizablePanelGroup /*direction="horizontal"*/className="h-full">
                    <ResizablePanel defaultSize={(isChatOpen || isPreviewVisible) ? 50 : 100}>
                      <PlaygroundEditor activeFile={activeFile} content={activeFile?.content || ""}
                      onContentChange={(value) => 
                        activeFileId && updateFileContent(activeFileId, value)
                      }
                      suggestion={aiSuggestions.suggestion}
                      suggestionLoading={aiSuggestions.isLoading}
                      suggestionPosition={aiSuggestions.position}
                      onAcceptSuggestion={(editor, monaco) => aiSuggestions.acceptSuggestion(editor, monaco)}
                      onRejectSuggestion={(editor) => aiSuggestions.rejectSuggestion(editor)}
                      onTriggerSuggestion={(type, editor) => aiSuggestions.fetchSuggestion(type, editor)}
                      />
                    </ResizablePanel>
                    {
                      (isChatOpen || isPreviewVisible) && (
                        <>
                          <ResizableHandle/>
                          <ResizablePanel defaultSize={50}>
                            {isChatOpen ? (
                              <div className="h-full border-l border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-950/20 backdrop-blur-md flex flex-col overflow-hidden relative">
                                <AIChatSidePanel
                                  isOpen={isChatOpen}
                                  onClose={() => setIsChatOpen(false)}
                                  inline={true}
                                  activeFileName={activeFile ? `${activeFile.filename}.${activeFile.fileExtension}` : undefined}
                                  activeFileContent={activeFile?.content}
                                  activeFileLanguage={activeFile ? getEditorLanguage(activeFile.fileExtension || "") : undefined}
                                  onInsertCode={(code) => {
                                    if (activeFileId) {
                                      updateFileContent(activeFileId, code);
                                    }
                                  }}
                                />
                              </div>
                            ) : (
                              <WebConatinerPreview
                                templateData={templateData}
                                instance={instance}
                                writeFileSync={writeFileSync}
                                isLoading={containerLoading}
                                error={containerError}
                                serverUrl={serverUrl || ""}
                                forceResetup={false}
                              />
                            )}
                          </ResizablePanel>
                        </>
                      )
                    }
                  </ResizablePanelGroup>
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full items-center justify-center text-muted-foreground gap-4">
                <FileText className="h-16 w-16 text-gray-300" />
                <div className="text-center">
                  <p className="text-lg font-medium">No files open</p>
                  <p className="text-sm text-gray-500">
                    Select a file from the sidebar to start editing
                  </p>
                </div>
              </div>
            )}
          </div>
        </SidebarInset>
      </>
    </TooltipProvider>
  );
};

export default MainPlaygroundPage;
