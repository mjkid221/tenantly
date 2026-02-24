import type { RouterOutputs } from "~/trpc/react";

export type Invoice = RouterOutputs["invoices"]["list"][number];

export type InvoiceStatus = "draft" | "issued" | "partially_paid" | "paid";

export interface InvoiceListViewProps {
  propertyId: number;
  propertyName: string | undefined;
  invoices: Invoice[];
  isLoading: boolean;
  isAdmin: boolean;
}
