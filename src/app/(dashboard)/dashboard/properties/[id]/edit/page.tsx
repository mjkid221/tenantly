import { EditPropertyWrapper } from "./_components/edit-property-wrapper";

export const metadata = { title: "Edit Property - Property Manager" };

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const propertyId = Number(id);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Property</h1>
        <p className="text-muted-foreground">
          Update the property details below.
        </p>
      </div>
      <EditPropertyWrapper propertyId={propertyId} />
    </div>
  );
}
