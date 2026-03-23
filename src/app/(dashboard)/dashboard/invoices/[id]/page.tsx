import { api, HydrateClient } from "~/trpc/server";
import { InvoiceDetail } from "./_components/invoice-detail";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Invoice Detail - Tenantly",
};

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invoiceId = Number(id);

  void api.invoices.getById.prefetch({ id: invoiceId });
  void api.user.me.prefetch();
  void api.invoices.listCategories.prefetch();
  void api.payments.getStatus.prefetch({ invoiceId });

  return (
    <HydrateClient>
      <InvoiceDetail invoiceId={invoiceId} />
    </HydrateClient>
  );
}
