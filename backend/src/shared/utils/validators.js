import { z } from "zod";

// * Zod field dùng chung.
export const objectIdField = (message = "Id không hợp lệ") =>
  z.string().regex(/^[0-9a-fA-F]{24}$/, message);
