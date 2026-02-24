import { api, HydrateClient } from "~/trpc/server";
import { InvoiceList } from "./_components/invoice-list";

export const dynamic = "force-dynamic";

export const metadata = { title: "Invoices - Property Manager" };

export default async function InvoicesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const propertyId = Number(id);

  void api.properties.getById.prefetch({ id: propertyId });
  void api.invoices.list.prefetch({ propertyId });
  void api.user.me.prefetch();

  return (
    <HydrateClient>
      <InvoiceList propertyId={propertyId} />
    </HydrateClient>
  );
}
