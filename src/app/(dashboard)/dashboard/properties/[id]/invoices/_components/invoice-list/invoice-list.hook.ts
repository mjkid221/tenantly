"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { toast } from "sonner";

export function useInvoiceList(propertyId: number) {
  const router = useRouter();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: property, isLoading: isLoadingProperty } =
    api.properties.getById.useQuery(
      { id: propertyId },
      { enabled: !isNaN(propertyId) },
    );

  const { data: invoices, isLoading: isLoadingInvoices } =
    api.invoices.list.useQuery({ propertyId }, { enabled: !isNaN(propertyId) });

  const { data: tenants } = api.properties.listTenants.useQuery(
    { propertyId },
    { enabled: !isNaN(propertyId) },
  );

  const { data: me, isLoading: isLoadingMe } = api.user.me.useQuery();

  const utils = api.useUtils();
  const isAdmin = me?.role === "admin";

  const createInvoice = api.invoices.create.useMutation({
    onSuccess: (data) => {
      toast.success("Invoice created");
      setIsCreateDialogOpen(false);
      void utils.invoices.list.invalidate({ propertyId });
      if (data) router.push(`/dashboard/invoices/${data.id}`);
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to create invoice");
    },
  });

  const onCreateInvoice = (values: {
    propertyTenantId?: number;
    billingPeriodStart: string;
    billingPeriodEnd: string;
    label?: string;
  }) => {
    createInvoice.mutate({
      propertyId,
      ...values,
    });
  };

  return {
    propertyId,
    propertyName: property?.name,
    invoices: invoices ?? [],
    isLoading: isLoadingProperty || isLoadingInvoices || isLoadingMe,
    isAdmin,
    tenants: (tenants ?? [])
      .filter((t) => t.isActive)
      .map((t) => ({
        id: t.id,
        email: t.email,
        fullName: t.user?.fullName ?? null,
      })),
    isCreateDialogOpen,
    onCreateDialogOpenChange: setIsCreateDialogOpen,
    onCreateInvoice,
    isCreating: createInvoice.isPending,
  };
}
