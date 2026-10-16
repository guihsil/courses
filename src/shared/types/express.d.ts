import type { AppAbility, Perfis } from "@/config/permissions/roles";
import type { Models } from "@/prisma/schema";

declare global {
    namespace Express {
        interface Request {
            user?: Models.public_User;
            ability?: AppAbility;
            perfis?: Perfis;
            auth?: { userId: string };
        }
    }
}

export {};