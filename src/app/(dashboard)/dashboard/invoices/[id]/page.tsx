import { InvoiceDetail } from "./_components/invoice-detail";

export const metadata = {
  title: "Invoice Detail - Property Manager",
};

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <InvoiceDetail invoiceId={Number(id)} />;
}
