"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderOpen,
  PlusCircle,
  Sparkles,
  ChevronRight,
  History,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserButton } from "@clerk/nextjs";
import { ScrollArea } from "@/components/ui/scroll-area";

const NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/projects",
    label: "Projects",
    icon: FolderOpen,
  },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex h-full w-60 flex-col border-r border-border bg-sidebar",
        className
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 border-b border-border px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
          <Sparkles className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="font-semibold text-sm tracking-tight text-sidebar-foreground">
          AI Use Case Finder
        </span>
      </div>

      <ScrollArea className="flex-1 py-3">
        <nav className="px-2 space-y-0.5">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive =
              pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "group flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
                {isActive && (
                  <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-60" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-4 px-4">
          <div className="border-t border-sidebar-border pt-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">
              Quick Actions
            </p>
            <Link
              href="/projects/new"
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname === "/projects/new"
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <PlusCircle className="h-4 w-4 shrink-0" />
              New Analysis
            </Link>
            <Link
              href="/projects"
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors mt-0.5",
                pathname.includes("/history")
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <History className="h-4 w-4 shrink-0" />
              Analysis History
            </Link>
          </div>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-8 w-8",
              },
            }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-sidebar-foreground truncate">
              Account
            </p>
            <p className="text-xs text-muted-foreground truncate">Settings</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
