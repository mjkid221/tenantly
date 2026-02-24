import type { RouterOutputs } from "~/trpc/react";

export type PropertyTenant = RouterOutputs["properties"]["listTenants"][number];

export interface TenantManagerViewProps {
  propertyId: number;
  propertyName: string | undefined;
  tenants: PropertyTenant[];
  isLoading: boolean;
  isAdmin: boolean;
  // Add tenant
  showAddDialog: boolean;
  setShowAddDialog: (open: boolean) => void;
  onAddTenant: (email: string, moveInDate?: string) => void;
  isAddingTenant: boolean;
  // Remove tenant
  showRemoveDialog: boolean;
  setShowRemoveDialog: (open: boolean) => void;
  tenantToRemove: PropertyTenant | null;
  onConfirmRemove: () => void;
  onRequestRemove: (tenant: PropertyTenant) => void;
  isRemovingTenant: boolean;
}
