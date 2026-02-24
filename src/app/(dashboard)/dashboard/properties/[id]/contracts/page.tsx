import { api, HydrateClient } from "~/trpc/server";
import { ContractList } from "./_components/contract-list";

export const dynamic = "force-dynamic";

export const metadata = { title: "Contracts - Property Manager" };

export default async function ContractsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const propertyId = Number(id);

  void api.properties.getById.prefetch({ id: propertyId });
  void api.contracts.listByProperty.prefetch({ propertyId });
  void api.user.me.prefetch();

  return (
    <HydrateClient>
      <ContractList propertyId={propertyId} />
    </HydrateClient>
  );
}
