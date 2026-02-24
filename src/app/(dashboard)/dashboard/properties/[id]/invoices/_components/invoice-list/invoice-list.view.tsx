"use client";

import Link from "next/link";
import { Receipt, Plus, Calendar } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { BlurFade } from "~/components/ui/blur-fade";
import type { InvoiceListViewProps, InvoiceStatus } from "./invoice-list.types";

const statusConfig: Record<
  InvoiceStatus,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  draft: { label: "Draft", variant: "outline" },
  issued: { label: "Issued", variant: "default" },
  partially_paid: { label: "Partially Paid", variant: "secondary" },
  paid: { label: "Paid", variant: "default" },
};

function getStatusBadge(status: string) {
  const config = statusConfig[status as InvoiceStatus] ?? {
    label: status,
    variant: "outline" as const,
  };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(amount);
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Skeleton className="h-5 w-64" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-5 w-48" />
        </div>
        <Skeleton className="h-10 w-36 rounded-md" />
      </div>

      {/* Table Card */}
      <Card className="rounded-2xl">
        <CardContent className="p-0">
          <div className="space-y-1 p-4">
            <Skeleton className="h-10 w-full" />
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function InvoiceListView({
  propertyId,
  propertyName,
  invoices,
  isLoading,
  isAdmin,
}: InvoiceListViewProps) {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      <BlurFade delay={0.05}>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard/properties">
                Properties
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/dashboard/properties/${propertyId}`}>
                {propertyName ?? "Property"}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Invoices</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </BlurFade>

      <BlurFade delay={0.1}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
            <p className="text-muted-foreground">
              Billing for {propertyName ?? "this property"}
            </p>
          </div>
          {isAdmin && (
            <Button asChild>
              <Link href={`/dashboard/invoices/new?propertyId=${propertyId}`}>
                <Plus className="mr-2 h-4 w-4" />
                Create Invoice
              </Link>
            </Button>
          )}
        </div>
      </BlurFade>

      {invoices.length === 0 ? (
        <BlurFade delay={0.15}>
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center">
            <div className="bg-muted rounded-2xl p-4">
              <Receipt className="text-muted-foreground/40 h-8 w-8" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No invoices yet</h3>
            <p className="text-muted-foreground mt-1 mb-4 text-sm">
              {isAdmin
                ? "Create the first invoice for this property."
                : "No invoices have been created yet."}
            </p>
            {isAdmin && (
              <Button asChild>
                <Link href={`/dashboard/invoices/new?propertyId=${propertyId}`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Invoice
                </Link>
              </Button>
            )}
          </div>
        </BlurFade>
      ) : (
        <BlurFade delay={0.15}>
          <Card className="rounded-2xl">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead>Label</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Tenant Charge</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-25" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => {
                    const totalBill = invoice.lineItems.reduce(
                      (sum, li) => sum + Number(li.totalBillAmount),
                      0,
                    );
                    const tenantCharge = invoice.lineItems.reduce(
                      (sum, li) => sum + Number(li.tenantChargeAmount),
                      0,
                    );

                    return (
                      <TableRow key={invoice.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="text-muted-foreground h-4 w-4" />
                            <span className="text-sm">
                              {formatDate(invoice.billingPeriodStart)} -{" "}
                              {formatDate(invoice.billingPeriodEnd)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium">
                            {invoice.label ?? "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {invoice.lineItems.length}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {formatCurrency(totalBill)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium">
                            {formatCurrency(tenantCharge)}
                          </span>
                        </TableCell>
                        <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                        <TableCell>
                          <Button asChild variant="ghost" size="sm">
                            <Link href={`/dashboard/invoices/${invoice.id}`}>
                              View
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </BlurFade>
      )}
    </div>
  );
}
