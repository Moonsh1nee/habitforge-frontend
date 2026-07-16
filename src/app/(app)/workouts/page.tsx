"use client";

import { useState } from "react";
import { Plus, Dumbbell } from "lucide-react";
import { useWorkoutPlans, useWorkoutLogs } from "@/lib/hooks/useWorkouts";
import { LogCard } from "@/components/workouts/LogCard";
import { PlanCard } from "@/components/workouts/PlanCard";
import { LogForm } from "@/components/workouts/LogForm";
import { PlanForm } from "@/components/workouts/PlanForm";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { FormDialog } from "@/components/shared/FormDialog";
import { FilterTabs } from "@/components/shared/FilterTabs";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";

export default function WorkoutsPage() {
  const [logOpen, setLogOpen] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"logs" | "plans">("logs");

  const { data: plans } = useWorkoutPlans();
  const { data: logs } = useWorkoutLogs({ limit: 30 });

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader
        title="Тренировки"
        action={
          <div className="flex gap-2">
            {activeTab === "plans" && (
              <Button onClick={() => setPlanOpen(true)} variant="outline" className="border-border text-text gap-2">
                <Plus size={16} />
                Новый план
              </Button>
            )}
            <Button onClick={() => setLogOpen(true)} className="bg-primary text-white gap-2">
              <Plus size={16} />
              Тренировка
            </Button>
          </div>
        }
      />

      <FilterTabs
        value={activeTab}
        onChange={setActiveTab}
        size="md"
        options={[
          { value: "logs", label: "Логи" },
          { value: "plans", label: "Планы" },
        ]}
      />

      <Tabs value={activeTab}>
        <TabsContent value="logs" className="mt-0 space-y-3">
          {!logs || logs.length === 0 ? (
            <EmptyState icon={<Dumbbell />} title="Нет записей" description="Начните записывать свои тренировки" />
          ) : (
            logs.map((log) => <LogCard key={log.id} log={log} />)
          )}
        </TabsContent>

        <TabsContent value="plans" className="mt-0">
          {!plans || plans.length === 0 ? (
            <EmptyState
              icon={<Dumbbell />}
              title="Нет планов"
              description="Создайте план для структурированных тренировок"
              action={
                <Button onClick={() => setPlanOpen(true)} className="bg-primary text-white">
                  Создать план
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {plans.map((plan) => <PlanCard key={plan.id} plan={plan} />)}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <FormDialog open={logOpen} onOpenChange={setLogOpen} title="Записать тренировку">
        <LogForm onSuccess={() => setLogOpen(false)} />
      </FormDialog>

      <FormDialog open={planOpen} onOpenChange={setPlanOpen} title="Новый план">
        <PlanForm onSuccess={() => setPlanOpen(false)} />
      </FormDialog>
    </div>
  );
}
