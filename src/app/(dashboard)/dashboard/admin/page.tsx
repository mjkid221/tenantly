import { api, HydrateClient } from "~/trpc/server";
import { AdminPanel } from "./_components/admin-panel";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Panel - Property Manager",
};

export default async function AdminPage() {
  void api.admin.listAdmins.prefetch();
  void api.invoices.listCategories.prefetch();

  return (
    <HydrateClient>
      <AdminPanel />
    </HydrateClient>
  );
}
