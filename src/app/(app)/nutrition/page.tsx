"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import { Plus, Apple, Trash2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { nutritionApi } from "@/lib/api/nutrition";
import { GlassCard } from "@/components/shared/GlassCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { AnimatedNumber } from "@/components/shared/AnimatedNumber";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { getTodayString } from "@/lib/utils";
import type { MealType } from "@/types";

const MACRO_COLORS = ["#f59e0b", "#7c3aed", "#06b6d4", "#22c55e"];
const mealLabels: Record<MealType, string> = {
  breakfast: "Завтрак",
  lunch: "Обед",
  dinner: "Ужин",
  snack: "Перекус",
};

function AddFoodForm({ onSuccess }: { onSuccess: () => void }) {
  const [mealType, setMealType] = useState<MealType>("breakfast");
  const qc = useQueryClient();
  const create = useMutation({
    mutationFn: nutritionApi.createLog,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["nutrition"] });
      toast.success("Еда добавлена!");
      onSuccess();
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    create.mutate({
      date: getTodayString(),
      mealType,
      name: fd.get("name") as string,
      calories: Number(fd.get("calories")),
      protein: Number(fd.get("protein")),
      carbs: Number(fd.get("carbs")),
      fat: Number(fd.get("fat")),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label className="text-text/80">Название</Label>
        <Input
          name="name"
          placeholder="Куриная грудка"
          required
          className="bg-white/5 border-border text-text"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-text/80">Приём пищи</Label>
        <Select value={mealType} onValueChange={(v) => setMealType(v as MealType)}>
          <SelectTrigger className="bg-white/5 border-border text-text">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#13131a] border-border">
            {Object.entries(mealLabels).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[["calories", "Калории"], ["protein", "Белки (г)"], ["carbs", "Углеводы (г)"], ["fat", "Жиры (г)"]].map(
          ([name, label]) => (
            <div key={name} className="space-y-2">
              <Label className="text-text/80 text-xs">{label}</Label>
              <Input
                name={name}
                type="number"
                min={0}
                step={0.1}
                defaultValue={0}
                className="bg-white/5 border-border text-text"
              />
            </div>
          )
        )}
      </div>
      <Button
        type="submit"
        disabled={create.isPending}
        className="w-full gradient-primary text-white"
      >
        Добавить
      </Button>
    </form>
  );
}

export default function NutritionPage() {
  const [addOpen, setAddOpen] = useState(false);
  const qc = useQueryClient();
  const today = getTodayString();

  const { data: summary } = useQuery({
    queryKey: ["nutrition", "summary", today],
    queryFn: () => nutritionApi.getSummary(today),
  });

  const { data: logs = [] } = useQuery({
    queryKey: ["nutrition", "logs", today],
    queryFn: () => nutritionApi.getLogs({ date: today }),
  });

  const deleteLog = useMutation({
    mutationFn: (id: string) => nutritionApi.deleteLog(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["nutrition"] }),
  });

  const macros = summary
    ? [
        { name: "Белки", value: summary.total_protein ?? 0, color: MACRO_COLORS[1] },
        { name: "Углеводы", value: summary.total_carbs ?? 0, color: MACRO_COLORS[2] },
        { name: "Жиры", value: summary.total_fat ?? 0, color: MACRO_COLORS[3] },
      ]
    : [];

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text">Питание</h1>
        <Button
          onClick={() => setAddOpen(true)}
          className="gradient-primary text-white gap-2"
        >
          <Plus size={16} />
          Добавить еду
        </Button>
      </div>

      {summary && (
        <GlassCard className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-40 h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={macros}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {macros.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#13131a",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 8,
                    color: "#f1f5f9",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex-1 grid grid-cols-2 gap-4">
            <div className="text-center">
              <AnimatedNumber
                value={summary.total_calories}
                className="text-3xl font-bold text-warning"
              />
              <p className="text-xs text-muted">ккал</p>
            </div>
            {macros.map((m) => (
              <div key={m.name} className="text-center">
                <span className="text-xl font-bold" style={{ color: m.color }}>
                  <AnimatedNumber value={m.value} decimals={1} suffix=" г" />
                </span>
                <p className="text-xs text-muted">{m.name}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      <div className="space-y-3">
        {!logs.length ? (
          <EmptyState
            icon={<Apple />}
            title="Нет записей питания"
            description="Добавьте первый приём пищи"
          />
        ) : (
          logs.map((entry, i) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="glass p-4 flex items-center justify-between group"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-primary font-medium">
                    {mealLabels[entry.mealType]}
                  </span>
                  <span className="text-sm font-medium text-text">{entry.name}</span>
                </div>
                <p className="text-xs text-muted mt-0.5">
                  {entry.calories} ккал · Б {entry.protein}г · У {entry.carbs}г · Ж {entry.fat}г
                </p>
              </div>
              <button
                onClick={() => deleteLog.mutate(entry.id)}
                className="opacity-0 group-hover:opacity-100 text-muted hover:text-danger transition-all"
              >
                <Trash2 size={14} />
              </button>
            </motion.div>
          ))
        )}
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="bg-[#13131a] border-border">
          <DialogHeader>
            <DialogTitle className="text-text">Добавить еду</DialogTitle>
          </DialogHeader>
          <AddFoodForm onSuccess={() => setAddOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
