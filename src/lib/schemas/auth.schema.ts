import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Email обязателен").email("Некорректный email"),
  password: z.string().min(8, "Минимум 8 символов"),
});

export const registerSchema = z
  .object({
    email: z.string().min(1, "Email обязателен").email("Некорректный email"),
    username: z
      .string()
      .min(3, "Минимум 3 символа")
      .max(30, "Максимум 30 символов"),
    firstName: z.string().min(1, "Имя обязательно"),
    password: z
      .string()
      .min(10, "Минимум 10 символов")
      .regex(/\d/, "Нужна хотя бы одна цифра")
      .regex(/[A-Z]/, "Нужна хотя бы одна заглавная буква")
      .regex(/[a-z]/, "Нужна хотя бы одна строчная буква")
      .regex(/[^a-zA-Z0-9]/, "Нужен хотя бы один спецсимвол"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  });

export type LoginInput = z.input<typeof loginSchema>;
export type RegisterInput = z.input<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email обязателен").email("Некорректный email"),
});

export const resetPasswordSchema = z
  .object({
    new_password: z
      .string()
      .min(10, "Минимум 10 символов")
      .regex(/\d/, "Нужна хотя бы одна цифра")
      .regex(/[A-Z]/, "Нужна хотя бы одна заглавная буква")
      .regex(/[a-z]/, "Нужна хотя бы одна строчная буква")
      .regex(/[^a-zA-Z0-9]/, "Нужен хотя бы один спецсимвол"),
    confirm_password: z.string(),
  })
  .refine((d) => d.new_password === d.confirm_password, {
    message: "Пароли не совпадают",
    path: ["confirm_password"],
  });

export type ForgotPasswordInput = z.input<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.input<typeof resetPasswordSchema>;
