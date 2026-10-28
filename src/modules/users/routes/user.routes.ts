import { Router } from "express";
import type { CreateUserController } from "../controllers/create-user.controller";

export function usersRoutes(createUser: CreateUserController): Router {
    const router = Router();
    router.post("/users", (req, res, next) => createUser.handle(req, res, next));
    return router;
}