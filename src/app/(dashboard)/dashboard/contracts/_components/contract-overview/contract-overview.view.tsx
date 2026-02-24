"use client";

import Link from "next/link";
import { FileText, Building2, ExternalLink } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import { api } from "~/trpc/react";
import type { ContractOverviewViewProps, Property } from "./contract-overview.types";

function PropertyContractCard({ property }: { property: Property }) {
  const { data: latestContract, isLoading } =
    api.contracts.getLatestByProperty.useQuery({ propertyId: property.id });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <Building2 className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg">{property.name}</CardTitle>
              <CardDescription>
                {property.addressLine1}, {property.city}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-16 w-full" />
        ) : latestContract ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                v{latestContract.version} - {latestContract.fileName}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Uploaded{" "}
              {new Date(latestContract.createdAt).toLocaleDateString("en-AU", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
            {latestContract.notes && (
              <p className="text-xs text-muted-foreground">
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
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
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
      </CardContent>
    </Card>
  );
}

export function ContractOverviewView({
  properties,
  isLoading,
}: ContractOverviewViewProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Contracts</h1>
        <p className="text-muted-foreground">
          View and manage contracts for all properties.
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : properties.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-lg font-medium">No properties found</p>
            <p className="text-sm text-muted-foreground">
              Properties need to be created before contracts can be managed.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <PropertyContractCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
}
