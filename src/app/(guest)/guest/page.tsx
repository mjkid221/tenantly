import { Suspense } from "react";
import { GuestEntry } from "./_components/guest-entry";

export const metadata = {
  title: "Guest Access - Tenantly",
};

export default function GuestPage() {
  return (
    <Suspense>
      <GuestEntry />
    </Suspense>
  );
}
