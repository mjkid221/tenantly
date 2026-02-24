"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "~/trpc/react";

export function useGuestEntry() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryCode = searchParams.get("code") ?? "";
  const [code, setCode] = useState(queryCode);
  const [submitCode, setSubmitCode] = useState(queryCode);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading, error: queryError } =
    api.guest.validateCode.useQuery(
      { code: submitCode },
      {
        enabled: !!submitCode,
        retry: false,
      },
    );

  useEffect(() => {
    if (data) {
      router.push(`/guest/${submitCode}`);
    }
  }, [data, submitCode, router]);

  useEffect(() => {
    if (queryError) {
      setError(queryError.message ?? "Invalid or expired access code");
    }
  }, [queryError]);

  const onSubmit = () => {
    if (!code.trim()) return;
    setError(null);
    setSubmitCode(code.trim());
  };

  return {
    code,
    onCodeChange: (value: string) => {
      setCode(value);
      setError(null);
    },
    onSubmit,
    isValidating: isLoading && !!submitCode,
    error,
  };
}
