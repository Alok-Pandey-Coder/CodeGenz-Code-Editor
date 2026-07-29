import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getAllPlaygroundForUser } from "@/modules/dashboard/actions";
import { DashboardSidebar } from "@/modules/dashboard/components/dashboard-sidebar";
import { currentUser } from "@/modules/auth/actions";

export default async function dashboardLayout({children}: {children: React.ReactNode}) {
  const playgroundData = await getAllPlaygroundForUser();
  const user = await currentUser();

  const formattedPlaygroundData = playgroundData?.map((item) => ({
    id: item.id,
    name: item.title,
    starred: item.starMark?.[0]?.isMarked || false,
    icon: item.template || "REACT",
    updatedAt: item.updatedAt
  })) || []
  return (
    <TooltipProvider>
    <SidebarProvider>
      <div className="relative flex min-h-screen w-full overflow-x-hidden bg-background text-foreground">
        {/* Grid Background */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30 dark:opacity-20 z-0"
          style={{
            backgroundSize: "40px 40px",
            backgroundImage: "linear-gradient(to right, #e4e4e7 1px, transparent 1px), linear-gradient(to bottom, #e4e4e7 1px, transparent 1px)",
          }}
        />
        {/* Radial Mask */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/20 [mask-image:radial-gradient(ellipse_at_center,transparent_30%,black)] dark:bg-black/10 z-0" />
        
        {/* Ambient Glow Blob */}
        <div className="absolute top-0 right-10 w-[300px] h-[300px] rounded-full bg-violet-500/10 dark:bg-violet-600/5 blur-[80px] pointer-events-none z-0" />

        {/* dashboard sidebar */}
        {/* @ts-ignore */}
        <DashboardSidebar user={user} initialPlaygroundData={formattedPlaygroundData}/>
        <main className="relative flex-1 z-10 w-full">
          {children}
        </main>
      </div>
    </SidebarProvider>
    </TooltipProvider>
  )
}