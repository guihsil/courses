import type { PasswordHasher } from "./use-cases/create-user";
import type { UserRepository } from "./repositories/user.repository";
import { CreateUserUseCase } from "./use-cases/create-user";
import { CreateUserController } from "./controllers/create-user.controller";
import { usersRoutes } from "./routes/user.routes";
import type { UsersFacade } from ".";

export function buildUserModule(userRepository: UserRepository, hasher: PasswordHasher) {
    const createUser = new CreateUserUseCase(userRepository, hasher, "ALUNO");
    const createInitialAdmin = new CreateUserUseCase(userRepository, hasher, "ADMINISTRADOR");
    const createUserController = new CreateUserController(createUser);
    const users: UsersFacade = {
        exists: async (userId) => (await userRepository.findById(userId)) !== null,
        initialAdmin: (input) => createInitialAdmin.ensureInitialAdmin(input),
    };

    return {
        router: usersRoutes(createUserController),
        users,
        findUserById: (id: string) => userRepository.findById(id),
    };
}