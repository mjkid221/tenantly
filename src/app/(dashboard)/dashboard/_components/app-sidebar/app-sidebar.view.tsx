"use client";

import Link from "next/link";
import {
  Building2,
  FileText,
  Key,
  LayoutDashboard,
  LogOut,
  Receipt,
  Settings,
  Shield,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { AnimatedThemeToggler } from "~/components/ui/animated-theme-toggler";
import type { AppSidebarViewProps } from "./app-sidebar.types";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "layout-dashboard": LayoutDashboard,
  "building-2": Building2,
  receipt: Receipt,
  "file-text": FileText,
  shield: Shield,
  key: Key,
  settings: Settings,
};

export function AppSidebarView({
  navItems,
  role,
  userName,
  userEmail,
  userAvatar,
  pathname,
  onSignOut,
}: AppSidebarViewProps) {
  const initials =
    userName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? userEmail.slice(0, 2).toUpperCase();

  return (
    <Sidebar>
      <SidebarHeader className="h-14 justify-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="from-primary to-primary/80 flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br shadow-sm">
            <Building2 className="text-primary-foreground h-4 w-4" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">Tenantly</span>
            <Badge variant="secondary" className="rounded-full text-[10px]">
              {role}
            </Badge>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = iconMap[item.icon] ?? LayoutDashboard;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" &&
                    pathname.startsWith(item.href));

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link
                        href={item.href}
                        className="transition-colors duration-200"
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="hover:bg-sidebar-accent flex min-w-0 flex-1 items-center gap-3 rounded-xl p-2 text-left text-sm transition-colors duration-200">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={userAvatar ?? undefined} />
                  <AvatarFallback className="text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {userName ?? userEmail}
                  </p>
                  {userName && (
                    <p className="text-muted-foreground truncate text-xs">
                      {userEmail}
                    </p>
                  )}
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <AnimatedThemeToggler className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground inline-flex size-8 shrink-0 items-center justify-center rounded-md transition-colors" />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
