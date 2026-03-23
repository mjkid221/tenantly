"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Receipt, ExternalLink } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Skeleton } from "~/components/ui/skeleton";
import { BlurFade } from "~/components/ui/blur-fade";
import type { InvoiceListViewProps, InvoiceStatus } from "./invoice-list.types";

const statusConfig: Record<
  string,
  { label: string; dotColor: string; bgColor: string; textColor: string }
> = {
  draft: {
    label: "Draft",
    dotColor: "bg-zinc-400",
    bgColor: "bg-zinc-500/10",
    textColor: "text-zinc-600 dark:text-zinc-400",
  },
  issued: {
    label: "Issued",
    dotColor: "bg-amber-500",
    bgColor: "bg-amber-500/10",
    textColor: "text-amber-700 dark:text-amber-400",
  },
  partially_paid: {
    label: "Partial",
    dotColor: "bg-orange-500",
    bgColor: "bg-orange-500/10",
    textColor: "text-orange-700 dark:text-orange-400",
  },
  paid: {
    label: "Paid",
    dotColor: "bg-emerald-500",
    bgColor: "bg-emerald-500/10",
    textColor: "text-emerald-700 dark:text-emerald-400",
  },
};

function formatCurrency(amount: number): string {
  return `A$${amount.toFixed(2)}`;
}

export function InvoiceListView({
  invoices,
  isLoading,
  isAdmin,
  statusFilter,
  onStatusFilterChange,
  propertyFilter,
  onPropertyFilterChange,
  isCreateDialogOpen,
  onCreateDialogOpenChange,
  properties,
  propertiesLoading,
  onCreateInvoice,
  isCreating,
}: InvoiceListViewProps) {
  const [formPropertyId, setFormPropertyId] = useState<string>("");
  const [formTenantId, setFormTenantId] = useState<string>("");
  const [formStart, setFormStart] = useState("");
  const [formEnd, setFormEnd] = useState("");
  const [formLabel, setFormLabel] = useState("");

  const selectedProperty = properties.find(
    (p) => p.id === Number(formPropertyId),
  );

  const handlePropertyChange = (value: string) => {
    setFormPropertyId(value);
    setFormTenantId("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPropertyId || !formStart || !formEnd) return;
    onCreateInvoice({
      propertyId: Number(formPropertyId),
      propertyTenantId:
        formTenantId && formTenantId !== "all"
          ? Number(formTenantId)
          : undefined,
      billingPeriodStart: formStart,
      billingPeriodEnd: formEnd,
      label: formLabel,
    });
    setFormPropertyId("");
    setFormTenantId("");
    setFormStart("");
    setFormEnd("");
    setFormLabel("");
  };

  return (
    <div className="space-y-6">
      <BlurFade delay={0.05}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
            <p className="text-muted-foreground">
              {isAdmin
                ? "Manage all property invoices and billing cycles."
                : "View your invoices and payment status."}
            </p>
          </div>
          {isAdmin && (
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={onCreateDialogOpenChange}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Invoice
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Invoice</DialogTitle>
                  <DialogDescription>
                    Create a new billing cycle invoice for a property.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="property">Property</Label>
                    <Select
                      value={formPropertyId}
                      onValueChange={handlePropertyChange}
                    >
                      <SelectTrigger id="property">
                        <SelectValue placeholder="Select property" />
                      </SelectTrigger>
                      <SelectContent>
                        {propertiesLoading ? (
                          <SelectItem value="loading" disabled>
                            Loading...
                          </SelectItem>
                        ) : (
                          properties.map((p) => (
                            <SelectItem key={p.id} value={String(p.id)}>
                              {p.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  {selectedProperty && selectedProperty.tenants.length > 0 && (
                    <div className="space-y-2">
                      <Label htmlFor="tenant">Tenant</Label>
                      <Select
                        value={formTenantId}
                        onValueChange={setFormTenantId}
                      >
                        <SelectTrigger id="tenant">
                          <SelectValue placeholder="All Tenants" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Tenants</SelectItem>
                          {selectedProperty.tenants.map((t) => (
                            <SelectItem key={t.id} value={String(t.id)}>
                              {t.fullName
                                ? `${t.fullName} (${t.email})`
                                : t.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start">Period Start</Label>
                      <Input
                        id="start"
                        type="date"
                        value={formStart}
                        onChange={(e) => setFormStart(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end">Period End</Label>
                      <Input
                        id="end"
                        type="date"
                        value={formEnd}
                        onChange={(e) => setFormEnd(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="label">Label (optional)</Label>
                    <Input
                      id="label"
                      placeholder="e.g. Q1 2025 Utilities"
                      value={formLabel}
                      onChange={(e) => setFormLabel(e.target.value)}
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => onCreateDialogOpenChange(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={
                        isCreating || !formPropertyId || !formStart || !formEnd
                      }
                    >
                      {isCreating ? "Creating..." : "Create Invoice"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </BlurFade>

      <BlurFade delay={0.1}>
        <Card className="rounded-2xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <Receipt className="h-4 w-4" />
                  All Invoices
                </CardTitle>
                <CardDescription>
                  {invoices.length} invoice{invoices.length !== 1 ? "s" : ""}{" "}
                  found
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={
                    propertyFilter === "all" ? "all" : String(propertyFilter)
                  }
                  onValueChange={(v) =>
                    onPropertyFilterChange(v === "all" ? "all" : Number(v))
                  }
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by property" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Properties</SelectItem>
                    {properties.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={statusFilter}
                  onValueChange={(v) =>
                    onStatusFilterChange(v as InvoiceStatus | "all")
                  }
                >
                  <SelectTrigger className="w-45">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="issued">Issued</SelectItem>
                    <SelectItem value="partially_paid">
                      Partially Paid
                    </SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-lg" />
                ))}
              </div>
            ) : invoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center">
                <div className="bg-muted rounded-2xl p-4">
                  <Receipt className="text-muted-foreground/40 h-8 w-8" />
                </div>
                <p className="mt-4 text-lg font-medium">No invoices found</p>
                <p className="text-muted-foreground mt-1 text-sm">
                  {statusFilter !== "all"
                    ? "Try changing the status filter."
                    : isAdmin
                      ? "Create your first invoice to get started."
                      : "No invoices have been issued yet."}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Label</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => {
                    const total = invoice.lineItems.reduce(
                      (sum, li) => sum + parseFloat(li.tenantChargeAmount),
                      0,
                    );
                    const status =
                      statusConfig[invoice.status] ?? statusConfig.draft!;
                    return (
                      <TableRow key={invoice.id} className="h-14">
                        <TableCell className="font-medium">
                          {invoice.property.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {invoice.tenant
                            ? (invoice.tenant.user?.fullName ??
                              invoice.tenant.email)
                            : "All"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {invoice.billingPeriodStart} -{" "}
                          {invoice.billingPeriodEnd}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {invoice.label ?? "-"}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${status.bgColor} ${status.textColor}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${status.dotColor}`}
                            />
                            {status.label}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(total)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/dashboard/invoices/${invoice.id}`}>
                              <ExternalLink className="mr-1 h-3.5 w-3.5" />
                              View
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </BlurFade>
    </div>
  );
}
