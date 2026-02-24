"use client";

import { api } from "~/trpc/react";

export function useInvoiceList(propertyId: number) {
  const { data: property, isLoading: isLoadingProperty } =
    api.properties.getById.useQuery(
      { id: propertyId },
      { enabled: !isNaN(propertyId) },
    );

  const { data: invoices, isLoading: isLoadingInvoices } =
    api.invoices.list.useQuery(
      { propertyId },
      { enabled: !isNaN(propertyId) },
    );

  const { data: me, isLoading: isLoadingMe } = api.user.me.useQuery();

  const isAdmin = me?.role === "admin";

  return {
    propertyId,
    propertyName: property?.name,
    invoices: invoices ?? [],
    isLoading: isLoadingProperty || isLoadingInvoices || isLoadingMe,
    isAdmin,
  };
}
