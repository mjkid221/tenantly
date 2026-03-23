import type { RouterOutputs } from "~/trpc/react";

export type Invoice = RouterOutputs["invoices"]["list"][number];

export type InvoiceStatus = "draft" | "issued" | "partially_paid" | "paid";

export interface InvoiceListViewProps {
  propertyId: number;
  propertyName: string | undefined;
  invoices: Invoice[];
  isLoading: boolean;
  isAdmin: boolean;
  tenants: Array<{ id: number; email: string; fullName: string | null }>;
  isCreateDialogOpen: boolean;
  onCreateDialogOpenChange: (open: boolean) => void;
  onCreateInvoice: (values: {
    propertyTenantId?: number;
    billingPeriodStart: string;
    billingPeriodEnd: string;
    label?: string;
  }) => void;
  isCreating: boolean;
}
