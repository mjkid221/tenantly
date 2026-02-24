"use client";

import { useAdminPanel } from "./admin-panel.hook";
import { AdminPanelView } from "./admin-panel.view";

export function AdminPanel() {
  const props = useAdminPanel();
  return <AdminPanelView {...props} />;
}
