export interface GuestEntryViewProps {
  code: string;
  onCodeChange: (code: string) => void;
  onSubmit: () => void;
  isValidating: boolean;
  error: string | null;
}
