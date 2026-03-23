import { api, HydrateClient } from "~/trpc/server";
import { SettingsForm } from "./_components/settings-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Settings - Tenantly",
};

export default async function SettingsPage() {
  void api.user.me.prefetch();

  return (
    <HydrateClient>
      <SettingsForm />
    </HydrateClient>
  );
}
