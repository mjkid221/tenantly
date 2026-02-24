"use client";

import { useTenantManager } from "./tenant-manager.hook";
import { TenantManagerView } from "./tenant-manager.view";

interface TenantManagerProps {
  propertyId: number;
}

export function TenantManager({ propertyId }: TenantManagerProps) {
  const props = useTenantManager(propertyId);
  return <TenantManagerView {...props} />;
}
