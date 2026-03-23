import { api, HydrateClient } from "~/trpc/server";
import { TenantManager } from "./_components/tenant-manager";

export const dynamic = "force-dynamic";

export const metadata = { title: "Tenants - Tenantly" };

export default async function TenantsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const propertyId = Number(id);

  void api.properties.getById.prefetch({ id: propertyId });
  void api.properties.listTenants.prefetch({ propertyId });
  void api.user.me.prefetch();

  return (
    <HydrateClient>
      <TenantManager propertyId={propertyId} />
    </HydrateClient>
  );
}
