import { api } from "./client";

export type ExportFormat = "json" | "csv";
export type ExportScope = "all" | "tasks" | "habits" | "journal" | "nutrition" | "finance" | "workouts";

export const exportApi = {
  export: async (format: ExportFormat = "json", scope: ExportScope = "all"): Promise<Blob> => {
    const { data } = await api.get<Blob>("/export", {
      params: { format, scope },
      responseType: "blob",
    });
    return data;
  },
};
