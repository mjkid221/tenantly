export type OAuthProvider = "google" | "azure" | "apple";

export interface LoginFormViewProps {
  onOAuthLogin: (provider: OAuthProvider) => void;
  isLoading: boolean;
  error: string | null;
}
