export type OAuthProvider = "google" | "azure" | "apple";

export interface LoginFormViewProps {
  onOAuthLogin: (provider: OAuthProvider) => void;
  onMagicLinkLogin: (email: string) => void;
  isLoading: boolean;
  magicLinkSent: boolean;
  error: string | null;
}
