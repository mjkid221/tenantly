import { api, HydrateClient } from "~/trpc/server";
import { GuestCodeManager } from "./_components/guest-code-manager";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Guest Codes - Tenantly",
};

export default async function GuestCodesPage() {
  void api.admin.listGuestCodes.prefetch();
  void api.properties.list.prefetch();

  return (
    <HydrateClient>
      <GuestCodeManager />
    </HydrateClient>
  );
}
