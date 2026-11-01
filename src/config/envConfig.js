import dotenv from "dotenv";

dotenv.config({ quiet: true });

// * Biến để trống trong .env = chưa khai báo → dùng giá trị mặc định.
function readEnv(key, defaultValue) {
  const value = process.env[key]?.trim();
  return value ? value : defaultValue;
}

export const envConfig = {
  NODE_ENV: readEnv("NODE_ENV", "development"),
  PORT: Number(readEnv("PORT", 8000)),
  DB_URI: readEnv("DB_URI"),
  LOG_LEVEL: readEnv("LOG_LEVEL", "info"),

  BCRYPT_SALT_ROUNDS: Number(readEnv("BCRYPT_SALT_ROUNDS", 10)),

  JWT_ACCESS_SECRET: readEnv("JWT_ACCESS_SECRET"),
  JWT_ACCESS_EXPIRES_IN: readEnv("JWT_ACCESS_EXPIRES_IN", "15m"),
  JWT_REFRESH_SECRET: readEnv("JWT_REFRESH_SECRET"),
  JWT_REFRESH_EXPIRES_IN: readEnv("JWT_REFRESH_EXPIRES_IN", "7d"),

  COOKIE_DOMAIN: readEnv("COOKIE_DOMAIN"),
};

envConfig.IS_PRODUCTION = envConfig.NODE_ENV === "production";

// * Biến bắt buộc, không có mặc định → báo rõ khi khởi động.
const REQUIRED_KEYS = ["DB_URI", "JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET"];
const missingKeys = REQUIRED_KEYS.filter((key) => !envConfig[key]);

if (missingKeys.length > 0) {
  console.error(
    `[envConfig] Biến môi trường bắt buộc chưa điền: ${missingKeys.join(", ")} (kiểm tra file .env)`,
  );
  process.exit(1);
}
