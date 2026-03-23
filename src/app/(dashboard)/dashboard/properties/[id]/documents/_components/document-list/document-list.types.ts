import type { RouterOutputs } from "~/trpc/react";

export type PropertyDocument =
  RouterOutputs["documents"]["listByProperty"][number];

export const DOCUMENT_TYPES = [
  { value: "entry_condition", label: "Entry Condition Report" },
  { value: "inspection", label: "Inspection Report" },
  { value: "maintenance", label: "Maintenance Report" },
  { value: "insurance", label: "Insurance Document" },
  { value: "other", label: "Other" },
] as const;

export interface DocumentListViewProps {
  propertyId: number;
  propertyName: string | undefined;
  documents: PropertyDocument[];
  isLoading: boolean;
  isAdmin: boolean;
  onUpload: (
    file: File,
    documentType: string,
    mimeType: string,
    notes: string,
  ) => void;
  isUploading: boolean;
  showUploadDialog: boolean;
  setShowUploadDialog: (open: boolean) => void;
  onDelete: (id: number) => void;
  isDeleting: boolean;
  onDownload: (id: number) => void;
  onPreview: (id: number) => void;
  previewFile: { url: string; fileName: string; mimeType?: string } | null;
  onClosePreview: () => void;
}
