import type { NextFunction, Request, Response } from "express";
import { createUserSchema } from "../dtos/create-user.dto";
import { toUserResponse } from "../dtos/user-response.dto";
import { UserAlreadyExistsError } from "../entity/user-errors";
import type { CreateUserUseCase } from "../use-cases/create-user";

export class CreateUserController {
    private readonly createUser: CreateUserUseCase;

    constructor(createUser: CreateUserUseCase) {
        this.createUser = createUser;
    }

    async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
        const parsed = createUserSchema.safeParse(req.body);

        if (!parsed.success) {
            res.status(400).json({ errors: parsed.error.flatten() });
            return;
        }

        try {
            const user = await this.createUser.execute(parsed.data);
            res.status(201).json(toUserResponse(user));
        } catch (error) {
            if (error instanceof UserAlreadyExistsError) {
                res.status(409).json({ message: error.message });
                return;
            }

            next(error);
        }
    }
}