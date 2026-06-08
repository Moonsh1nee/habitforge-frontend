import { api } from "./client";
import type { SearchResponse, SearchResultItem } from "@/types";

const TYPE_URL: Record<string, string> = {
  task: "/tasks",
  habit: "/habits",
  journal: "/journal",
  finance_transaction: "/finance",
  finance_category: "/finance",
};

export type SearchResultItemWithUrl = SearchResultItem & { url: string };

export const searchApi = {
  search: async (q: string): Promise<SearchResultItemWithUrl[]> => {
    const { data } = await api.get<SearchResponse>("/search", {
      params: { q, limit: 20, types: ["tasks", "habits", "journal", "finance"] },
    });
    return (data?.results ?? []).map((r) => ({
      ...r,
      url: TYPE_URL[r.type] ?? "/dashboard",
    }));
  },
};
