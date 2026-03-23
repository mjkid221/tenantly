import { api, HydrateClient } from "~/trpc/server";
import { PropertyList } from "./_components/property-list";

export const dynamic = "force-dynamic";

export const metadata = { title: "Properties - Tenantly" };

export default async function PropertiesPage() {
  void api.properties.list.prefetch();
  void api.user.me.prefetch();
  void api.properties.getImageUrl.prefetch({ storagePath: "" });

  return (
    <HydrateClient>
      <PropertyList />
    </HydrateClient>
  );
}
