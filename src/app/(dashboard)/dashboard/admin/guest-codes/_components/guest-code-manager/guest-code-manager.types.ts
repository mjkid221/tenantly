import type { RouterOutputs } from "~/trpc/react";

export type GuestCode = RouterOutputs["admin"]["listGuestCodes"][number];

export const ALLOWED_SECTIONS = [
  { value: "property_details", label: "Property Details" },
  { value: "contracts", label: "Contracts" },
  { value: "invoices", label: "Invoices" },
] as const;

export interface CreateGuestCodeFormValues {
  propertyId: number;
  label: string;
  expiresAt: string;
  allowedSections: string[];
}

export interface GuestCodeManagerViewProps {
  guestCodes: GuestCode[];
  isLoading: boolean;
  properties: { id: number; name: string }[];
  propertiesLoading: boolean;

  // Create
  isCreateDialogOpen: boolean;
  onCreateDialogOpenChange: (open: boolean) => void;
  onCreateGuestCode: (values: CreateGuestCodeFormValues) => void;
  isCreating: boolean;

  // Toggle
  onToggleEnabled: (id: number, isEnabled: boolean) => void;
  isToggling: boolean;

  // Delete
  onDeleteGuestCode: (id: number) => void;
  isDeleting: boolean;

  // Copy
  onCopyUrl: (code: string) => void;
}
