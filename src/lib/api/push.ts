import { api } from "./client";

export const pushApi = {
  getVapidKey: async (): Promise<string> => {
    const { data } = await api.get<{ key: string }>("/push/vapid-public-key");
    return data.key;
  },

  subscribe: async (subscription: PushSubscriptionJSON): Promise<void> => {
    await api.post("/push/subscribe", {
      endpoint: subscription.endpoint,
      keys: subscription.keys,
    });
  },

  unsubscribe: async (endpoint: string): Promise<void> => {
    await api.delete("/push/subscribe", { data: { endpoint } });
  },
};
