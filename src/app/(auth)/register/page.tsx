"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { registerSchema, type RegisterInput } from "@/lib/schemas/auth.schema";
import { useRegister } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const onSubmit = (data: RegisterInput) =>
    registerMutation.mutate({
      email: data.email,
      password: data.password,
      username: data.username,
      firstName: data.firstName,
    });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass p-8"
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gradient mb-2">HabitForge</h1>
        <p className="text-muted text-sm">Создайте свой аккаунт</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-text/80">Имя</Label>
            <Input
              placeholder="Иван"
              className="bg-white/5 border-border text-text placeholder:text-muted focus-visible:ring-primary"
              {...register("firstName")}
            />
            {errors.firstName && (
              <p className="text-danger text-xs">{errors.firstName.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label className="text-text/80">Юзернейм</Label>
            <Input
              placeholder="ivan_dev"
              className="bg-white/5 border-border text-text placeholder:text-muted focus-visible:ring-primary"
              {...register("username")}
            />
            {errors.username && (
              <p className="text-danger text-xs">{errors.username.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-text/80">Email</Label>
          <Input
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            className="bg-white/5 border-border text-text placeholder:text-muted focus-visible:ring-primary"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-danger text-xs">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-text/80">Пароль</Label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Минимум 8 символов с цифрой"
              autoComplete="new-password"
              className="bg-white/5 border-border text-text placeholder:text-muted focus-visible:ring-primary pr-10"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-danger text-xs">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-text/80">Подтвердите пароль</Label>
          <Input
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            className="bg-white/5 border-border text-text placeholder:text-muted focus-visible:ring-primary"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-danger text-xs">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={registerMutation.isPending}
          className="w-full gradient-primary text-white font-semibold hover:opacity-90 transition-opacity mt-2"
        >
          {registerMutation.isPending ? (
            <Loader2 size={16} className="animate-spin mr-2" />
          ) : null}
          Зарегистрироваться
        </Button>
      </form>

      <p className="text-center text-sm text-muted mt-6">
        Уже есть аккаунт?{" "}
        <Link
          href="/login"
          className="text-primary hover:text-primary/80 font-medium transition-colors"
        >
          Войти
        </Link>
      </p>
    </motion.div>
  );
}
