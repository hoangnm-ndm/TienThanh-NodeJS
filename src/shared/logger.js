import pino from "pino";
import { envConfig } from "../config/envConfig.js";

// * Không bao giờ ghi password / token / cookie ra log.
export const logger = pino({
  level: envConfig.LOG_LEVEL,
  redact: {
    paths: [
      "password",
      "*.password",
      "accessToken",
      "refreshToken",
      "*.accessToken",
      "*.refreshToken",
      "req.headers.authorization",
      "req.headers.cookie",
    ],
    censor: "[REDACTED]",
  },
});
