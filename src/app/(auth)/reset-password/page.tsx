"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";
import Link from "next/link";
import { Loader2, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/schemas/auth.schema";
import { useResetPassword } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [showPassword, setShowPassword] = useState(false);
  const resetPassword = useResetPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <AlertTriangle size={40} className="text-danger mx-auto" />
        <h2 className="text-lg font-semibold text-text">Неверная ссылка</h2>
        <p className="text-sm text-muted">
          Ссылка для сброса пароля отсутствует или повреждена.
        </p>
        <Link
          href="/forgot-password"
          className="text-sm text-primary hover:text-primary/80 transition-colors"
        >
          Запросить новую ссылку
        </Link>
      </div>
    );
  }

  const onSubmit = (data: ResetPasswordInput) =>
    resetPassword.mutate({ token, new_password: data.new_password });

  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-text mb-2">Новый пароль</h1>
        <p className="text-muted text-sm">Введите новый пароль для вашего аккаунта</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <Label>Новый пароль</Label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Минимум 8 символов с цифрой"
              autoComplete="new-password"
              className="pr-10"
              {...register("new_password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.new_password && (
            <p className="text-danger text-xs">{errors.new_password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Подтвердите пароль</Label>
          <Input
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
           
            {...register("confirm_password")}
          />
          {errors.confirm_password && (
            <p className="text-danger text-xs">{errors.confirm_password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={resetPassword.isPending}
          className="w-full bg-primary text-white font-semibold hover:opacity-90 transition-opacity"
        >
          {resetPassword.isPending ? (
            <Loader2 size={16} className="animate-spin mr-2" />
          ) : null}
          Сохранить пароль
        </Button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass p-8"
    >
      <Suspense
        fallback={
          <div className="text-center text-muted text-sm py-8">Загрузка...</div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </motion.div>
  );
}
