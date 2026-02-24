export interface NavItem {
  title: string;
  href: string;
  icon: string;
  adminOnly?: boolean;
}

export interface AppSidebarViewProps {
  navItems: NavItem[];
  role: "admin" | "tenant";
  userName: string | null;
  userEmail: string;
  userAvatar: string | null;
  pathname: string;
  onSignOut: () => void;
}
