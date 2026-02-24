"use client";

import { usePropertyList } from "./property-list.hook";
import { PropertyListView } from "./property-list.view";

export function PropertyList() {
  const props = usePropertyList();
  return <PropertyListView {...props} />;
}
