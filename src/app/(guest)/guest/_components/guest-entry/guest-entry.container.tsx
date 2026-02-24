"use client";

import { useGuestEntry } from "./guest-entry.hook";
import { GuestEntryView } from "./guest-entry.view";

export function GuestEntry() {
  const props = useGuestEntry();
  return <GuestEntryView {...props} />;
}
