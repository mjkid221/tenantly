import { api, HydrateClient } from "~/trpc/server";
import { DashboardHome } from "./_components/dashboard-home";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard - Tenantly",
};

export default async function DashboardPage() {
  const user = await api.user.me();

  void api.properties.list.prefetch();
  void api.invoices.list.prefetch();

  return (
    <HydrateClient>
      <DashboardHome role={user.role} userName={user.fullName} />
    </HydrateClient>
  );
}
