import { PropertyDetail } from "./_components/property-detail";

export const metadata = { title: "Property Details - Property Manager" };

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const propertyId = Number(id);

  return <PropertyDetail propertyId={propertyId} />;
}
