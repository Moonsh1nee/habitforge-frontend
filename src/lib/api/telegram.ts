import { api } from "./client";
import type { TelegramLink } from "@/types";

export type { TelegramLink };

export interface Reminder {
  id: string;
  type: string;
  title: string;
  message: string | null;
  cronExpression: string;
  isActive: boolean;
  lastSentAt: string | null;
  createdAt?: string;
}

export const telegramApi = {
  getLink: async (): Promise<TelegramLink> =>
    api.get("/telegram/link").then((r) => r.data),

  getLinkCode: async (): Promise<{ code: string }> =>
    api.post("/telegram/link/code").then((r) => r.data),

  link: async (code: string): Promise<TelegramLink> =>
    api.post("/telegram/link", { code }).then((r) => r.data),

  unlink: async (): Promise<void> => {
    await api.delete("/telegram/link");
  },

  getReminders: async (): Promise<Reminder[]> =>
    api.get("/telegram/reminders", { params: { active_only: false } }).then((r) => r.data),

  createReminder: async (payload: Partial<Reminder>): Promise<Reminder> =>
    api.post("/telegram/reminders", payload).then((r) => r.data),

  updateReminder: async (
    id: string,
    payload: Partial<Reminder>
  ): Promise<Reminder> =>
    api.patch(`/telegram/reminders/${id}`, payload).then((r) => r.data),

  deleteReminder: async (id: string): Promise<void> => {
    await api.delete(`/telegram/reminders/${id}`);
  },
};
