"use client";

import { usePathname, useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "~/lib/supabase/client";
import { api } from "~/trpc/react";
import type { NavItem } from "./app-sidebar.types";

const allNavItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: "layout-dashboard" },
  { title: "Properties", href: "/dashboard/properties", icon: "building-2" },
  { title: "Invoices", href: "/dashboard/invoices", icon: "receipt" },
  { title: "Contracts", href: "/dashboard/contracts", icon: "file-text" },
  { title: "Admin", href: "/dashboard/admin", icon: "shield", adminOnly: true },
  {
    title: "Guest Codes",
    href: "/dashboard/admin/guest-codes",
    icon: "key",
    adminOnly: true,
  },
  { title: "Settings", href: "/dashboard/settings", icon: "settings" },
];

export function useAppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const { data: user } = api.user.me.useQuery();

  const role = user?.role ?? "tenant";

  const navItems = allNavItems.filter(
    (item) => !item.adminOnly || role === "admin",
  );

  const onSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return {
    navItems,
    role,
    userName: user?.fullName ?? null,
    userEmail: user?.email ?? "",
    userAvatar: user?.avatarUrl ?? null,
    pathname,
    onSignOut,
  };
}
