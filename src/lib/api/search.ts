import { api } from "./client";
import type { SearchResponse, SearchResultItem } from "@/types";

const TYPE_URL: Record<string, string> = {
  task: "/tasks",
  habit: "/habits",
  journal: "/journal",
};

export type SearchResultItemWithUrl = SearchResultItem & { url: string };

export const searchApi = {
  search: async (q: string): Promise<SearchResultItemWithUrl[]> => {
    const { data } = await api.get<SearchResponse>("/search", {
      params: { q, limit: 20 },
    });
    return (data?.results ?? []).map((r) => ({
      ...r,
      url: TYPE_URL[r.type] ?? "/dashboard",
    }));
  },
};
