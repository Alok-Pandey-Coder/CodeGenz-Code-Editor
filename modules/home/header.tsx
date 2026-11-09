import Link from "next/link";
import Image from "next/image";
import UserButton from "../auth/components/user-button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ArrowUpRight } from "lucide-react";

export function Header() {
  return (
    <>
      <header className="sticky top-0 z-50 border-b border-zinc-200/70 bg-white/75 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/75">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-5 lg:px-8">
              <div className="flex items-center justify-between">
                {/* Left side: Logo */}
                <div className="flex items-center">
                  <Link
                    href="/"
                    className="flex items-center gap-2"
                  >
                    <Image
                      src="/logo.svg"
                      alt="Logo"
                      width={38}
                      height={38}
                      className="rounded-xl"
                    />

                    <span className="hidden lg:block font-extrabold text-lg tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-zinc-100 dark:to-zinc-400 bg-clip-text text-transparent">
                      VibeCode
                    </span>
                  </Link>
                </div>

                {/* Center: Desktop Navigation Links (Centered Pill) */}
                <nav className="hidden md:flex items-center gap-1 rounded-xl border border-zinc-200/70 bg-zinc-50/80 p-1 dark:border-white/10 dark:bg-white/5">
                  <Link
                    href="/docs"
                    className="rounded-lg px-3 py-2 text-xs font-semibold text-zinc-600 transition hover:bg-white hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white"
                  >
                    Docs
                  </Link>
                  <Link
                    href="/resources"
                    className="rounded-lg px-3 py-2 text-xs font-semibold text-zinc-600 transition hover:bg-white hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white"
                  >
                    Resources
                  </Link>
                  <Link
                    href="/pricing"
                    className="rounded-lg px-3 py-2 text-xs font-semibold text-zinc-600 transition hover:bg-white hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white"
                  >
                    Pricing
                  </Link>
                  <Link
                    href="/download"
                    className="rounded-lg px-3 py-2 text-xs font-semibold text-zinc-600 transition hover:bg-white hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white"
                  >
                    Download
                  </Link>
                  <Link
                    href="/contact"
                    className="rounded-lg px-3 py-2 text-xs font-semibold text-zinc-600 transition hover:bg-white hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white"
                  >
                    Contact Us
                  </Link>
                  <Link
                    href="/api"
                    className="flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold text-zinc-600 transition hover:bg-white hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white"
                  >
                    API
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </nav>

                {/* Right side: Desktop Actions */}
                <div className="hidden md:flex items-center gap-2">
                  <ThemeToggle /> 
                  <UserButton />
                </div>

                {/* Mobile Navigation */}
                <div className="flex items-center gap-2 md:hidden">
                  <Link
                    href="/docs"
                    className="text-xs text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors font-semibold"
                  >
                    Docs
                  </Link>
                  <Link
                    href="/pricing"
                    className="text-xs text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors font-semibold"
                  >
                    Pricing
                  </Link>
                  <Link
                    href="/download"
                    className="text-xs text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors font-semibold"
                  >
                    Download
                  </Link>
                  <ThemeToggle /> 
                  <UserButton />
                </div>
              </div>
        </div>
      </header>
    </>
  );
}
