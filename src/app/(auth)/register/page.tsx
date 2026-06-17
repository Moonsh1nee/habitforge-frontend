"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { registerSchema, type RegisterInput } from "@/lib/schemas/auth.schema";
import { useRegister } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const registerMutation = useRegister();

  const pwChecks = [
    { label: "Минимум 8 символов", ok: password.length >= 8 },
    { label: "Есть цифра", ok: /\d/.test(password) },
    { label: "Есть заглавная буква", ok: /[A-Z]/.test(password) },
  ];
  const pwStrength = pwChecks.filter((c) => c.ok).length;

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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Имя</Label>
            <Input
              placeholder="Иван"
             
              {...register("firstName")}
            />
            {errors.firstName && (
              <p className="text-danger text-xs">{errors.firstName.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Юзернейм</Label>
            <Input
              placeholder="ivan_dev"
             
              {...register("username")}
            />
            {errors.username && (
              <p className="text-danger text-xs">{errors.username.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Email</Label>
          <Input
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
           
            {...register("email")}
          />
          {errors.email && (
            <p className="text-danger text-xs">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Пароль</Label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Минимум 8 символов"
              autoComplete="new-password"
              className="pr-10"
              {...register("password", { onChange: (e) => setPassword(e.target.value) })}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Strength indicator */}
          {password.length > 0 && (
            <div className="space-y-2">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-all duration-300",
                      i < pwStrength
                        ? pwStrength === 1 ? "bg-danger" : pwStrength === 2 ? "bg-warning" : "bg-success"
                        : "bg-white/10"
                    )}
                  />
                ))}
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                {pwChecks.map(({ label, ok }) => (
                  <span key={label} className={cn("text-[11px] transition-colors", ok ? "text-success" : "text-muted")}>
                    {ok ? "✓" : "·"} {label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {errors.password && (
            <p className="text-danger text-xs">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Подтвердите пароль</Label>
          <Input
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
           
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
