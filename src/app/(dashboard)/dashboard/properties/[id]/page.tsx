import { api, HydrateClient } from "~/trpc/server";
import { PropertyDetail } from "./_components/property-detail";

export const dynamic = "force-dynamic";

export const metadata = { title: "Property Details - Tenantly" };

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const propertyId = Number(id);

  void api.properties.getById.prefetch({ id: propertyId });
  void api.user.me.prefetch();
  void api.properties.getImageUrl.prefetch({ storagePath: "" });
  void api.contracts.listByProperty.prefetch({ propertyId });
  void api.invoices.list.prefetch({ propertyId });
  void api.documents.listByProperty.prefetch({ propertyId });

  return (
    <HydrateClient>
      <PropertyDetail propertyId={propertyId} />
    </HydrateClient>
  );
}
