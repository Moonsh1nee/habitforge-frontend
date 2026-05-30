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
      .min(8, "Минимум 8 символов")
      .regex(/\d/, "Нужна хотя бы одна цифра")
      .regex(/[A-Z]/, "Нужна хотя бы одна заглавная буква"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email обязателен").email("Некорректный email"),
});

export const resetPasswordSchema = z
  .object({
    new_password: z
      .string()
      .min(8, "Минимум 8 символов")
      .regex(/\d/, "Нужна хотя бы одна цифра")
      .regex(/[A-Z]/, "Нужна хотя бы одна заглавная буква"),
    confirm_password: z.string(),
  })
  .refine((d) => d.new_password === d.confirm_password, {
    message: "Пароли не совпадают",
    path: ["confirm_password"],
  });

export type ForgotPasswordInput = z.input<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.input<typeof resetPasswordSchema>;
