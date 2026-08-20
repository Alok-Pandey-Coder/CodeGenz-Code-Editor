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
  fetchSuggestion: (type: string, editor: any) => void;
  acceptSuggestion: (editor: any, monaco: any) => void;
  rejectSuggestion: (editor: any) => void;
  clearSuggestion: (editor: any) => void;
}

const DEBOUNCE_MS = 300;
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
    setState((prev) => ({ ...prev, isEnabled: !prev.isEnabled }));
  }, []);

  const fetchSuggestion = useCallback((type: string, editor: any) => {
    // Reset any pending debounce so only the latest keystroke actually fires.
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(() => {
      setState((currentState) => {
        if (!currentState.isEnabled) {
          devLog("AI suggestions are disabled.");
          return currentState;
        }

        if (!editor) {
          devLog("Editor instance is not available.");
          return currentState;
        }

        const model = editor.getModel();
        const cursorPosition = editor.getPosition();

        if (!model || !cursorPosition) {
          devLog("Editor model or cursor position is not available.");
          return currentState;
        }

        const thisRequestId = ++requestIdRef.current;

        // Cancel any previous in-flight request before starting a new one.
        abortControllerRef.current?.abort();
        const controller = new AbortController();
        abortControllerRef.current = controller;

        const newState = { ...currentState, isLoading: true, error: null };

        (async () => {
          try {
            const payload = {
              fileContent: model.getValue(),
              cursorLine: cursorPosition.lineNumber - 1,
              cursorColumn: cursorPosition.column - 1,
              suggestionType: type,
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

            // Discard if a newer request has started or we've unmounted.
            if (thisRequestId !== requestIdRef.current || !isMountedRef.current) {
              return;
            }

            if (data.suggestion && data.suggestion.trim() !== "// AI suggestion unavailable") {
              const suggestionText = data.suggestion.trim();
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
            // Expected when we abort an old request in favor of a new one — not a real error.
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

        return newState;
      });
    }, DEBOUNCE_MS);
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