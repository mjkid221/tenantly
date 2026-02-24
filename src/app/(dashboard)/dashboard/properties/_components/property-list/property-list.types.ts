import type { RouterOutputs } from "~/trpc/react";

export type Property = RouterOutputs["properties"]["list"][number];

export interface PropertyListViewProps {
  properties: Property[];
  isLoading: boolean;
  isAdmin: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  imageBaseUrl: string | null;
}
