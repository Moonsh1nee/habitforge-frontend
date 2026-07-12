import { api } from "./client";
import type {
  ShoppingList,
  ShoppingListWithItems,
  ShoppingItem,
  FinanceTransaction,
} from "@/types";

export interface ShoppingListFilters {
  list_status?: "active" | "completed" | "cancelled";
  start?:       string;
  end?:         string;
  skip?:        number;
  limit?:       number;
}

export const shoppingApi = {
  // ─── Lists ────────────────────────────────────────────────────────────────

  getLists: async (params?: ShoppingListFilters): Promise<ShoppingList[]> => {
    const { data } = await api.get<ShoppingList[]>("/shopping/lists", { params });
    return data;
  },

  getList: async (id: string): Promise<ShoppingListWithItems> => {
    const { data } = await api.get<ShoppingListWithItems>(`/shopping/lists/${id}`);
    return data;
  },

  createList: async (payload: {
    name:         string;
    store?:       string | null;
    plannedDate?: string | null;
    plannedTime?: string | null;
    notes?:       string | null;
  }): Promise<ShoppingList> => {
    const { data } = await api.post<ShoppingList>("/shopping/lists", payload);
    return data;
  },

  updateList: async (
    id: string,
    payload: {
      name?:        string;
      store?:       string | null;
      plannedDate?: string | null;
      plannedTime?: string | null;
      notes?:       string | null;
      status?:      "cancelled";
    }
  ): Promise<ShoppingList> => {
    const { data } = await api.patch<ShoppingList>(`/shopping/lists/${id}`, payload);
    return data;
  },

  deleteList: async (id: string): Promise<void> => {
    await api.delete(`/shopping/lists/${id}`);
  },

  completeList: async (
    id: string,
    payload?: {
      categoryId?:  string | null;
      description?: string | null;
      date?:        string | null;
    }
  ): Promise<{ list: ShoppingList; transaction: FinanceTransaction }> => {
    const { data } = await api.post<{ list: ShoppingList; transaction: FinanceTransaction }>(
      `/shopping/lists/${id}/complete`,
      payload ?? {}
    );
    return data;
  },

  // ─── Items ────────────────────────────────────────────────────────────────

  addItem: async (
    listId: string,
    payload: {
      name:          string;
      quantity?:     number;
      unit?:         string | null;
      plannedPrice?: number | null;
      categoryId?:   string | null;
      notes?:        string | null;
    }
  ): Promise<ShoppingItem> => {
    const { data } = await api.post<ShoppingItem>(`/shopping/lists/${listId}/items`, payload);
    return data;
  },

  updateItem: async (
    listId: string,
    itemId: string,
    payload: {
      name?:         string;
      quantity?:     number;
      unit?:         string | null;
      plannedPrice?: number | null;
      actualPrice?:  number | null;
      categoryId?:   string | null;
      checked?:      boolean;
      notes?:        string | null;
    }
  ): Promise<ShoppingItem> => {
    const { data } = await api.patch<ShoppingItem>(
      `/shopping/lists/${listId}/items/${itemId}`,
      payload
    );
    return data;
  },

  checkItem: async (listId: string, itemId: string): Promise<ShoppingItem> => {
    const { data } = await api.patch<ShoppingItem>(
      `/shopping/lists/${listId}/items/${itemId}/check`,
      {}
    );
    return data;
  },

  deleteItem: async (listId: string, itemId: string): Promise<void> => {
    await api.delete(`/shopping/lists/${listId}/items/${itemId}`);
  },

  reorderItems: async (listId: string, ids: string[]): Promise<void> => {
    await api.post(`/shopping/lists/${listId}/items/reorder`, { ids });
  },
};
