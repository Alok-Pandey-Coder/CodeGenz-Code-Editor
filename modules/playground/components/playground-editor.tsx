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
  onTriggerSuggestion: (type: string, editor: any, fileName?: string, immediate?: boolean) => void
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
  const currentSuggestionRef = useRef<{
    text: string
    position: { line: number; column: number }
    id: string
  } | null>(null)
  const isAcceptingSuggestionRef = useRef(false)
  const suggestionAcceptedRef = useRef(false)
  const suggestionTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const tabCommandRef = useRef<any>(null)
  const providersRef = useRef<any[]>([])

  const activeFileName = activeFile ? `${activeFile.filename}.${activeFile.fileExtension}` : undefined
  const activeFileNameRef = useRef(activeFileName)
  activeFileNameRef.current = activeFileName

  // Generate unique ID for each suggestion
  const generateSuggestionId = () => `suggestion-${Date.now()}-${Math.random()}`

  // Update inline completions ref and trigger editor action
  useEffect(() => {
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
            editorRef.current.trigger("ai", "editor.action.inlineSuggest.trigger", null)
          }
        }, 30)
      }
    } else {
      currentSuggestionRef.current = null
      if (editorRef.current) {
        editorRef.current.trigger("ai", "editor.action.inlineSuggest.hide", null)
      }
    }
  }, [suggestion, suggestionPosition])

  const clearCurrentSuggestion = useCallback(() => {
    currentSuggestionRef.current = null
    suggestionAcceptedRef.current = false
    if (editorRef.current) {
      editorRef.current.trigger("ai", "editor.action.inlineSuggest.hide", null)
    }
  }, [])

  const acceptCurrentSuggestion = useCallback(() => {
    if (!editorRef.current || !monacoRef.current || !currentSuggestionRef.current) {
      return false
    }

    if (isAcceptingSuggestionRef.current || suggestionAcceptedRef.current) {
      return false
    }

    isAcceptingSuggestionRef.current = true
    suggestionAcceptedRef.current = true

    const editor = editorRef.current
    const monaco = monacoRef.current
    const currentSuggestion = currentSuggestionRef.current

    try {
      const cleanSuggestionText = currentSuggestion.text.replace(/\r/g, "")
      const currentPosition = editor.getPosition()
      const suggestionPos = currentSuggestion.position

      if (
        !currentPosition ||
        currentPosition.lineNumber !== suggestionPos.line ||
        currentPosition.column < suggestionPos.column ||
        currentPosition.column > suggestionPos.column + 10
      ) {
        return false
      }

      const range = new monaco.Range(suggestionPos.line, suggestionPos.column, currentPosition.lineNumber, currentPosition.column)

      const success = editor.executeEdits("ai-suggestion-accept", [
        {
          range: range,
          text: cleanSuggestionText,
          forceMoveMarkers: true,
        },
      ])

      if (!success) {
        return false
      }

      const lines = cleanSuggestionText.split("\n")
      const endLine = suggestionPos.line + lines.length - 1
      const endColumn =
        lines.length === 1 ? suggestionPos.column + cleanSuggestionText.length : lines[lines.length - 1].length + 1

      editor.setPosition({ lineNumber: endLine, column: endColumn })

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
      }, 1000)
    }
  }, [clearCurrentSuggestion, onAcceptSuggestion])

  const hasActiveSuggestionAtPosition = useCallback(() => {
    if (!editorRef.current || !currentSuggestionRef.current) return false

    const position = editorRef.current.getPosition()
    const suggestion = currentSuggestionRef.current

    return (
      position &&
      position.lineNumber === suggestion.position.line &&
      position.column >= suggestion.position.column &&
      position.column <= suggestion.position.column + 10
    )
  }, [])

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor
    monacoRef.current = monaco

    editor.updateOptions({
      ...defaultEditorOptions,
      inlineSuggest: {
        enabled: true,
        mode: "prefix",
        suppressSuggestions: false,
      },
      suggest: {
        preview: false,
        showInlineDetails: false,
        insertMode: "replace",
      },
      quickSuggestions: {
        other: true,
        comments: false,
        strings: false,
      },
      cursorSmoothCaretAnimation: "on",
    })

    configureMonaco(monaco)

    // Register inline completions provider for all Monaco languages
    const monacoLanguages = monaco.languages.getLanguages().map((l: any) => l.id)
    const fallbackLanguages = [
      "javascript", "typescript", "css", "html", "json", "plaintext", "markdown",
      "python", "java", "c", "cpp", "csharp", "php", "ruby", "go", "rust",
      "shell", "sql", "scss", "sass", "less", "xml", "yaml", "ini", "dockerfile",
    ]
    const allLanguages = Array.from(new Set([...monacoLanguages, ...fallbackLanguages]))

    const provider = {
      provideInlineCompletions: async (model: any, position: any) => {
        const suggestionData = currentSuggestionRef.current

        if (!suggestionData || isAcceptingSuggestionRef.current || suggestionAcceptedRef.current) {
          return { items: [] }
        }

        const currentLine = position.lineNumber
        const currentColumn = position.column
        const suggestionPos = suggestionData.position

        // Check if cursor is on correct line and at or after suggestion trigger column
        if (currentLine !== suggestionPos.line || currentColumn < suggestionPos.column) {
          return { items: [] }
        }

        const cleanSuggestionText = suggestionData.text.replace(/\r/g, "")
        if (!cleanSuggestionText) {
          return { items: [] }
        }

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
              label: "AI Suggestion",
              detail: "Press Tab to accept",
            },
          ],
        }
      },
      freeInlineCompletions: () => {},
    }

    // Dispose old providers if any
    providersRef.current.forEach((p) => p.dispose())
    providersRef.current = []

    // Register for all languages
    allLanguages.forEach((lang) => {
      try {
        const p = monaco.languages.registerInlineCompletionsProvider(lang, provider)
        providersRef.current.push(p)
      } catch (err) {
        // Silently skip if language not registered in Monaco core
      }
    })

    // Keyboard shortcut for manual trigger: Ctrl+Space / Cmd+Space
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Space, () => {
      onTriggerSuggestion("completion", editor, activeFileNameRef.current, true)
    })

    // Tab key interception for active suggestion
    if (tabCommandRef.current) {
      tabCommandRef.current.dispose()
    }

    tabCommandRef.current = editor.addCommand(
      monaco.KeyCode.Tab,
      () => {
        if (isAcceptingSuggestionRef.current) return

        if (suggestionAcceptedRef.current) {
          editor.trigger("keyboard", "tab", null)
          return
        }

        // If we have an active suggestion at current position, accept it
        if (currentSuggestionRef.current && hasActiveSuggestionAtPosition()) {
          const accepted = acceptCurrentSuggestion()
          if (accepted) {
            return
          }
        }

        // Default tab behavior (indentation)
        editor.trigger("keyboard", "tab", null)
      },
      "editorTextFocus && !editorReadonly && !suggestWidgetVisible",
    )

    // Escape to reject suggestion
    editor.addCommand(monaco.KeyCode.Escape, () => {
      if (currentSuggestionRef.current) {
        onRejectSuggestion(editor)
        clearCurrentSuggestion()
      }
    })

    // Listen for cursor position changes
    editor.onDidChangeCursorPosition((e: any) => {
      if (isAcceptingSuggestionRef.current) return

      const newPosition = e.position

      // Clear existing suggestion if cursor moved away
      if (currentSuggestionRef.current && !suggestionAcceptedRef.current) {
        const suggestionPos = currentSuggestionRef.current.position

        if (
          newPosition.lineNumber !== suggestionPos.line ||
          newPosition.column < suggestionPos.column ||
          newPosition.column > suggestionPos.column + 15
        ) {
          clearCurrentSuggestion()
          onRejectSuggestion(editor)
        }
      }

      // Trigger debounced suggestion on cursor stop
      if (!currentSuggestionRef.current && !suggestionLoading) {
        if (suggestionTimeoutRef.current) {
          clearTimeout(suggestionTimeoutRef.current)
        }

        suggestionTimeoutRef.current = setTimeout(() => {
          if (editorRef.current) {
            onTriggerSuggestion("completion", editorRef.current, activeFileNameRef.current, false)
          }
        }, 200)
      }
    })

    // Listen for model content changes
    editor.onDidChangeModelContent((e: any) => {
      if (isAcceptingSuggestionRef.current) return

      // Clear existing suggestion if user types different text
      if (currentSuggestionRef.current && e.changes.length > 0 && !suggestionAcceptedRef.current) {
        const change = e.changes[0]
        const expected = currentSuggestionRef.current.text.replace(/\r/g, "")
        if (change.text !== expected) {
          clearCurrentSuggestion()
          onRejectSuggestion(editor)
        }
      }

      // Debounced trigger on typing
      if (e.changes.length > 0 && !suggestionAcceptedRef.current) {
        if (suggestionTimeoutRef.current) {
          clearTimeout(suggestionTimeoutRef.current)
        }

        suggestionTimeoutRef.current = setTimeout(() => {
          if (editorRef.current && !currentSuggestionRef.current && !suggestionLoading) {
            onTriggerSuggestion("completion", editorRef.current, activeFileNameRef.current, false)
          }
        }, 150)
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