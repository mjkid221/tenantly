import { TenantManager } from "./_components/tenant-manager";

export const metadata = { title: "Tenants - Property Manager" };

export default async function TenantsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const propertyId = Number(id);

  return <TenantManager propertyId={propertyId} />;
}
