
"use client";

import { Button } from "@/components/ui/button"
// import { createPlayground } from "@/features/playground/actions";
import { Plus, Router } from 'lucide-react'
import Image from "next/image"
import { useRouter } from "next/navigation";
import { useState } from "react"
import { toast } from "sonner";
import TemplateSelectingModal from "./template-selecting-model";
import { createPlayground } from "../actions";

const AddNewButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<{
    title: string;
    template: "REACT" | "EXPRESS" | "VUE" | "ANGULAR" | "NEXTJS" | "HONO";
    description?: string;
  } | null>(null)

  const router = useRouter()

  const handleSubmit = async(data: {
    title: string;
    template: "REACT" | "EXPRESS" | "VUE" | "ANGULAR" | "NEXTJS" | "HONO";
    description?: string;
  }) => {
    setSelectedTemplate(data);

    const res = await createPlayground(data);
    toast.success("Playground created succefully");
    setIsModalOpen(false);

    router.push(`/playground/${res?.id}`)
  }

  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        className="group px-6 py-8 flex flex-row justify-between items-center border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white/50 dark:bg-zinc-900/30 backdrop-blur-md cursor-pointer 
        transition-all duration-350 ease-out
        hover:bg-white dark:hover:bg-zinc-900/50 hover:border-violet-500/40 hover:-translate-y-1
        shadow-sm hover:shadow-[0_15px_30px_rgba(139,92,246,0.1)]"
      >
        <div className="flex flex-row justify-center items-center gap-4">
          <Button
            variant={"outline"}
            className="flex justify-center items-center bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 group-hover:border-violet-500 group-hover:text-violet-500 transition-all duration-350"
            size={"icon"}
          >
            <Plus size={20} className="transition-transform duration-350 group-hover:rotate-90 text-zinc-500 group-hover:text-violet-500" />
          </Button>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold bg-gradient-to-r from-violet-600 to-indigo-650 dark:from-violet-400 dark:to-indigo-400 bg-clip-text text-transparent">Add New Playground</h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-[220px] mt-0.5">Spin up a clean sandboxed template instantly</p>
          </div>
        </div>

        <div className="relative overflow-hidden hidden sm:block">
          <Image
            src={"/add-new.svg"}
            alt="Create new playground"
            width={120}
            height={120}
            className="transition-transform duration-350 group-hover:scale-105 opacity-80"
          />
        </div>
      </div>

      <TemplateSelectingModal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      onSubmit={handleSubmit}
      />
    </>
  )
}

export default AddNewButton
