
import { Button } from "@/components/ui/button"
import { ArrowDown } from "lucide-react"
import Image from "next/image"

const AddRepo = () => {
  return (
    <div
      className="group px-6 py-8 flex flex-row justify-between items-center border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white/50 dark:bg-zinc-900/30 backdrop-blur-md cursor-pointer 
      transition-all duration-350 ease-out
      hover:bg-white dark:hover:bg-zinc-900/50 hover:border-cyan-500/40 hover:-translate-y-1
      shadow-sm hover:shadow-[0_15px_30px_rgba(6,182,212,0.1)]"
    >
      <div className="flex flex-row justify-center items-center gap-4">
        <Button
          variant={"outline"}
          className="flex justify-center items-center bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 group-hover:border-cyan-500 group-hover:text-cyan-500 transition-all duration-350"
          size={"icon"}
        >
          <ArrowDown size={20} className="transition-transform duration-350 group-hover:translate-y-1 text-zinc-500 group-hover:text-cyan-500" />
        </Button>
        <div className="flex flex-col">
          <h1 className="text-lg font-bold bg-gradient-to-r from-cyan-600 to-teal-650 dark:from-cyan-400 dark:to-teal-400 bg-clip-text text-transparent">Import Repository</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-[220px] mt-0.5">Import and edit your existing Github projects</p>
        </div>
      </div>

      <div className="relative overflow-hidden hidden sm:block">
        <Image
          src={"/github.svg"}
          alt="Open GitHub repository"
          width={120}
          height={120}
          className="transition-transform duration-350 group-hover:scale-105 opacity-80"
        />
      </div>
    </div>
  )
}

export default AddRepo


