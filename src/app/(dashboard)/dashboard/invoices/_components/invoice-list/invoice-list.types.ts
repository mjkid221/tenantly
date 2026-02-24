import type { RouterOutputs } from "~/trpc/react";

export type Invoice = RouterOutputs["invoices"]["list"][number];

export type InvoiceStatus = "draft" | "issued" | "partially_paid" | "paid";

export interface PropertyTenantOption {
  id: number;
  email: string;
  fullName: string | null;
}

export interface PropertyOption {
  id: number;
  name: string;
  tenants: PropertyTenantOption[];
}

export interface CreateInvoiceFormValues {
  propertyId: number;
  propertyTenantId?: number;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  label: string;
}

export interface InvoiceListViewProps {
  invoices: Invoice[];
  isLoading: boolean;
  isAdmin: boolean;
  statusFilter: InvoiceStatus | "all";
  onStatusFilterChange: (status: InvoiceStatus | "all") => void;
  isCreateDialogOpen: boolean;
  onCreateDialogOpenChange: (open: boolean) => void;
  properties: PropertyOption[];
  propertiesLoading: boolean;
  onCreateInvoice: (values: CreateInvoiceFormValues) => void;
  isCreating: boolean;
}
