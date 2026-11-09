import { useState, useRef, useCallback, useEffect } from "react";

interface AISuggestionsState {
  suggestion: string | null;
  isLoading: boolean;
  position: { line: number; column: number } | null;
  decoration: string[];
  isEnabled: boolean;
  error: string | null;
}

interface UseAISuggestionsReturn extends AISuggestionsState {
  toggleEnabled: () => void;
  fetchSuggestion: (type: string, editor: any, fileName?: string, immediate?: boolean) => void;
  acceptSuggestion: (editor: any, monaco: any) => void;
  rejectSuggestion: (editor: any) => void;
  clearSuggestion: (editor: any) => void;
}

const DEBOUNCE_MS = 250;
const isDev = process.env.NODE_ENV === "development";
const devLog = (...args: any[]) => {
  if (isDev) console.log(...args);
};

export const useAISuggestions = (): UseAISuggestionsReturn => {
  const [state, setState] = useState<AISuggestionsState>({
    suggestion: null,
    isLoading: false,
    position: null,
    decoration: [],
    isEnabled: true,
    error: null,
  });

  // Tracks the latest request so stale responses (from an old cursor
  // position) never get applied after a newer one has started.
  const requestIdRef = useRef(0);
  // Cancels the in-flight fetch when a newer request starts or the
  // component unmounts, so the server call itself is aborted, not just ignored.
  const abortControllerRef = useRef<AbortController | null>(null);
  // Debounce timer so we don't fire a request on every keystroke.
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Guards against setState after unmount.
  const isMountedRef = useRef(true);
  const isEnabledRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      abortControllerRef.current?.abort();
    };
  }, []);

  const toggleEnabled = useCallback(() => {
    devLog("Toggling AI suggestions");
    setState((prev) => {
      const isEnabled = !prev.isEnabled;
      isEnabledRef.current = isEnabled;
      if (!isEnabled) {
        requestIdRef.current += 1;
        abortControllerRef.current?.abort();
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      }
      return { ...prev, isEnabled, suggestion: null, position: null, isLoading: false };
    });
  }, []);

  const fetchSuggestion = useCallback((type: string, editor: any, fileName?: string, immediate = false) => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    const executeFetch = () => {
      if (!editor) {
        devLog("Editor instance is not available.");
        return;
      }
      if (!isEnabledRef.current) {
        devLog("AI suggestions are disabled.");
        return;
      }

      const model = editor.getModel();
      const cursorPosition = editor.getPosition();
      if (!model || !cursorPosition) {
        devLog("Editor model or cursor position is not available.");
        return;
      }

      const thisRequestId = ++requestIdRef.current;
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setState((currentState) => ({ ...currentState, isLoading: true, error: null }));

      (async () => {
        try {
          const payload = {
            fileContent: model.getValue(),
            cursorLine: cursorPosition.lineNumber - 1,
            cursorColumn: cursorPosition.column - 1,
            suggestionType: type,
            fileName,
          };
          devLog("Request payload:", payload);

          const response = await fetch("/api/code-completion", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            signal: controller.signal,
          });

          if (!response.ok) {
            throw new Error(`API responded with status ${response.status}`);
          }

          const data = await response.json();
          devLog("API response:", data);
          if (thisRequestId !== requestIdRef.current || !isMountedRef.current) return;

          const suggestionText = typeof data.suggestion === "string" ? data.suggestion : "";
          if (suggestionText.trim()) {
            setState((prev) => ({
              ...prev,
              suggestion: suggestionText,
              position: {
                line: cursorPosition.lineNumber,
                column: cursorPosition.column,
              },
              isLoading: false,
              error: null,
            }));
          } else {
            devLog("No suggestion received from API.");
            setState((prev) => ({ ...prev, isLoading: false }));
          }
        } catch (error: any) {
          if (error?.name === "AbortError") return;
          if (thisRequestId !== requestIdRef.current || !isMountedRef.current) return;

          console.error("Error fetching code suggestion:", error);
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: "Failed to fetch suggestion",
          }));
        }
      })();
    };

    if (immediate) {
      executeFetch();
    } else {
      debounceTimerRef.current = setTimeout(executeFetch, DEBOUNCE_MS);
    }
  }, []);

  const acceptSuggestion = useCallback((editor: any, monaco: any) => {
    setState((currentState) => {
      if (!currentState.suggestion || !currentState.position || !editor || !monaco) {
        return currentState;
      }

      const { line, column } = currentState.position;
      const sanitizedSuggestion = currentState.suggestion.replace(/^\d+:\s*/gm, "");

      editor.executeEdits("", [
        {
          range: new monaco.Range(line, column, line, column),
          text: sanitizedSuggestion,
          forceMoveMarkers: true,
        },
      ]);

      if (currentState.decoration.length > 0) {
        editor.deltaDecorations(currentState.decoration, []);
      }

      return {
        ...currentState,
        suggestion: null,
        position: null,
        decoration: [],
      };
    });
  }, []);

  // reject and clear do the same thing (dismiss without inserting) —
  // kept as two names since callers use them in semantically different places.
  const clearSuggestion = useCallback((editor: any) => {
    setState((currentState) => {
      if (editor && currentState.decoration.length > 0) {
        editor.deltaDecorations(currentState.decoration, []);
      }
      return {
        ...currentState,
        suggestion: null,
        position: null,
        decoration: [],
      };
    });
  }, []);

  const rejectSuggestion = clearSuggestion;

  return {
    ...state,
    toggleEnabled,
    fetchSuggestion,
    acceptSuggestion,
    rejectSuggestion,
    clearSuggestion,
  };
};