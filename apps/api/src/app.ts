import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: env.WEB_URL,
  }),
);

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "a11yscope-api",
  });
});

app.use("/api/auth", authRoutes);

export default app;
