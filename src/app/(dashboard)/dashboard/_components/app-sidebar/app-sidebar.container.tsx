"use client";

import { useAppSidebar } from "./app-sidebar.hook";
import { AppSidebarView } from "./app-sidebar.view";

export function AppSidebar() {
  const props = useAppSidebar();
  return <AppSidebarView {...props} />;
}
