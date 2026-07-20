import { api } from "./client";
import type { SearchResponse, SearchResultItem } from "@/types";

export const searchApi = {
  search: async (q: string): Promise<SearchResultItem[]> => {
    const { data } = await api.get<SearchResponse>("/search", {
      params: { q, limit: 20, types: ["tasks", "habits", "journal", "finance", "goals"] },
    });
    return data?.results ?? [];
  },
};
