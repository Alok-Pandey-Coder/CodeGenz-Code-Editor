import { useState, useEffect, useCallback } from "react";
import {toast} from "sonner"

import type { TemplateFolder } from "../lib/path-to-json";
import { getPlaygroundById, SaveUpdatedCode } from "../actions";

interface PlagroundData {
  id:string;
  name?: string
  [key:string]:any;
}

interface UsePlaygroundReturn {
  playgroundData: PlagroundData | null;
  templateData: TemplateFolder | null;
  isLoading: boolean;
  error: string | null;
  loadPlayground: (id: string) => Promise<void>;
  saveTemplateData: (data: TemplateFolder) => Promise<void>;
}

export const usePlayground = (id: string): UsePlaygroundReturn => {
  const [playgroundData, setPlaygroundData] = useState<PlagroundData | null>(null);
  const [templateData, setTemplateData] = useState<TemplateFolder | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadPlayground = useCallback(async () => {
    if(!id) return;
    try {
      setIsLoading(true);
      setError(null);
      const data = await getPlaygroundById(id);
      //@ts-ignore
      setPlaygroundData(data)

      const rawContent = data?.templateFiles?.[0]?.content;

      if(typeof rawContent === "string") {
        const parsedContent = JSON.parse(rawContent)
        setTemplateData(parsedContent)
        toast.success("Playground loaded succefully")
        return;
      }

      const res = await fetch(`/api/template/${id}`);
      if(!res.ok) throw new Error(`Failed to load template: ${res.status}`);

      const templateRes = await res.json()

      if(templateRes?.templateJson && Array .isArray(templateRes.templateJson)) {
        setTemplateData({
          folderName: "Root",
          items: templateRes.templateJson
        });
      } else {
        setTemplateData(templateRes.templateJson || {
          folderName: "Root",
          items: []
        });
      }
      toast.success("Playground loaded succefully")
    } catch (error) {
      console.error("Error loading playground data:", error);
      setError("Failed to load playground data. Please try again.");
      toast.error("Failed to load playground data!")
    }
    finally {
      setIsLoading(false);
    }
  }, [id])

  const saveTemplateData = useCallback(async(data: TemplateFolder) => {

    try {
      await SaveUpdatedCode(id, data)
      setTemplateData(data);
      toast.success("changes saved successfully")
    } catch (error) {
      console.error("Error saving template data:", error);
      toast.error("Failed to save changes")
      throw error
    }
  }, [id])

  useEffect(() => {
    loadPlayground()

  }, [loadPlayground])

   return {
    playgroundData,
    templateData,
    isLoading,
    error,
    loadPlayground,
    saveTemplateData,
  };
}