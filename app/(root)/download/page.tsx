import { Download } from "lucide-react";
import { PageCta, SitePage } from "@/modules/home/site-page";

export default function DownloadPage() {
  return (
    <SitePage eyebrow="Download" title="Your workspace, wherever you build." description="VibeCode runs in the browser with no setup. Open the editor on any modern device and keep your projects close.">
      <div className="mt-14 max-w-2xl rounded-2xl border border-zinc-200 bg-white/80 p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/80">
        <Download className="h-10 w-10 text-violet-600" />
        <h2 className="mt-5 text-2xl font-bold">No installer required</h2>
        <p className="mt-3 leading-7 text-zinc-600 dark:text-zinc-400">The full development environment is available in your browser. Sign in to access your projects from any machine.</p>
        <PageCta href="/dashboard">Launch VibeCode</PageCta>
      </div>
    </SitePage>
  );
}
