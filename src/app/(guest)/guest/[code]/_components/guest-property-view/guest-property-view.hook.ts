"use client";

import { api } from "~/trpc/react";

export function useGuestPropertyView(code: string) {
  const {
    data: validation,
    isLoading: validationLoading,
    error: validationError,
  } = api.guest.validateCode.useQuery({ code }, { retry: false });

  const allowedSections = validation?.allowedSections ?? [];

  const { data: property, isLoading: propertyLoading } =
    api.guest.getPropertyDetails.useQuery(
      { code },
      {
        enabled: !!validation && allowedSections.includes("property_details"),
        retry: false,
      },
    );

  const { data: contract, isLoading: contractLoading } =
    api.guest.getContract.useQuery(
      { code },
      {
        enabled: !!validation && allowedSections.includes("contracts"),
        retry: false,
      },
    );

  const isLoading =
    validationLoading ||
    (allowedSections.includes("property_details") && propertyLoading) ||
    (allowedSections.includes("contracts") && contractLoading);

  const error = validationError
    ? validationError.message ?? "Invalid or expired access code"
    : null;

  return {
    validation,
    property,
    contract,
    isLoading,
    error,
    allowedSections,
  };
}
