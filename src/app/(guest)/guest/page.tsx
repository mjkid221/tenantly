import { Suspense } from "react";
import { GuestEntry } from "./_components/guest-entry";

export const metadata = {
  title: "Guest Access - Property Manager",
};

export default function GuestPage() {
  return (
    <Suspense>
      <GuestEntry />
    </Suspense>
  );
}
