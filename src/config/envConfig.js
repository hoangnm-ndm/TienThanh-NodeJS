import dotenv from "dotenv";

dotenv.config({});

export const envConfig = {
  PORT: process.env.PORT,
  DB_URI: process.env.DB_URI,
};
