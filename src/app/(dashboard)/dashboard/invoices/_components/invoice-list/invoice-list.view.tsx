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
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import type { InvoiceListViewProps, InvoiceStatus } from "./invoice-list.types";

const statusVariantMap: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  draft: "secondary",
  issued: "default",
  partially_paid: "outline",
  paid: "default",
};

const statusLabelMap: Record<string, string> = {
  draft: "Draft",
  issued: "Issued",
  partially_paid: "Partially Paid",
  paid: "Paid",
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
  isCreateDialogOpen,
  onCreateDialogOpenChange,
  properties,
  propertiesLoading,
  onCreateInvoice,
  isCreating,
}: InvoiceListViewProps) {
  const [formPropertyId, setFormPropertyId] = useState<string>("");
  const [formStart, setFormStart] = useState("");
  const [formEnd, setFormEnd] = useState("");
  const [formLabel, setFormLabel] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPropertyId || !formStart || !formEnd) return;
    onCreateInvoice({
      propertyId: Number(formPropertyId),
      billingPeriodStart: formStart,
      billingPeriodEnd: formEnd,
      label: formLabel,
    });
    setFormPropertyId("");
    setFormStart("");
    setFormEnd("");
    setFormLabel("");
  };

  return (
    <div className="space-y-6">
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
          <Dialog open={isCreateDialogOpen} onOpenChange={onCreateDialogOpenChange}>
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
                    onValueChange={setFormPropertyId}
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
                    disabled={isCreating || !formPropertyId || !formStart || !formEnd}
                  >
                    {isCreating ? "Creating..." : "Create Invoice"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                All Invoices
              </CardTitle>
              <CardDescription>
                {invoices.length} invoice{invoices.length !== 1 ? "s" : ""} found
              </CardDescription>
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) =>
                onStatusFilterChange(v as InvoiceStatus | "all")
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="issued">Issued</SelectItem>
                <SelectItem value="partially_paid">Partially Paid</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Receipt className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-lg font-medium">No invoices found</p>
              <p className="text-sm text-muted-foreground">
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
                  return (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        {invoice.property.name}
                      </TableCell>
                      <TableCell>
                        {invoice.billingPeriodStart} - {invoice.billingPeriodEnd}
                      </TableCell>
                      <TableCell>{invoice.label ?? "-"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            statusVariantMap[invoice.status] ?? "secondary"
                          }
                          className={
                            invoice.status === "paid"
                              ? "bg-green-100 text-green-700 hover:bg-green-100"
                              : undefined
                          }
                        >
                          {statusLabelMap[invoice.status] ?? invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(total)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/invoices/${invoice.id}`}>
                            <ExternalLink className="mr-1 h-4 w-4" />
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
    </div>
  );
}
