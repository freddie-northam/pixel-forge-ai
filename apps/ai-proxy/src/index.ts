import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { registerGenerationRoutes } from "./routes/generation.js";
import { registerHealthRoute } from "./routes/health.js";
import { registerProviderRoutes } from "./routes/providers.js";
import { registerSafetyRoutes } from "./routes/safety.js";
import { errorHandler } from "./middleware/error-handler.js";

const app: Express = express();

app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:5173"]
}));
app.use(express.json({ limit: "256kb" }));

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false
});

const generationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false
});

app.use(generalLimiter);
app.use("/v1/generate-level", generationLimiter);
app.use("/v1/improve-level", generationLimiter);

registerHealthRoute(app);
registerProviderRoutes(app);
registerSafetyRoutes(app);
registerGenerationRoutes(app);

app.use(errorHandler);

const port = Number(process.env.PORT ?? 4242);
if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`AI proxy listening on http://localhost:${port}`);
  });
}

export { app };
