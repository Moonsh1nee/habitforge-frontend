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
      .regex(/\d/, "Пароль должен содержать хотя бы одну цифру"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
