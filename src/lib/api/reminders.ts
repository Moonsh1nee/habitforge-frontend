import { api } from "./client";
import type { Reminder, ReminderEntityType, ReminderRecurrence } from "@/types";

export interface CreateReminderPayload {
  title: string;
  entityType?: ReminderEntityType | null;
  entityId?: string | null;
  remindAt: string;
  recurrence?: ReminderRecurrence;
  recurrenceTime?: string | null;
  daysOfWeek?: number[] | null;
}

export const remindersApi = {
  getAll: async (): Promise<Reminder[]> => {
    const { data } = await api.get<Reminder[]>("/reminders");
    return data ?? [];
  },

  create: async (payload: CreateReminderPayload): Promise<Reminder> => {
    const { data } = await api.post<Reminder>("/reminders", payload);
    return data;
  },

  update: async (id: string, payload: Partial<CreateReminderPayload> & { isActive?: boolean }): Promise<Reminder> => {
    const { data } = await api.patch<Reminder>(`/reminders/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/reminders/${id}`);
  },
};
