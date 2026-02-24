"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Trash2,
  CheckCircle,
  FileText,
  Upload,
  DollarSign,
} from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import { Separator } from "~/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import type {
  InvoiceDetailViewProps,
  InvoiceStatusValue,
  LineItem,
} from "./invoice-detail.types";

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

function getLineItemPaymentStatus(lineItem: LineItem): {
  paidAmount: number;
  isPaid: boolean;
} {
  const confirmedPayments = lineItem.payments.filter(
    (p) => p.status === "confirmed",
  );
  const paidAmount = confirmedPayments.reduce(
    (sum, p) => sum + parseFloat(p.amount),
    0,
  );
  const chargeAmount = parseFloat(lineItem.tenantChargeAmount);
  return { paidAmount, isPaid: paidAmount >= chargeAmount };
}

export function InvoiceDetailView({
  invoice,
  paymentStatus,
  isLoading,
  isAdmin,
  categories,
  categoriesLoading,
  onAddLineItem,
  isAddingLineItem,
  onRemoveLineItem,
  isRemovingLineItem,
  onMarkPaid,
  isMarkingPaid,
  onUpdateStatus,
  isUpdatingStatus,
  onUploadProof,
  isUploadingProof,
  isAddLineItemDialogOpen,
  onAddLineItemDialogOpenChange,
}: InvoiceDetailViewProps) {
  const [formCategoryId, setFormCategoryId] = useState<string>("");
  const [formTotalBill, setFormTotalBill] = useState("");
  const [formTenantCharge, setFormTenantCharge] = useState("");
  const [formProportionType, setFormProportionType] = useState<string>("fixed");
  const [formProportionValue, setFormProportionValue] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingLineItemId, setUploadingLineItemId] = useState<number | null>(
    null,
  );

  const handleAddLineItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCategoryId || !formTotalBill || !formTenantCharge) return;
    onAddLineItem({
      categoryId: Number(formCategoryId),
      totalBillAmount: formTotalBill,
      tenantChargeAmount: formTenantCharge,
      proportionType: formProportionType as
        | "fixed"
        | "percentage"
        | "usage_only",
      proportionValue: formProportionValue,
      description: formDescription,
    });
    setFormCategoryId("");
    setFormTotalBill("");
    setFormTenantCharge("");
    setFormProportionType("fixed");
    setFormProportionValue("");
    setFormDescription("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && uploadingLineItemId !== null) {
      onUploadProof(uploadingLineItemId, file);
      setUploadingLineItemId(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <p className="text-lg font-medium">Invoice not found</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/dashboard/invoices">Back to Invoices</Link>
        </Button>
      </div>
    );
  }

  const breadcrumbLabel =
    invoice.label ?? `${invoice.billingPeriodStart} - ${invoice.billingPeriodEnd}`;

  return (
    <div className="space-y-6">
      {/* Hidden file input for proof uploads */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".pdf"
        onChange={handleFileChange}
      />

      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard/invoices">Invoices</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{breadcrumbLabel}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Invoice Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl">
                {invoice.property.name}
              </CardTitle>
              <CardDescription className="text-base">
                {invoice.billingPeriodStart} to {invoice.billingPeriodEnd}
                {invoice.label && ` -- ${invoice.label}`}
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                variant={statusVariantMap[invoice.status] ?? "secondary"}
                className={`text-sm ${
                  invoice.status === "paid"
                    ? "bg-green-100 text-green-700 hover:bg-green-100"
                    : ""
                }`}
              >
                {statusLabelMap[invoice.status] ?? invoice.status}
              </Badge>
              {isAdmin && (
                <Select
                  value={invoice.status}
                  onValueChange={(v) =>
                    onUpdateStatus(v as InvoiceStatusValue)
                  }
                  disabled={isUpdatingStatus}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Change status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="issued">Issued</SelectItem>
                    <SelectItem value="partially_paid">
                      Partially Paid
                    </SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Line Items Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Line Items</CardTitle>
              <CardDescription>
                {invoice.lineItems.length} item
                {invoice.lineItems.length !== 1 ? "s" : ""} on this invoice
              </CardDescription>
            </div>
            {isAdmin && (
              <Dialog
                open={isAddLineItemDialogOpen}
                onOpenChange={onAddLineItemDialogOpenChange}
              >
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Line Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add Line Item</DialogTitle>
                    <DialogDescription>
                      Add a billing category item to this invoice.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddLineItem} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={formCategoryId}
                        onValueChange={setFormCategoryId}
                      >
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categoriesLoading ? (
                            <SelectItem value="loading" disabled>
                              Loading...
                            </SelectItem>
                          ) : (
                            categories.map((c) => (
                              <SelectItem key={c.id} value={String(c.id)}>
                                {c.icon ? `${c.icon} ` : ""}
                                {c.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="totalBill">
                          Total Bill (A$)
                        </Label>
                        <Input
                          id="totalBill"
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={formTotalBill}
                          onChange={(e) => setFormTotalBill(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tenantCharge">
                          Tenant Charge (A$)
                        </Label>
                        <Input
                          id="tenantCharge"
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={formTenantCharge}
                          onChange={(e) => setFormTenantCharge(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="proportionType">Proportion Type</Label>
                        <Select
                          value={formProportionType}
                          onValueChange={setFormProportionType}
                        >
                          <SelectTrigger id="proportionType">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fixed">Fixed</SelectItem>
                            <SelectItem value="percentage">
                              Percentage
                            </SelectItem>
                            <SelectItem value="usage_only">
                              Usage Only
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="proportionValue">
                          Proportion Value
                        </Label>
                        <Input
                          id="proportionValue"
                          type="number"
                          step="0.01"
                          placeholder="e.g. 50.00"
                          value={formProportionValue}
                          onChange={(e) =>
                            setFormProportionValue(e.target.value)
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">
                        Description (optional)
                      </Label>
                      <Input
                        id="description"
                        placeholder="Additional notes"
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => onAddLineItemDialogOpenChange(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={
                          isAddingLineItem ||
                          !formCategoryId ||
                          !formTotalBill ||
                          !formTenantCharge
                        }
                      >
                        {isAddingLineItem ? "Adding..." : "Add Item"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {invoice.lineItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <DollarSign className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-lg font-medium">No line items yet</p>
              <p className="text-sm text-muted-foreground">
                {isAdmin
                  ? "Add billing items to this invoice."
                  : "No charges have been added yet."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  {isAdmin && (
                    <TableHead className="text-right">
                      Total Bill (A$)
                    </TableHead>
                  )}
                  <TableHead className="text-right">
                    Tenant Charge (A$)
                  </TableHead>
                  <TableHead>Proportion</TableHead>
                  <TableHead>Proof</TableHead>
                  <TableHead>Payment</TableHead>
                  {isAdmin && (
                    <TableHead className="text-right">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.lineItems.map((li) => {
                  const { paidAmount, isPaid } = getLineItemPaymentStatus(li);
                  const chargeAmount = parseFloat(li.tenantChargeAmount);
                  return (
                    <TableRow key={li.id}>
                      <TableCell className="font-medium">
                        {li.category.icon ? `${li.category.icon} ` : ""}
                        {li.category.name}
                        {li.description && (
                          <p className="text-xs text-muted-foreground">
                            {li.description}
                          </p>
                        )}
                      </TableCell>
                      {isAdmin && (
                        <TableCell className="text-right">
                          {formatCurrency(parseFloat(li.totalBillAmount))}
                        </TableCell>
                      )}
                      <TableCell className="text-right">
                        {formatCurrency(chargeAmount)}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm capitalize">
                          {li.proportionType.replace("_", " ")}
                        </span>
                        {li.proportionValue && (
                          <span className="ml-1 text-xs text-muted-foreground">
                            ({li.proportionValue}
                            {li.proportionType === "percentage" ? "%" : ""})
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {li.proofFileName ? (
                          <span className="flex items-center gap-1 text-sm text-blue-600">
                            <FileText className="h-3 w-3" />
                            {li.proofFileName}
                          </span>
                        ) : isAdmin ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={isUploadingProof}
                            onClick={() => {
                              setUploadingLineItemId(li.id);
                              fileInputRef.current?.click();
                            }}
                          >
                            <Upload className="mr-1 h-3 w-3" />
                            Upload
                          </Button>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            --
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {isPaid ? (
                          <Badge
                            variant="default"
                            className="bg-green-100 text-green-700 hover:bg-green-100"
                          >
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Paid
                          </Badge>
                        ) : paidAmount > 0 ? (
                          <Badge variant="outline">
                            Partial ({formatCurrency(paidAmount)})
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Unpaid</Badge>
                        )}
                      </TableCell>
                      {isAdmin && (
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {!isPaid && (
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={isMarkingPaid}
                                onClick={() =>
                                  onMarkPaid(
                                    li.id,
                                    li.tenantChargeAmount,
                                  )
                                }
                              >
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Mark Paid
                              </Button>
                            )}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Remove line item?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently remove the{" "}
                                    {li.category.name} line item and any
                                    associated proof files. This action cannot be
                                    undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => onRemoveLineItem(li.id)}
                                    disabled={isRemovingLineItem}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    {isRemovingLineItem
                                      ? "Removing..."
                                      : "Remove"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      {paymentStatus && (
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Total Charged
                </span>
                <span className="font-medium">
                  {formatCurrency(paymentStatus.totalCharged)}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Total Paid
                </span>
                <span className="font-medium text-green-600">
                  {formatCurrency(paymentStatus.totalPaid)}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Outstanding Balance</span>
                <span
                  className={`text-lg font-bold ${
                    paymentStatus.outstanding > 0
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {formatCurrency(paymentStatus.outstanding)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
