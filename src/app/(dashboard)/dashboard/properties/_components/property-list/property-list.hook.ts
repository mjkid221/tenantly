"use client";

import { useState, useMemo } from "react";
import { api } from "~/trpc/react";

export function usePropertyList() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: properties, isLoading: isLoadingProperties } =
    api.properties.list.useQuery();

  const { data: me, isLoading: isLoadingMe } = api.user.me.useQuery();

  const { data: imageUrlData } = api.properties.getImageUrl.useQuery(
    { storagePath: "" },
    { enabled: !!properties?.some((p) => p.images.length > 0) },
  );

  const isAdmin = me?.role === "admin";

  const filteredProperties = useMemo(() => {
    if (!properties) return [];
    if (!searchQuery.trim()) return properties;

    const query = searchQuery.toLowerCase();
    return properties.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.addressLine1.toLowerCase().includes(query) ||
        p.city.toLowerCase().includes(query) ||
        (p.state?.toLowerCase().includes(query) ?? false),
    );
  }, [properties, searchQuery]);

  return {
    properties: filteredProperties,
    isLoading: isLoadingProperties || isLoadingMe,
    isAdmin,
    searchQuery,
    onSearchChange: setSearchQuery,
    imageBaseUrl: imageUrlData?.baseUrl ?? null,
  };
}
