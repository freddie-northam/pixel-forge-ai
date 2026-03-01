import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import { registerGenerationRoutes } from "./routes/generation.js";
import { registerHealthRoute } from "./routes/health.js";
import { registerProviderRoutes } from "./routes/providers.js";
import { registerSafetyRoutes } from "./routes/safety.js";
import { errorHandler } from "./middleware/error-handler.js";

const app: express.Express = express();

const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS ?? "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim());

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    maxAge: 600
  })
);
app.use(express.json({ limit: "256kb" }));

const generationLimiter = rateLimit({
  windowMs: 60_000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "rate_limit", message: "Too many requests. Please wait before trying again." }
});

app.use("/v1/generate-level", generationLimiter);
app.use("/v1/improve-level", generationLimiter);
app.use("/v1/safety", generationLimiter);

registerHealthRoute(app);
registerProviderRoutes(app);
registerSafetyRoutes(app);
registerGenerationRoutes(app);

app.use(errorHandler);

const port = Number(process.env.PORT ?? 4242);
if (process.env.NODE_ENV !== "test") {
  if (Number.isNaN(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid PORT value: ${process.env.PORT}`);
  }
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`AI proxy listening on http://localhost:${port}`);
  });
}

export { app };
