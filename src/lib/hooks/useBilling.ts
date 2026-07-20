"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { billingApi } from "@/lib/api/billing";

export function useSubscription() {
  return useQuery({
    queryKey: ["subscription"],
    queryFn: billingApi.getSubscription,
    staleTime: 5 * 60_000,
  });
}

export function useCreateCheckout() {
  return useMutation({
    mutationFn: () => billingApi.createCheckoutSession("pro"),
    onSuccess: ({ url }) => {
      window.location.href = url;
    },
    onError: () => toast.error("Не удалось открыть страницу оплаты"),
  });
}

export function useOpenBillingPortal() {
  return useMutation({
    mutationFn: billingApi.createPortalSession,
    onSuccess: ({ url }) => {
      window.open(url, "_blank");
    },
    onError: () => toast.error("Не удалось открыть портал управления подпиской"),
  });
}
