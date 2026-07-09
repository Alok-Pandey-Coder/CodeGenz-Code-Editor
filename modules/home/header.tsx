import Link from "next/link";
import Image from "next/image";
// import { ThemeToggle } from "@/components/ui/toggle-theme";
import UserButton from "../auth/components/user-button";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function Header() {
  return (
    <>
      <div className="sticky top-0 left-0 right-0 z-50">
        <div className="bg-white dark:bg-black/5 w-full">
          {/* Rest of the header content */}
          <div className="flex items-center justify-center w-full flex-col">
            <div
              className={`
                            flex items-center justify-between
                            bg-linear-to-b from-white/90 via-gray-50/90 to-white/90
                            dark:from-zinc-900/90 dark:via-zinc-800/90 dark:to-zinc-900/90
                            shadow-[0_2px_20px_-2px_rgba(0,0,0,0.1)]
                            backdrop-blur-md
                            border-x border-b 
                            border-[rgba(230,230,230,0.7)] dark:border-[rgba(70,70,70,0.7)]
                            w-full sm:min-w-[800px] sm:max-w-[1200px]
                            rounded-b-[28px]
                            px-4 py-2.5
                            relative
                            transition-all duration-300 ease-in-out
                        `}
            >
              <div className="relative z-10 flex items-center justify-between w-full">
                {/* Left side: Logo */}
                <div className="flex items-center">
                  <Link
                    href="/"
                    className="flex items-center gap-2"
                  >
                    <img
                      src="/logo.svg"
                      alt="Logo"
                      width={60}
                      height={60}
                    />

                    <span className="hidden lg:block font-extrabold text-lg tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-zinc-100 dark:to-zinc-400 bg-clip-text text-transparent">
                      VibeCode Editor
                    </span>
                  </Link>
                </div>

                {/* Center: Desktop Navigation Links (Centered Pill) */}
                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-6 bg-zinc-100/40 dark:bg-zinc-900/30 border border-zinc-200/50 dark:border-zinc-800/40 px-6 py-2 rounded-full backdrop-blur-md shadow-sm">
                  <Link
                    href="/docs/components/background-paths"
                    className="text-xs text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors font-semibold"
                  >
                    Docs
                  </Link>
                  <Link
                    href="/resources"
                    className="text-xs text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors font-semibold"
                  >
                    Resources
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
                  <Link
                    href="/contact"
                    className="text-xs text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors font-semibold"
                  >
                    Contact Us
                  </Link>
                  <Link
                    href="https://codesnippetui.pro/templates?utm_source=codesnippetui.com&utm_medium=header"
                    target="_blank"
                    className="text-xs text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors flex items-center gap-1 font-semibold"
                  >
                    API
                    <span className="text-green-500 dark:text-green-400 border border-green-500/30 dark:border-green-400/30 rounded-md px-1.5 py-0.5 text-[9px] font-bold">
                      New
                    </span>
                  </Link>
                </div>

                {/* Right side: Desktop Actions */}
                <div className="hidden md:flex items-center gap-3">
                  <ThemeToggle /> 
                  <UserButton />
                </div>

                {/* Mobile Navigation */}
                <div className="flex md:hidden items-center gap-3 ml-auto">
                  <Link
                    href="/docs/components/action-search-bar"
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
          </div>
        </div>
      </div>
    </>
  );
}
