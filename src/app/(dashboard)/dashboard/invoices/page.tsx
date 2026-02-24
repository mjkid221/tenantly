import { api, HydrateClient } from "~/trpc/server";
import { InvoiceList } from "./_components/invoice-list";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Invoices - Property Manager",
};

export default async function InvoicesPage() {
  void api.invoices.list.prefetch();
  void api.properties.list.prefetch();
  void api.user.me.prefetch();

  return (
    <HydrateClient>
      <InvoiceList />
    </HydrateClient>
  );
}
