"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import type { CreateInvoiceFormValues, InvoiceStatus } from "./invoice-list.types";

export function useInvoiceList() {
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "all">("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: user } = api.user.me.useQuery();
  const { data: invoices, isLoading } = api.invoices.list.useQuery();
  const { data: properties, isLoading: propertiesLoading } =
    api.properties.list.useQuery();

  const utils = api.useUtils();
  const createInvoice = api.invoices.create.useMutation({
    onSuccess: () => {
      toast.success("Invoice created successfully");
      setIsCreateDialogOpen(false);
      void utils.invoices.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to create invoice");
    },
  });

  const isAdmin = user?.role === "admin";

  const filteredInvoices = (invoices ?? []).filter((invoice) => {
    if (statusFilter === "all") return true;
    return invoice.status === statusFilter;
  });

  const onCreateInvoice = (values: CreateInvoiceFormValues) => {
    createInvoice.mutate({
      propertyId: values.propertyId,
      billingPeriodStart: values.billingPeriodStart,
      billingPeriodEnd: values.billingPeriodEnd,
      label: values.label || undefined,
    });
  };

  return {
    invoices: filteredInvoices,
    isLoading,
    isAdmin,
    statusFilter,
    onStatusFilterChange: setStatusFilter,
    isCreateDialogOpen,
    onCreateDialogOpenChange: setIsCreateDialogOpen,
    properties: (properties ?? []).map((p) => ({ id: p.id, name: p.name })),
    propertiesLoading,
    onCreateInvoice,
    isCreating: createInvoice.isPending,
  };
}
