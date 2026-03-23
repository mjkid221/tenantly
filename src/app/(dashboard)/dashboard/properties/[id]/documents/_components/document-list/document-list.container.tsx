"use client";

import { useDocumentList } from "./document-list.hook";
import { DocumentListView } from "./document-list.view";

interface DocumentListProps {
  propertyId: number;
}

export function DocumentList({ propertyId }: DocumentListProps) {
  const props = useDocumentList(propertyId);
  return <DocumentListView {...props} />;
}
