import { InvoiceList } from "./_components/invoice-list";

export const metadata = { title: "Invoices - Property Manager" };

export default async function InvoicesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const propertyId = Number(id);

  return <InvoiceList propertyId={propertyId} />;
}
