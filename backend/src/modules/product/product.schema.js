import { z } from "zod";

export const productCreateSchema = z.object({
  title: z.string().min(3, "Title phải có tối thiểu 3 ký tự"),
  price: z.number().min(0, " Price không được âm"),
});

export const productUpdateSchema = z.object({
  title: z.string().min(3, "Title phải có tối thiểu 3 ký tự").optional(),
  price: z.number().min(0, " Price không được âm").optional(),
});
