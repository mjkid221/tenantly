"use client";

import { useInvoiceList } from "./invoice-list.hook";
import { InvoiceListView } from "./invoice-list.view";

interface InvoiceListProps {
  propertyId: number;
}

export function InvoiceList({ propertyId }: InvoiceListProps) {
  const props = useInvoiceList(propertyId);
  return <InvoiceListView {...props} />;
}
