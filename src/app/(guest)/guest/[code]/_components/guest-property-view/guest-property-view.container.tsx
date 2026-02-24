"use client";

import { useGuestPropertyView } from "./guest-property-view.hook";
import { GuestPropertyViewComponent } from "./guest-property-view.view";

interface GuestPropertyViewContainerProps {
  code: string;
}

export function GuestPropertyView({ code }: GuestPropertyViewContainerProps) {
  const props = useGuestPropertyView(code);
  return <GuestPropertyViewComponent {...props} />;
}
