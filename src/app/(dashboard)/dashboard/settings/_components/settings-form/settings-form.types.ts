export interface SettingsFormValues {
  fullName: string;
}

export interface SettingsFormViewProps {
  fullName: string;
  email: string;
  avatarUrl: string | null;
  isLoading: boolean;
  onSubmit: (values: SettingsFormValues) => void;
  isSaving: boolean;
}
