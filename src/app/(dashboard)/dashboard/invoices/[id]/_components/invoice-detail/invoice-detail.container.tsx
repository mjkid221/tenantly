"use client";

import { useInvoiceDetail } from "./invoice-detail.hook";
import { InvoiceDetailView } from "./invoice-detail.view";

interface InvoiceDetailProps {
  invoiceId: number;
}

export function InvoiceDetail({ invoiceId }: InvoiceDetailProps) {
  const props = useInvoiceDetail(invoiceId);
  return <InvoiceDetailView {...props} />;
}
