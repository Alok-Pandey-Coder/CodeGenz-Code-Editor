import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200/70 bg-white/40 dark:border-white/10 dark:bg-zinc-950/30">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <p>&copy; {new Date().getFullYear()} VibeCode. Build boldly.</p>
        <div className="flex gap-5">
          <Link href="/docs" className="transition hover:text-violet-600">Documentation</Link>
          <Link href="/contact" className="transition hover:text-violet-600">Support</Link>
          <Link href="/pricing" className="transition hover:text-violet-600">Pricing</Link>
        </div>
      </div>
    </footer>
  );
}