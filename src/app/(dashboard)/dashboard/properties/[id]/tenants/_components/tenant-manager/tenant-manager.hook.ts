"use client";

import { useState } from "react";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import type { PropertyTenant } from "./tenant-manager.types";

export function useTenantManager(propertyId: number) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [tenantToRemove, setTenantToRemove] = useState<PropertyTenant | null>(
    null,
  );

  const utils = api.useUtils();

  const { data: property, isLoading: isLoadingProperty } =
    api.properties.getById.useQuery(
      { id: propertyId },
      { enabled: !isNaN(propertyId) },
    );

  const { data: tenants, isLoading: isLoadingTenants } =
    api.properties.listTenants.useQuery(
      { propertyId },
      { enabled: !isNaN(propertyId) },
    );

  const { data: me, isLoading: isLoadingMe } = api.user.me.useQuery();

  const assignMutation = api.properties.assignTenant.useMutation({
    onSuccess: async () => {
      await utils.properties.listTenants.invalidate({ propertyId });
      await utils.properties.getById.invalidate({ id: propertyId });
      setShowAddDialog(false);
      toast.success("Tenant assigned successfully");
    },
    onError: (error) => {
      toast.error(`Failed to assign tenant: ${error.message}`);
    },
  });

  const removeMutation = api.properties.removeTenant.useMutation({
    onMutate: async (variables) => {
      await utils.properties.listTenants.cancel({ propertyId });
      const previous = utils.properties.listTenants.getData({ propertyId });
      utils.properties.listTenants.setData({ propertyId }, (old) => {
        if (!old) return old;
        return old.filter((t) => t.id !== variables.propertyTenantId);
      });
      return { previous };
    },
    onSuccess: () => {
      setShowRemoveDialog(false);
      setTenantToRemove(null);
      toast.success("Tenant removed successfully");
    },
    onError: (error, _vars, context) => {
      if (context?.previous) {
        utils.properties.listTenants.setData({ propertyId }, context.previous);
      }
      toast.error(`Failed to remove tenant: ${error.message}`);
    },
    onSettled: () => {
      void utils.properties.listTenants.invalidate({ propertyId });
      void utils.properties.getById.invalidate({ id: propertyId });
    },
  });

  const isAdmin = me?.role === "admin";

  const onAddTenant = (email: string, moveInDate?: string) => {
    assignMutation.mutate({
      propertyId,
      email,
      moveInDate: moveInDate ?? undefined,
    });
  };

  const onRequestRemove = (tenant: PropertyTenant) => {
    setTenantToRemove(tenant);
    setShowRemoveDialog(true);
  };

  const onConfirmRemove = () => {
    if (tenantToRemove) {
      removeMutation.mutate({ propertyTenantId: tenantToRemove.id });
    }
  };

  return {
    propertyId,
    propertyName: property?.name,
    tenants: tenants ?? [],
    isLoading: isLoadingProperty || isLoadingTenants || isLoadingMe,
    isAdmin,
    showAddDialog,
    setShowAddDialog,
    onAddTenant,
    isAddingTenant: assignMutation.isPending,
    showRemoveDialog,
    setShowRemoveDialog,
    tenantToRemove,
    onConfirmRemove,
    onRequestRemove,
    isRemovingTenant: removeMutation.isPending,
  };
}
