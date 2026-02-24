import type { RouterOutputs } from "~/trpc/react";

export type PropertyData = NonNullable<RouterOutputs["properties"]["getById"]>;
export type PropertyImage = PropertyData["images"][number];
export type PropertyTenant = PropertyData["tenants"][number];

export interface PropertyDetailViewProps {
  property: PropertyData | undefined;
  isLoading: boolean;
  isAdmin: boolean;
  imageBaseUrl: string | null;
  onDeleteProperty: () => void;
  isDeleting: boolean;
  onRemoveImage: (imageId: number) => void;
  isRemovingImage: boolean;
  showDeleteDialog: boolean;
  setShowDeleteDialog: (open: boolean) => void;
}
