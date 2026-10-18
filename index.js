import express from "express";
import { connectDB } from "./src/config/connectDB.js";
import { routes } from "./src/routes/index.js";
import { envConfig } from "./src/config/envConfig.js";

const app = express();

// endpoint

app.use(express.json());

connectDB();

app.use("/api", routes);

app.listen(envConfig.PORT, "localhost", () => {
  console.log(`server is running on port: ${envConfig.PORT}`);
});
