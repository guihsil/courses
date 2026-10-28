import express, { type Express, type Router } from "express";

function getErrorStatus(error: unknown): 400 | 413 | 500 {
  if (typeof error === "object" && error !== null && "status" in error) {
    if (error.status === 400 || error.status === 413) {
      return error.status;
    }
  }

  return 500;
}

export function createApp(usersRouter: Router): Express {
  const app = express();

  app.use(express.json({ limit: "32kb" }));
  app.use(usersRouter);
  app.get("/", (_req, res) => {
    res.send("Courses API");
  });

  app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const status = getErrorStatus(error);
    if (status === 500) {
      console.error("Unhandled API error:", error);
    } else {
      console.warn(`Rejected request with status ${status}.`);
    }

    const message = status === 400
      ? "JSON inválido"
      : status === 413
        ? "Corpo da requisição muito grande"
        : "Erro interno";
    res.status(status).json({ message });
  });

  return app;
}