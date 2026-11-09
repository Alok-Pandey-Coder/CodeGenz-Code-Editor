import { cn } from "@/lib/utils";
import {Footer} from "@/modules/home/footer";
import { Header } from "@/modules/home/header";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "Vibecode - Editor ",
    default: "Code Editor For VibeCoders - Vibecode",
  },
};

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <div
        className={cn(
          "pointer-events-none absolute inset-0 opacity-40",
          "[background-size:48px_48px]",
          "[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] dark:[background-image:linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)]",
        )}
      />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/70 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-zinc-950/70" />

      <main className="z-20 relative w-full pt-0">{children}</main>
      <Footer />
    </>
  );
}
