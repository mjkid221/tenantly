import type { RouterOutputs } from "~/trpc/react";

export type Property = RouterOutputs["properties"]["list"][number];

export interface PropertyWithContract {
  property: Property;
  latestContract: {
    id: number;
    version: number;
    fileName: string;
    createdAt: Date;
  } | null;
  contractCount: number;
}

export interface ContractOverviewViewProps {
  properties: Property[];
  isLoading: boolean;
}
