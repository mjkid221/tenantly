"use client";

import { useGuestCodeManager } from "./guest-code-manager.hook";
import { GuestCodeManagerView } from "./guest-code-manager.view";

export function GuestCodeManager() {
  const props = useGuestCodeManager();
  return <GuestCodeManagerView {...props} />;
}
