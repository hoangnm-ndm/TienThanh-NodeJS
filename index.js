import express from "express";
import { connectDB } from "./src/config/connectDB.js";
import { routes } from "./src/routes/index.js";

const app = express();

// endpoint

app.use(express.json());

connectDB();

app.use("/api", routes);

app.listen(3000, "localhost", () => {
  console.log(`server is running on port: 3000`);
});
