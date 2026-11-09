import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Code2,
  Download,
  Mail,
  Rocket,
  Sparkles,
  Terminal,
} from "lucide-react";

type SitePageProps = {
  eyebrow: string;
  title: string;
  description: string;
  children?: React.ReactNode;
};

export function SitePage({
  eyebrow,
  title,
  description,
  children,
}: SitePageProps) {
  return (
    <div className="mx-auto min-h-[calc(100vh-7rem)] w-full max-w-6xl px-6 py-20 sm:px-10">
      <div className="max-w-3xl">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-violet-600 dark:text-violet-400">
          {eyebrow}
        </p>
        <h1 className="text-4xl font-black tracking-tight text-zinc-950 dark:text-white sm:text-6xl">
          {title}
        </h1>
        <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-300">
          {description}
        </p>
      </div>
      {children}
    </div>
  );
}

export function FeatureGrid({
  items,
}: {
  items: Array<{ icon: React.ReactNode; title: string; description: string }>;
}) {
  return (
    <div className="mt-14 grid gap-4 md:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.title}
          className="rounded-2xl border border-zinc-200/80 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70"
        >
          <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-950/60 dark:text-violet-300">
            {item.icon}
          </div>
          <h2 className="font-bold text-zinc-900 dark:text-white">{item.title}</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            {item.description}
          </p>
        </div>
      ))}
    </div>
  );
}

export function PageCta({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="mt-10 inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 dark:bg-white dark:text-zinc-950 dark:hover:bg-violet-200"
    >
      {children}
      <ArrowRight className="h-4 w-4" />
    </Link>
  );
}

export const pageIcons = {
  book: <BookOpen className="h-5 w-5" />,
  code: <Code2 className="h-5 w-5" />,
  download: <Download className="h-5 w-5" />,
  mail: <Mail className="h-5 w-5" />,
  rocket: <Rocket className="h-5 w-5" />,
  sparkles: <Sparkles className="h-5 w-5" />,
  terminal: <Terminal className="h-5 w-5" />,
};
