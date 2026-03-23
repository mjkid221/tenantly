"use client";

import { useRef, useState } from "react";
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Calendar,
  User,
  Loader2,
  FolderOpen,
  Eye,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { FilePreviewModal } from "~/components/file-preview-modal";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { BlurFade } from "~/components/ui/blur-fade";
import {
  DOCUMENT_TYPES,
  type DocumentListViewProps,
} from "./document-list.types";

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-5 w-64" />
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-5 w-56" />
        </div>
        <Skeleton className="h-10 w-44 rounded-md" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

function UploadDialog({
  open,
  onOpenChange,
  onUpload,
  isUploading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (
    file: File,
    documentType: string,
    mimeType: string,
    notes: string,
  ) => void;
  isUploading: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = () => {
    if (selectedFile && documentType) {
      onUpload(
        selectedFile,
        documentType,
        selectedFile.type || "application/octet-stream",
        notes,
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Upload a document to this property.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Document Type</Label>
            <Select value={documentType} onValueChange={setDocumentType}>
              <SelectTrigger>
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>File</Label>
            <Input
              ref={fileInputRef}
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setSelectedFile(file);
              }}
            />
            {selectedFile && (
              <p className="text-muted-foreground truncate text-sm">
                Selected: {selectedFile.name} (
                {(selectedFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <textarea
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[60px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              placeholder="e.g. Initial inspection before move-in"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedFile || !documentType || isUploading}
          >
            {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function getDocumentTypeLabel(value: string) {
  return DOCUMENT_TYPES.find((t) => t.value === value)?.label ?? value;
}

export function DocumentListView({
  propertyId,
  propertyName,
  documents,
  isLoading,
  isAdmin,
  onUpload,
  isUploading,
  showUploadDialog,
  setShowUploadDialog,
  onDelete,
  isDeleting,
  onDownload,
  onPreview,
  previewFile,
  onClosePreview,
}: DocumentListViewProps) {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  // Group documents by type
  const grouped = documents.reduce<Record<string, typeof documents>>(
    (acc, doc) => {
      const type = doc.documentType;
      acc[type] ??= [];
      acc[type].push(doc);
      return acc;
    },
    {},
  );

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
              <BreadcrumbPage>Documents</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </BlurFade>

      <BlurFade delay={0.1}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
            <p className="text-muted-foreground">
              Property documents for {propertyName ?? "this property"}
            </p>
          </div>
          {isAdmin && (
            <Button onClick={() => setShowUploadDialog(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          )}
        </div>
      </BlurFade>

      {documents.length === 0 ? (
        <BlurFade delay={0.15}>
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center">
            <div className="bg-muted rounded-2xl p-4">
              <FolderOpen className="text-muted-foreground/40 h-8 w-8" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No documents yet</h3>
            <p className="text-muted-foreground mt-1 mb-4 text-sm">
              {isAdmin
                ? "Upload the first document for this property."
                : "No documents have been uploaded yet."}
            </p>
            {isAdmin && (
              <Button onClick={() => setShowUploadDialog(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Document
              </Button>
            )}
          </div>
        </BlurFade>
      ) : (
        <BlurFade delay={0.15}>
          <div className="space-y-6">
            {Object.entries(grouped).map(([type, docs]) => (
              <Card key={type} className="rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FolderOpen className="h-5 w-5" />
                    {getDocumentTypeLabel(type)}
                    <Badge variant="secondary" className="ml-1">
                      {docs.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {docs.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between rounded-xl border p-3"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="text-muted-foreground h-5 w-5" />
                          <div>
                            <p className="text-sm font-medium">
                              {doc.fileName}
                            </p>
                            <div className="text-muted-foreground flex items-center gap-3 text-xs">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(doc.createdAt).toLocaleDateString(
                                  "en-AU",
                                  {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  },
                                )}
                              </span>
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {doc.uploadedBy.fullName ??
                                  doc.uploadedBy.email}
                              </span>
                              {doc.sizeBytes && (
                                <span>
                                  {(doc.sizeBytes / 1024).toFixed(1)} KB
                                </span>
                              )}
                            </div>
                            {doc.notes && (
                              <p className="text-muted-foreground mt-1 text-xs">
                                {doc.notes}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onPreview(doc.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDownload(doc.id)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          {isAdmin && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={isDeleting}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete Document
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete &quot;
                                    {doc.fileName}&quot;? This action cannot be
                                    undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => onDelete(doc.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </BlurFade>
      )}

      <UploadDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        onUpload={onUpload}
        isUploading={isUploading}
      />

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
