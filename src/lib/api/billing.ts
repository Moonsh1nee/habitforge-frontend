import { api } from "./client";
import type { Subscription } from "@/types";

export const billingApi = {
  getSubscription: async (): Promise<Subscription> => {
    const { data } = await api.get<Subscription>("/billing/subscription");
    return data;
  },

  createCheckoutSession: async (plan: "pro"): Promise<{ url: string }> => {
    const { data } = await api.post<{ url: string }>("/billing/create-checkout-session", { plan });
    return data;
  },

  createPortalSession: async (): Promise<{ url: string }> => {
    const { data } = await api.post<{ url: string }>("/billing/portal");
    return data;
  },
};
