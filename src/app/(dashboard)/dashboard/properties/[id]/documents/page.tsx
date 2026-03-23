import { api, HydrateClient } from "~/trpc/server";
import { DocumentList } from "./_components/document-list";

export const dynamic = "force-dynamic";

export const metadata = { title: "Documents - Tenantly" };

export default async function DocumentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const propertyId = Number(id);

  void api.properties.getById.prefetch({ id: propertyId });
  void api.documents.listByProperty.prefetch({ propertyId });
  void api.user.me.prefetch();

  return (
    <HydrateClient>
      <DocumentList propertyId={propertyId} />
    </HydrateClient>
  );
}
