import type { RouterOutputs } from "~/trpc/react";

export type GuestValidation = RouterOutputs["guest"]["validateCode"];
export type GuestPropertyDetails = RouterOutputs["guest"]["getPropertyDetails"];
export type GuestContract = RouterOutputs["guest"]["getContract"];

export interface GuestPropertyViewProps {
  validation: GuestValidation | undefined;
  property: GuestPropertyDetails | undefined;
  contract: GuestContract | null | undefined;
  isLoading: boolean;
  error: string | null;
  allowedSections: string[];
}
