"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "~/lib/supabase/client";
import { getSiteUrl } from "~/lib/url";
import type { OAuthProvider } from "./login-form.types";

export function useLoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const supabase = createSupabaseBrowserClient();

  const onOAuthLogin = async (provider: OAuthProvider) => {
    setIsLoading(true);
    setError(null);
    setMagicLinkSent(false);

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${getSiteUrl()}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
    }
  };

  const onMagicLinkLogin = async (email: string) => {
    setIsLoading(true);
    setError(null);
    setMagicLinkSent(false);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${getSiteUrl()}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setMagicLinkSent(true);
    }

    setIsLoading(false);
  };

  return { onOAuthLogin, onMagicLinkLogin, isLoading, magicLinkSent, error };
}
