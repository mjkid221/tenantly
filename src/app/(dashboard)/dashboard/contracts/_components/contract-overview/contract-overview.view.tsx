"use client";

import Link from "next/link";
import { FileText, Building2, ExternalLink } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { BlurFade } from "~/components/ui/blur-fade";
import { MagicCard } from "~/components/ui/magic-card";
import { api } from "~/trpc/react";
import type {
  ContractOverviewViewProps,
  Property,
} from "./contract-overview.types";

function PropertyContractCard({ property }: { property: Property }) {
  const { data: latestContract, isLoading } =
    api.contracts.getLatestByProperty.useQuery({ propertyId: property.id });

  return (
    <MagicCard className="overflow-hidden rounded-2xl" gradientOpacity={0.1}>
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
              <Building2 className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{property.name}</h3>
              <p className="text-muted-foreground text-sm">
                {property.addressLine1}, {property.city}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-4">
          {isLoading ? (
            <Skeleton className="h-16 w-full rounded-lg" />
          ) : latestContract ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <FileText className="text-muted-foreground h-4 w-4" />
                <span className="font-medium">
                  v{latestContract.version} - {latestContract.fileName}
                </span>
              </div>
              <p className="text-muted-foreground text-xs">
                Uploaded{" "}
                {new Date(latestContract.createdAt).toLocaleDateString(
                  "en-AU",
                  {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  },
                )}
              </p>
              {latestContract.notes && (
                <p className="text-muted-foreground text-xs">
                  {latestContract.notes}
                </p>
              )}
              <Button variant="outline" size="sm" asChild>
                <Link
                  href={`/dashboard/properties/${property.id}?tab=contracts`}
                >
                  <ExternalLink className="mr-2 h-3 w-3" />
                  View All Contracts
                </Link>
              </Button>
            </div>
          ) : (
            <div className="py-4 text-center">
              <p className="text-muted-foreground text-sm">
                No contracts uploaded yet.
              </p>
              <Button variant="outline" size="sm" className="mt-2" asChild>
                <Link
                  href={`/dashboard/properties/${property.id}?tab=contracts`}
                >
                  Upload Contract
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </MagicCard>
  );
}

export function ContractOverviewView({
  properties,
  isLoading,
}: ContractOverviewViewProps) {
  return (
    <div className="space-y-6">
      <BlurFade delay={0.05}>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contracts</h1>
          <p className="text-muted-foreground">
            View and manage contracts for all properties.
          </p>
        </div>
      </BlurFade>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-2xl" />
          ))}
        </div>
      ) : properties.length === 0 ? (
        <BlurFade delay={0.1}>
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center">
            <div className="bg-muted rounded-2xl p-4">
              <FileText className="text-muted-foreground/40 h-8 w-8" />
            </div>
            <p className="mt-4 text-lg font-medium">No properties found</p>
            <p className="text-muted-foreground mt-1 text-sm">
              Properties need to be created before contracts can be managed.
            </p>
          </div>
        </BlurFade>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((property, index) => (
            <BlurFade key={property.id} delay={0.05 + index * 0.05} inView>
              <PropertyContractCard property={property} />
            </BlurFade>
          ))}
        </div>
      )}
    </div>
  );
}
