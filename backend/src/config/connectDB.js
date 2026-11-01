import mongoose from "mongoose";
import { envConfig } from "./envConfig.js";

export function connectDB() {
  mongoose
    .connect(envConfig.DB_URI)
    .then(() => {
      console.log(`Connect Database successfully!`);
    })
    .catch((err) => {
      console.log(`Connect Database failed: ${JSON.stringify(err)}`);
    });
}
