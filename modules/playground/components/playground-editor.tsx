"use client"

import { useRef, useEffect, useCallback } from "react"
import Editor, { type Monaco } from "@monaco-editor/react"
import { configureMonaco, defaultEditorOptions, getEditorLanguage } from "@/modules/playground/lib/editor-config"
import type { TemplateFile } from "@/modules/playground/lib/path-to-json"

interface PlaygroundEditorProps {
  activeFile: TemplateFile | undefined
  content: string
  onContentChange: (value: string) => void
  suggestion: string | null
  suggestionLoading: boolean
  suggestionPosition: { line: number; column: number } | null
  onAcceptSuggestion: (editor: any, monaco: any) => void
  onRejectSuggestion: (editor: any) => void
  onTriggerSuggestion: (type: string, editor: any) => void
}

export const PlaygroundEditor = ({
  activeFile,
  content,
  onContentChange,
  suggestion,
  suggestionLoading,
  suggestionPosition,
  onAcceptSuggestion,
  onRejectSuggestion,
  onTriggerSuggestion,
}: PlaygroundEditorProps) => {
  const editorRef = useRef<any>(null)
  const monacoRef = useRef<Monaco | null>(null)
  const inlineCompletionProviderRef = useRef<any>(null)
  const currentSuggestionRef = useRef<{
    text: string
    position: { line: number; column: number }
    id: string
  } | null>(null)
  const isAcceptingSuggestionRef = useRef(false)
  const suggestionAcceptedRef = useRef(false)
  const suggestionTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const tabCommandRef = useRef<any>(null)

  // Generate unique ID for each suggestion
  const generateSuggestionId = () => `suggestion-${Date.now()}-${Math.random()}`

  // Update inline completions ref and trigger editor action
  useEffect(() => {
    console.log("Suggestion changed in prop", {
      hasSuggestion: !!suggestion,
      hasPosition: !!suggestionPosition,
    })

    if (suggestion && suggestionPosition) {
      currentSuggestionRef.current = {
        text: suggestion,
        position: suggestionPosition,
        id: generateSuggestionId(),
      }

      // Trigger inline suggest widget inside Monaco
      if (editorRef.current) {
        setTimeout(() => {
          if (editorRef.current && currentSuggestionRef.current) {
            console.log("Triggering inline suggest display")
            editorRef.current.trigger("ai", "editor.action.inlineSuggest.trigger", null)
          }
        }, 50)
      }
    } else {
      currentSuggestionRef.current = null
      if (editorRef.current) {
        editorRef.current.trigger("ai", "editor.action.inlineSuggest.hide", null)
      }
    }
  }, [suggestion, suggestionPosition])

  const providersRef = useRef<any[]>([])

  const clearCurrentSuggestion = useCallback(() => {
    console.log("Clearing current suggestion")
    currentSuggestionRef.current = null
    suggestionAcceptedRef.current = false
    if (editorRef.current) {
      editorRef.current.trigger("ai", "editor.action.inlineSuggest.hide", null)
    }
  }, [])

  const acceptCurrentSuggestion = useCallback(() => {
    console.log("acceptCurrentSuggestion called", {
      hasEditor: !!editorRef.current,
      hasMonaco: !!monacoRef.current,
      hasSuggestion: !!currentSuggestionRef.current,
      isAccepting: isAcceptingSuggestionRef.current,
      suggestionAccepted: suggestionAcceptedRef.current,
    })

    if (!editorRef.current || !monacoRef.current || !currentSuggestionRef.current) {
      console.log("Cannot accept suggestion - missing refs")
      return false
    }

    if (isAcceptingSuggestionRef.current || suggestionAcceptedRef.current) {
      console.log("BLOCKED: Already accepting/accepted suggestion, skipping")
      return false
    }

    isAcceptingSuggestionRef.current = true
    suggestionAcceptedRef.current = true

    const editor = editorRef.current
    const monaco = monacoRef.current
    const currentSuggestion = currentSuggestionRef.current

    try {
      const cleanSuggestionText = currentSuggestion.text.replace(/\r/g, "")
      console.log("ACCEPTING suggestion:", cleanSuggestionText.substring(0, 50) + "...")

      const currentPosition = editor.getPosition()
      const suggestionPos = currentSuggestion.position

      if (
        currentPosition.lineNumber !== suggestionPos.line ||
        currentPosition.column < suggestionPos.column ||
        currentPosition.column > suggestionPos.column + 5
      ) {
        console.log("Position changed, cannot accept suggestion")
        return false
      }

      const range = new monaco.Range(suggestionPos.line, suggestionPos.column, suggestionPos.line, suggestionPos.column)

      const success = editor.executeEdits("ai-suggestion-accept", [
        {
          range: range,
          text: cleanSuggestionText,
          forceMoveMarkers: true,
        },
      ])

      if (!success) {
        console.error("Failed to execute edit")
        return false
      }

      const lines = cleanSuggestionText.split("\n")
      const endLine = suggestionPos.line + lines.length - 1
      const endColumn =
        lines.length === 1 ? suggestionPos.column + cleanSuggestionText.length : lines[lines.length - 1].length + 1

      editor.setPosition({ lineNumber: endLine, column: endColumn })
      console.log("SUCCESS: Suggestion accepted, new position:", `${endLine}:${endColumn}`)

      clearCurrentSuggestion()
      onAcceptSuggestion(editor, monaco)

      return true
    } catch (error) {
      console.error("Error accepting suggestion:", error)
      return false
    } finally {
      isAcceptingSuggestionRef.current = false
      setTimeout(() => {
        suggestionAcceptedRef.current = false
        console.log("Reset suggestionAcceptedRef flag")
      }, 1000)
    }
  }, [clearCurrentSuggestion, onAcceptSuggestion])

  const hasActiveSuggestionAtPosition = useCallback(() => {
    if (!editorRef.current || !currentSuggestionRef.current) return false

    const position = editorRef.current.getPosition()
    const suggestion = currentSuggestionRef.current

    return (
      position.lineNumber === suggestion.position.line &&
      position.column >= suggestion.position.column &&
      position.column <= suggestion.position.column + 5
    )
  }, [])

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor
    monacoRef.current = monaco
    console.log("Editor instance mounted:", !!editorRef.current)

    editor.updateOptions({
      ...defaultEditorOptions,
      // Enable inline suggestions but with specific settings to prevent conflicts
      inlineSuggest: {
        enabled: true,
        mode: "prefix",
        suppressSuggestions: false,
      },
      // Disable some conflicting suggest features
      suggest: {
        preview: false, // Disable preview to avoid conflicts
        showInlineDetails: false,
        insertMode: "replace",
      },
      // Quick suggestions
      quickSuggestions: {
        other: true,
        comments: false,
        strings: false,
      },
      // Smooth cursor
      cursorSmoothCaretAnimation: "on",
    })

    configureMonaco(monaco)

    // Register static inline completions provider for all supported languages
    const supportedLanguages = ["javascript", "typescript", "css", "html", "json", "plaintext", "markdown"];
    const provider = {
      provideInlineCompletions: async (model: any, position: any, context: any, token: any) => {
        const suggestionData = currentSuggestionRef.current;
        
        if (!suggestionData || isAcceptingSuggestionRef.current || suggestionAcceptedRef.current) {
          return { items: [] };
        }

        const currentLine = position.lineNumber;
        const currentColumn = position.column;
        const suggestionPos = suggestionData.position;

        // Position validation: check if cursor is on correct line and past the suggestion trigger column
        if (currentLine !== suggestionPos.line || currentColumn < suggestionPos.column) {
          return { items: [] };
        }

        const cleanSuggestionText = suggestionData.text.replace(/\r/g, "");

        return {
          items: [
            {
              insertText: cleanSuggestionText,
              range: new monaco.Range(
                suggestionPos.line,
                suggestionPos.column,
                currentLine,
                currentColumn
              ),
              kind: monaco.languages.CompletionItemKind.Snippet,
              label: "AI Suggestion",
              detail: "AI-generated code suggestion",
              documentation: "Press Tab to accept",
              sortText: "0000",
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            },
          ],
        };
      },
      freeInlineCompletions: () => {}
    };

    // Dispose old providers if any
    providersRef.current.forEach(p => p.dispose());
    providersRef.current = [];

    // Register for all languages
    supportedLanguages.forEach(lang => {
      const p = monaco.languages.registerInlineCompletionsProvider(lang, provider);
      providersRef.current.push(p);
    });

    // Keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Space, () => {
      console.log("Ctrl+Space pressed, triggering suggestion")
      onTriggerSuggestion("completion", editor)
    })

    // CRITICAL: Override Tab key with high priority and prevent default Monaco behavior
    if (tabCommandRef.current) {
      tabCommandRef.current.dispose()
    }

    tabCommandRef.current = editor.addCommand(
      monaco.KeyCode.Tab,
      () => {
        console.log("TAB PRESSED", {
          hasSuggestion: !!currentSuggestionRef.current,
          hasActiveSuggestion: hasActiveSuggestionAtPosition(),
          isAccepting: isAcceptingSuggestionRef.current,
          suggestionAccepted: suggestionAcceptedRef.current,
        })

        // CRITICAL: Block if already processing
        if (isAcceptingSuggestionRef.current) {
          console.log("BLOCKED: Already in the process of accepting, ignoring Tab")
          return
        }

        // CRITICAL: Block if just accepted
        if (suggestionAcceptedRef.current) {
          console.log("BLOCKED: Suggestion was just accepted, using default tab")
          editor.trigger("keyboard", "tab", null)
          return
        }

        // If we have an active suggestion at the current position, try to accept it
        if (currentSuggestionRef.current && hasActiveSuggestionAtPosition()) {
          console.log("ATTEMPTING to accept suggestion with Tab")
          const accepted = acceptCurrentSuggestion()
          if (accepted) {
            console.log("SUCCESS: Suggestion accepted via Tab, preventing default behavior")
            return // CRITICAL: Return here to prevent default tab behavior
          }
          console.log("FAILED: Suggestion acceptance failed, falling through to default")
        }

        // Default tab behavior (indentation)
        console.log("DEFAULT: Using default tab behavior")
        editor.trigger("keyboard", "tab", null)
      },
      // CRITICAL: Use specific context to override Monaco's built-in Tab handling
      "editorTextFocus && !editorReadonly && !suggestWidgetVisible",
    )

    // Escape to reject
    editor.addCommand(monaco.KeyCode.Escape, () => {
      console.log("Escape pressed")
      if (currentSuggestionRef.current) {
        onRejectSuggestion(editor)
        clearCurrentSuggestion()
      }
    })

    // Listen for cursor position changes to hide suggestions when moving away
    editor.onDidChangeCursorPosition((e: any) => {
      if (isAcceptingSuggestionRef.current) return

      const newPosition = e.position

      // Clear existing suggestion if cursor moved away
      if (currentSuggestionRef.current && !suggestionAcceptedRef.current) {
        const suggestionPos = currentSuggestionRef.current.position

        // If cursor moved away from suggestion position, clear it
        if (
          newPosition.lineNumber !== suggestionPos.line ||
          newPosition.column < suggestionPos.column ||
          newPosition.column > suggestionPos.column + 10
        ) {
          console.log("Cursor moved away from suggestion, clearing")
          clearCurrentSuggestion()
          onRejectSuggestion(editor)
        }
      }

      // Trigger new suggestion if appropriate (simplified)
      if (!currentSuggestionRef.current && !suggestionLoading) {
        // Clear any existing timeout
        if (suggestionTimeoutRef.current) {
          clearTimeout(suggestionTimeoutRef.current)
        }

        // Trigger suggestion with a delay
        suggestionTimeoutRef.current = setTimeout(() => {
          onTriggerSuggestion("completion", editor)
        }, 150)
      }
    })

    // Listen for content changes to detect manual typing over suggestions
    editor.onDidChangeModelContent((e: any) => {
      if (isAcceptingSuggestionRef.current) return

      // If user types while there's a suggestion, clear it (unless it's our insertion)
      if (currentSuggestionRef.current && e.changes.length > 0 && !suggestionAcceptedRef.current) {
        const change = e.changes[0]

        // Check if this is our own suggestion insertion
        if (
          change.text === currentSuggestionRef.current.text ||
          change.text === currentSuggestionRef.current.text.replace(/\r/g, "")
        ) {
          console.log("Our suggestion was inserted, not clearing")
          return
        }

        // User typed something else, clear the suggestion
        console.log("User typed while suggestion active, clearing")
        clearCurrentSuggestion()
        onRejectSuggestion(editor)
      }

      // Trigger context-aware suggestions on certain typing patterns
      if (e.changes.length > 0 && !suggestionAcceptedRef.current) {
        const change = e.changes[0]

        // Trigger suggestions after specific characters
        if (
          change.text === "\n" || // New line
          change.text === "{" || // Opening brace
          change.text === "." || // Dot notation
          change.text === "=" || // Assignment
          change.text === "(" || // Function call
          change.text === "," || // Parameter separator
          change.text === ":" || // Object property
          change.text === ";" // Statement end
        ) {
          setTimeout(() => {
            if (editorRef.current && !currentSuggestionRef.current && !suggestionLoading) {
              onTriggerSuggestion("completion", editor)
            }
          }, 100) // Small delay to let the change settle
        }
      }
    })

    updateEditorLanguage()
  }

  const updateEditorLanguage = () => {
    if (!activeFile || !monacoRef.current || !editorRef.current) return
    const model = editorRef.current.getModel()
    if (!model) return

    const language = getEditorLanguage(activeFile.fileExtension || "")
    try {
      monacoRef.current.editor.setModelLanguage(model, language)
    } catch (error) {
      console.warn("Failed to set editor language:", error)
    }
  }

  useEffect(() => {
    updateEditorLanguage()
  }, [activeFile])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (suggestionTimeoutRef.current) {
        clearTimeout(suggestionTimeoutRef.current)
      }
      providersRef.current.forEach((p) => p.dispose())
      providersRef.current = []
      if (tabCommandRef.current) {
        tabCommandRef.current.dispose()
        tabCommandRef.current = null
      }
    }
  }, [])

  return (
    <div className="h-full relative">
      {/* Loading indicator */}
      {suggestionLoading && (
        <div className="absolute top-2 right-2 z-10 bg-red-100 dark:bg-red-900 px-2 py-1 rounded text-xs text-red-700 dark:text-red-300 flex items-center gap-1">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          AI thinking...
        </div>
      )}

      {/* Active suggestion indicator */}
      {currentSuggestionRef.current && !suggestionLoading && (
        <div className="absolute top-2 right-2 z-10 bg-green-100 dark:bg-green-900 px-2 py-1 rounded text-xs text-green-700 dark:text-green-300 flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          Press Tab to accept
        </div>
      )}

      <Editor
        height="100%"
        value={content}
        onChange={(value) => onContentChange(value || "")}
        onMount={handleEditorDidMount}
        language={activeFile ? getEditorLanguage(activeFile.fileExtension || "") : "plaintext"}
        options={defaultEditorOptions as any}
      />
    </div>
  )
}