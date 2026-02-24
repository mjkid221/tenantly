"use client";

import Link from "next/link";
import {
  Building2,
  MapPin,
  FileText,
  Download,
  AlertCircle,
} from "lucide-react";
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
import { Separator } from "~/components/ui/separator";
import type { GuestPropertyViewProps } from "./guest-property-view.types";

export function GuestPropertyViewComponent({
  validation,
  property,
  contract,
  isLoading,
  error,
  allowedSections,
}: GuestPropertyViewProps) {
  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="text-destructive mb-4 h-12 w-12" />
            <p className="text-lg font-medium">Access Denied</p>
            <p className="text-muted-foreground mt-2 text-sm">{error}</p>
            <Button variant="outline" className="mt-6" asChild>
              <Link href="/guest">Try Another Code</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!validation) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {validation.propertyName}
        </h1>
        <div className="mt-2 flex items-center gap-2">
          <Badge variant="outline">Guest Access</Badge>
          {validation.expiresAt && (
            <span className="text-muted-foreground text-sm">
              Expires:{" "}
              {new Date(validation.expiresAt).toLocaleDateString("en-AU", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          )}
        </div>
      </div>

      {/* Property Details */}
      {allowedSections.includes("property_details") && property && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Property Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">{property.name}</h3>
              <div className="text-muted-foreground mt-1 flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <div>
                  <p>{property.addressLine1}</p>
                  {property.addressLine2 && <p>{property.addressLine2}</p>}
                  <p>
                    {property.city}
                    {property.state ? `, ${property.state}` : ""}
                    {property.postalCode ? ` ${property.postalCode}` : ""}
                  </p>
                  <p>{property.country}</p>
                </div>
              </div>
            </div>

            {property.description && (
              <>
                <Separator />
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Description
                  </p>
                  <p className="mt-1 whitespace-pre-wrap">
                    {property.description}
                  </p>
                </div>
              </>
            )}

            {property.images && property.images.length > 0 && (
              <>
                <Separator />
                <div>
                  <p className="text-muted-foreground mb-3 text-sm font-medium">
                    Images
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                    {property.images.map((image) => (
                      <div
                        key={image.id}
                        className="overflow-hidden rounded-lg border"
                      >
                        <div className="bg-muted flex h-32 items-center justify-center">
                          <Building2 className="text-muted-foreground h-8 w-8" />
                        </div>
                        <div className="p-2">
                          <p className="text-muted-foreground truncate text-xs">
                            {image.fileName}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Contract */}
      {allowedSections.includes("contracts") && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Contract
            </CardTitle>
            <CardDescription>
              Latest contract document for this property.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {contract ? (
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">{contract.fileName}</p>
                  <p className="text-muted-foreground text-sm">
                    Version {contract.version}
                    {contract.notes && ` -- ${contract.notes}`}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Uploaded{" "}
                    {new Date(contract.createdAt).toLocaleDateString("en-AU", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <Button asChild>
                  <a
                    href={contract.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </a>
                </Button>
              </div>
            ) : (
              <p className="text-muted-foreground py-6 text-center text-sm">
                No contract available for this property.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* If no sections are allowed */}
      {allowedSections.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="text-muted-foreground mb-4 h-12 w-12" />
            <p className="text-lg font-medium">Limited Access</p>
            <p className="text-muted-foreground text-sm">
              This access code does not grant access to any property sections.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
