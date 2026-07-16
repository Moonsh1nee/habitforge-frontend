"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { ShoppingCart, Plus } from "lucide-react";
import { useShoppingLists } from "@/lib/hooks/useShopping";
import { ShoppingListCard } from "@/components/shopping/ShoppingListCard";
import { ListFormDialog } from "@/components/shopping/ListFormDialog";
import { ListDetailSheet } from "@/components/shopping/ListDetailSheet";
import { PageHeader } from "@/components/shared/PageHeader";
import { FilterTabs } from "@/components/shared/FilterTabs";
import { EmptyState } from "@/components/shared/EmptyState";
import { CardSkeleton } from "@/components/shared/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import type { ShoppingListStatus } from "@/types";

type StatusFilter = "all" | ShoppingListStatus;

const FILTER_OPTIONS = [
  { value: "all",       label: "Все" },
  { value: "active",    label: "Активные" },
  { value: "completed", label: "Завершённые" },
  { value: "cancelled", label: "Отменённые" },
];

export default function ShoppingPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const { data: lists = [], isLoading } = useShoppingLists(
    statusFilter !== "all" ? { list_status: statusFilter } : undefined
  );

  const handleListClick = (id: string) => {
    setSelectedListId(id);
    setSheetOpen(true);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Списки покупок"
        subtitle="Планируй покупки и отслеживай расходы"
        action={
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus size={14} className="mr-1.5" />
            Новый список
          </Button>
        }
      />

      <FilterTabs
        options={FILTER_OPTIONS}
        value={statusFilter}
        onChange={(v) => setStatusFilter(v as StatusFilter)}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : lists.length === 0 ? (
        <EmptyState
          icon={<ShoppingCart size={40} />}
          title="Нет списков покупок"
          description={
            statusFilter === "active"
              ? "Создайте первый список для похода в магазин"
              : "Нет списков в этой категории"
          }
          action={
            statusFilter === "active" ? (
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                <Plus size={14} className="mr-1.5" />
                Создать список
              </Button>
            ) : undefined
          }
        />
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.05 } }, hidden: {} }}
        >
          {lists.map((list) => (
            <motion.div
              key={list.id}
              variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
            >
              <ShoppingListCard list={list} onClick={() => handleListClick(list.id)} />
            </motion.div>
          ))}
        </motion.div>
      )}

      <ListFormDialog open={createOpen} onOpenChange={setCreateOpen} />

      <ListDetailSheet
        listId={selectedListId}
        open={sheetOpen}
        onOpenChange={(v) => {
          setSheetOpen(v);
          if (!v) setSelectedListId(null);
        }}
      />
    </div>
  );
}
