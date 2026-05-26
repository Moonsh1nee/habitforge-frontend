import { api } from "./client";

export interface Reminder {
  id: string;
  type: string;
  title: string;
  message: string;
  cronExpression: string;
  isActive: boolean;
  lastSentAt?: string;
  createdAt?: string;
}

export interface TelegramLinkStatus {
  chatId?: number;
  username?: string;
  isActive: boolean;
  linkedAt?: string;
}

export const telegramApi = {
  getLink: async (): Promise<TelegramLinkStatus> =>
    api.get("/telegram/link").then((r) => r.data),

  link: async (code: string): Promise<TelegramLinkStatus> =>
    api.post("/telegram/link", { code }).then((r) => r.data),

  unlink: async (): Promise<void> => {
    await api.delete("/telegram/link");
  },

  getReminders: async (): Promise<Reminder[]> =>
    api.get("/telegram/reminders").then((r) => r.data),

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
