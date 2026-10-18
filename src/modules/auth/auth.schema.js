import { z } from "zod";
export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Password toi thieu 6 ky tu"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Password toi thieu 6 ky tu"),
});
