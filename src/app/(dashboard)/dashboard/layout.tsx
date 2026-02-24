import { SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar";
import { AppSidebar } from "./_components/app-sidebar";
import { Separator } from "~/components/ui/separator";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex flex-1 flex-col">
        <header className="bg-background/80 sticky top-0 z-10 flex h-14 items-center gap-2 border-b px-4 backdrop-blur-md">
          <SidebarTrigger className="-ml-2" />
          <Separator orientation="vertical" className="h-6" />
        </header>
        <div className="flex-1 overflow-auto p-6">{children}</div>
      </main>
    </SidebarProvider>
  );
}
