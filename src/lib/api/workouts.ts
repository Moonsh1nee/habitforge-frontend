import { api } from "./client";
import type { WorkoutPlan, WorkoutPlanWithExercises, WorkoutLog, WorkoutLogWithExercises, PlanExercise, ExerciseLog } from "@/types";

export const workoutsApi = {
  getPlans: async (): Promise<WorkoutPlan[]> => {
    const { data } = await api.get<WorkoutPlan[]>("/workouts/plans");
    return data;
  },

  getPlan: async (id: string): Promise<WorkoutPlanWithExercises> => {
    const { data } = await api.get<WorkoutPlanWithExercises>(`/workouts/plans/${id}`);
    return data;
  },

  createPlan: async (payload: Partial<WorkoutPlan>): Promise<WorkoutPlan> => {
    const { data } = await api.post<WorkoutPlan>("/workouts/plans", payload);
    return data;
  },

  updatePlan: async (
    id: string,
    payload: Partial<WorkoutPlan>
  ): Promise<WorkoutPlan> => {
    const { data } = await api.patch<WorkoutPlan>(
      `/workouts/plans/${id}`,
      payload
    );
    return data;
  },

  deletePlan: async (id: string): Promise<void> => {
    await api.delete(`/workouts/plans/${id}`);
  },

  addExercise: async (
    planId: string,
    payload: Partial<PlanExercise>
  ): Promise<PlanExercise> => {
    const { data } = await api.post<PlanExercise>(
      `/workouts/plans/${planId}/exercises`,
      payload
    );
    return data;
  },

  getLogs: async (params?: {
    start?: string;
    end?: string;
    skip?: number;
    limit?: number;
  }): Promise<WorkoutLog[]> => {
    const { data } = await api.get<WorkoutLog[]>("/workouts/logs", { params });
    return data;
  },

  getLog: async (id: string): Promise<WorkoutLogWithExercises> => {
    const { data } = await api.get<WorkoutLogWithExercises>(`/workouts/logs/${id}`);
    return data;
  },

  createLog: async (payload: Partial<WorkoutLog>): Promise<WorkoutLog> => {
    const { data } = await api.post<WorkoutLog>("/workouts/logs", payload);
    return data;
  },

  updateLog: async (
    id: string,
    payload: Partial<WorkoutLog>
  ): Promise<WorkoutLog> => {
    const { data } = await api.patch<WorkoutLog>(
      `/workouts/logs/${id}`,
      payload
    );
    return data;
  },

  deleteLog: async (id: string): Promise<void> => {
    await api.delete(`/workouts/logs/${id}`);
  },

  addExerciseLog: async (
    logId: string,
    payload: Partial<ExerciseLog>
  ): Promise<ExerciseLog> => {
    const { data } = await api.post<ExerciseLog>(
      `/workouts/logs/${logId}/exercises`,
      payload
    );
    return data;
  },

  updatePlanExercise: async (
    planId: string,
    exerciseId: string,
    payload: Partial<PlanExercise>
  ): Promise<PlanExercise> => {
    const { data } = await api.patch<PlanExercise>(
      `/workouts/plans/${planId}/exercises/${exerciseId}`,
      payload
    );
    return data;
  },

  deletePlanExercise: async (planId: string, exerciseId: string): Promise<void> => {
    await api.delete(`/workouts/plans/${planId}/exercises/${exerciseId}`);
  },

  updateLogExercise: async (
    logId: string,
    exerciseId: string,
    payload: Partial<ExerciseLog>
  ): Promise<ExerciseLog> => {
    const { data } = await api.patch<ExerciseLog>(
      `/workouts/logs/${logId}/exercises/${exerciseId}`,
      payload
    );
    return data;
  },

  deleteLogExercise: async (logId: string, exerciseId: string): Promise<void> => {
    await api.delete(`/workouts/logs/${logId}/exercises/${exerciseId}`);
  },
};
