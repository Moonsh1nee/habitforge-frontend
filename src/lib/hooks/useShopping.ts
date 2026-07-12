"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { shoppingApi, type ShoppingListFilters } from "@/lib/api/shopping";
import type { ShoppingListWithItems } from "@/types";

// ─── Lists ────────────────────────────────────────────────────────────────────

export function useShoppingLists(params?: ShoppingListFilters) {
  return useQuery({
    queryKey: ["shopping-lists", params],
    queryFn: () => shoppingApi.getLists(params),
  });
}

export function useShoppingList(id: string | null) {
  return useQuery({
    queryKey: ["shopping-list", id],
    queryFn: () => shoppingApi.getList(id!),
    enabled: !!id,
  });
}

export function useCreateShoppingList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: shoppingApi.createList,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["shopping-lists"] });
      toast.success("Список создан");
    },
    onError: () => toast.error("Ошибка создания списка"),
  });
}

export function useUpdateShoppingList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof shoppingApi.updateList>[1] }) =>
      shoppingApi.updateList(id, payload),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["shopping-lists"] });
      qc.invalidateQueries({ queryKey: ["shopping-list", data.id] });
      toast.success("Список обновлён");
    },
    onError: () => toast.error("Ошибка обновления"),
  });
}

export function useDeleteShoppingList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => shoppingApi.deleteList(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["shopping-lists"] });
      toast.success("Список удалён");
    },
    onError: () => toast.error("Ошибка удаления"),
  });
}

export function useCompleteShoppingList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload?: Parameters<typeof shoppingApi.completeList>[1];
    }) => shoppingApi.completeList(id, payload),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["shopping-lists"] });
      qc.invalidateQueries({ queryKey: ["shopping-list", data.list.id] });
      qc.invalidateQueries({ queryKey: ["finance-transactions"] });
      qc.invalidateQueries({ queryKey: ["finance-summary"] });
      toast.success("Поход завершён, транзакция создана");
    },
    onError: () => toast.error("Ошибка завершения"),
  });
}

// ─── Items ────────────────────────────────────────────────────────────────────

export function useAddShoppingItem(listId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof shoppingApi.addItem>[1]) =>
      shoppingApi.addItem(listId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["shopping-list", listId] });
      qc.invalidateQueries({ queryKey: ["shopping-lists"] });
    },
    onError: () => toast.error("Ошибка добавления товара"),
  });
}

export function useUpdateShoppingItem(listId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      itemId,
      payload,
    }: {
      itemId: string;
      payload: Parameters<typeof shoppingApi.updateItem>[2];
    }) => shoppingApi.updateItem(listId, itemId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["shopping-list", listId] });
      qc.invalidateQueries({ queryKey: ["shopping-lists"] });
    },
    onError: () => toast.error("Ошибка обновления товара"),
  });
}

export function useCheckShoppingItem(listId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => shoppingApi.checkItem(listId, itemId),
    onMutate: async (itemId) => {
      await qc.cancelQueries({ queryKey: ["shopping-list", listId] });
      const prev = qc.getQueryData<ShoppingListWithItems>(["shopping-list", listId]);
      if (prev) {
        qc.setQueryData<ShoppingListWithItems>(["shopping-list", listId], {
          ...prev,
          items: prev.items.map((i) =>
            i.id === itemId ? { ...i, checked: !i.checked } : i
          ),
        });
      }
      return { prev };
    },
    onError: (_, __, ctx) => {
      if (ctx?.prev) qc.setQueryData(["shopping-list", listId], ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["shopping-list", listId] });
      qc.invalidateQueries({ queryKey: ["shopping-lists"] });
    },
  });
}

export function useDeleteShoppingItem(listId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => shoppingApi.deleteItem(listId, itemId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["shopping-list", listId] });
      qc.invalidateQueries({ queryKey: ["shopping-lists"] });
    },
    onError: () => toast.error("Ошибка удаления товара"),
  });
}
