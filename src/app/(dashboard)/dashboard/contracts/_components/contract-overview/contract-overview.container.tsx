"use client";

import { useContractOverview } from "./contract-overview.hook";
import { ContractOverviewView } from "./contract-overview.view";

export function ContractOverview() {
  const props = useContractOverview();
  return <ContractOverviewView {...props} />;
}
