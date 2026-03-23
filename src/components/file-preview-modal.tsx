"use client";

import { useState } from "react";
import { Download, X, FileText, Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";

interface FilePreviewModalProps {
  open: boolean;
  onClose: () => void;
  url: string;
  fileName: string;
  mimeType?: string;
}

function getMimeCategory(
  fileName: string,
  mimeType?: string,
): "image" | "pdf" | "other" {
  const mime = mimeType?.toLowerCase() ?? "";
  const ext = fileName.toLowerCase().split(".").pop() ?? "";

  if (
    mime.startsWith("image/") ||
    ["png", "jpg", "jpeg", "webp", "gif", "svg"].includes(ext)
  ) {
    return "image";
  }
  if (mime === "application/pdf" || ext === "pdf") {
    return "pdf";
  }
  return "other";
}

export function FilePreviewModal({
  open,
  onClose,
  url,
  fileName,
  mimeType,
}: FilePreviewModalProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const category = getMimeCategory(fileName, mimeType);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Header bar */}
      <div className="fixed top-0 right-0 left-0 z-[101] flex items-center justify-between px-6 py-4">
        <p className="max-w-md truncate text-sm font-medium text-white">
          {fileName}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 hover:text-white"
            asChild
          >
            <a
              href={url}
              download={fileName}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </a>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 hover:text-white"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-h-[85vh] max-w-[90vw]">
        {category === "image" && (
          <div className="relative">
            {imageLoading && (
              <div className="flex h-64 w-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={fileName}
              className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
              onLoad={() => setImageLoading(false)}
              style={imageLoading ? { display: "none" } : undefined}
            />
          </div>
        )}

        {category === "pdf" && (
          <iframe
            src={url}
            title={fileName}
            className="h-[85vh] w-[80vw] max-w-4xl rounded-lg bg-white"
          />
        )}

        {category === "other" && (
          <div className="flex flex-col items-center gap-4 rounded-2xl bg-white p-12 text-center">
            <FileText className="text-muted-foreground h-16 w-16" />
            <div>
              <p className="text-lg font-semibold">{fileName}</p>
              <p className="text-muted-foreground mt-1 text-sm">
                Preview not available for this file type
              </p>
            </div>
            <Button asChild>
              <a
                href={url}
                download={fileName}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download className="mr-2 h-4 w-4" />
                Download File
              </a>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
