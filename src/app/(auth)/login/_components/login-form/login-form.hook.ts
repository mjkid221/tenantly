"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "~/lib/supabase/client";
import type { OAuthProvider } from "./login-form.types";

export function useLoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createSupabaseBrowserClient();

  const onOAuthLogin = async (provider: OAuthProvider) => {
    setIsLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
    }
  };

  return { onOAuthLogin, isLoading, error };
}
