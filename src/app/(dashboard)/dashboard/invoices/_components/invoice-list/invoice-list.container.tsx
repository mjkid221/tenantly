"use client";

import { useInvoiceList } from "./invoice-list.hook";
import { InvoiceListView } from "./invoice-list.view";

export function InvoiceList() {
  const props = useInvoiceList();
  return <InvoiceListView {...props} />;
}
