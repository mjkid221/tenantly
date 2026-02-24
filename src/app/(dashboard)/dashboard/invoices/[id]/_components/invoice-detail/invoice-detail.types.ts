import type { RouterOutputs } from "~/trpc/react";

export type InvoiceData = NonNullable<RouterOutputs["invoices"]["getById"]>;
export type LineItem = InvoiceData["lineItems"][number];
export type PaymentStatus = RouterOutputs["payments"]["getStatus"];
export type Category = RouterOutputs["invoices"]["listCategories"][number];

export type InvoiceStatusValue = "draft" | "issued" | "partially_paid" | "paid";

export interface AddLineItemFormValues {
  categoryId: number;
  totalBillAmount: string;
  tenantChargeAmount: string;
  proportionType: "fixed" | "percentage" | "usage_only";
  proportionValue: string;
  description: string;
}

export interface InvoiceDetailViewProps {
  invoice: InvoiceData | undefined;
  paymentStatus: PaymentStatus | undefined;
  isLoading: boolean;
  isAdmin: boolean;
  categories: Category[];
  categoriesLoading: boolean;

  // Admin actions
  onAddLineItem: (values: AddLineItemFormValues) => void;
  isAddingLineItem: boolean;
  onRemoveLineItem: (id: number) => void;
  isRemovingLineItem: boolean;
  onMarkPaid: (lineItemId: number, amount: string) => void;
  isMarkingPaid: boolean;
  onUpdateStatus: (status: InvoiceStatusValue) => void;
  isUpdatingStatus: boolean;
  onUploadProof: (lineItemId: number, file: File) => void;
  isUploadingProof: boolean;

  // Delete invoice (admin only, draft only)
  onDeleteInvoice: () => void;
  isDeleting: boolean;
  showDeleteDialog: boolean;
  setShowDeleteDialog: (open: boolean) => void;

  // Invoice attachments
  onUploadAttachment: (file: File) => void;
  isUploadingAttachment: boolean;
  onRemoveAttachment: (id: number) => void;
  isRemovingAttachment: boolean;
  onViewAttachment: (id: number) => void;

  // Email sending
  onSendEmail: () => void;
  isSendingEmail: boolean;
  showResendDialog: boolean;
  setShowResendDialog: (open: boolean) => void;

  // Dialog state
  isAddLineItemDialogOpen: boolean;
  onAddLineItemDialogOpenChange: (open: boolean) => void;
}
