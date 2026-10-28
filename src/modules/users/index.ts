import type { AdminInput } from "./use-cases/create-user";

export interface UsersFacade {
    exists(userId: string): Promise<boolean>;
    initialAdmin(input: AdminInput): Promise<void>;
}

export { buildUserModule } from "./user.module";