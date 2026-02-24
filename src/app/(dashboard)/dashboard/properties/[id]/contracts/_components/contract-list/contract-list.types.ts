import type { RouterOutputs } from "~/trpc/react";

export type Contract = RouterOutputs["contracts"]["listByProperty"][number];

export interface ContractListViewProps {
  propertyId: number;
  propertyName: string | undefined;
  contracts: Contract[];
  isLoading: boolean;
  isAdmin: boolean;
  selectedContractId: number | null;
  onSelectContract: (id: number) => void;
  downloadUrl: string | null;
  downloadFileName: string | null;
  isLoadingDownload: boolean;
  // Upload
  onUpload: (file: File, notes: string) => void;
  isUploading: boolean;
  showUploadDialog: boolean;
  setShowUploadDialog: (open: boolean) => void;
}
