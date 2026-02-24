import { GuestPropertyView } from "./_components/guest-property-view";

export const metadata = {
  title: "Guest Property View - Property Manager",
};

export default async function GuestCodePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return <GuestPropertyView code={code} />;
}
