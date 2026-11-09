import { Mail } from "lucide-react";
import { SitePage, pageIcons } from "@/modules/home/site-page";

export default function ContactPage() {
  return (
    <SitePage eyebrow="Contact us" title="We would love to hear from you." description="Questions, feedback, or a great idea for the editor? Send us a message and our team will get back to you.">
      <div className="mt-14 grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white/80 p-7 dark:border-zinc-800 dark:bg-zinc-900/80">
          <Mail className="h-8 w-8 text-violet-600" />
          <h2 className="mt-5 text-xl font-bold">Email support</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">For product questions and account help, reach us at support@vibecode.dev.</p>
          <a className="mt-5 inline-block font-semibold text-violet-600 hover:underline" href="mailto:support@vibecode.dev">Send an email</a>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white/80 p-7 dark:border-zinc-800 dark:bg-zinc-900/80">
          <div className="flex h-8 w-8 items-center justify-center text-violet-600">{pageIcons.sparkles}</div>
          <h2 className="mt-5 text-xl font-bold">Share feedback</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">Tell us what would make your building workflow smoother. Every suggestion helps shape the roadmap.</p>
        </div>
      </div>
    </SitePage>
  );
}
