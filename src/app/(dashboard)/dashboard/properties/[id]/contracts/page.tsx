import { ContractList } from "./_components/contract-list";

export const metadata = { title: "Contracts - Property Manager" };

export default async function ContractsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const propertyId = Number(id);

  return <ContractList propertyId={propertyId} />;
}
