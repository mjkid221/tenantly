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
  Receipt,
  Mail,
  Paperclip,
  Eye,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { FilePreviewModal } from "~/components/file-preview-modal";
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
import { BlurFade } from "~/components/ui/blur-fade";
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
    label: "Partially Paid",
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
  onDeleteInvoice,
  isDeleting,
  showDeleteDialog,
  setShowDeleteDialog,
  onUploadAttachment,
  isUploadingAttachment,
  onRemoveAttachment,
  isRemovingAttachment,
  onViewAttachment,
  onSendEmail,
  isSendingEmail,
  showResendDialog,
  setShowResendDialog,
  isAddLineItemDialogOpen,
  onAddLineItemDialogOpenChange,
  paymentMethodsList,
  previewFile,
  onClosePreview,
}: InvoiceDetailViewProps) {
  const [formCategoryId, setFormCategoryId] = useState<string>("");
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [formTotalBill, setFormTotalBill] = useState("");
  const [formTenantCharge, setFormTenantCharge] = useState("");
  const [formProportionType, setFormProportionType] = useState<string>("fixed");
  const [formProportionValue, setFormProportionValue] = useState("");

  // Auto-calculate tenant charge based on proportion type
  const handleProportionTypeChange = (type: string) => {
    setFormProportionType(type);
    if (type === "usage_only") {
      setFormTenantCharge(formTotalBill);
      setFormProportionValue("");
    } else if (type === "percentage" && formProportionValue && formTotalBill) {
      const calc = (
        (parseFloat(formTotalBill) * parseFloat(formProportionValue)) /
        100
      ).toFixed(2);
      setFormTenantCharge(calc);
    } else if (type === "fixed") {
      setFormProportionValue("");
    }
  };

  const handleTotalBillChange = (value: string) => {
    setFormTotalBill(value);
    if (formProportionType === "usage_only") {
      setFormTenantCharge(value);
    } else if (formProportionType === "percentage" && formProportionValue) {
      const calc = (
        (parseFloat(value) * parseFloat(formProportionValue)) /
        100
      ).toFixed(2);
      setFormTenantCharge(isNaN(parseFloat(calc)) ? "" : calc);
    }
  };

  const handleProportionValueChange = (value: string) => {
    setFormProportionValue(value);
    if (formProportionType === "percentage" && formTotalBill) {
      const calc = (
        (parseFloat(formTotalBill) * parseFloat(value)) /
        100
      ).toFixed(2);
      setFormTenantCharge(isNaN(parseFloat(calc)) ? "" : calc);
    }
  };
  const [formDescription, setFormDescription] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);
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

  const handleAttachmentFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadAttachment(file);
    }
    if (attachmentInputRef.current) {
      attachmentInputRef.current.value = "";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Skeleton className="h-5 w-48" />

        {/* Invoice Header Card */}
        <Card className="rounded-2xl">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-5 w-64" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-7 w-20 rounded-full" />
                <Skeleton className="h-10 w-40 rounded-md" />
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Attachments Card */}
        <Card className="rounded-2xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1.5">
                <Skeleton className="h-6 w-28" />
                <Skeleton className="h-4 w-36" />
              </div>
              <Skeleton className="h-9 w-24 rounded-md" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-24 w-full rounded-2xl" />
          </CardContent>
        </Card>

        {/* Line Items Card */}
        <Card className="rounded-2xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1.5">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-40" />
              </div>
              <Skeleton className="h-9 w-32 rounded-md" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <Skeleton className="h-10 w-full" />
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Summary Card */}
        <Card className="rounded-2xl">
          <CardHeader>
            <Skeleton className="h-6 w-24" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-6 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-20">
        <div className="bg-muted rounded-2xl p-4">
          <Receipt className="text-muted-foreground/40 h-8 w-8" />
        </div>
        <p className="mt-4 text-lg font-medium">Invoice not found</p>
        <p className="text-muted-foreground mt-1 text-sm">
          The invoice you are looking for does not exist or you do not have
          access.
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/dashboard/invoices">Back to Invoices</Link>
        </Button>
      </div>
    );
  }

  const breadcrumbLabel =
    invoice.label ??
    `${invoice.billingPeriodStart} - ${invoice.billingPeriodEnd}`;

  return (
    <div className="space-y-6">
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".pdf"
        onChange={handleFileChange}
      />
      <input
        type="file"
        ref={attachmentInputRef}
        className="hidden"
        accept=".pdf,.png,.jpg,.jpeg,.webp"
        onChange={handleAttachmentFileChange}
      />

      {/* Breadcrumb */}
      <BlurFade delay={0.05}>
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
      </BlurFade>

      {/* Invoice Header */}
      <BlurFade delay={0.1}>
        <Card className="rounded-2xl">
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
                {invoice.tenant ? (
                  <p className="text-muted-foreground text-sm">
                    Tenant:{" "}
                    {invoice.tenant.user?.fullName ?? invoice.tenant.email}
                    {invoice.tenant.user?.fullName &&
                      ` (${invoice.tenant.email})`}
                  </p>
                ) : (
                  <p className="text-muted-foreground text-sm">All Tenants</p>
                )}
                {invoice.emailSentAt && (
                  <p className="text-muted-foreground flex items-center gap-1 text-xs">
                    <Mail className="h-3 w-3" />
                    Emailed on{" "}
                    {new Date(invoice.emailSentAt).toLocaleDateString("en-AU", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                    {invoice.emailSentTo && ` to ${invoice.emailSentTo}`}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                {(() => {
                  const status =
                    statusConfig[invoice.status] ?? statusConfig.draft!;
                  return (
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${status.bgColor} ${status.textColor}`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${status.dotColor}`}
                      />
                      {status.label}
                    </span>
                  );
                })()}
                {isAdmin && (
                  <>
                    <Select
                      value={invoice.status}
                      onValueChange={(v) =>
                        onUpdateStatus(v as InvoiceStatusValue)
                      }
                      disabled={isUpdatingStatus}
                    >
                      <SelectTrigger className="w-40">
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
                    {invoice.status !== "draft" &&
                      (invoice.emailSentAt ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowResendDialog(true)}
                          disabled={isSendingEmail}
                        >
                          <Mail className="mr-2 h-4 w-4" />
                          Resend
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={onSendEmail}
                          disabled={isSendingEmail}
                        >
                          <Mail className="mr-2 h-4 w-4" />
                          {isSendingEmail ? "Sending..." : "Send Email"}
                        </Button>
                      ))}
                    {invoice.status === "draft" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setShowDeleteDialog(true)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>
      </BlurFade>

      {/* Attachments */}
      <BlurFade delay={0.12}>
        <Card className="rounded-2xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Attachments</CardTitle>
                <CardDescription>
                  {invoice.attachments.length} file
                  {invoice.attachments.length !== 1 ? "s" : ""} attached
                </CardDescription>
              </div>
              {isAdmin && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isUploadingAttachment}
                  onClick={() => attachmentInputRef.current?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {isUploadingAttachment ? "Uploading..." : "Upload"}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {invoice.attachments.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-10 text-center">
                <div className="bg-muted rounded-2xl p-4">
                  <Paperclip className="text-muted-foreground/40 h-8 w-8" />
                </div>
                <p className="mt-4 text-sm font-medium">No attachments</p>
                <p className="text-muted-foreground mt-1 text-xs">
                  {isAdmin
                    ? "Upload PDFs or images for tenants to view."
                    : "No files attached to this invoice."}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {invoice.attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <FileText className="text-muted-foreground h-4 w-4 shrink-0" />
                      <span className="truncate text-sm">{att.fileName}</span>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewAttachment(att.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {isAdmin && (
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
                                Remove attachment?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete &ldquo;
                                {att.fileName}
                                &rdquo;.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => onRemoveAttachment(att.id)}
                                disabled={isRemovingAttachment}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                {isRemovingAttachment
                                  ? "Removing..."
                                  : "Remove"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </BlurFade>

      {/* Line Items Table */}
      <BlurFade delay={0.17}>
        <Card className="rounded-2xl">
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
                                  {c.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="totalBill">Total Bill (A$)</Label>
                          <Input
                            id="totalBill"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={formTotalBill}
                            onChange={(e) =>
                              handleTotalBillChange(e.target.value)
                            }
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
                            onChange={(e) =>
                              setFormTenantCharge(e.target.value)
                            }
                            disabled={formProportionType !== "fixed"}
                            required
                          />
                          {formProportionType !== "fixed" && (
                            <p className="text-muted-foreground text-xs">
                              Auto-calculated from{" "}
                              {formProportionType === "percentage"
                                ? "percentage"
                                : "total bill"}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="proportionType">Charge Method</Label>
                          <Select
                            value={formProportionType}
                            onValueChange={handleProportionTypeChange}
                          >
                            <SelectTrigger id="proportionType">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="fixed">
                                Fixed Amount
                              </SelectItem>
                              <SelectItem value="percentage">
                                Percentage of Bill
                              </SelectItem>
                              <SelectItem value="usage_only">
                                Full Amount
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {formProportionType === "percentage" && (
                          <div className="space-y-2">
                            <Label htmlFor="proportionValue">
                              Percentage (%)
                            </Label>
                            <Input
                              id="proportionValue"
                              type="number"
                              step="0.01"
                              min="0"
                              max="100"
                              placeholder="e.g. 50"
                              value={formProportionValue}
                              onChange={(e) =>
                                handleProportionValueChange(e.target.value)
                              }
                            />
                          </div>
                        )}
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
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center">
                <div className="bg-muted rounded-2xl p-4">
                  <DollarSign className="text-muted-foreground/40 h-8 w-8" />
                </div>
                <p className="mt-4 text-lg font-medium">No line items yet</p>
                <p className="text-muted-foreground mt-1 text-sm">
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
                    <TableHead>Charge Method</TableHead>
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
                          {li.category.name}
                          {li.description && (
                            <p className="text-muted-foreground text-xs">
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
                          <span className="text-sm">
                            {li.proportionType === "fixed"
                              ? "Fixed"
                              : li.proportionType === "percentage"
                                ? `${li.proportionValue ?? ""}% of bill`
                                : "Full amount"}
                          </span>
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
                            <span className="text-muted-foreground text-sm">
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
                                    onMarkPaid(li.id, li.tenantChargeAmount)
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
                                      associated proof files. This action cannot
                                      be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
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
      </BlurFade>

      {/* Summary */}
      {paymentStatus && (
        <BlurFade delay={0.2}>
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">
                    Total Charged
                  </span>
                  <span className="font-medium">
                    {formatCurrency(paymentStatus.totalCharged)}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">
                    Total Paid
                  </span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(paymentStatus.totalPaid)}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Outstanding Balance
                  </span>
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
        </BlurFade>
      )}

      {/* Payment Methods */}
      {paymentMethodsList.length > 0 && (
        <BlurFade delay={0.45}>
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base">Payment Methods</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentMethodsList.map((method) => (
                  <div key={method.id} className="bg-muted/50 rounded-xl p-4">
                    <p className="text-sm font-semibold">{method.name}</p>
                    <pre className="text-muted-foreground mt-1 font-sans text-sm leading-relaxed whitespace-pre-wrap">
                      {method.details}
                    </pre>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </BlurFade>
      )}

      {/* Delete Invoice Confirmation */}
      <AlertDialog
        open={showDeleteDialog}
        onOpenChange={(open) => {
          setShowDeleteDialog(open);
          if (!open) setDeleteConfirmText("");
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this draft invoice and all its line
              items. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label htmlFor="delete-confirm">
              Type <span className="font-mono font-semibold">DELETE</span> to
              confirm
            </Label>
            <Input
              id="delete-confirm"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
              autoComplete="off"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDeleteInvoice}
              disabled={isDeleting || deleteConfirmText !== "DELETE"}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete Invoice"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Resend Email Confirmation */}
      <AlertDialog open={showResendDialog} onOpenChange={setShowResendDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Resend Invoice Email?</AlertDialogTitle>
            <AlertDialogDescription>
              This invoice was already emailed
              {invoice?.emailSentAt && (
                <>
                  {" "}
                  on{" "}
                  {new Date(invoice.emailSentAt).toLocaleDateString("en-AU", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </>
              )}
              {invoice?.emailSentTo && <> to {invoice.emailSentTo}</>}. Are you
              sure you want to send it again?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSendingEmail}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={onSendEmail} disabled={isSendingEmail}>
              {isSendingEmail ? "Sending..." : "Resend Email"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {previewFile && (
        <FilePreviewModal
          open={!!previewFile}
          onClose={onClosePreview}
          url={previewFile.url}
          fileName={previewFile.fileName}
          mimeType={previewFile.mimeType}
        />
      )}
    </div>
  );
}
