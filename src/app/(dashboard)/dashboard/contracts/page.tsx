import { api, HydrateClient } from "~/trpc/server";
import { ContractOverview } from "./_components/contract-overview";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Contracts - Property Manager",
};

export default async function ContractsPage() {
  void api.properties.list.prefetch();

  return (
    <HydrateClient>
      <ContractOverview />
    </HydrateClient>
  );
}
