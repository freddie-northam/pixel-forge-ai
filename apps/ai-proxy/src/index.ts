import cors from "cors";
import express from "express";
import { registerGenerationRoutes } from "./routes/generation.js";
import { registerHealthRoute } from "./routes/health.js";
import { registerProviderRoutes } from "./routes/providers.js";
import { registerSafetyRoutes } from "./routes/safety.js";
import { errorHandler } from "./middleware/error-handler.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "256kb" }));

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
