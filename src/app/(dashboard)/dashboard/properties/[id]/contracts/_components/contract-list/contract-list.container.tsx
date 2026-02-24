"use client";

import { useContractList } from "./contract-list.hook";
import { ContractListView } from "./contract-list.view";

interface ContractListProps {
  propertyId: number;
}

export function ContractList({ propertyId }: ContractListProps) {
  const props = useContractList(propertyId);
  return <ContractListView {...props} />;
}
