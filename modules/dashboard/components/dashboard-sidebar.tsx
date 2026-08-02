"use client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createPlayground } from "../actions"; // apna actual path
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { toggleStarMarked } from "../actions";
import TemplateSelectionModal from "./template-selecting-model";
import {
  Code2,
  FolderPlus,
  History,
  Home,
  LayoutDashboard,
  Plus,
  Settings,
  Star,
  ChevronsUpDown,
  Sparkles,
  LogOut,
  Search,
  User,
  PlaySquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarGroupAction,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { signOut } from "next-auth/react";

// Define the interface for a single playground item
interface PlaygroundData {
  id: string;
  name: string;
  icon: string;
  starred: boolean;
  updatedAt: Date;
}

interface DashboardSidebarProps {
  initialPlaygroundData: PlaygroundData[];
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

// Custom Technology SVG Icons for premium branding
function ReactIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="-11.5 -10.23174 23 20.46348" className={className}>
      <title>React</title>
      <circle cx="0" cy="0" r="2.05" fill="#61DAFB" />
      <g stroke="#61DAFB" strokeWidth="1.1" fill="none">
        <ellipse rx="11" ry="4.2" />
        <ellipse rx="11" ry="4.2" transform="rotate(60)" />
        <ellipse rx="11" ry="4.2" transform="rotate(120)" />
      </g>
    </svg>
  );
}

function NextjsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 180 180" className={className} fill="none">
      <title>Next.js</title>
      <circle
        cx="90"
        cy="90"
        r="90"
        fill="currentColor"
        className="text-zinc-950 dark:text-zinc-50"
      />
      <path
        d="M149.508 157.52L69.142 54H54v72h13.254V67.055l70.134 90.465zm12.492-31.52H148.746V54h13.254z"
        fill="url(#nextjs-logo-gradient)"
      />
      <defs>
        <linearGradient
          id="nextjs-logo-gradient"
          x1="109"
          y1="116.5"
          x2="144.5"
          y2="160.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function VueIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 256 221" className={className} fill="none">
      <title>Vue.js</title>
      <path
        d="M204.8 0H256L128 220.8L0 0H51.2L128 132.48L204.8 0Z"
        fill="#41B883"
      />
      <path
        d="M204.8 0H156.8L128 49.6L99.2 0H51.2L128 132.48L204.8 0Z"
        fill="#35495E"
      />
    </svg>
  );
}

function ExpressIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 128 128" className={className} fill="none">
      <title>Express.js</title>
      <rect
        x="8"
        y="16"
        width="112"
        height="28"
        rx="6"
        fill="currentColor"
        className="text-zinc-300 dark:text-zinc-800"
      />
      <rect
        x="8"
        y="50"
        width="112"
        height="28"
        rx="6"
        fill="currentColor"
        className="text-zinc-400 dark:text-zinc-700"
      />
      <rect
        x="8"
        y="84"
        width="112"
        height="28"
        rx="6"
        fill="currentColor"
        className="text-zinc-500 dark:text-zinc-600"
      />

      <circle cx="24" cy="30" r="4.5" fill="#10B981" />
      <circle cx="24" cy="64" r="4.5" fill="#10B981" />
      <circle cx="24" cy="98" r="4.5" fill="#6B7280" />

      <circle cx="40" cy="30" r="3" fill="#6B7280" />
      <circle cx="40" cy="64" r="3" fill="#3B82F6" />
      <circle cx="40" cy="98" r="3" fill="#6B7280" />
    </svg>
  );
}

function HonoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none">
      <title>Hono</title>
      <path
        d="M50 5C50 5 80 35 80 60C80 76.5685 66.5685 90 50 90C33.4315 90 20 76.5685 20 60C20 35 50 5 50 5Z"
        fill="url(#hono-fire-gradient)"
      />
      <path
        d="M50 30C50 30 70 50 70 65C70 76.0457 61.0457 85 50 85C38.9543 85 30 76.0457 30 65C30 50 50 30 50 30Z"
        fill="url(#hono-inner-gradient)"
      />
      <defs>
        <linearGradient
          id="hono-fire-gradient"
          x1="50"
          y1="5"
          x2="50"
          y2="90"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E20000" />
          <stop offset="1" stopColor="#FF4B4B" />
        </linearGradient>
        <linearGradient
          id="hono-inner-gradient"
          x1="50"
          y1="30"
          x2="50"
          y2="85"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FF9000" />
          <stop offset="1" stopColor="#FFD338" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function AngularIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 256 273" className={className} fill="none">
      <title>Angular</title>
      <path
        d="M128 0L241.6 40.5L224.2 199.1L128 256L31.8 199.1L14.4 40.5L128 0Z"
        fill="#DD0031"
      />
      <path
        d="M128 39.5L59 191.7H89.2L103.5 156.4H152.1L166.4 191.7H196.6L128 39.5ZM143.5 125H112.5L128 87.2L143.5 125Z"
        fill="white"
      />
    </svg>
  );
}

// Map tech strings to custom SVG icons
const lucideIconMap: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  REACT: ReactIcon,
  NEXTJS: NextjsIcon,
  EXPRESS: ExpressIcon,
  VUE: VueIcon,
  HONO: HonoIcon,
  ANGULAR: AngularIcon,
};

export function DashboardSidebar({
  initialPlaygroundData,
  user,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const [playgrounds, setPlaygrounds] = useState(initialPlaygroundData);
  const starredPlaygrounds = playgrounds.filter((p) => p.starred);
  const allPlaygrounds = playgrounds;
  const recentPlaygrounds = [...playgrounds]
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 5);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter playgrounds based on search query
  const filteredStarred = starredPlaygrounds.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredRecent = recentPlaygrounds.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const unStarred = playgrounds.filter((playground) => !playground.starred);

  const toggleStar = async (id: string, isChecked: boolean) => {
    // Optimistic UI update — turant UI change
    setPlaygrounds((prev) =>
      prev.map((p) => (p.id === id ? { ...p, starred: isChecked } : p)),
    );

    const result = await toggleStarMarked(id, isChecked);

    if (!result.success) {
      // DB update fail hua toh UI revert karo
      setPlaygrounds((prev) =>
        prev.map((p) => (p.id === id ? { ...p, starred: !isChecked } : p)),
      );
      console.error(result.error);
    }
  };

  const hasStarredMatches = filteredStarred.length > 0;
  const hasRecentMatches = filteredRecent.length > 0;

  //for template seclection
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const handleCreatePlayground = async (data: {
    title: string;
    template: "REACT" | "EXPRESS" | "VUE" | "ANGULAR" | "NEXTJS" | "HONO";
    description?: string;
  }) => {
    const res = await createPlayground(data);
    toast.success("Playground created successfully");
    setIsModalOpen(false);
    router.push(`/playground/${res?.id}`);
  };

  return (
    <>
      <Sidebar
        variant="inset"
        collapsible="icon"
        className="border-r border-sidebar-border bg-sidebar/95 backdrop-blur-md"
      >
        {/* Workspace Switcher Header */}
        <SidebarHeader className="border-b border-sidebar-border/40 px-2 py-2.5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="w-full justify-between data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-sidebar-accent/50 transition-colors rounded-lg"
              >
                <div className="flex items-center gap-2.5 text-left">
                  <Image
                    src="/logo.svg"
                    alt="logo"
                    height={40}
                    width={40}
                    className="invert-0 dark:brightness-100"
                  />
                  <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate font-semibold bg-linear-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
                      CodeGenZ
                    </span>
                    <span className="truncate text-[10px] text-muted-foreground font-medium">
                      Personal Workspace
                    </span>
                  </div>
                </div>
                <ChevronsUpDown className="ml-auto size-3.5 text-muted-foreground/75 group-data-[collapsible=icon]:hidden" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg p-1.5"
              align="start"
              side="bottom"
              sideOffset={4}
            >
              <DropdownMenuLabel className="text-[10px] font-semibold text-muted-foreground/80 px-2.5 py-1.5 uppercase tracking-wider">
                Workspaces
              </DropdownMenuLabel>
              <DropdownMenuItem className="gap-2.5 px-2.5 py-2 font-medium cursor-pointer">
                <div className="flex size-6 items-center justify-center rounded-md bg-linear-to-tr from-violet-600 to-indigo-500 text-white text-xs font-semibold">
                  C
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold">CodeGenZ</span>
                  <span className="text-[10px] text-muted-foreground">
                    Personal Workspace
                  </span>
                </div>
                <span className="ml-auto text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold">
                  Pro
                </span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 px-2.5 py-2 text-xs cursor-not-allowed opacity-50" disabled>
                <Plus className="size-4" />
                <span className="text-xs font-medium">
                  Create new workspace (Coming soon...)
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarHeader>

        <SidebarContent className="py-2">
          {/* Main Navigation Group */}
          <SidebarGroup className="py-1">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/"}
                  tooltip="Home"
                  className={cn(
                    "transition-all duration-200 hover:translate-x-0.5 relative overflow-hidden rounded-md",
                    pathname === "/" &&
                      "bg-sidebar-accent font-medium text-sidebar-accent-foreground before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-1 before:rounded-r-md before:bg-primary",
                  )}
                >
                  <Link href="/">
                    <Home className="h-4 w-4 text-muted-foreground group-hover/menu-button:text-foreground transition-colors" />
                    <span>Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/dashboard"}
                  tooltip="Dashboard"
                  className={cn(
                    "transition-all duration-200 hover:translate-x-0.5 relative overflow-hidden rounded-md",
                    pathname === "/dashboard" &&
                      "bg-sidebar-accent font-medium text-sidebar-accent-foreground before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-1 before:rounded-r-md before:bg-primary",
                  )}
                >
                  <Link href="/dashboard">
                    <LayoutDashboard className="h-4 w-4 text-muted-foreground group-hover/menu-button:text-foreground transition-colors" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>

          {/* Real-time Project Search box */}
          <div className="px-3 py-1 mb-2 group-data-[collapsible=icon]:hidden">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground/75" />
              <input
                type="text"
                placeholder="Search playgrounds..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-muted/40 hover:bg-muted/65 focus:bg-background border border-muted-foreground/15 rounded-md py-1.5 pl-8 pr-3 text-xs outline-hidden focus:ring-1 focus:ring-primary/45 focus:border-primary/45 transition-all placeholder:text-muted-foreground/60"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2.5 text-muted-foreground/60 hover:text-foreground text-[10px]"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Starred Playgrounds Group */}
          <SidebarGroup className="py-1">
            <SidebarGroupLabel className="text-[10px] font-semibold text-muted-foreground/80 uppercase tracking-wider flex items-center gap-1.5 px-3 py-1.5">
              <Star className="h-3 w-3 text-yellow-400 fill-amber-300" />
              <span>Starred</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="ml-auto flex items-center justify-center hover:text-foreground transition-colors">
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  side="right"
                  className="w-48"
                >
                  {unStarred.length === 0 ? (
                    <div className="px-2.5 py-2 text-xs text-muted-foreground">
                      No playgrounds to star
                    </div>
                  ) : (
                    unStarred.map((playground) => (
                      <DropdownMenuItem
                        key={playground.id}
                        onClick={() => toggleStar(playground.id, true)}
                        className="text-xs cursor-pointer"
                      >
                        {playground.name}
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {allPlaygrounds.length === 0 ? (
                  <div className="text-center text-xs text-muted-foreground/60 py-4 px-2 group-data-[collapsible=icon]:hidden">
                    Create your playground
                  </div>
                ) : !hasStarredMatches && searchQuery ? null : (
                  filteredStarred.map((playground) => {
                    const IconComponent =
                      lucideIconMap[playground.icon] || Code2;
                    const isActive =
                      pathname === `/playground/${playground.id}`;

                    // Setup dynamic hover styles for the icon
                    const iconClasses = cn(
                      "h-4 w-4 shrink-0 transition-all duration-300",
                      playground.icon === "REACT" &&
                        "group-hover/menu-button:animate-spin-slow",
                      playground.icon === "VUE" &&
                        "group-hover/menu-button:scale-110",
                      playground.icon === "HONO" &&
                        "group-hover/menu-button:scale-110 group-hover/menu-button:drop-shadow-[0_0_4px_rgba(239,68,68,0.5)]",
                      playground.icon === "NEXTJS" &&
                        "group-hover/menu-button:scale-105",
                      playground.icon === "ANGULAR" &&
                        "group-hover/menu-button:scale-110",
                      playground.icon === "EXPRESS" &&
                        "group-hover/menu-button:translate-y-[-1px]",
                    );

                    return (
                      <SidebarMenuItem key={playground.id}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={playground.name}
                          className={cn(
                            "transition-all duration-200 hover:translate-x-0.5 relative overflow-hidden rounded-md",
                            isActive &&
                              "bg-sidebar-accent font-medium text-sidebar-accent-foreground before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-1 before:rounded-r-md before:bg-primary",
                          )}
                        >
                          <Link href={`/playground/${playground.id}`}>
                            {IconComponent && (
                              <IconComponent className={iconClasses} />
                            )}
                            <span className="truncate">{playground.name}</span>
                            <span className="ml-auto text-[9px] font-bold tracking-wider text-muted-foreground/50 bg-muted/40 dark:bg-muted/15 px-1.5 py-0.5 rounded-sm uppercase group-data-[collapsible=icon]:hidden select-none">
                              {playground.icon === "NEXTJS"
                                ? "NEXT"
                                : playground.icon}
                            </span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Recent Playgrounds Group */}
          <SidebarGroup className="py-1">
            <SidebarGroupLabel className="text-[10px] font-semibold text-muted-foreground/80 uppercase tracking-wider flex items-center gap-1.5 px-3 py-1.5">
              <History className="h-3 w-3 text-white" />
              <span>Recent</span>
            </SidebarGroupLabel>
            <SidebarGroupAction
              title="Create new playground"
              onClick={() => setIsModalOpen(true)}
            >
              <FolderPlus className="h-3.5 w-3.5 hover:text-yellow-500" />
            </SidebarGroupAction>
            <SidebarGroupContent>
              <SidebarMenu>
                {recentPlaygrounds.length === 0
                  ? null
                  : !hasRecentMatches && searchQuery
                    ? null
                    : filteredRecent.map((playground) => {
                        const IconComponent =
                          lucideIconMap[playground.icon] || Code2;
                        const isActive =
                          pathname === `/playground/${playground.id}`;

                        const iconClasses = cn(
                          "h-4 w-4 shrink-0 transition-all duration-300",
                          playground.icon === "REACT" &&
                            "group-hover/menu-button:animate-spin-slow",
                          playground.icon === "VUE" &&
                            "group-hover/menu-button:scale-110",
                          playground.icon === "HONO" &&
                            "group-hover/menu-button:scale-110 group-hover/menu-button:drop-shadow-[0_0_4px_rgba(239,68,68,0.5)]",
                          playground.icon === "NEXTJS" &&
                            "group-hover/menu-button:scale-105",
                          playground.icon === "ANGULAR" &&
                            "group-hover/menu-button:scale-110",
                          playground.icon === "EXPRESS" &&
                            "group-hover/menu-button:translate-y-[-1px]",
                        );

                        return (
                          <SidebarMenuItem key={playground.id}>
                            <SidebarMenuButton
                              asChild
                              isActive={isActive}
                              tooltip={playground.name}
                              className={cn(
                                "transition-all duration-200 hover:translate-x-0.5 relative overflow-hidden rounded-md",
                                isActive &&
                                  "bg-sidebar-accent font-medium text-sidebar-accent-foreground before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-1 before:rounded-r-md before:bg-primary",
                              )}
                            >
                              <Link href={`/playground/${playground.id}`}>
                                {IconComponent && (
                                  <IconComponent className={iconClasses} />
                                )}
                                <span className="truncate">
                                  {playground.name}
                                </span>
                                <span className="ml-auto text-[9px] font-bold tracking-wider text-muted-foreground/50 bg-muted/40 dark:bg-muted/15 px-1.5 py-0.5 rounded-sm uppercase group-data-[collapsible=icon]:hidden select-none">
                                  {playground.icon === "NEXTJS"
                                    ? "NEXT"
                                    : playground.icon}
                                </span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                {/* No search results fallback */}
                {searchQuery && !hasStarredMatches && !hasRecentMatches && (
                  <div className="text-center text-xs text-muted-foreground/60 py-6 px-4 group-data-[collapsible=icon]:hidden">
                    No projects found matching &ldquo;{searchQuery}&rdquo;
                  </div>
                )}
                //todo work on future
                {/* <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    tooltip="View all"
                    className="transition-all duration-200 hover:translate-x-0.5"
                  >
                    <Link href="/playgrounds">
                      <span className="text-xs font-medium text-muted-foreground hover:text-foreground">
                        View all playgrounds
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem> */}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* User Profile Footer Dropdown Widget */}
        <SidebarFooter className="border-t border-sidebar-border/40 p-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="w-full justify-between data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-sidebar-accent/50 transition-colors rounded-lg"
                  >
                    <div className="flex items-center gap-2.5 text-left">
                      <Avatar className="size-8 rounded-lg shadow-sm border border-border/50">
                        {user?.image ? (
                          <AvatarImage
                            src={user.image}
                            alt={user.name || "User avatar"}
                          />
                        ) : null}
                        <AvatarFallback className="rounded-lg bg-linear-to-tr from-violet-500/20 to-indigo-500/20 text-violet-700 dark:text-violet-300 text-xs font-semibold">
                          {user?.name
                            ? user.name.slice(0, 2).toUpperCase()
                            : "US"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-xs leading-tight group-data-[collapsible=icon]:hidden">
                        <span className="truncate font-semibold text-foreground">
                          {user?.name || "User Account"}
                        </span>
                        <span className="truncate text-[10px] text-muted-foreground">
                          {user?.email || "personal@codegenz.dev"}
                        </span>
                      </div>
                    </div>
                    <ChevronsUpDown className="ml-auto size-3.5 text-muted-foreground/75 group-data-[collapsible=icon]:hidden" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg p-1.5"
                  side="top"
                  align="start"
                  sideOffset={8}
                >
                  <div className="flex items-center gap-2.5 px-2.5 py-2">
                    <Avatar className="size-8 rounded-lg">
                      {user?.image ? (
                        <AvatarImage
                          src={user.image}
                          alt={user.name || "User avatar"}
                        />
                      ) : null}
                      <AvatarFallback className="rounded-lg bg-linear-to-tr from-violet-500/20 to-indigo-500/20 text-violet-700 dark:text-violet-300 text-xs font-semibold">
                        {user?.name
                          ? user.name.slice(0, 2).toUpperCase()
                          : "US"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-xs leading-tight">
                      <span className="truncate font-semibold text-foreground">
                        {user?.name || "User Account"}
                      </span>
                      <span className="truncate text-[10px] text-muted-foreground">
                        {user?.email || "personal@codegenz.dev"}
                      </span>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem className="gap-2 px-2.5 py-2 cursor-pointer text-xs">
                      <User className="text-yellow-300"></User>
                      <Link href="/profile">
                      <span className="font-medium text-foreground">
                        My Profile
                      </span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem className="gap-2 px-2.5 py-2 cursor-pointer text-xs">
                      <Link href="/myPlaygrounds" className="flex items-center gap-2">
                      <PlaySquare className="text-red-600"></PlaySquare>
                      <span className="font-medium text-foreground">
                        My Playgrounds
                      </span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem className="gap-2 px-2.5 py-2 text-xs cursor-not-allowed opacity-50" disabled>
                      <Sparkles className="size-4 text-violet-500 animate-pulse" />
                      <span className="font-medium text-foreground">
                        Upgrade to Pro ( Coming soon...)
                      </span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      asChild
                      className="gap-2 px-2.5 py-2 cursor-pointer text-xs"
                    >
                      <Link href="/profile/edit">
                        <Settings className="size-4" />
                        <span>Edit Profile</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="gap-2 px-2.5 py-2 cursor-pointer text-xs text-rose-500 focus:bg-rose-50/50 dark:focus:bg-rose-950/20 focus:text-rose-600 dark:focus:text-rose-400"
                  >
                    <LogOut className="size-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <TemplateSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreatePlayground}
      />
    </>
  );
}
