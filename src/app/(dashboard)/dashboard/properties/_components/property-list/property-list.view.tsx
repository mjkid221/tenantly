"use client";

import Link from "next/link";
import { Building2, Plus, Search, MapPin } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import { BlurFade } from "~/components/ui/blur-fade";
import { MagicCard } from "~/components/ui/magic-card";
import type { PropertyListViewProps, Property } from "./property-list.types";

function PropertyCard({
  property,
  imageBaseUrl,
}: {
  property: Property;
  imageBaseUrl: string | null;
}) {
  const firstImage = property.images[0];
  const activeTenants = property.tenants.filter((t) => t.isActive);

  return (
    <Link href={`/dashboard/properties/${property.id}`}>
      <MagicCard className="overflow-hidden rounded-2xl" gradientOpacity={0.1}>
        <div className="bg-muted relative aspect-video w-full overflow-hidden">
          {firstImage && imageBaseUrl ? (
            <img
              src={`${imageBaseUrl}${firstImage.storagePath}`}
              alt={property.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Building2 className="text-muted-foreground/30 h-12 w-12" />
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-black/25 to-transparent" />
        </div>
        <div className="p-4">
          <h3 className="line-clamp-1 text-lg font-semibold">
            {property.name}
          </h3>
          <div className="text-muted-foreground mt-1.5 flex items-start gap-2 text-sm">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span className="line-clamp-1">
              {property.addressLine1}
              {property.addressLine2 ? `, ${property.addressLine2}` : ""}
              {", "}
              {property.city}
              {property.state ? `, ${property.state}` : ""}
            </span>
          </div>
          <div className="mt-3">
            <Badge variant="secondary" className="gap-1.5 rounded-full">
              <span
                className={`h-1.5 w-1.5 rounded-full ${activeTenants.length > 0 ? "bg-emerald-500" : "bg-zinc-400"}`}
              />
              {activeTenants.length}{" "}
              {activeTenants.length === 1 ? "tenant" : "tenants"}
            </Badge>
          </div>
        </div>
      </MagicCard>
    </Link>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="overflow-hidden rounded-2xl">
          <Skeleton className="aspect-video w-full" />
          <div className="space-y-3 p-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </Card>
      ))}
    </div>
  );
}

function EmptyState({ isAdmin }: { isAdmin: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-20">
      <div className="bg-muted rounded-2xl p-4">
        <Building2 className="text-muted-foreground/40 h-8 w-8" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">No properties found</h3>
      <p className="text-muted-foreground mt-1 max-w-sm text-center text-sm">
        {isAdmin
          ? "Get started by adding your first property."
          : "No properties have been assigned to you yet."}
      </p>
      {isAdmin && (
        <Button asChild className="mt-4">
          <Link href="/dashboard/properties/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Property
          </Link>
        </Button>
      )}
    </div>
  );
}

export function PropertyListView({
  properties,
  isLoading,
  isAdmin,
  searchQuery,
  onSearchChange,
  imageBaseUrl,
}: PropertyListViewProps) {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      <BlurFade delay={0.05}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Properties</h1>
            <p className="text-muted-foreground">Manage your properties</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative max-w-sm flex-1 sm:w-64">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Search properties..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            {isAdmin && (
              <Button asChild>
                <Link href="/dashboard/properties/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Property
                </Link>
              </Button>
            )}
          </div>
        </div>
      </BlurFade>

      {properties.length === 0 ? (
        <BlurFade delay={0.1}>
          <EmptyState isAdmin={isAdmin} />
        </BlurFade>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property, index) => (
            <BlurFade key={property.id} delay={0.05 + index * 0.05} inView>
              <PropertyCard property={property} imageBaseUrl={imageBaseUrl} />
            </BlurFade>
          ))}
        </div>
      )}
    </div>
  );
}
