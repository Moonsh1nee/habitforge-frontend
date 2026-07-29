import { api } from "./client";

export type ExportType =
  | "tasks"
  | "finance"
  | "nutrition"
  | "habits"
  | "goals"
  | "workouts"
  | "journal"
  | "projects"
  | "tags"
  | "shopping"
  | "reminders";

export const exportApi = {
  exportCsv: async (type: ExportType): Promise<Blob> => {
    const { data } = await api.get<Blob>("/export/csv", {
      params: { type },
      responseType: "blob",
    });
    return data;
  },
};
