"use client";

import { api } from "~/trpc/react";

export function useContractOverview() {
  const { data: properties, isLoading } = api.properties.list.useQuery();

  return {
    properties: properties ?? [],
    isLoading,
  };
}
