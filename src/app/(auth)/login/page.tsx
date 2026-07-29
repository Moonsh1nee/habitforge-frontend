"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { loginSchema, type LoginInput } from "@/lib/schemas/auth.schema";
import { useLogin } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const login = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = (data: LoginInput) => login.mutate(data);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass p-8"
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">GetGrip</h1>
        <p className="text-muted text-sm">Войдите в свой аккаунт</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">
            Email
          </Label>
          <Input
            id="email"
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
          <Label htmlFor="password">
            Пароль
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="current-password"
              className="pr-10"
              {...register("password")}
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
          {errors.password && (
            <p className="text-danger text-xs">{errors.password.message}</p>
          )}
          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-xs text-muted hover:text-primary transition-colors"
            >
              Забыли пароль?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          disabled={login.isPending}
          className="w-full bg-primary text-white font-semibold hover:opacity-90 transition-opacity"
        >
          {login.isPending ? (
            <Loader2 size={16} className="animate-spin mr-2" />
          ) : null}
          Войти
        </Button>
      </form>

      <p className="text-center text-sm text-muted mt-6">
        Нет аккаунта?{" "}
        <Link
          href="/register"
          className="text-primary hover:text-primary/80 font-medium transition-colors"
        >
          Зарегистрироваться
        </Link>
      </p>
    </motion.div>
  );
}
